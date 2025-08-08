import { _decorator, Component, Label, ProgressBar } from 'cc';
const { ccclass } = _decorator;

/** 入口文件 */
@ccclass('Main')
export class Main extends Component {
    /** 进度条组件 */
    private progressBar: ProgressBar | null = null;

    /** 进度标签组件 */
    private progressLabel: Label | null = null;

    /** 加载 */
    onLoad() {
        app.log.version('1.0.0', '2024/09/08');

        /** 获取进度条组件 */
        const progressBarNode = this.node.getChildByPath('Content/ProgressBar');
        this.progressBar = progressBarNode?.getComponent(ProgressBar);

        /** 获取进度标签组件 */
        const progressLabelNode = this.node.getChildByPath('Content/ProgressBar/Progress');
        this.progressLabel = progressLabelNode?.getComponent(Label);

        if (!this.progressLabel || !this.progressBar) {
            app.log.err('进度条或进度标签组件未初始');
        }
    }

    /** 开始 */
    start() {
        this.loadGame();
    }
    
    /** 加载游戏 */
    private async loadGame(): Promise<void> {
        const bundle = await app.bundle.getBundle('Game001', this.onProgress);
        if (bundle !== null) {
             /** 加载完毕 */
             app.ui.showUI('Game001');
        }
    }

    /** 加载回调 */
    private onProgress = (progress: number): void => {
        if (this.progressLabel && this.progressBar) {
            this.progressLabel.string = `${Math.floor(progress * 100)}%`;
            this.progressBar.progress = progress;
        }
    }
}
