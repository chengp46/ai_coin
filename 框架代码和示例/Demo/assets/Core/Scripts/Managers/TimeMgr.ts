import { Director, director } from "cc";
import { EDITOR } from "cc/env";

/** 定义任务类型 */
interface Task {
    callback: Function;
    interval: number;
    repeat: boolean;
    elapsed: number;
}

/** 
 * 时间管理器
 * 提供任务的计时、添加和移除功能。
 */
class TimeMgr {
    /** 存储任务列表的映射 */
    private taskList: Map<number, Task> = new Map();

    /** 下一任务ID */
    private nextTaskId: number = 0;

    /** 更新间隔（毫秒） */
    private updateInterval: number = 1000;

    /** 私有构造函数，确保外部无法直接通过new创建实例 */
    private constructor() {
        if (!EDITOR) {
            director.once(Director.EVENT_AFTER_SCENE_LAUNCH, this.startTimer, this);
        }
    }

    /** 单例实例 */
    public static readonly instance: TimeMgr = new TimeMgr();

    /** 启动定时器 */
    private startTimer(): void {
        setInterval(() => {
            this.updateTimer(this.updateInterval);
        }, this.updateInterval);
    }

    /**
     * 更新方法，用于在游戏的主循环中调用，更新所有定时任务
     * @param dt 自上一次更新以来经过的时间（毫秒）
     */
    private updateTimer(dt: number): void {
        const tasksToRemove: number[] = [];
        this.taskList.forEach((task, id) => {
            task.elapsed += dt;
            if (task.elapsed >= task.interval) {
                task.callback();
                if (task.repeat) {
                    task.elapsed %= task.interval;
                } else {
                    tasksToRemove.push(id);
                }
            }
        });
        /** 移除已完成的非重复任务 */
        tasksToRemove.forEach((id) => this.taskList.delete(id));
    }

    /**
     * 添加一个新的定时任务
     * @param callback 要执行的回调函数
     * @param interval 时间间隔，单位为毫秒
     * @param repeat 是否重复执行
     * @returns 返回一个任务ID，可用于稍后移除定时任务
     */
    public addTimer(callback: Function, interval: number, repeat: boolean = false): number {
        const taskId = this.nextTaskId++;
        this.taskList.set(taskId, { callback, interval, repeat, elapsed: 0 });
        return taskId;
    }

    /**
     * 根据任务ID移除定时任务
     * @param taskId 要移除的任务的ID
     */
    public removeTimer(taskId: number): void {
        this.taskList.delete(taskId);
    }
}

/** 时间管理器实例 */
export const timeMgr = TimeMgr.instance;
