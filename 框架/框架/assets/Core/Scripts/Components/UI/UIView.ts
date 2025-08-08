import { _decorator, Component } from 'cc';
import { logMgr } from '../../Managers/LogMgr';
const { ccclass } = _decorator;

/** UI视图组件 */
@ccclass('UIView')
export class UIView extends Component {
    /** 组件数据 */
    private data: Map<string, any> = new Map();

    /** 组件加载时调用 */
    onLoad() {
        this.onInit();
    }

    /** 组件启用时调用 */
    onEnable() {
        this.onShow();
    }

    /** 组件禁用时调用 */
    onDisable() {
        this.onHide();
    }

    /** 组件销毁时调用 */
    onDestroy() {
        this.clearData();
    }

    /** 初始化组件 */
    protected onInit(): void {
        /** 初始化逻辑 */
    }

    /** 显示组件 */
    protected onShow(): void {
        /** 显示逻辑，如打开动画 */
    }

    /** 隐藏组件 */
    protected onHide(): void {
        /** 隐藏逻辑，如关闭动画 */
    }

    /**
     * 设置组件数据
     * @param key 数据键
     * @param value 数据值
     */
    public setData(key: string, value: any): void {
        this.data.set(key, value);
    }

    /**
     * 获取组件数据
     * @param key 数据键
     * @returns 数据值或null
     */
    public getData(key: string): any {
        if (!this.data.has(key)) {
            logMgr.err(`获取失败: 键${key}在数据中不存在`);
            return null;
        }
        return this.data.get(key);
    }

    /**
     * 删除组件数据
     * @param key 数据键
     */
    public deleteData(key: string): void {
        if (!this.data.has(key)) {
            logMgr.err(`删除失败: 键${key}在数据中不存在`);
            return;
        }
        this.data.delete(key);
    }

    /** 清空组件数据 */
    public clearData(): void {
        this.data.clear();
    }

    /** 获取包名 */
    public static get pack(): string {
        return '';
    }

    /** 获取URL */
    public static get url(): string {
        return '';
    }
}
