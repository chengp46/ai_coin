import { logMgr } from "../../Managers/LogMgr";

/** Http类，用于发送HTTP请求 */
export class Http {
    /**
     * 发送GET请求
     * @param url 请求的URL
     * @param params 查询参数
     * @param callback 回调函数，接收返回数据
     * @param retries 重试次数
     * @param timeout 超时时间
     */
    public static async get(url: string, params: Record<string, any> = {}, callback: (data: any) => void, retries: number = 3, timeout: number = 5000): Promise<void> {
        const queryString = Http.formEncode(params);
        const fullUrl = `${url}?${queryString}`;
        await Http.httpRequest(fullUrl, { method: 'GET' }, callback, retries, timeout);
    }

    /**
     * 发送POST请求
     * @param url 请求的URL
     * @param body 请求体
     * @param callback 回调函数，接收返回数据
     * @param contentType 内容类型
     * @param retries 重试次数
     * @param timeout 超时时间
     */
    public static async post(url: string, body: any, callback: (data: any) => void, contentType: string = 'json', retries: number = 3, timeout: number = 5000): Promise<void> {
        const { headers, bodyData } = Http.preparePostData(body, contentType);
        await Http.httpRequest(url, { method: 'POST', headers, body: bodyData }, callback, retries, timeout);
    }

    /**
     * 准备POST请求的数据
     * @param body 请求体
     * @param contentType 内容类型
     * @returns headers和bodyData
     */
    private static preparePostData(body: any, contentType: string): { headers: Record<string, string>, bodyData: string } {
        const headers: Record<string, string> = {};
        let bodyData = '';

        switch (contentType) {
            case 'json':
                headers['Content-Type'] = 'application/json';
                bodyData = typeof body === 'string' ? body : JSON.stringify(body);
                break;
            case 'form':
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                bodyData = typeof body === 'string' ? body : Http.formEncode(body);
                break;
        }

        return { headers, bodyData };
    }

    /**
     * 发送HTTP请求
     * @param url 请求的URL
     * @param options 请求选项
     * @param callback 回调函数，接收返回数据
     * @param retries 重试次数
     * @param timeout 超时时间
     */
    private static async httpRequest(url: string, options: RequestInit, callback: (data: any) => void, retries: number, timeout: number): Promise<void> {
        for (let attempt = 0; attempt < retries; attempt++) {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            options.signal = controller.signal;

            try {
                const response = await fetch(url, options);
                clearTimeout(id);

                if (response.ok) {
                    const data = await response.json();
                    callback(data);  // 调用回调函数，传递数据
                    return;
                } else {
                    logMgr.err(`${options.method} 请求失败: ${response.statusText}`);
                }
            } catch (error) {
                clearTimeout(id);
                logMgr.err(`${options.method} 请求异常: ${error}`);
            }

            if (attempt < retries - 1) {
                logMgr.warn(`${options.method} 重试中... 剩余尝试次数: ${retries - attempt - 1}`);
                await Http.delay(timeout);
            }
        }
        throw new Error('HTTP请求失败，已达到最大重试次数。');
    }

    /**
     * 将对象编码为查询字符串
     * @param data 要编码的数据
     * @returns 编码后的字符串
     */
    private static formEncode(data: Record<string, any>): string {
        return Object.keys(data)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
            .join('&');
    }

    /**
     * 延迟指定的毫秒数
     * @param ms 延迟时间
     * @returns Promise
     */
    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
