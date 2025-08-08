import { _decorator, Component, Node, UITransform, Vec3, Animation, Sprite, AnimationClip, SpriteAtlas, BoxCollider2D, Contact2DType, IPhysics2DContact, PhysicsGroup, tween, UIOpacity, Label, Button, input, Input, KeyCode, EventKeyboard } from 'cc';
const { ccclass, property } = _decorator;

/** 玩家控制器 */
@ccclass('PlayerControl')
export class PlayerControl extends Component {
    @property({ type: Node, displayName: '滑板节点' })
    boardNode: Node = null;

    @property({ type: Node, displayName: '摇杆节点' })
    joyStickNode: Node = null;

    @property({ type: Node, displayName: '跳跃按钮节点' })
    jumpButtonNode: Node = null;

    @property({ type: Node, displayName: '玩家节点' })
    playerNode: Node = null;

    @property({ type: Node, displayName: '分数节点' })
    scoreNode: Node = null;

    /** 是否初始化 */
    private isInit: boolean = false;

    /** 摇杆组件 */
    private joyStick: any = null;

    /** 玩家精灵组件 */
    private playerSp: Sprite = null;

    /** 玩家精灵图集 */
    private playerSpAtlas: SpriteAtlas = null;

    /** 滑板动画组件 */
    private boardAnim: Animation = null;

    /** 滑板动画数组 */
    private boardAnimArr: Map<string, AnimationClip> = new Map();

    /** 玩家速度 */
    private speed: Vec3 = new Vec3(500, 500, 0);

    /** 当前状态：空闲、下、左一、左二、左三、右二、右三、跳跃一、跳跃二、落水 */
    private currState: string = 'Board_Idle';

    /** 玩家是否落水 */
    private isInWater: boolean = false;

    /** 分数标签组件 */
    private scoreLabel: Label = null;

    /** 当前分数 */
    private score: number = 0;

    /** 滑板的 BoxCollider2D 组件 */
    private boardCollider: BoxCollider2D = null;

    /** 玩家是否在跳跃 */
    private isJumping: boolean = false;

    /** 跳跃按钮冷却时间（秒） */
    private jumpCooldown: number = 10;

    /** 跳跃按钮是否在冷却中 */
    private isJumpCooldown: boolean = false;

    /** 加载 */
    async onLoad() {
        try {
            this.initComponents();
            await this.loadResources();
            this.bindEvents();
            this.isInit = true;
        } catch (error) {
            app.log.err('玩家控制器初始化失败', error);
        }
    }

    /** 初始化组件 */
    private initComponents() {
        this.joyStick = this.joyStickNode.getComponent('Joystick2D');
        this.playerSp = this.playerNode.getComponent(Sprite);
        this.boardAnim = this.boardNode.getComponent(Animation);
        this.boardCollider = this.boardNode.getComponent(BoxCollider2D);
        this.scoreLabel = this.scoreNode.getComponent(Label);
    }

    /** 加载资源 */
    private async loadResources() {
        this.playerSpAtlas = await app.res.loadRes<SpriteAtlas>('Game001/Res/Images/Game001');
        if (!this.playerSpAtlas) {
            app.log.err('加载玩家精灵图集失败');
            return;
        }

        const anims = await app.res.loadResDir('Game001/Res/Anim');
        if (anims) {
            anims.forEach(asset => {
                const animClip = asset as AnimationClip;
                this.boardAnimArr.set(animClip.name, animClip);
                this.boardAnim.addClip(animClip, animClip.name);
            });
        } else {
            app.log.err('加载滑板动画资源失败');
            return;
        }

        if (this.boardCollider) {
            this.boardCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        } else {
            app.log.err('未找到滑板的 BoxCollider2D 组件');
            return;
        }

        if (!this.scoreLabel) {
            app.log.err('未找到分数标签的 Label 组件');
            return;
        }
    }

