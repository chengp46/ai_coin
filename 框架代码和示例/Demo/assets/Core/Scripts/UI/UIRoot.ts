import { director, instantiate, Node, Prefab } from "cc";
import { resMgr } from "../Managers/ResMgr";
import UIComp from "./UIComp";
import { UIScene } from "./UIScene";
import UIView from "./UIView";

/** 管理UI视图的显示和隐藏 */
class UIRoot {
    /** 缓存已加载的UI视图 */
    private cacheList: Map<string, UIView> = new Map();

    /** 已打开的UI视图列表 */
    private openList: UIView[] = [];

    /** 当前显示的场景 */
    private currentScene: UIScene | null = null;

    /** 单例实例 */
    public static readonly instance: UIRoot = new UIRoot();

    /** 获取根节点，即Canvas节点 */
    private get root(): Node {
        return director.getScene().getChildByName('Canvas')!;
    }

    /**
     * 显示场景
     * @param SceneClass 场景类
     * @param data 传递给场景的数据
     */
    public async showScene(SceneClass: { new(): UIScene }, data: any = null): Promise<void> {
        if (this.currentScene) this.currentScene.hide();
        this.currentScene = await this.showWindow(SceneClass, data) as UIScene;
    }

    /**
     * 显示窗口
     * @param WindowClass 窗口类
     * @param data 传递给窗口的数据
     * @returns 返回显示的UIView实例
     */
    public async showWindow(WindowClass: { new(): UIComp }, data: any = null): Promise<UIView> {
        const path = `${WindowClass['pack']}/${WindowClass['url']}`;
        let view = this.cacheList.get(path);

        if (!view) {
            const node = instantiate(await resMgr.loadRes<Prefab>(path));
            const uiComp = node.getComponent(WindowClass) || node.addComponent(WindowClass);
            this.cacheList.set(path, uiComp as UIView);
            view = uiComp as UIView;
            view.data = data;
        }

        view.node.parent = this.root;
        this.openList.push(view);
        view.node.setSiblingIndex(this.root.children.length - 1);

        return view;
    }

    /**
     * 隐藏窗口
     * @param view 要隐藏的UIView实例
     */
    public hideWindow(view: UIView): void {
        view.hide();
    }

    /**
     * 立即隐藏窗口
     * @param view 要隐藏的UIView实例
     * @param dispose 是否销毁
     */
    public hideWindowImmediately(view: UIView, dispose: boolean = false): void {
        const index = this.openList.indexOf(view);
        if (index >= 0) this.openList.splice(index, 1);
        if (dispose) view.node.destroy();
    }
}

/** 导出单例实例 */
export const uiRoot = UIRoot.instance;
