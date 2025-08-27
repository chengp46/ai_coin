import { Node, AudioSource, Director, director, AudioClip } from "cc";
import { EDITOR } from "cc/env";
import { dataMgr } from "./DataMgr";
import { resMgr } from "./ResMgr";

/** 
 * 音频管理器
 * 提供音乐和音效的播放、暂停、复位功能。
 */
class AudioMgr {
    /** 音乐播放组件 */
    private musicSource: AudioSource;

    /** 音效播放组件池 */
    private effectSourcePool: AudioSource[] = [];

    /** 音乐音量 */
    private musicVolume: number;

    /** 音效音量 */
    private effectVolume: number;
    
    /** 当前音效组件池索引 */
    private effectSourceIndex: number = 0;

    /** 私有构造函数，确保外部无法直接通过new创建实例 */
    private constructor() {
        if (!EDITOR) {
            director.once(Director.EVENT_AFTER_SCENE_LAUNCH, this.init, this);
        }
    }

    /** 单例实例 */
    public static readonly instance: AudioMgr = new AudioMgr();

    /** 初始化 */
    private init(): void {
        this.musicVolume = dataMgr.getNumber("musicVolume") ?? 0.5;
        this.effectVolume = dataMgr.getNumber("effectVolume") ?? 0.5;

        /** 创建节点 */
        const audioMgrNode = new Node("__AudioMgr__");
        director.getScene().addChild(audioMgrNode);

        this.musicSource = this.createAudioSource(audioMgrNode, this.musicVolume);
        for (let i = 0; i < 5; i++) {
            this.effectSourcePool.push(this.createAudioSource(audioMgrNode, this.effectVolume));
        }
    }

    /**
     * 创建音频源
     * @param node 节点
     * @param volume 音量
     * @returns AudioSource 音频源组件
     */
    private createAudioSource(node: Node, volume: number): AudioSource {
        const source = node.addComponent(AudioSource);
        source.loop = false;
        source.playOnAwake = false;
        source.volume = volume;
        return source;
    }

    /**
     * 播放音乐
     * @param path 音乐路径
     * @param loop 是否循环播放，默认为'true'
     * @param volume 音量大小，默认为'1.0'
     * @returns Promise<void> 播放完成后的Promise
     */
    public async playMusic(path: string, loop: boolean = true, volume: number = 1.0): Promise<void> {
        const clip = await resMgr.loadRes<AudioClip>(path);
        this.musicSource.stop();
        this.musicSource.clip = clip;
        this.musicSource.loop = loop;
        this.musicSource.volume = this.musicVolume * volume;
        this.musicSource.play();
    }

    /** 重播当前音乐 */
    public replayMusic(): void {
        this.musicSource.stop();
        this.musicSource.play();
    }

    /** 暂停当前播放的音乐 */
    public pauseMusic(): void {
        this.musicSource.pause();
    }

    /** 停止当前播放的音乐 */
    public stopMusic(): void {
        this.musicSource.stop();
    }

    /**
     * 播放音效
     * @param path 音效路径
     * @param volume 音量大小，默认为'1.0'
     * @returns Promise<void> 播放完成后的Promise
     */
    public async playEffect(path: string, volume: number = 1.0): Promise<void> {
        const clip = await resMgr.loadRes<AudioClip>(path);
        const source = this.getNextEffectSource();
        source.playOneShot(clip, this.effectVolume * volume);
    }

    /**
     * 获取下一个音效组件
     * @returns AudioSource 下一个音效组件
     */
    private getNextEffectSource(): AudioSource {
        const source = this.effectSourcePool[this.effectSourceIndex];
        this.effectSourceIndex = (this.effectSourceIndex + 1) % this.effectSourcePool.length;
        return source;
    }

    /**
     * 设置音乐音量
     * @param volume 音量大小，范围为 0.0 到 1.0
     */
    public setMusicVolume(volume: number): void {
        this.musicVolume = volume;
        this.musicSource.volume = volume;
        dataMgr.setData("musicVolume", volume);
    }

    /**
     * 获取当前音乐音量
     * @returns 当前音乐音量，范围为 0.0 到 1.0
     */
    public getMusicVolume(): number {
        return this.musicVolume;
    }

    /**
     * 设置音效音量
     * @param volume 音量大小，范围为 0.0 到 1.0
     */
    public setEffectVolume(volume: number): void {
        this.effectVolume = volume;
        this.effectSourcePool.forEach((source) => (source.volume = volume));
        dataMgr.setData("effectVolume", volume);
    }

    /**
     * 获取当前音效音量
     * @returns 当前音效音量，范围为 0.0 到 1.0
     */
    public getEffectVolume(): number {
        return this.effectVolume;
    }
}

/** 音频管理器实例 */
export const audioMgr = AudioMgr.instance;
