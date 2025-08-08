import { assetManager, AssetManager } from 'cc';
import { logMgr } from './LogMgr';

/**
 * 分包管理器
 * 提供分包加载、获取、移除功能。
 */
class BundleMgr {
    /** 私有构造函数，确保外部无法直接通过new创建实例 */
    private constructor() {}

    /** 单例实例 */
    public static readonly instance: BundleMgr = new BundleMgr();

    /**
     * 获取指定分包，如果未加载则进行加载。
     * @param nameOrUrl - 分包名称或URL。
     * @param onProgress - 进度回调函数。
     * @returns Promise<AssetManager.Bundle | null> - 加载完成后的Promise。
     */
    public async getBundle(nameOrUrl: string, onProgress?: (progress: number) => void): Promise<AssetManager.Bundle | null> {
        let bundle = assetManager.getBundle(nameOrUrl);
        if (bundle) return bundle;

        try {
            bundle = await this.loadBundle(nameOrUrl);
            if (onProgress) {
                await this.loadAssetsWithProgress(bundle, onProgress);
            }
            return bundle;
        } catch (error) {
            logMgr.err(`分包 ${nameOrUrl} 加载失败:`, error);
            return null;
        }
    }

    /**
     * 加载指定分包。
     * @param nameOrUrl - 分包名称或URL。
     * @returns Promise<AssetManager.Bundle> - 加载完成后的Promise。
     */
    private loadBundle(nameOrUrl: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(nameOrUrl, (error, loadedBundle) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(loadedBundle);
                }
            });
        });
    }

    /**
     * 加载分包中的资源并提供进度反馈。
     * @param bundle - 已加载的分包。
     * @param onProgress - 进度回调函数。
     * @returns Promise<void> - 加载完成后的Promise。
     */
    private loadAssetsWithProgress(bundle: AssetManager.Bundle, onProgress: (progress: number) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            const assets = bundle.getDirWithPath('');
            const totalAssets = assets.length;
            if (totalAssets === 0) {
                /** 异步调用，避免同步调用可能导致的问题 */
                setTimeout(() => onProgress(1), 0);
                resolve();
                return;
            }

            let loadedAssets = 0;
            const loadAsset = (asset: any) => {
                bundle.load(asset.path, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    loadedAssets++;
                    onProgress(loadedAssets / totalAssets);
                    if (loadedAssets === totalAssets) {
                        resolve();
                    }
                });
            };

            assets.forEach(loadAsset);
        });
    }
}

/** 分包管理器实例 */
export const bundleMgr = BundleMgr.instance;
