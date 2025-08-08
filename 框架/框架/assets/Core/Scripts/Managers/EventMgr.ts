import { logMgr } from './LogMgr';

/** 事件回调函数类型定义 */
type EventCallback<T = any> = (data: T) => void;

/** 事件处理器接口 */
interface Handler {
    key: string;
    callback: EventCallback;
    target: any;
}

/** 事件管理器，提供事件的注册、触发、注销功能 */
class EventMgr {
    /** 唯一ID生成器，用于为每个事件处理器分配唯一的ID */
    private uniqueId: number = 0;

    /** 存储所有事件处理器，键为唯一ID */
    private handlers: Record<number, Handler> = {};

    /** 存储每个目标对象对应的事件处理器ID集合 */
    private targetMap: Map<any, Set<number>> = new Map();

    /** 存储每个事件名对应的事件处理器ID集合 */
    private keyMap: Map<string, Set<number>> = new Map();

    /** 存储每个目标对象对应的事件名和处理器ID的映射 */
    private targetKeyMap: Map<any, Record<string, number>> = new Map();

    /** 存储持久化的数据，键为事件名 */
    private persistentData: Map<string, any> = new Map();

    /** 存储粘性事件的数据，键为事件名 */
    private stickyData: Map<string, any> = new Map();

    /** 私有构造函数，确保外部无法直接通过new创建实例 */
    private constructor() {}

    /** 单例实例 */
    public static readonly instance: EventMgr = new EventMgr();

    /**
     * 注册事件
     * @param key 事件名
     * @param callback 回调函数，当事件触发时调用
     * @param target 回调函数的上下文（默认值为 {}）
     */
    public on(key: string, callback: EventCallback, target: any = {}): void {
        const id = this.getOrCreateId(key, target);
        this.handlers[id] = { callback, target, key };
        this.addIdToMap(this.targetMap, target, id);
        this.addIdToMap(this.keyMap, key, id);

        /** 如果存在粘性数据，立即调用回调函数并删除粘性数据 */
        if (this.stickyData.has(key)) {
            callback.call(target, this.stickyData.get(key));
            this.stickyData.delete(key);
        }
    }

    /**
     * 注册一次性事件
     * @param key 事件名
     * @param callback 回调函数，当事件触发时调用
     * @param target 回调函数的上下文（默认值为 {}）
     */
    public once(key: string, callback: EventCallback, target: any = {}): void {
        const onceCallback: EventCallback = (data) => {
            callback.call(target, data);
            this.off(key, target);
        };
        this.on(key, onceCallback, target);
    }

    /**
     * 触发事件
     * @param key 事件名
     * @param data 传递给回调函数的数据
     * @param options 其他参数
     *  persistence 是否持久化数据
     *  sticky 传1则为粘性事件
     */
    public emit(key: string, data?: any, options: { persistence?: boolean, sticky?: number } = {}): void {
        if (options.persistence) this.persistentData.set(key, data);

        const ids = this.keyMap.get(key);
        if (ids) {
            ids.forEach(id => {
                const { callback, target } = this.handlers[id];
                callback.call(target, data);
                if (options.sticky === 1) options.sticky = -1;
            });
        }

        if (options.sticky === 1) this.stickyData.set(key, data);
    }

    /**
     * 注销事件
     * @param key 事件名
     * @param target 目标对象
     */
    public off(key: string, target: any): void {
        const targetKeys = this.targetKeyMap.get(target);
        if (targetKeys) this.removeHandler(targetKeys[key]);
    }

    /**
     * 获取持久化数据
     * @param key 事件名
     * @returns 持久化的数据
     */
    public getPersistentData(key: string): any {
        return this.persistentData.get(key);
    }

    /**
     * 注销目标对象的所有事件
     * @param target 目标对象
     */
    public offAllByTarget(target: any): void {
        this.removeAllHandlers(this.targetMap.get(target));
    }

    /**
     * 注销某个事件名的所有事件
     * @param key 事件名
     */
    public offAllByKey(key: string): void {
        this.removeAllHandlers(this.keyMap.get(key));
    }

    /**
     * 获取或创建唯一ID
     * @param key 事件名
     * @param target 目标对象
     * @returns 唯一ID
     */
    private getOrCreateId(key: string, target: any): number {
        let targetKeys = this.targetKeyMap.get(target);
        if (!targetKeys) {
            targetKeys = {};
            this.targetKeyMap.set(target, targetKeys);
        }
        if (!targetKeys[key]) targetKeys[key] = ++this.uniqueId;
        return targetKeys[key];
    }

    /**
     * 移除处理器
     * @param id 处理器ID
     */
    private removeHandler(id: number): void {
        const handler = this.handlers[id];
        if (!handler) return;

        const { target, key } = handler;
        const targetKeys = this.targetKeyMap.get(target);
        if (targetKeys) delete targetKeys[key];

        this.targetMap.get(target)?.delete(id);
        this.keyMap.get(key)?.delete(id);

        delete this.handlers[id];
        this.persistentData.delete(key);
    }

    /**
     * 移除所有处理器
     * @param ids 处理器ID集合
     */
    private removeAllHandlers(ids?: Set<number>): void {
        ids?.forEach(id => this.removeHandler(id));
    }

    /**
     * 将ID添加到映射中
     * @param map 映射
     * @param key 键
     * @param id ID
     */
    private addIdToMap(map: Map<any, Set<number>>, key: any, id: number): void {
        const set = map.get(key) || new Set<number>();
        set.add(id);
        map.set(key, set);
    }

    /** 重置事件管理器，清空所有事件和数据 */
    public reset(): void {
        this.uniqueId = 0;
        this.handlers = {};
        this.targetMap.clear();
        this.keyMap.clear();
        this.targetKeyMap.clear();
        this.persistentData.clear();
        this.stickyData.clear();
    }

    /** 输出当前注册的事件和处理器信息 */
    public debug(): void {
        logMgr.debug('处理器:', this.handlers);
        logMgr.debug('目标映射:', this.targetMap);
        logMgr.debug('事件名映射:', this.keyMap);
        logMgr.debug('目标事件映射:', this.targetKeyMap);
        logMgr.debug('持久化数据:', this.persistentData);
        logMgr.debug('粘性数据:', this.stickyData);
    }
}

/** 事件管理器实例 */
export const eventMgr = EventMgr.instance;