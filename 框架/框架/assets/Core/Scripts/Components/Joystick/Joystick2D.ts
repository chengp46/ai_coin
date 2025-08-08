import { _decorator, Component, Node, Vec3, Touch, UITransform } from 'cc';
const { ccclass, property } = _decorator;

/** 摇杆组件 */
@ccclass('Joystick2D')
export class Joystick2D extends Component {
    @property({ type: Node, displayName: '摇杆方向节点' })
    private thumbNode: Node | null = null;

    @property({ displayName: '摇杆方向范围', tooltip: '正:变大 负:变小' })
    private limitRange: number = 0;

    /** 触摸ID */
    private activeTouchId: number | null = null;

    /** 用于保存移动方向向量 */
    public direction: Vec3 = new Vec3(0, 0, 0);

    /** 保存弧度(角度) */
    public angle: number = 0;

    /** 是否正在移动 */
    public isMoving: boolean = false;

    /** 加载 */
    onLoad() {
        /** 计算摇杆范围 */
        const touchAreaTransform = this.node.getComponent(UITransform);
        if (touchAreaTransform) {
            this.limitRange += touchAreaTransform.contentSize.width / 2;
        }
    }

    /** 开始 */
    start() {
        this.addTouchEvent();
    }

    /** 更新 */
    update() {
        /** 限制摇杆移动时的范围 */
        if (this.isMoving) {
            this.limitThumbRange();
        }
    }

    /** 销毁 */
    onDestroy() {
        this.stop();
    }

    /** 添加触摸事件监听 */
    private addTouchEvent(): void {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    /** 移除触摸事件监听 */
    private removeTouchEvent(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    /** 停止监听触摸事件 */
    public stop(): void {
        this.removeTouchEvent();
        this.resetThumbPosition();
        this.enabled = false;
    }

    /** 触摸开始事件处理 */
    private onTouchStart(event: Touch): void {
        this.thumbNode?.setPosition(new Vec3(0, 0, 0));
        this.activeTouchId = event.getID();
        this.isMoving = false;
        this.enabled = true;
    }

    /** 触摸移动事件处理 */
    private onTouchMove(event: Touch): void {
        if (this.activeTouchId !== event.getID()) return;

        const delta = event.getDelta();
        const currentPosition = this.thumbNode?.getPosition() || new Vec3();
        const newPosition = new Vec3(currentPosition.x + delta.x, currentPosition.y + delta.y, 0);
        this.thumbNode?.setPosition(newPosition);
        this.isMoving = true;
    }

    /** 限制摇杆范围 */
    private limitThumbRange(): void {
        const thumbPosition = this.thumbNode?.position || new Vec3();
        const length = thumbPosition.length();
        const ratio = length / this.limitRange;

        if (ratio > 1) {
            const limitedPosition = thumbPosition.multiplyScalar(1 / length).multiplyScalar(this.limitRange);
            this.thumbNode?.setPosition(limitedPosition);
        }

        this.direction.set(thumbPosition.x / length, thumbPosition.y / length, 0);
        this.angle = Math.atan2(thumbPosition.y, thumbPosition.x);
    }

    /** 触摸结束事件处理 */
    private onTouchEnd(event: Touch): void {
        if (this.activeTouchId !== event.getID()) return;
        this.resetThumbPosition();
    }

    /** 触摸取消事件处理 */
    private onTouchCancel(event: Touch): void {
        if (this.activeTouchId !== event.getID()) return;
        this.resetThumbPosition();
    }

    /** 重置摇杆 */
    private resetThumbPosition(): void {
        this.thumbNode?.setPosition(new Vec3(0, 0, 0));
        this.isMoving = false;
        this.activeTouchId = null;
    }

    /** 启动摇杆 */
    public enableJoystick(): void {
        this.enabled = true;
        this.addTouchEvent();
    }

    /** 禁用摇杆 */
    public disableJoystick(): void {
        this.enabled = false;
        this.removeTouchEvent();
        this.resetThumbPosition();
    }
}
