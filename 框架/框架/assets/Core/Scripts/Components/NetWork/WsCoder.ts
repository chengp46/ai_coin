import { CryptUtil } from '../../Tools/CryptUtil';
import { logMgr } from '../../Managers/LogMgr';

/** 消息结构 */
export class Message {
    constructor(public cmd: number, public data: Uint8Array) {}
}

/** 消息编码器，提供WebSocket消息的编码加密和解码解密功能 */
export class WsCoder {
    /**
     * 消息打包（使用大端序）
     * @param msg 要打包的消息
     * @param key 可选的加密密钥
     * @returns 打包后的字节数组
     */
    public static pack(msg: Message, key?: string): Uint8Array | null {
        if (!msg) {
            logMgr.err('消息不能为空');
            return null;
        }

        const data = key ? CryptUtil.encryptBytes(msg.data, key) : msg.data;
        if (!data) {
            logMgr.err('消息加密失败');
            return null;
        }

        const buffer = new Uint8Array(4 + data.length);
        this.setUint32(buffer, 0, msg.cmd);
        buffer.set(data, 4);
        return buffer;
    }

    /**
     * 消息解包（使用大端序）
     * @param buffer 要解包的字节数组
     * @param key 可选的解密密钥
     * @returns 解包后的消息
     */
    public static unpack(buffer: Uint8Array, key?: string): Message | null {
        if (buffer.length < 4) {
            logMgr.err('消息长度不足');
            return null;
        }

        const cmd = this.getUint32(buffer, 0);
        const data = key ? CryptUtil.decryptBytes(buffer.slice(4), key) : buffer.slice(4);
        if (!data) {
            logMgr.err('消息解密失败');
            return null;
        }

        return new Message(cmd, data);
    }

    /**
     * 通过 DataView 设置 Uint32 值（大端序）
     * @param buffer 目标缓冲区
     * @param offset 偏移量
     * @param value 要设置的值
     */
    private static setUint32(buffer: Uint8Array, offset: number, value: number): void {
        new DataView(buffer.buffer).setUint32(offset, value, false);
    }

    /**
     * 通过 DataView 获取 Uint32 值（大端序）
     * @param buffer 源缓冲区
     * @param offset 偏移量
     * @returns 获取的值
     */
    private static getUint32(buffer: Uint8Array, offset: number): number {
        return new DataView(buffer.buffer).getUint32(offset, false);
    }
}
