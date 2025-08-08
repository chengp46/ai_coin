import { logMgr } from "../Managers/LogMgr";

/** JSON工具类 */
export class JsonUtil {
    /**
     * 将JSON字符串解析为对象。
     * @param jsonStr 要解析的JSON字符串。
     * @returns 解析后的对象或null
     */
    public static parse(jsonStr: string): any | null {
        try {
            return JSON.parse(jsonStr);
        } catch (error) {
            logMgr.err('JSON解析错误:', error);
            return null;
        }
    }

    /**
     * 将JSON字符串解析为指定类型的对象。
     * @param jsonStr 要解析的JSON字符串。
     * @returns 解析后的对象或null
     */
    public static parseWithType<T>(jsonStr: string): T | null {
        try {
            return JSON.parse(jsonStr) as T;
        } catch (error) {
            logMgr.err('泛型JSON解析错误:', error);
            return null;
        }
    }

    /**
     * 将对象序列化为JSON字符串。
     * @param value 要序列化的对象。
     * @param space 用于指定JSON字符串的缩进格式（可选，默认为无缩进）。
     * @returns 序列化后的JSON字符串或null
     */
    public static stringify(value: any, space?: number): string | null {
        try {
            return JSON.stringify(value, null, space);
        } catch (error) {
            logMgr.err('JSON序列化错误:', error);
            return null;
        }
    }
}
