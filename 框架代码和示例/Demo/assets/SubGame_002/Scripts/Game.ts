import { EDITOR } from 'cc/env';
import { _decorator, Component, Node, log, instantiate, Prefab, Vec3, EventTouch, input, Input, Camera, find, UITransform } from 'cc';
import { Ws } from '../../Core/Scripts/Components/NetWork/Ws';

const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    /** WebSocket实例 */
    private wsClient: Ws = null;

    /** 当前客户端ID */
    private myid: string = "";

    /** 地鼠预制体 */
    @property(Prefab)
    gopherPrefab: Prefab = null;

    /** 地鼠节点映射 */
    private gophers: Map<string, Node> = new Map();

    /** 主摄像机 */
    private mainCamera: Camera = null;

    onLoad() {
        if (EDITOR) return; // 编辑器模式下直接返回

        this.mainCamera = find('Canvas/Camera').getComponent(Camera); // 获取主摄像机
        this.wsClient = new Ws(); // 创建WebSocket实例

        this.wsClient.onConnected = () => log('WebSocket连接成功'); // 连接成功回调
        this.wsClient.onMessage = this.onMessage.bind(this); // 消息到达回调

        const url = 'ws://127.0.0.1';
        const port = 5000;
        const isConnected = this.wsClient.connect(url, port); // 连接WebSocket服务器

        log(isConnected ? '正在连接到WebSocket服务器...' : 'WebSocket连接失败');

        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this); // 监听触摸移动事件
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this); // 移除触摸移动事件监听
    }

    /** 处理收到的消息 */
    onMessage = (msg: any) => {
        log('收到消息:', msg);

        const cmds = { "iam": this.iam, "set": this.set, "dis": this.dis };
        if (msg) {
            const parts = msg.split(" ");
            const cmd = cmds[parts[0]];
            if (cmd) {
                cmd.apply(this, parts.slice(1));
            } else {
                log('未知命令:', parts[0]);
            }
        }
    }

    /** 设置当前客户端的ID */
    iam = (id: string) => {
        this.myid = id;
        log('我的id', id);
        this.createGopher(id); // 创建自己的地鼠
    }

    /** 创建地鼠 */
    createGopher = (id: string) => {
        if (!this.gophers.has(id)) {
            const gopher = instantiate(this.gopherPrefab);
            this.node.addChild(gopher);
            this.gophers.set(id, gopher);
        }
    }

    /** 设置地鼠的位置 */
    set = (id: string, x: string, y: string) => {
        let gopher = this.gophers.get(id);
        if (!gopher) {
            this.createGopher(id);
            gopher = this.gophers.get(id);
        }
        gopher.setPosition(new Vec3(parseFloat(x), parseFloat(y), 0));
    }

    /** 移除地鼠 */
    dis = (id: string) => {
        const gopher = this.gophers.get(id);
        if (gopher) {
            this.node.removeChild(gopher);
            this.gophers.delete(id);
        }
    }

    /** 处理触摸移动事件 */
    onTouchMove = (event: EventTouch) => {
        if (this.myid !== "") {
            const touch = event.getLocation();
            const worldPos = this.mainCamera.screenToWorld(new Vec3(touch.x, touch.y, 0));
            const localPos = this.node.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
            this.set(this.myid, localPos.x.toString(), localPos.y.toString());
            this.wsClient.send([localPos.x, localPos.y].join(" "));
        }
    }
}
