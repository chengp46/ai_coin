import { _decorator, Component, Node, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    /** 切换语言按钮 */
    private btn: Node = null;

    private lang: string = "zh";

    /** 加载 */
    onLoad() {
        this.btn = this.node.getChildByName('Button');
        if (this.btn) {
            this.btn.on(Button.EventType.CLICK, this.onButtonClick, this);
        }
    }

    /** 按钮点击事件处理 */
    private onButtonClick() {
        if (this.lang == 'zh') {
            this.lang = 'en';
        } else {
            this.lang = 'zh';
        }

        app.lang.changeLang(this.lang);
    }
}
