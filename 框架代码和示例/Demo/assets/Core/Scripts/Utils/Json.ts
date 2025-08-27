/**
 * Json工具类
 * 提供JSON字符串与对象之间的转换功能。
 */
export class Json {
    /**
     * 将JSON字符串解析为对象。
     * @param text 要解析的JSON字符串。
     * @returns 解析后的对象或null（如果解析失败）。
     */
    public static parse(text: string): any {
        try {
            return JSON.parse(text);
        } catch (error) {
            return null;
        }
    }

    /**
     * 将对象序列化为JSON字符串。
     * @param value 要序列化的对象。
     * @returns 序列化后的JSON字符串或空字符串（如果序列化失败）。
     */
    public static stringify(value: any): string {
        try {
            return JSON.stringify(value);
        } catch (error) {
            return '';
        }
    }
}
