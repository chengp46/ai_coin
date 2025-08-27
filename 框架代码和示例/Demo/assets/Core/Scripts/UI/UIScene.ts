import { _decorator } from "cc";
import UIView from "./UIView";
const { ccclass } = _decorator;

/** 场景基类 */
@ccclass
export class UIScene extends UIView {
    /** 组件加载时调用 */
    onLoad(): void {
        // 场景不需要模态窗
        this.isModal = false;

        // 调用父类的初始化方法
        this.onInit();
    }
}
