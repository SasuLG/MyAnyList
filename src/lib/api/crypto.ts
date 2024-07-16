import CryptoJS from "crypto-js";

/**
 * Fonction qui permet de chiffrer un text en AES 256 CBC.
 * 
 * @param {string} text - Le text à chiffre
 * @returns - Le text chiffré
 */
export const encrypt = (text: string): string => {
    return CryptoJS.AES.encrypt(text, process.env.CRYPTO_key as string).toString();
}

/**
 * Fonction qui permet de d"chiffrer un chiffrement AES 256 CBC.
 * 
 * @param {string} encryptedText - Le text chiffré
 * @returns - Le text déchiffré
 */
export const decrypt = (encryptedText: string): string => {
    return CryptoJS.AES.decrypt(encryptedText, process.env.CRYPTO_key as string).toString(CryptoJS.enc.Utf8);
}