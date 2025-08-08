/**
 * 日志管理器
 * 用于统一日志输出格式
 */
class LogMgr {
    private static createLogger(method: 'log' | 'debug' | 'info' | 'warn' | 'error', level: string, color: string): (...args: any[]) => void {
        return window.console[method].bind(
            window.console,
            `%c【${level}】`,
            `color: white; background-color: ${color}; font-weight: bold; font-size: 14px;`
        );
    }

    /** 用于输出调试信息 */
    static debug = LogMgr.createLogger('log', '调试', '#007BFF');

    /** 用于输出一般信息 */
    static info = LogMgr.createLogger('info', '信息', '#28A745');

    /** 用于输出警告信息 */
    static warn = LogMgr.createLogger('warn', '警告', '#FFC107');

    /** 用于输出错误信息 */
    static err = LogMgr.createLogger('error', '错误', '#DC3545');

    /**
     * 输出框架版本信息
     */
    static version(ver: string, date: string) {
        const styles = [
            "background: #fd6623; padding:5px 0; border: 5px;",
            "background: #272c31; color: #fafafa; padding:5px 0;",
            "background: #39a3e4; padding:5px 0;",
            "background: #ffffff; color: #000000; padding:5px 0;"
        ];

        const message = `%c    %c    cocos小白框架 ${ver} ${date}    %c    %c`;

        window.console.log(message, ...styles);
    }
}

/** 日志管理器实例 */
export const logMgr = LogMgr;
