import { Director, director, instantiate, js, Node, Prefab } from 'cc';
import { logMgr } from '../Managers/LogMgr';
import { resMgr } from '../Managers/ResMgr';
import { UIView } from '../Components/UI/UIView';
import { EDITOR } from 'cc/env';

/** 管理UI视图的显示和隐藏 */
class UIMgr {
    /** 缓存已加载的UI视图 */
    private cacheList: Map<string, UIView> = new Map();

    /** 已打开的UI视图列表 */
    private openList: UIView[] = [];

    /** 当前显示的场景 */
    private currentScene: UIView | null = null;

    /** 根节点，即Canvas节点 */
    private root: Node | null = null;

    /** 私有构造函数，确保外部无法直接通过new创建实例 */
    private constructor() {
        if (!EDITOR) {
            director.once(Director.EVENT_AFTER_SCENE_LAUNCH, this.init, this);
        }
    }

    /** 单例实例 */
    public static readonly instance: UIMgr = new UIMgr();

    /** 初始化方法 */
    private init(): void {
        this.root = director.getScene().getChildByName('Canvas')!;
    }

    /**
     * 显示UI
     * @param className UI类名称
     * @returns 返回显示的UIComponent实例
     */
    public async showUI(className: string): Promise<UIView | null> {
        try {
            const UIClass = js.getClassByName(className) as { new(): UIView } & { pack: string, url: string };
            if (!UIClass) throw new Error(`未找到名称为 ${className} 的UI类`);

            if (!UIClass.pack || !UIClass.url) throw new Error(`UI类 ${className} 缺少 pack 或 url 属性`);

            /** 先从缓存获取UI视图 */
            const path = this.getPath(UIClass);
            let view = this.cacheList.get(path);

            /** 没有说明未加载过 */
            if (!view) {
                const node = instantiate(await resMgr.loadRes<Prefab>(path));
                const uiComp = node.getComponent(UIClass) || node.addComponent(UIClass);
                this.cacheList.set(path, uiComp);
                view = uiComp;
            }

            /** 如果当前显示的就是需要显示的UI视图，就移除重新添加，类似刷新 */
            if (this.currentScene) {
                this.currentScene.node.removeFromParent();
            }
            this.currentScene = view;

            /** 添加到画布这个根节点 */
            this.addViewToRoot(view);

            return view;
        } catch (error) {
            logMgr.err(`显示 ${className} UI时发生错误:`, error);
            return null;
        }
    }

    /** 将视图添加到根节点 */
    private addViewToRoot(view: UIView): void {
        if (this.root) {
            view.node.parent = this.root;
            this.openList.push(view);
            /** 置顶显示 */
            view.node.setSiblingIndex(this.root.children.length - 1);
        } else {
            logMgr.err('画布根节点未初始化');
        }
    }

    /**
     * 隐藏UI
     * @param view 要隐藏的UIComponent实例
     * @param dispose 是否销毁
     */
    public hideUI(view: UIView, dispose: boolean = false): void {
        const index = this.openList.indexOf(view);
        if (index >= 0) this.openList.splice(index, 1);
        if (dispose) {
            const path = this.getPath(view.constructor as typeof UIView);
            this.cacheList.delete(path);
            view.node.destroy();
        } else {
            view.node.removeFromParent();
        }
    }

    /**
     * 设置组件数据
     * @param view 要设置数据的UIComponent实例
     * @param key 数据键
     * @param value 数据值
     */
    public setData(view: UIView, key: string, value: any): void {
        if (this.isViewLoaded(view)) {
            view.setData(key, value);
        }
    }

    /**
     * 获取组件数据
     * @param view 要获取数据的UIComponent实例
     * @param key 数据键
     * @returns 数据值
     */
    public getData(view: UIView, key: string): any {
        if (this.isViewLoaded(view)) {
            return view.getData(key);
        }
        return null;
    }

    /** 删除组件数据 */
    public deleteData(view: UIView, key: string): void {
        if (this.isViewLoaded(view)) {
            view.deleteData(key);
        }
    }

    /** 清空组件数据 */
    public clearData(view: UIView): void {
        if (this.isViewLoaded(view)) {
            view.clearData();
        }
    }

    /** 获取视图路径 */
    private getPath(UIClass: { pack: string, url: string }): string {
        return `${UIClass.pack}/${UIClass.url}`;
    }

    /** 检查视图是否已加载 */
    private isViewLoaded(view: UIView): boolean {
        const UIClass = view.constructor as typeof UIView;
        const path = this.getPath(UIClass);
        if (!this.cacheList.has(path)) {
            logMgr.err(`视图 ${view} 未加载，无法操作数据`);
            return false;
        }
        return true;
    }
}

/** 导出单例实例 */
export const uiMgr = UIMgr.instance;
