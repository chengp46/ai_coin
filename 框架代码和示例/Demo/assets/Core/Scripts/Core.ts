// 管理器
import { audioMgr } from "./Managers/AudioMgr";
import { bundleMgr } from "./Managers/BundleMgr";
import { dataMgr } from "./Managers/DataMgr";
import { eventMgr } from "./Managers/EventMgr";
import { langMgr } from "./Managers/LangMgr";
import { logMgr } from "./Managers/LogMgr";
import { resMgr } from "./Managers/ResMgr";
import { timeMgr } from "./Managers/TimeMgr";
import { uiRoot } from "./UI/UIRoot";

/**
 * Core 类
 * 负责映射导出框架接口
 */
class Core {
    /** 音频管理器 */
    public audio = audioMgr;

    /** 分包管理器 */
    public bundle = bundleMgr;

    /** 数据管理器 */
    public data = dataMgr;

    /** 事件管理器 */
    public event = eventMgr;

    /** 语言管理器 */
    public lang = langMgr;

    /** 日志管理器 */
    public log = logMgr;

    /** 资源管理器 */
    public res = resMgr;

    /** 时间管理器 */
    public time = timeMgr;

    /** 界面管理器 */
    public ui = uiRoot;
}

/** 全局 Window 接口 */
declare global {
    interface Window {
        app: Core;
    }
    const app: Core;
}

/** 创建 Core 类的实例并赋值给全局 window 对象 */
window.app = new Core();