import { User } from "../model/user";

/**
 * Fonction qui permet de récupérer les informations d'une personne à partir de son cookie de session.
 * 
 * @param {string} senderCookie - Le cookie de connexion de la personne qui fait la requête
 */
export async function getUserInfo(senderCookie: string): Promise<User | undefined> {
    if (senderCookie && senderCookie?.trim() !== '') {
        const response = await fetch(`/api/${encodeURIComponent(senderCookie)}/user/load`);
        if (response.ok) {
            return await response.json() as User;
        }
    }
    return undefined;
}