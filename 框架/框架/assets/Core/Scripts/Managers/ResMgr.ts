import { Asset, AssetManager, assetManager } from 'cc';
import { logMgr } from './LogMgr';
import { bundleMgr } from './BundleMgr';
import { PathUtil } from '../Tools/PathUtil';

/** 
 * 资源管理器
 * 提供资源加载、释放功能。
 */
class ResMgr {
    /** 私有构造函数，确保外部无法直接通过new创建实例 */
    private constructor() {}

    /** 单例实例 */
    public static readonly instance: ResMgr = new ResMgr();

    /**
     * 加载资源
     * @param resPath 资源路径
     * @param onProgress 进度回调函数（可选）
     * @param onComplete 完成回调函数（可选）
     * @returns Promise<T | null> 加载完成后的Promise
     */
    public async loadRes<T extends Asset>(
        resPath: string,
        onProgress?: (completedCount: number, totalCount: number, item: any) => void,
        onComplete?: (err: Error | null, asset: T | null) => void
    ): Promise<T | null> {
        try {
            /** 1、解析路径 */
            const parsedResult = PathUtil.parse(resPath);
            if (!parsedResult) throw new Error(`解析资源路径失败: ${resPath}`);

            /** 2、获取分包 */
            const { bundleName, path } = parsedResult;
            const bundle = await bundleMgr.getBundle(bundleName);
            if (!bundle) throw new Error(`获取资源分包失败: ${bundleName}`);

            /** 3、加载资源 */
            const assetResult = await this.loadAsset<T>(bundle, path, onProgress, onComplete);
            if (assetResult instanceof Error) throw assetResult;

            return assetResult;
        } catch (error) {
            logMgr.err(`加载 ${resPath} 资源过程中发生错误:`, error);
            onComplete?.(error as Error, null);
            return null;
        }
    }

    /**
     * 加载目录下的所有资源
     * @param resPath 资源路径
     * @param onProgress 进度回调函数
     * @param onComplete 完成回调函数
     * @returns Promise<Asset[] | null> 加载完成后的Promise
     */
    public async loadResDir(
        resPath: string,
        onProgress?: (completedCount: number, totalCount: number, item: any) => void,
        onComplete?: (err: Error | null, assets: Asset[]) => void
    ): Promise<Asset[] | null> {
        try {
            /** 1、解析路径 */
            const parsedResult = PathUtil.parse(resPath);
            if (!parsedResult) throw new Error(`解析目录路径失败: ${resPath}`);

            /** 2、获取分包 */
            const { bundleName, path } = parsedResult;
            const bundle = await bundleMgr.getBundle(bundleName);
            if (!bundle) throw new Error(`获取目录分包失败: ${bundleName}`);

            /** 3、加载资源 */
            const assetResult = await this.loadAssetDirectory(bundle, path, onProgress, onComplete);
            if (assetResult instanceof Error) throw assetResult;

            return assetResult;
        } catch (error) {
            logMgr.err(`加载 ${resPath} 目录资源过程中发生错误:`, error);
            onComplete?.(error as Error, []);
            return null;
        }
    }

    /**
     * 释放指定分包单个资源
     * @param resPath 资源路径
     */
    public releaseRes(resPath: string): void {
        const parsedResult = PathUtil.parse(resPath);
        if (!parsedResult) {
            logMgr.err(`释放 ${resPath} 资源失败`);
            return;
        }

        const { bundleName, path } = parsedResult;
        const bundle = assetManager.getBundle(bundleName);
        if (bundle) {
            bundle.release(path);
        } else {
            logMgr.err(`分包 ${bundleName} 未找到，无法释放资源 ${path}`);
        }
    }

    /**
     * 释放指定分包全部资源
     * @param bundleName 分包名称
     */
    public releaseBundleRes(bundleName: string): void {
        const bundle = assetManager.getBundle(bundleName);
        if (bundle) {
            bundle.releaseAll();
            assetManager.removeBundle(bundle);
        } else {
            logMgr.err(`分包 ${bundleName} 未找到，无法释放资源`);
        }
    }

    /** 释放所有资源 */
    public releaseAllRes(): void {
        assetManager.releaseAll();
    }

    /**
     * 加载资源
     * @param bundle 资源包
     * @param path 资源路径
     * @param onProgress 加载进度回调
     * @param onComplete 加载完成回调
     * @returns 返回加载的资源，失败时返回错误对象
     */
    private loadAsset<T extends Asset>(
        bundle: AssetManager.Bundle,
        path: string,
        onProgress?: (completedCount: number, totalCount: number, item: any) => void,
        onComplete?: (err: Error | null, asset: T | null) => void
    ): Promise<T | Error> {
        return new Promise<T | Error>((resolve) => {
            bundle.load(
                path,
                (completedCount, totalCount, item) => onProgress?.(completedCount, totalCount, item),
                (err, asset) => {
                    onComplete?.(err, asset as T);
                    if (err) {
                        resolve(err);
                    } else {
                        resolve(asset as T);
                    }
                }
            );
        });
    }

    /**
     * 加载目录下所有资源的辅助方法
     * @param bundle 资源所在的分包
     * @param path 目录路径
     * @param onProgress 进度回调函数
     * @param onComplete 完成回调函数
     * @returns Promise<Asset[] | Error> 加载完成后的Promise
     */
    private loadAssetDirectory(
        bundle: AssetManager.Bundle,
        path: string,
        onProgress?: (completedCount: number, totalCount: number, item: any) => void,
        onComplete?: (err: Error | null, assets: Asset[]) => void
    ): Promise<Asset[] | Error> {
        return new Promise<Asset[] | Error>((resolve) => {
            bundle.loadDir(
                path,
                (completedCount, totalCount, item) => onProgress?.(completedCount, totalCount, item),
                (err, assets) => {
                    onComplete?.(err, assets);
                    if (err) {
                        resolve(err);
                    } else {
                        resolve(assets);
                    }
                }
            );
        });
    }
}

/** 资源管理器实例 */
export const resMgr = ResMgr.instance;