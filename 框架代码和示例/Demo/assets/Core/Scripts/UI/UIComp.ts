import { _decorator, Component } from "cc";
const { ccclass } = _decorator;

/** 基础UI组件类 */
@ccclass
export default class UIComponent extends Component {
    /** 组件数据 */
    public data: any;

    /** 组件加载时调用 */
    onLoad(): void {
        this.onInit();
    }

    /** 组件启用时调用 */
    onEnable(): void {
        this.onShow();
    }

    /** 组件禁用时调用 */
    onDisable(): void {
        this.onHide();
    }

    /** 初始化组件 */
    protected onInit(): void {
        // 初始化逻辑
    }

    /** 显示组件 */
    protected onShow(): void {
        // 显示逻辑
    }

    /** 隐藏组件 */
    protected onHide(): void {
        // 隐藏逻辑
    }

    /**
     * 隐藏组件，并根据需要销毁节点
     * @param isDispose - 如果为 true，则销毁节点；否则仅移除节点
     */
    protected Hide(isDispose: boolean = false): void {
        if (isDispose) {
            this.node.destroy();
        } else {
            this.node.removeFromParent();
        }
    }
}
