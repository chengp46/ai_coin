import { _decorator, Asset, Component, instantiate, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

/** 入口文件 */
@ccclass('Main')
export class Main extends Component {
    // 测试变量类型
    private num: number = 1;
    private str: string = "文本内容";
    private obj: any = {
        id: 1, 
        name: '名称'
    };

    // 加载
    onLoad() {
        // this.Example_Log();
        // this.Example_Data();
        // this.Example_Bundle();
        // this.Example_Res();
        // this.Example_Audio();
        // this.Example_Event();
        // this.Example_Time();
    }

    // 开始
    start() {
        // this.Example_Lang();
        // this.Example_Net();
        // this.Example_UI();
    }

    // UI示例
    async Example_UI() {
        // 1、加载分包预制体资源：SubGame_003/Game.prefab
        const prefab = await app.res.loadRes<Prefab>('SubGame_003/Game');

        // 2、实例化预制体
        const newNode = instantiate(prefab);

        // 3、将实例化的节点添加到当前节点下
        this.node.addChild(newNode);
    }

    // 网络示例
    async Example_Net() {
        // 网络组件可以添加到任何节点，为了保持教程干净，我单独弄了一个网络示例分包
        // 所以没有挂载到主场景节点，一般开发时可以在主场景添加一个常驻的网络节点即可
        // 既然是分包，那么就按下面代码先加载、然后实例化、最后添加到主场景

        // 1、加载分包预制体资源：SubGame_002/Game.prefab
        const prefab = await app.res.loadRes<Prefab>('SubGame_002/Game');

        // 2、实例化预制体
        const newNode = instantiate(prefab);

        // 3、将实例化的节点添加到当前节点下
        this.node.addChild(newNode);
    }

    // 多语言示例
    async Example_Lang() {
        // 注意：多语言需要框架初始化后加载，所以本示例需放到cocos的start事件中执行
        // 由于我们还没学习到UI的封装，所以这里我们手动加载一个分包的预制体UI
        // 实际项目中，我们无需关心多语言的加载，也不用写以下代码

        // 1、加载分包下多语言的JSON文件，默认为zh.json
        await app.lang.loadLanguageData('SubGame_001');

        // 2、加载分包预制体资源：SubGame_001/Game.prefab
        const prefab = await app.res.loadRes<Prefab>('SubGame_001/Game');

        // 2、实例化预制体
        const newNode = instantiate(prefab);

        // 3、将实例化的节点添加到当前节点下
        this.node.addChild(newNode);
    }

    // 日志示例
    Example_Log() {
        app.log.info('日志示例_数字', this.num);
        app.log.info('日志示例_文本', this.str);
        app.log.info('日志示例_对象', this.obj);
    }

    // 数据示例
    Example_Data() {
        app.data.setData('key_num', this.num);
        app.data.setData('key_str', this.str);
        app.data.setData('key_obj', this.obj);

        app.log.info(
            '数字型储存读取',
            app.data.getNumber('key_num')
        );

        app.log.info(
            '文本型储存读取',
            app.data.getText('key_str')
        );

        app.log.info(
            '对象型储存读取',
            app.data.getJSON('key_obj')
        );
    }

    // 分包示例
    Example_Bundle() {
        // 进度回调（可选）
        const onProgress = (progress: number) => {
            app.log.debug('加载进度:', `${(progress * 100).toFixed(2)}%`);
        };

        app.bundle.getBundle('SubGame_001', onProgress)
            .then((bundle) => {
                if (bundle) {
                    app.log.info('分包加载成功！');
                    // 在这里可以执行加载完成后的操作
                }
            });
    }

    // 资源示例
    Example_Res() {
        // 进度回调（可选）
        const onProgress = (completedCount: number, totalCount: number, item: any) => {
            app.log.info('加载进度', `${(completedCount / totalCount * 100).toFixed(2)}%`);
        };

        // 完成回调（可选）
        const onComplete = (err: Error | null, asset: Asset) => {
            if (!err) {
                // 在这里可以使用加载的资源
            }
        };

        app.res.loadRes<Prefab>('SubGame_001/Game', onProgress, onComplete)
        .then((asset) => {
            app.log.info('资源加载完成:', asset);
        });
    }

    // 音频示例
    Example_Audio() {
        app.audio.playMusic('SubGame_001/Res/Audio/BGM');
        app.audio.playEffect('SubGame_001/Res/Audio/Click');
    }

    // 事件示例
    Example_Event() {
        // 事件回调
        const onEvent = (res: any) => {
            app.log.info(res);
            app.log.info(res.userId);
            app.log.info(res.userName);
        };

        // 先订阅监听
        app.event.on('测试事件', onEvent);

        // 可在任意地方发布事件
        app.event.emit('测试事件', { userId: 123, userName: 'John Doe' });
    }

    // 任务示例
    Example_Time() {
        app.log.info('任务计次', 0);

        // 任务计次
        let ct: number = 1;

        // 任务函数
        const TaskFun = () => {
            app.log.info('任务计次', ct++);
        };

        app.time.addTimer(
            TaskFun,
            1000,
            true     
        );
    }
}
