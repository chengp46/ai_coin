//import CryptoES from 'crypto-es';
import { logMgr } from '../Managers/LogMgr';

/** 加解密工具类 */
export class CryptUtil {
    /**
     * 文本加密函数
     * @param plainText 明文文本
     * @param key 加密密钥
     * @returns 加密后的Base64字符串
     */
    public static encryptText(plainText: string, key: string): string | null {
        // try {
        //     const { keyWordArray, iv } = this.getKeyAndIV(key);
        //     const wordArray = CryptoES.enc.Utf8.parse(plainText);

        //     const cipherText = CryptoES.AES.encrypt(wordArray, keyWordArray, {
        //         mode: CryptoES.mode.CBC,
        //         padding: CryptoES.pad.Pkcs7,
        //         iv: iv
        //     });

        //     const combined = iv.concat(cipherText.ciphertext);
        //     return CryptoES.enc.Base64.stringify(combined);
        // } catch (error) {
        //     logMgr.err('加密文本时出错:', error);
             return null;
        // }
    }

    /**
     * 文本解密函数
     * @param cipherText 密文文本
     * @param key 解密密钥
     * @returns 解密后的明文
     */
    public static decryptText(cipherText: string, key: string): string | null {
        // try {
        //     const { keyWordArray, iv, encryptedText } = this.extractIVAndCipherText(cipherText, key);

        //     const decrypted = CryptoES.AES.decrypt({ ciphertext: encryptedText }, keyWordArray, {
        //         mode: CryptoES.mode.CBC,
        //         padding: CryptoES.pad.Pkcs7,
        //         iv: iv
        //     });

        //     return decrypted.toString(CryptoES.enc.Utf8);
        // } catch (error) {
        //     logMgr.err('解密文本时出错:', error);
             return null;
        // }
    }

    /**
     * 二进制数据加密函数
     * @param data 要加密的二进制数据
     * @param key 加密密钥
     * @returns 加密后的二进制数据
     */
    public static encryptBytes(data: Uint8Array, key: string): Uint8Array | null {
        // try {
        //     const { keyWordArray, iv } = this.getKeyAndIV(key);
        //     const wordArray = CryptoES.lib.WordArray.create(data);

        //     const cipherText = CryptoES.AES.encrypt(wordArray, keyWordArray, {
        //         mode: CryptoES.mode.CBC,
        //         padding: CryptoES.pad.Pkcs7,
        //         iv: iv
        //     });

        //     const combined = iv.concat(cipherText.ciphertext);
        //     return this.wordArrayToUint8Array(combined);
        // } catch (error) {
        //     logMgr.err('加密二进制数据时出错:', error);
             return null;
        // }
    }

    /**
     * 二进制数据解密函数
     * @param data 要解密的二进制数据
     * @param key 解密密钥
     * @returns 解密后的二进制数据
     */
    public static decryptBytes(data: Uint8Array, key: string): Uint8Array | null {
        // try {
        //     const { keyWordArray, iv, encryptedText } = this.extractIVAndCipherTextFromBytes(data, key);

        //     const decrypted = CryptoES.AES.decrypt({ ciphertext: encryptedText }, keyWordArray, {
        //         mode: CryptoES.mode.CBC,
        //         padding: CryptoES.pad.Pkcs7,
        //         iv: iv
        //     });

        //     return this.wordArrayToUint8Array(decrypted);
        // } catch (error) {
        //     logMgr.err('解密二进制数据时出错:', error);
             return null;
        // }
    }

    /**
     * 生成随机 IV 和获取加密密钥的WordArray格式
     * @param key 密钥字符串
     * @returns 包含密钥和IV的对象
     */
    // private static getKeyAndIV(key: string): { keyWordArray: CryptoES.lib.WordArray, iv: CryptoES.lib.WordArray } {
    //     const keyWordArray = CryptoES.enc.Utf8.parse(this.md5(key));
    //     const iv = CryptoES.lib.WordArray.random(16);
    //     return { keyWordArray, iv };
    // }

    // /**
    //  * 从Base64字符串中提取IV和密文
    //  * @param cipherText 密文文本
    //  * @param key 解密密钥
    //  * @returns 包含密钥、IV和密文的对象
    //  */
    // private static extractIVAndCipherText(cipherText: string, key: string): { keyWordArray: CryptoES.lib.WordArray, iv: CryptoES.lib.WordArray, encryptedText: CryptoES.lib.WordArray } {
    //     const keyWordArray = CryptoES.enc.Utf8.parse(this.md5(key));
    //     const cipherTextBytes = CryptoES.enc.Base64.parse(cipherText);

    //     const iv = CryptoES.lib.WordArray.create(cipherTextBytes.words.slice(0, 4), 16);
    //     const encryptedText = CryptoES.lib.WordArray.create(cipherTextBytes.words.slice(4), cipherTextBytes.sigBytes - 16);

    //     return { keyWordArray, iv, encryptedText };
    // }

    // /**
    //  * 从Uint8Array中提取IV和密文
    //  * @param data 密文数据
    //  * @param key 解密密钥
    //  * @returns 包含密钥、IV和密文的对象
    //  */
    // private static extractIVAndCipherTextFromBytes(data: Uint8Array, key: string): { keyWordArray: CryptoES.lib.WordArray, iv: CryptoES.lib.WordArray, encryptedText: CryptoES.lib.WordArray } {
    //     const keyWordArray = CryptoES.enc.Utf8.parse(this.md5(key));
    //     const wordArray = this.uint8ArrayToWordArray(data);

    //     const iv = CryptoES.lib.WordArray.create(wordArray.words.slice(0, 4), 16);
    //     const encryptedText = CryptoES.lib.WordArray.create(wordArray.words.slice(4), wordArray.sigBytes - 16);

    //     return { keyWordArray, iv, encryptedText };
    // }

    // /**
    //  * 将WordArray转换为Uint8Array
    //  * @param wordArray 要转换的WordArray
    //  * @returns 转换后的Uint8Array
    //  */
    // private static wordArrayToUint8Array(wordArray: CryptoES.lib.WordArray): Uint8Array {
    //     const base64String = CryptoES.enc.Base64.stringify(wordArray);
    //     return Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
    // }

    // /**
    //  * 将Uint8Array转换为WordArray
    //  * @param byteArray 要转换的Uint8Array
    //  * @returns 转换后的WordArray
    //  */
    // private static uint8ArrayToWordArray(byteArray: Uint8Array): CryptoES.lib.WordArray {
    //     const base64String = btoa(String.fromCharCode.apply(null, byteArray as any));
    //     return CryptoES.enc.Base64.parse(base64String);
    // }

    // /**
    //  * md5加密方法
    //  * @param data 需要加密的数据
    //  * @returns 加密后的字符串
    //  */
    // public static md5(data: string): string {
    //     return CryptoES.MD5(data).toString();
    // }

    // /**
    //  * md5签名方法
    //  * @param key 可选密钥
    //  * @param data 需要加密的数据
    //  * @returns 加密后的字符串
    //  */
    // public static md5Sign(key: string, ...data: string[]): string {
    //     return CryptoES.MD5(data.join('') + key).toString();
    // }
}
