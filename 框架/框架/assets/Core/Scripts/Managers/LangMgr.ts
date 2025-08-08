import { JsonAsset, director, Director } from 'cc';
import { EDITOR } from 'cc/env';
import { dataMgr } from './DataMgr';
import { resMgr } from './ResMgr';
import { eventMgr } from './EventMgr';
import { logMgr } from './LogMgr';

/** 
 * 语言管理器
 * 提供语言本地化：加载语言包、更改语言设置、获取翻译文本或精灵。 
 */
class LangMgr {
    /** 当前选择的语言 */
    private currentLanguage: string;

    /** 记录已加载的分包及其语言 */
    private loadedBundles: Record<string, Set<string>> = {};

    /** 缓存的语言数据 */
    private languageData: Record<string, Record<string, string>> = {};

    /** 私有构造函数，确保外部无法直接通过new创建实例 */
    private constructor() {
        if (!EDITOR) {
            director.once(Director.EVENT_AFTER_SCENE_LAUNCH, this.init, this);
        }
    }

    /** 单例实例 */
    public static readonly instance: LangMgr = new LangMgr();

    /** 初始化多语言 */
    private async init(): Promise<void> {
        this.currentLanguage = dataMgr.getText('language');
        if (this.currentLanguage) {
            await this.changeLanguage(this.currentLanguage);
        }
    }

    /** 获取当前语言 */
    public get language(): string {
        return this.currentLanguage;
    }

    /**
     * 更改当前语言，并加载必要的语言包
     * @param langCode 语言代码
     */
    public async changeLanguage(langCode: string): Promise<void> {
        if (this.currentLanguage === langCode) return;

        this.currentLanguage = langCode;
        try {
            await Promise.all(
                Object.keys(this.loadedBundles).map(bundleName =>
                    this.loadLanguageData(bundleName, langCode)
                )
            );
            dataMgr.setData('language', langCode);
            eventMgr.emit('langChange');
        } catch (error) {
            logMgr.err(`更改 ${langCode} 语言失败:`, error);
        }
    }

    /**
     * 加载指定分包的指定语言数据
     * @param bundleName 分包名称
     * @param langCode 语言代码
     */
    public async loadLanguageData(bundleName: string, langCode: string = this.currentLanguage): Promise<void> {
        const loadedLanguages = this.loadedBundles[bundleName] || new Set<string>();
        if (loadedLanguages.has(langCode)) return;

        try {
            const path = `${bundleName}/Res/Lang/Lable/${langCode}`;
            const langAsset = await resMgr.loadRes<JsonAsset>(path);
            if (langAsset) {
                this.languageData[langCode] = { ...this.languageData[langCode], ...langAsset.json };
                loadedLanguages.add(langCode);
                this.loadedBundles[bundleName] = loadedLanguages;
            } else {
                logMgr.err(`加载 ${bundleName} 语言数据失败:`, `${langCode}资源未找到`);
            }
        } catch (error) {
            logMgr.err(`加载 ${bundleName}-${bundleName} 语言数据失败:`, error);
        }
    }

    /**
     * 根据键获取对应的翻译文本
     * @param key 翻译键
     * @param def 默认值
     * @returns 翻译文本
     */
    public getTranslation(key: string, def: string = ''): string {
        return this.languageData[this.currentLanguage]?.[key] ?? def;
    }
}

/** 导出单例实例 */
export const langMgr = LangMgr.instance;
