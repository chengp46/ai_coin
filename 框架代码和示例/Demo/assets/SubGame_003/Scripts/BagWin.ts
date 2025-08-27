import { _decorator, Button, Component, Node } from 'cc';
import UIView from '../../Core/Scripts/UI/UIView';
const { ccclass, property } = _decorator;

@ccclass('BagWin')
export class BagWin extends UIView {
    // 关闭按钮
    private closeBtn: Node = null;

    // 分包名称
    public static get pack(): string {
        return 'SubGame_003';
    }

    // 资源路径
    public static get url(): string {
        return 'Bag';
    }

    // 窗口初始
    onInit() {
        app.log.info('背包窗口_初始');

        this.closeBtn = this.node.getChildByPath('Panel/CloseBtn');
        if (this.closeBtn) {
            this.closeBtn.on(Button.EventType.CLICK, this.onCloseClick, this);
        }
    }

    // 场景隐藏
    onHide() {
        app.log.info('背包窗口_隐藏');
    }

    // 场景显示
    onShow() {
        app.log.info('背包窗口_显示');
    }

    /** 点击关闭按钮 */
    onCloseClick(): void
    {
        this.hide();
    }
}
