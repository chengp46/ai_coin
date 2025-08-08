import { logMgr } from "../Managers/LogMgr";

/** 路径工具类 */
export class PathUtil {
    /**
     * 解析文件路径并将其分解为包名和路径
     *
     * @param filePath - 要解析的文件路径
     * @returns 包含bundleName和path的对象或null
     */
    public static parse(filePath: string): { bundleName: string; path: string } | null {
        const parts = filePath.split('/');
        
        if (parts.length < 2) {
            logMgr.err(`文件路径 '${filePath}' 格式不正确，应包含包名和至少一级路径`);
            return null;
        }

        const bundleName = parts[0];
        const path = parts.slice(1).join('/');

        return { bundleName, path };
    }
}