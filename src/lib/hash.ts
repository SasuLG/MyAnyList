import bcrypt from 'bcryptjs';

/**
 * Méthode qui permet d'encrypter un mot en bcrypt.
 * 
 * @param word - le mot en claire.
 * @returns Le mot encrypté en bcrypt.
 */
async function HashWord(word: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    const hashedWord = await bcrypt.hash(word, salt);
    return hashedWord;
}

export {
    HashWord
};
