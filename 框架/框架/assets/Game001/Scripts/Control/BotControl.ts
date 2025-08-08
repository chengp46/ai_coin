import { _decorator, Component, Vec3, SpriteAtlas, Sprite, BoxCollider2D, Contact2DType, IPhysics2DContact, PhysicsGroup } from 'cc';
const { ccclass } = _decorator;

/** 机器人控制器 */
@ccclass('BotControl')
export class BotControl extends Component {
    /** 机器人速度 */
    private speed: Vec3 = new Vec3(50, 50, 0);

    /** 机器人精灵图集 */
    private botSpAtlas: SpriteAtlas = null;

    /** 机器人方向 */
    direction: Vec3 = new Vec3(1, -1, 0);

    /** 是否可以移动 */
    canMove: boolean = true;

    /** 机器人精灵 */
    private botSprite: Sprite = null;

    /** 是否初始化 */
    private isInit: boolean = false;

    /** 加载 */
    async onLoad() {
        try {
            this.botSpAtlas = await app.res.loadRes<SpriteAtlas>('Game001/Res/Images/Game001');
            this.botSprite = this.node.getComponent(Sprite);
            const botCollider = this.node.getComponent(BoxCollider2D);
            botCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.isInit = true;
        } catch (error) {
            app.log.err('机器人控制器初始化失败', error);
        }
    }

    /** 更新 */
    update(deltaTime: number) {
        if (this.isInit) {
            this.moveBot(deltaTime);
        }
    }

    /** 移动机器人 */
    private moveBot(deltaTime: number) {
        if (!this.canMove) return;

        let position = this.node.getPosition();
        position.x += this.direction.x * this.speed.x * deltaTime;
        position.y += this.direction.y * this.speed.y * deltaTime;

        const directionState = this.direction.x < 0 ? 'left' : 'right';
        this.setBotSprite(this.botSprite, this.node.name, directionState);

        if (Math.random() < 0.003) this.direction.x *= -1;

        this.node.setPosition(position);
    }

    /** 设置机器人精灵 */
    private setBotSprite(botSp: Sprite, botName: string, state: 'left' | 'right' | 'wave') {
        const spriteMap = {
            'Bot01': ['Role01', 'Role02', 'Role03'],
            'Bot02': ['Role04', 'Role05', 'Role06'],
            'Bot03': ['Role07', 'Role08', 'Role09'],
            'Bot04': ['Role10', 'Role11', 'Role12']
        };

        const spriteIndex = state === 'left' ? 0 : state === 'right' ? 1 : 2;
        botSp.spriteFrame = this.botSpAtlas.getSpriteFrame(spriteMap[botName][spriteIndex]);
    }

    /** 碰撞开始回调 */
    private onBeginContact(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact | null) {
        const otherGroupName = PhysicsGroup[otherCollider.group];
        if (otherGroupName === 'Player') {
            this.playCollisionSound(selfCollider.node.name);
        }

        if (['Obs', 'Player'].indexOf(otherGroupName) !== -1) {
            this.handleObsCollision();
        }
    }

    /** 播放碰撞音效 */
    private playCollisionSound(botName: string) {
        if (botName === 'Bot01') {
            app.audio.playEffect('Game001/Res/Audio/Bot01');
        } else {
            const audioEffects = ['Game001/Res/Audio/Bot02', 'Game001/Res/Audio/Bot03', 'Game001/Res/Audio/Bot04'];
            const randomEffect = audioEffects[Math.floor(Math.random() * audioEffects.length)];
            app.audio.playEffect(randomEffect);
        }
    }

    /** 处理与障碍物碰撞 */
    private handleObsCollision() {
        this.setBotSprite(this.botSprite, this.node.name, 'wave');
        this.canMove = false;
        this.scheduleOnce(() => {
            this.canMove = true;
        }, 3);
    }
}