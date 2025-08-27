import { JsonAsset, director, Director } from "cc";
import { EDITOR } from "cc/env";
import { dataMgr } from "./DataMgr";
import { resMgr } from "./ResMgr";
import { eventMgr } from "./EventMgr";

/** 
 * 语言管理器
 * 提供语言本地化：加载语言包、更改语言设置、获取翻译文本或精灵。 
 */
class LangMgr {
    /** 记录已加载的分包及其语言 */
    private loadedBundles: Record<string, Set<string>> = {};

    /** 当前选择的语言 */
    private currLang: string;

    /** 缓存的语言数据 */
    private langData: Record<string, Record<string, string>> = {};

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
        this.currLang = dataMgr.getText("language") || "zh";
        await this.changeLang(this.currLang);
    }

    /** 获取当前语言 */
    public get lang(): string {
        return this.currLang;
    }

    /** 更改当前语言，并加载必要的语言包 */
    public async changeLang(langCode: string): Promise<void> {
        if (this.currLang === langCode) return;

        this.currLang = langCode;
        await Promise.all(
            Object.keys(this.loadedBundles).map(bundleName =>
                this.loadLanguageData(bundleName, langCode)
            )
        );
        dataMgr.setData("language", langCode);
        eventMgr.emit("langChange");
    }

    /** 异步加载指定分包的指定语言数据 */
    public async loadLanguageData(bundleName: string, langCode: string = this.currLang): Promise<void> {
        const loadedLanguages = this.loadedBundles[bundleName] || new Set<string>();
        if (loadedLanguages.has(langCode)) return;

        const path = `${bundleName}/Res/Lang/Lable/${langCode}`;
        const langAsset = await resMgr.loadRes<JsonAsset>(path);
        this.langData[langCode] = { ...this.langData[langCode], ...langAsset.json };
        loadedLanguages.add(langCode);
        this.loadedBundles[bundleName] = loadedLanguages;
    }

    /** 根据键获取对应的翻译文本 */
    public getLanguage(key: string, def: string = ""): string {
        return this.langData[this.currLang]?.[key] ?? def;
    }
}

/** 导出单例实例 */
export const langMgr = LangMgr.instance;