    /** 绑定事件 */
    private bindEvents() {
        const jumpButton = this.jumpButtonNode.getComponent(Button);
        if (jumpButton) {
            jumpButton.node.on(Node.EventType.TOUCH_END, this.onJump, this);
        } else {
            app.log.err('未找到跳跃按钮的 Button 组件');
            return;
        }

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    /** 销毁 */
    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    /** 键盘按下事件处理 */
    private onKeyDown(event: EventKeyboard) {
        if (event.keyCode === KeyCode.SPACE) {
            this.onJump();
        }
    }

    /** 更新 */
    update(deltaTime: number) {
        if (this.isInit) {
            if (this.isInWater) {
                this.changeState('Board_Water');
                return;
            }
            if (this.isJumping) {
                this.updateScore(deltaTime);
                return;
            }
            if (this.joyStick.isMoving) {
                this.movePlayer(deltaTime);
            } else {
                this.changeState('Board_Idle');
            }
        }
    }

    /** 移动玩家 */
    private movePlayer(deltaTime: number) {
        const direction = this.joyStick.direction;
        const angle = this.joyStick.angle;

        if (direction.y > 0) {
            this.changeState('Board_Idle');
            return;
        }

        this.updateScore(deltaTime);
        this.handleDirection(angle);

        let x = this.node.getPosition().x + direction.x * this.speed.x * deltaTime;
        const screenWidthHalf = this.node.parent.getComponent(UITransform).width / 2;
        const playerWidthHalf = this.node.getComponent(UITransform).width / 2;

        if (x < -screenWidthHalf + playerWidthHalf) {
            x = -screenWidthHalf + playerWidthHalf;
        } else if (x > screenWidthHalf - playerWidthHalf) {
            x = screenWidthHalf - playerWidthHalf;
        }

        this.node.setPosition(new Vec3(x, this.node.getPosition().y, 0));
    }

    /** 处理方向 */
    private handleDirection(angle: number) {
        const angleInDegrees = (angle * 180 / Math.PI + 360) % 360;

        if (angleInDegrees >= 260 && angleInDegrees <= 270) {
            this.changeState('Board_Down');
        } else if (angleInDegrees >= 230 && angleInDegrees < 260) {
            this.changeState('Board_Left2');
        } else if (angleInDegrees > 180 && angleInDegrees < 230) {
            this.changeState('Board_Left3');
        } else if (angleInDegrees >= 270 && angleInDegrees <= 280) {
            this.changeState('Board_Down');
        } else if (angleInDegrees > 280 && angleInDegrees <= 310) {
            this.changeState('Board_Right2');
        } else if (angleInDegrees > 310 && angleInDegrees < 360) {
            this.changeState('Board_Right3');
        }
    }

    /** 更新分数 */
    private updateScore(deltaTime: number) {
        this.score += 100 * deltaTime;
        this.scoreLabel.string = Math.floor(this.score).toString();
    }

    /** 切换玩家状态 */
    private changeState(name: string) {
        if (this.currState != name) {
            this.currState = name;
            const currAnim = this.boardAnimArr.get(name);
            if (currAnim) {
                this.boardAnim.play(name);
            } else {
                app.log.err('未找到动画资源', name);
            }

            let sp = this.playerSpAtlas.getSpriteFrame('Player_01');
            switch (name) {
                case 'Board_Down':
                    sp = this.playerSpAtlas.getSpriteFrame('Player_04');
                    break;
                case 'Board_Left2':
                    sp = this.playerSpAtlas.getSpriteFrame('Player_03');
                    break;
                case 'Board_Left3':
                    sp = this.playerSpAtlas.getSpriteFrame('Player_02');
                    break;
                case 'Board_Right2':
                    sp = this.playerSpAtlas.getSpriteFrame('Player_05');
                    break;
                case 'Board_Right3':
                    sp = this.playerSpAtlas.getSpriteFrame('Player_06');
                    break;
                case 'Board_Water':
                    sp = this.playerSpAtlas.getSpriteFrame('Player_07');
                    break;
                case 'Board_Jump1':
                    sp = this.playerSpAtlas.getSpriteFrame('Player_08');
                    break;
                case 'Board_Jump2':
                    sp = this.playerSpAtlas.getSpriteFrame('Player_09');
                    break;
                default:
                    sp = this.playerSpAtlas.getSpriteFrame('Player_01');
                    break;
            }
            this.playerSp.spriteFrame = sp;
        }
    }

    /** 碰撞开始回调 */
    private onBeginContact(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact | null) {
        const otherGroupName = PhysicsGroup[otherCollider.group];
        switch (otherGroupName) {
            case 'Obs':
                app.audio.playEffect('Game001/Res/Audio/Water01');
                const obsEffects = ['Game001/Res/Audio/Obs01', 'Game001/Res/Audio/Obs02'];
                const randomObsEffect = obsEffects[Math.floor(Math.random() * obsEffects.length)];
                app.audio.playEffect(randomObsEffect);
                this.handleObsCollision();
                break;
            case 'Bot':
                app.audio.playEffect('Game001/Res/Audio/Water01');
                this.handleObsCollision();
                break;
            case 'Spring':
                this.onJump(true);
                break;
            case 'Bonus':
                app.audio.playEffect('Game001/Res/Audio/Bonus01');
                this.updateScore(5);
                otherCollider.node.destroy();
                break;
            default:
                break;
        }
    }

    /** 处理与障碍物碰撞 */
    private handleObsCollision() {
        this.joyStick.disableJoystick();
        this.isInWater = true;
        this.startBlinkingEffect();
        this.score = 0;
        this.scoreLabel.string = this.score.toString();
    }

    /** 开始闪烁特效 */
    private startBlinkingEffect() {
        const blinkDuration = 0.5;
        const blinkTimes = 6;

        const blinkTween = tween(this.node.getComponent(UIOpacity))
            .to(blinkDuration / 2, { opacity: 0 })
            .to(blinkDuration / 2, { opacity: 255 })
            .union()
            .repeat(blinkTimes)
            .call(() => {
                this.isInWater = false;
                this.joyStick.enableJoystick();
            });

        blinkTween.start();
    }

    /** 跳跃按钮点击事件处理 */
    private onJump(ignoreCooldown: boolean = false) {
        if (!this.joyStick.isMoving || this.isInWater || (!ignoreCooldown && this.isJumpCooldown)) {
            return;
        }

        const audioEffects = ['Game001/Res/Audio/Jump01', 'Game001/Res/Audio/Jump02', 'Game001/Res/Audio/Jump03'];
        const randomEffect = audioEffects[Math.floor(Math.random() * audioEffects.length)];
        app.audio.playEffect(randomEffect);

        this.isJumping = true;

        if (this.boardCollider) {
            this.boardCollider.enabled = false;
        }

        this.changeState('Board_Jump1');

        this.scheduleOnce(() => {
            this.changeState('Board_Jump2');
            this.scheduleOnce(() => {
                this.changeState('Board_Down');
                this.isJumping = false;
                this.boardCollider.enabled = true;
            }, 2);
        }, 1);

        if (!ignoreCooldown) {
            this.startJumpCooldown();
        }
    }

    /** 开始跳跃按钮冷却 */
    private startJumpCooldown() {
        this.isJumpCooldown = true;

        const jumpButton = this.jumpButtonNode.getComponent(Button);
        if (jumpButton) {
            jumpButton.interactable = false;
        }

        const jumpSprite = this.jumpButtonNode.getComponent(Sprite);
        if (jumpSprite) {
            jumpSprite.fillRange = 0;
            tween(jumpSprite)
                .to(this.jumpCooldown, { fillRange: -1 })
                .call(() => {
                    if (jumpButton) {
                        jumpButton.interactable = true;
                    }
                    this.isJumpCooldown = false;
                })
                .start();
        }
    }

    /** 获取玩家是否在跳跃 */
    public isPlayerJumping(): boolean {
        return this.isJumping;
    }
}