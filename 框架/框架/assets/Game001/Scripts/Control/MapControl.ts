import { _decorator, Component, Node, Vec3, UITransform, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

/** 地图控制器 */
@ccclass('MapControl')
export class MapControl extends Component {
    @property({ type: Node, displayName: '玩家控制器节点' })
    playerNode: Node = null;

    @property({ type: Node, displayName: '摇杆节点' })
    joyStickNode: Node = null;

    @property({ type: Node, displayName: '场景背景节点' })
    mainBgNode: Node = null;

    @property({ type: Node, displayName: '过渡背景节点' })
    transBgNode: Node = null;

    @property({ type: Node, displayName: '动态背景节点' })
    dynamicBgNode: Node = null;

    /** 是否初始化 */
    private isInit: boolean = false;

    /** 预制体数组 */
    private prefabs: { [key: string]: Prefab[] } = {
        land: [],
        grass: [],
        wave: [],
        sob: [],
        spring: [],
        bot: [],
        bonus: []
    };

    /** 摇杆组件 */
    private joyStick: any = null;

    /** 玩家控制器组件 */
    private playerControl: any = null;

    /** 背景移动速度 */
    private speed: Vec3 = new Vec3(500, 500, 0);

    /** 背景大小 */
    private mainBgTransform: UITransform = null;

    /** 加载 */
    async onLoad() {
        try {
            this.joyStick = this.joyStickNode.getComponent('Joystick2D');
            this.playerControl = this.playerNode.getComponent('PlayerControl');
            this.mainBgTransform = this.mainBgNode.getComponent(UITransform);

            const prefabPaths = {
                land: 'Game001/Res/Prefab/Land',
                grass: 'Game001/Res/Prefab/Grass',
                wave: 'Game001/Res/Prefab/Wave',
                sob: 'Game001/Res/Prefab/Sob',
                spring: 'Game001/Res/Prefab/Spring',
                bot: 'Game001/Res/Prefab/Bot',
                bonus: 'Game001/Res/Prefab/Bonus'
            };

            for (const key in prefabPaths) {
                await this.loadPrefabs(prefabPaths[key], this.prefabs[key]);
            }

            this.clearAndAddPrefab(this.dynamicBgNode);
            this.isInit = true;
        } catch (error) {
            app.log.err('地图控制器初始化失败', error);
        }
    }

    /** 更新 */
    update(deltaTime: number) {
        if (this.isInit && (this.joyStick.isMoving || this.playerControl.isPlayerJumping())) {
            this.moveBackgrounds(deltaTime);
        }
    }

    /** 移动背景 */
    private moveBackgrounds(deltaTime: number) {
        const direction = this.joyStick.direction;
        if (direction.y > 0 && !this.playerControl.isPlayerJumping()) return;

        const moveDistance = this.speed.y * deltaTime;
        this.moveNode(this.mainBgNode, moveDistance);
        this.moveNode(this.transBgNode, moveDistance);
        this.moveNode(this.dynamicBgNode, moveDistance);
        this.resetBackgroundPosition();
    }

    /** 移动单个节点 */
    private moveNode(node: Node, moveDistance: number) {
        node.setPosition(node.position.x, node.position.y + moveDistance, node.position.z);
    }

    /** 加载预制体 */
    private async loadPrefabs(path: string, prefabArray: Prefab[]) {
        const prefabs = await app.res.loadResDir(path);
        if (prefabs) {
            prefabs.forEach(asset => prefabArray.push(asset as Prefab));
        } else {
            app.log.err(`加载预制体失败: ${path}`);
        }
    }

    /** 清理并添加新的预制体 */
    private clearAndAddPrefab(node: Node) {
        this.clearNodeChildren(node);
        this.addRandomPrefab(node, this.prefabs.land, 1, 2);
        this.addRandomPrefab(node, this.prefabs.grass, 1, 3);
        this.addRandomPrefab(node, this.prefabs.wave, 1, 2);
        this.addRandomPrefab(node, this.prefabs.sob, 1, 10);
        this.addRandomPrefab(node, this.prefabs.spring, 0, 1);
        this.addRandomPrefab(node, this.prefabs.bonus, 0, 3);
    }

    /** 清理节点下的所有子节点 */
    private clearNodeChildren(node: Node) {
        node.removeAllChildren();
    }

    /** 添加随机预制体 */
    private addRandomPrefab(node: Node, prefabArray: Prefab[], minCount: number, maxCount: number) {
        const count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * prefabArray.length);
            const prefabInstance = instantiate(prefabArray[randomIndex]);
            this.setPositionAndAddChild(node, prefabInstance);
        }
    }

    /** 设置预制体位置并添加到节点 */
    private setPositionAndAddChild(node: Node, prefabInstance: Node) {
        const nodeTransform = node.getComponent(UITransform);
        const prefabTransform = prefabInstance.getComponent(UITransform);

        const anchorOffsetX = prefabTransform.contentSize.width * prefabTransform.anchorX;
        const anchorOffsetY = prefabTransform.contentSize.height * prefabTransform.anchorY;

        const randomX = (Math.random() * (nodeTransform.contentSize.width - prefabTransform.contentSize.width)) - (nodeTransform.contentSize.width / 2) + anchorOffsetX;
        const randomY = (Math.random() * (nodeTransform.contentSize.height - prefabTransform.contentSize.height)) - (nodeTransform.contentSize.height / 2) + anchorOffsetY;

        prefabInstance.setPosition(randomX, randomY, 0);
        node.addChild(prefabInstance);
    }

    /** 检查并重置背景位置 */
    private resetBackgroundPosition() {
        const bgHeight = this.mainBgTransform.contentSize.height;

        this.checkAndResetPosition(this.mainBgNode, this.dynamicBgNode, bgHeight);
        this.checkAndResetPosition(this.transBgNode, this.mainBgNode, bgHeight);
        this.checkAndResetPosition(this.dynamicBgNode, this.transBgNode, bgHeight);
    }

    /** 检查并重置单个背景节点位置 */
    private checkAndResetPosition(node: Node, referenceNode: Node, height: number) {
        if (node.position.y >= height) {
            node.setPosition(node.position.x, referenceNode.position.y - height, node.position.z);
            this.clearAndAddPrefab(node);
            this.addRandomPrefab(node, this.prefabs.bot, 0, 10);
        }
    }
}