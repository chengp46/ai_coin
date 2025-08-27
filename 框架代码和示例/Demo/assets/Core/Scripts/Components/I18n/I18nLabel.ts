import { _decorator, Label, RichText } from "cc";
import { EDITOR } from "cc/env";
import { I18nBase } from "./I18nBase";
import { logMgr } from "../../Managers/LogMgr";
import { langMgr } from "../../Managers/LangMgr";
const { ccclass, property, requireComponent } = _decorator;

/** 用于显示多语言文本，并根据语言变化自动更新内容 */
@ccclass("I18nLabel")
@requireComponent(Label)
@requireComponent(RichText)
export class I18nLabel extends I18nBase {
    @property({ displayName: "多语言 key" })
    private code: string = "";

    /** 多语言标签组件变量 */
    private lbl: Label | RichText | null = null;

    /** 获取多语言 key */
    public get key(): string {
        return this.code;
    }

    /** 设置多语言 key 并刷新内容 */
    public set key(value: string) {
        this.code = value;
        this.refresh();
    }

    /** 刷新文本内容，根据当前语言设置更新组件的 string 属性 */
    public refresh(): void {
        if (EDITOR) return; // 编辑器模式下不刷新

        if (!this.lbl) {
            this.lbl = this.getComponent(Label) || this.getComponent(RichText);
            if (!this.lbl) {
                logMgr.err("未找到 Label 或 RichText 组件。");
                return;
            }
        }

        this.lbl.string = langMgr.getLanguage(this.key);
    }
}
