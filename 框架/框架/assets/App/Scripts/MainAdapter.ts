import { _decorator, Component, view, screen, Size, ResolutionPolicy, director, UITransform } from 'cc';
const { ccclass } = _decorator;

/** 主适配器 */
@ccclass('MainAdapter')
export class MainAdapter extends Component {
    /** 画布节点大小属性 */
    private canvasTransform: UITransform | null = null;

    /** 内容节点大小属性 */
    private contentTransform: UITransform | null = null;

    /** 上次检查尺寸 */
    private lastCheckSize: Size = new Size();

    /** 上次检查时间 */
    private lastCheckTime: number = 0;

    /** 加载 */
    onLoad() {
        const canvasNode = director.getScene()?.getChildByName('Canvas');
        this.canvasTransform = canvasNode?.getComponent(UITransform);

        const contentNode = canvasNode?.getChildByName('Content');
        this.contentTransform = contentNode?.getComponent(UITransform);

        if (!this.canvasTransform || !this.contentTransform) {
            app.log.err('画布或内容节点大小属性未设置');
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
        if (this.canvasTransform && this.contentTransform) {
            /** 获取屏幕尺寸 */
            const winSize = screen.windowSize;
            if (!this.lastCheckSize.equals(winSize)) {
                try {
                    const ratio = winSize.width / winSize.height;
                    const designResolutionSize = view.getDesignResolutionSize();
                    const designRatio = designResolutionSize.width / designResolutionSize.height;

                    /** 设置分辨率策略 */
                    const policy = ratio > designRatio ? ResolutionPolicy.FIXED_HEIGHT : ResolutionPolicy.FIXED_WIDTH;
                    view.setResolutionPolicy(policy);

                    this.lastCheckSize.set(winSize.width, winSize.height);

                    /** 调整内容尺寸 */
                    if (ratio > designRatio) {
                        this.contentTransform.setContentSize(designResolutionSize.width * (ratio / designRatio), designResolutionSize.height);
                    } else {
                        this.contentTransform.setContentSize(designResolutionSize.width, designResolutionSize.height * (designRatio / ratio));
                    }
                } catch (error) {
                    app.log.err('主适配器发生错误:', error);
                }
            }
        }
    }
}
