import { sys } from 'cc';
import { logMgr } from './LogMgr';
import { CryptUtil } from '../Tools/CryptUtil';
import { JsonUtil } from '../Tools/JsonUtil';

/** 数据管理器
 * 提供数据的存储、读取（支持文本、数字、JSON）功能 
 */
class DataMgr {
    /** 加密密钥 */
    private readonly encryptionKey: string = 'dataKey';

    /** 私有构造函数，确保外部无法直接通过new创建实例 */
    private constructor() {}

    /** 单例实例 */
    public static readonly instance: DataMgr = new DataMgr();

    /**
     * 存储数据
     * @param key 数据键
     * @param value 数据值，可以是文本、数字或对象
     */
    public setData(key: string, value: unknown): void {
        const stringValue = typeof value === 'object' ? JsonUtil.stringify(value) : String(value);
        if (stringValue !== null) {
            //const encryptedValue = CryptUtil.encryptText(stringValue, this.encryptionKey);
            if (stringValue !== null) {
                sys.localStorage.setItem(key, stringValue);
            } else {
                logMgr.err(`存储数据失败: ${key}, 加密错误`);
            }
        } else {
            logMgr.err(`数据序列化失败: ${key}`);
        }
    }

    /**
     * 读取文本数据
     * @param key 数据键
     * @returns 返回对应键的数据值
     */
    public getText(key: string): string | null {
        const encryptedValue = sys.localStorage.getItem(key);
        if (encryptedValue) {
           // const decryptedValue = CryptUtil.decryptText(encryptedValue, this.encryptionKey);
            if (encryptedValue !== null) {
                return encryptedValue;
            } else {
                logMgr.err(`读取数据失败: ${key}, 解密错误`);
            }
        }
        return null;
    }

    /**
     * 读取数字数据
     * @param key 数据键
     * @returns 返回对应键的数字值
     */
    public getNumber(key: string): number | null {
        const textValue = this.getText(key);
        if (textValue) {
            const numberValue = Number(textValue);
            return isNaN(numberValue) ? null : numberValue;
        }
        return null;
    }

    /**
     * 读取JSON数据（不带泛型）
     * @param key 数据键
     * @returns 返回对应键的对象
     */
    public getJSON(key: string): any | null {
        const textValue = this.getText(key);
        if (textValue) {
            const obj = JsonUtil.parse(textValue);
            if (obj !== null) {
                return obj;
            } else {
                logMgr.err(`读取JSON数据失败: ${key}, 解析错误`);
            }
        }
        return null;
    }

    /**
     * 读取JSON数据（带泛型）
     * @param key 数据键
     * @returns 返回对应键的对象
     */
    public getJSONWithType<T>(key: string): T | null {
        const textValue = this.getText(key);
        if (textValue) {
            const obj = JsonUtil.parseWithType<T>(textValue);
            if (obj !== null) {
                return obj;
            } else {
                logMgr.err(`读取泛型JSON数据失败: ${key}, 解析错误`);
            }
        }
        return null;
    }

    /**
     * 删除数据
     * @param key 数据键
     */
    public removeData(key: string): void {
        sys.localStorage.removeItem(key);
    }

    /** 清空所有数据 */
    public clearAllData(): void {
        sys.localStorage.clear();
    }
}

/** 数据管理器实例 */
export const dataMgr = DataMgr.instance;
