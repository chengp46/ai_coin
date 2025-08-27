import { Node } from "cc";
import UIComp from "./UIComp";
import { _decorator } from "cc";
import { uiRoot } from "./UIRoot";
const { ccclass } = _decorator;

/** 面板基类 */
@ccclass
export default class UIView extends UIComp {
    /** 获取包名 */
    public static get pack(): string { return ""; }

    /** 获取URL */
    public static get url(): string { return ""; }

    /** 是否模态窗 */
    public isModal: boolean = true;

    /** 是否点击空白处关闭 */
    public isClickVoidClose: boolean = true;

    /** 用户点击该层时，面板将会被关闭 */
    private clickCloseLayer: Node | null = null;

    /** 组件加载时调用 */
    onLoad(): void {
        this.onInit();
    }

    /** 组件启用时调用 */
    onEnable(): void {
        this.showWithAnimation();
    }

    /** 组件禁用时调用 */
    onDisable(): void {
        this.onHide();
    }

    /** 面板打开动画 */
    protected showWithAnimation(): void {
        this.onShow();
    }

    /** 面板关闭动画 */
    protected hideWithAnimation(): void {
        this.hideImmediately();
    }

    /** 隐藏面板 */
    public hide(): void {
        if (this.clickCloseLayer) {
            this.clickCloseLayer.removeFromParent();
        }
        this.hideWithAnimation();
    }

    /** 立即隐藏面板 */
    public hideImmediately(): void {
        this.Hide();
        uiRoot.hideWindowImmediately(this);
    }
}
