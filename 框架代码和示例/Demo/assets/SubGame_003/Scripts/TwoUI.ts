import { _decorator, Button, Component, Node } from 'cc';
import { UIScene } from '../../Core/Scripts/UI/UIScene';
import { OneUI } from './OneUI';
import { BagWin } from './BagWin';
const { ccclass, property } = _decorator;

@ccclass('TwoUI')
export class TwoUI extends UIScene {
    // 打开界面二按钮
    private btn: Node = null;

    // 关闭按钮
    private closeBtn: Node = null;

    // 分包名称
    public static get pack(): string {
        return 'SubGame_003';
    }

    // 资源路径
    public static get url(): string {
        return 'TwoUI';
    }

    // 场景初始
    onInit() {
        app.log.info('分包场景2_初始');

        this.btn = this.node.getChildByName('Button');
        if (this.btn) {
            this.btn.on(Button.EventType.CLICK, this.onOpenClick, this);
        }

        this.closeBtn = this.node.getChildByName('CloseBtn');
        if (this.closeBtn) {
            this.closeBtn.on(Button.EventType.CLICK, this.onCloseClick, this);
        }
    }

    // 场景隐藏
    onHide() {
        app.log.info('分包场景2_隐藏');
    }

    // 场景显示
    onShow() {
        app.log.info('分包场景2_显示');
    }

    /** 点击打开按钮 */
    onOpenClick() {
        app.ui.showWindow(BagWin);
    }

    /** 点击关闭按钮 */
    onCloseClick(): void
    {
        app.ui.showScene(OneUI);
    }
}
