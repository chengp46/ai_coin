import { sys } from "cc";
import { logMgr } from "./LogMgr";
import { Crypt } from "../Utils/Crypt";
import { Json } from "../Utils/Json";

/** 
 * 数据管理器
 * 提供数据的存储、读取（支持文本、数字、JSON）功能。
 */
class DataMgr {
    /** 私有构造函数，确保外部无法直接通过new创建实例 */
    private constructor() {}

    /** 单例实例 */
    public static readonly instance: DataMgr = new DataMgr();

    /**
     * 存储数据
     * @param key 数据键
     * @param value 数据值，可以是文本、数字或对象
     */
    public setData(key: string, value: any): void {
        const stringValue = typeof value === "object" ? Json.stringify(value) : value.toString();
        const encryptedValue = Crypt.strEncrypt(stringValue, 'dataKey');

        try {
            sys.localStorage.setItem(key, encryptedValue);
        } catch (error) {
            logMgr.err(`数据存储失败: ${key}`, error.message);
        }
    }

    /**
     * 读取文本数据
     * @param key 数据键
     * @returns 返回对应键的数据值
     */
    public getText(key: string): string | null {
        try {
            const encryptedValue = sys.localStorage.getItem(key);
            if (encryptedValue) {
                return Crypt.strDecrypt(encryptedValue, 'dataKey');
            }
            return null;
        } catch (error) {
            logMgr.err(`文本数据读取失败: ${key}`, error.message);
            return null;
        }
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
     * 读取JSON数据
     * @param key 数据键
     * @returns 返回对应键的对象
     */
    public getJSON(key: string): any | null {
        const textValue = this.getText(key);
        if (textValue) {
            return Json.parse(textValue);
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
