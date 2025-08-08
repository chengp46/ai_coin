import { _decorator, Component, Size, director, UITransform } from 'cc';
import { logMgr } from '../../Managers/LogMgr';
const { ccclass } = _decorator;

/** 子适配器 */
@ccclass('SubAdapter')
export class SubAdapter extends Component {
    /** 画布节点大小属性 */
    private canvasTransform: UITransform | null = null;

    /** 当前节点大小属性 */
    private currTransform: UITransform | null = null;

    /** 上次检查尺寸 */
    private lastCheckSize: Size = new Size();

    /** 上次检查时间 */
    private lastCheckTime: number = 0;

    /** 加载 */
    onLoad() {
        const canvasNode = director.getScene()?.getChildByName('Canvas');
        this.canvasTransform = canvasNode?.getComponent(UITransform);
        this.currTransform = this.node.getComponent(UITransform);

        if (!this.canvasTransform || !this.currTransform) {
            logMgr.err('画布或当前节点大小属性未设置');
        }
    }

    /** 开始 */
    start() {
        this.autoSetSize();
    }

    /** 更新 */
    update(dt: number) {
        this.lastCheckTime += dt;
        /** 检查频率 */
        if (this.lastCheckTime >= 0.1) {
            this.lastCheckTime = 0;
            this.autoSetSize();
        }
    }

    /** 自动调整 */
    private async autoSetSize(): Promise<void> {
        if (this.canvasTransform && this.currTransform) {
            const canvasSize = this.canvasTransform.contentSize;
            if (!this.lastCheckSize.equals(canvasSize)) {
                try {
                    this.currTransform.contentSize = canvasSize;
                    this.lastCheckSize.set(canvasSize);
                } catch (error) {
                    logMgr.err('子适配器发生错误:', error);
                }
            }
        }
    }
}
