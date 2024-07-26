import { SESSION_ID_COOKIE } from "@/constants/session.const";
import { AuthResponse } from "@/types/api/auth/auth.type";
import { HashWord } from "../../hash";

/**
 * Fonction qui permet de créer la réponse suite à une demande d'authentification.
 * Si la requête est valide un cookie de session est créé.
 * 
 * @param {string} message - Le message à inclure dans la réponse en cas d'erreur.
 * @param {string} redirect - Le chemin où sera redirigé l'utilisateur en cas de succès.
 * @param {number} status - Le status serveur de la réponse.
 * @param {boolean} valid - True si les identifiants de connexion de l'utilisateur sont bon.
 * @returns 
 *  Si les identifiants sont bon :
 *      - le premier élément est la réponse du serveur.
 *      - le deuxième élément est l'ID de session pour l'utilisateur.
 *  Si les identifiants ne sont pas bon :
 *      - Uniquement la réponse du serveur. 
 */
async function AuthRouteResponse(message: string, redirect: string, status: number, valid: boolean = false): Promise<[Response, string] | Response> {
    const responseData: AuthResponse = { message, redirect, valid };
    if (responseData.valid) {
        const web_token = crypto.randomUUID();
        const hashed_token = await HashWord(web_token);
        const token_expires = 60 * 60 * 24 * 180; // 6 mois.
        const response = new Response(JSON.stringify({ ...responseData, cookie: hashed_token }), {
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': `${SESSION_ID_COOKIE}=${hashed_token}; Path=/; Max-Age=${token_expires}`
            },
            status
        });
        return [response, hashed_token];
    }

    return new Response(JSON.stringify(responseData), {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 200
    });
}

/**
 * Fonction prédéfini pour envoyer une réponse indiquant que les identifiants
 * de connexion de l'utilisateur ne sont pas bon.
 * 
 * @returns Une réponse serveur.
 */
async function WrongCredentials(): Promise<Response> {
    return await AuthRouteResponse('Identifiant ou mot de passe incorrect !', '', 200) as Response;
}

/**
 * Fonction prédéfini pour envoyer une réponse indiquant que le pseudo (identifiant)
 * existe déjà dans le base de donnée.
 * 
 * @returns Une réponse serveur.
 */
async function UserAlreadyExists(): Promise<Response> {
    return await AuthRouteResponse('Cet identifiant existe déjà !', '', 200) as Response;
}

export {
    AuthRouteResponse,
    HashWord,
    UserAlreadyExists,
    WrongCredentials
};

