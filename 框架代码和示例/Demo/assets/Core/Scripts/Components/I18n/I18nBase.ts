import { _decorator, Component } from 'cc';
import { eventMgr } from '../../Managers/EventMgr';
const { ccclass } = _decorator;

/** 多语言抽象组件基类 */
@ccclass('I18nBase')
export abstract class I18nBase extends Component {
    /** 组件加载时调用，注册语言更改事件 */
    onLoad(): void {
        eventMgr.on('langChange', this.refresh, this);
        this.refresh();
    }

    /** 组件销毁时调用，注销语言更改事件 */
    onDestroy(): void {
        eventMgr.off('langChange', this.refresh);
    }

    /** 刷新多语言，子类需实现具体逻辑 */
    public abstract refresh(): void;
}
