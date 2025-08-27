import { _decorator, Sprite, SpriteFrame } from "cc";
import { EDITOR } from "cc/env";
import { I18nBase } from "./I18nBase";
import { logMgr } from "../../Managers/LogMgr";
import { langMgr } from "../../Managers/LangMgr";
const { ccclass, property, requireComponent } = _decorator;

/** 存储语言代码与对应的精灵帧 */
@ccclass("I18nSpriteData")
export class I18nSpriteData {
    @property({ displayName: "语言代码", tooltip: "如：en、zh等" })
    langCode: string = "";

    @property({ displayName: "对应精灵", type: SpriteFrame })
    spriteFrame: SpriteFrame | null = null;
}

/** 根据当前语言自动更新精灵帧 */
@ccclass("I18nSprite")
@requireComponent(Sprite)
export class I18nSprite extends I18nBase {
    @property({ displayName: "多语言精灵数据列表", type: [I18nSpriteData] })
    public spList: I18nSpriteData[] = [];

    /** 多语言精灵组件变量 */
    private sp: Sprite | null = null;

    /** 刷新精灵帧，根据当前语言设置更新 Sprite 的 spriteFrame 属性 */
    public refresh(): void {
        if (EDITOR) return; // 编辑器模式下不刷新

        if (!this.sp) {
            this.sp = this.getComponent(Sprite);
            if (!this.sp) {
                logMgr.err("未找到 Sprite 组件。");
                return;
            }
        }

        const spriteData = this.spList.find(data => data.langCode === langMgr.lang);
        if (spriteData?.spriteFrame) {
            this.sp.spriteFrame = spriteData.spriteFrame;
        } else {
            logMgr.err(`未找到语言代码为 ${langMgr.lang} 的精灵帧。`);
        }
    }
}
