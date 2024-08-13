import { User } from "../model/user";

/**
 * Fonction qui permet de récupérer les informations d'une personne à partir de son cookie de session.
 * 
 * @param {string} senderCookie - Le cookie de connexion de la personne qui fait la requête
 * @returns {Promise<User | undefined>}
 */
export async function getUserInfo(senderCookie: string): Promise<User | undefined> {
    if (senderCookie && senderCookie.trim() !== '') {
        const response = await fetch(`/api/${encodeURIComponent(senderCookie)}/user/load`);
        if (response.ok) {
            const user: User = await response.json();
            
            // Vérifier la présence d'un ancien cookie de session
            const oldSessionCookie = document.cookie
                .split('; ')
                .find(row => row.startsWith('old_session_id='))
                ?.split('=')[1];

            if (oldSessionCookie) {
                user.isIncarned = true; 
            } else {
                user.isIncarned = false;
            }

            return user;
        }
    }
    return undefined;
}
