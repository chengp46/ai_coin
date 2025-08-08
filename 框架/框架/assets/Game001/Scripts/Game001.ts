import { _decorator } from 'cc';
import { UIView } from '../../Core/Scripts/Components/UI/UIView';
const { ccclass } = _decorator;

/** 游戏入口 */
@ccclass('Game001')
export class Game001 extends UIView {
    /** 分包名称 */
    public static get pack(): string {
        return 'Game001';
    }

    /** 资源路径 */
    public static get url(): string {
        return 'Game001';
    }

    /** 初始化 */
    onInit(): void {
        app.audio.playMusic('Game001/Res/Audio/Bg');
    }
}
