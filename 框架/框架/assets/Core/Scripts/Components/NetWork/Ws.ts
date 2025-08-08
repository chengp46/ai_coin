import { ISocket, WsData } from './ISocket';
import { Message, WsCoder } from './WsCoder';
import { logMgr } from '../../Managers/LogMgr';

/** WebSocket类，实现ISocket接口 */
export class Ws implements ISocket {
    /** WebSocket对象 */
    private ws: WebSocket | null = null;

    /** 连接成功时的回调 */
    onConnected: () => void = () => {};

    /** 收到消息时的回调 */
    onMessage: (msg: WsData) => void = () => {};

    /** 错误处理回调 */
    onError: (err: string) => void = () => {};

    /** 连接关闭时的回调 */
    onClosed: () => void = () => {};

    /**
     * 连接到WebSocket服务器
     * @param urlOrIp URL地址或IP地址
     * @param port 端口号（可选）
     * @param path 路径部分（可选）
     * @param protocol 协议类型（可选，默认为 'ws'）
     * @returns 是否成功发起连接
     */
    connect(urlOrIp: string, port?: number, path: string = '', protocol: 'ws' | 'wss' = 'ws'): boolean {
        if (this.isConnecting) return false;

        /** 确保路径以 '/' 开头 */
        if (path && !path.startsWith('/')) {
            path = '/' + path;
        }

        const url = port ? `${protocol}://${urlOrIp}:${port}${path}` : `${protocol}://${urlOrIp}${path}`;

        try {
            this.ws = new WebSocket(url);
            this.ws.binaryType = 'arraybuffer';
            this.ws.onopen = this.onConnected.bind(this);
            this.ws.onmessage = (event) => this.onMessage(event.data);
            this.ws.onerror = (event) => {
                const errorMessage = event instanceof ErrorEvent ? event.message : '未知错误';
                logMgr.err(`WebSocket 错误:`, errorMessage);
                this.onError(errorMessage);
            };
            this.ws.onclose = this.onClosed.bind(this);
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            logMgr.err(`WebSocket 连接失败:`, errorMessage);
            this.onError(errorMessage);
            return false;
        }
    }

    /**
     * 发送数据
     * @param data 指定格式数据
     * @returns 是否发送成功
     */
    send(data: WsData): boolean {
        if (this.isActive) {
            this.ws.send(data);
            return true;
        }
        logMgr.err('WebSocket 连接未建立或已关闭');
        return false;
    }

    /**
     * 发送命令和数据
     * @param cmd 主命令码
     * @param buffer 数据
     * @param key 加密密钥（可选）
     * @returns 是否发送成功
     */
    sendBuffer(cmd: number, buffer: Uint8Array, key?: string): boolean {
        const message = new Message(cmd, buffer);
        const packedData = WsCoder.pack(message, key);
        
        if (packedData === null) {
            logMgr.err('WebSocket 数据打包失败');
            return false;
        }

        return this.send(packedData);
    }

    /**
     * 关闭WebSocket连接
     * @param code 关闭代码（可选）
     * @param reason 关闭原因（可选）
     */
    close(code?: number, reason?: string): void {
        if (this.ws) {
            try {
                this.ws.close(code, reason);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : '未知错误';
                logMgr.err(`WebSocket 关闭连接失败:`, errorMessage);
                this.onError(errorMessage);
            }
        }
    }

    /**
     * 获取当前连接状态
     * @returns 是否处于活动状态
     */
    get isActive(): boolean {
        return this.ws?.readyState === WebSocket.OPEN;
    }

    /**
     * 检查是否正在连接
     * @returns 是否正在连接
     */
    private get isConnecting(): boolean {
        return this.ws?.readyState === WebSocket.CONNECTING;
    }
}
