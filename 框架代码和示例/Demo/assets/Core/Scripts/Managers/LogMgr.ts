/**
 * 日志管理器
 * 用于统一日志输出格式
 */
class LogMgr {
    /**
     * 用于输出调试信息
     */
    static get debug() {
        return window.console.log.bind(window.console, '%c【调试】', 'color: white; background-color: #007BFF; font-weight: bold; font-size: 14px;');
    }

    /**
     * 用于输出一般信息
     */
    static get info() {
        return window.console.log.bind(window.console, '%c【信息】', 'color: white; background-color: #28A745; font-weight: bold; font-size: 14px;');
    }

    /**
     * 用于输出警告信息
     */
    static get warn() {
        return window.console.log.bind(window.console, '%c【警告】', 'color: black; background-color: #FFC107; font-weight: bold; font-size: 14px;');
    }

    /**
     * 用于输出错误信息
     */
    static get err() {
        return window.console.log.bind(window.console, '%c【错误】', 'color: white; background-color: #DC3545; font-weight: bold; font-size: 14px;');
    }
}

/** 日志管理器实例 */
export const logMgr = LogMgr
