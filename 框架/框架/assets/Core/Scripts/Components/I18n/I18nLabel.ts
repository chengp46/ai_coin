import { _decorator, Label, RichText } from 'cc';
import { EDITOR } from 'cc/env';
import { I18nBase } from './I18nBase';
import { logMgr } from '../../Managers/LogMgr';
import { langMgr } from '../../Managers/LangMgr';
const { ccclass, property, requireComponent } = _decorator;

/** 多语言标签组件 */
@ccclass('I18nLabel')
@requireComponent(Label)
@requireComponent(RichText)
export class I18nLabel extends I18nBase {
    @property({ displayName: '多语言 key' })
    private code: string = '';

    /** 多语言标签变量 */
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

    /** 刷新多语言标签文本内容 */
    public async refresh(): Promise<void> {
        /** 编辑器模式下不刷新 */
        if (EDITOR) return;

        if (!this.lbl) {
            this.lbl = this.getComponent(Label) || this.getComponent(RichText);
            if (!this.lbl) {
                logMgr.err('未找到 Label 或 RichText 组件。');
                return;
            }
        }

        const localizedString = langMgr.getTranslation(this.key);
        if (localizedString) {
            this.lbl.string = localizedString;
        } else {
            logMgr.err(`未找到 key 为 ${this.key} 的多语言文本。`);
        }
    }
}
