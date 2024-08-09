import { deleteWebToken, getUserByToken } from "@/bdd/requests/user.request";
import { SESSION_ID_COOKIE } from "@/constants/session.const";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Fonction qui permet de désérialiser la partie cookie du header d'une requête.
 * 
 * @param {string} cookieHeader - La partie cookie de la requête.
 * @returns {Record<string, string>[]} Un tableau d'objet avec les valeurs et les clés des cookies.
 */
function deserializeCookie(cookieHeader: string): Record<string, string>[] {
    return cookieHeader.split(';').map(cookie => {
        const [key, value] = cookie.trim().split('=');
        return { key, value };
    });
}

/**
 * Fonction qui permet de récupérer la valeur du cookie de session issue de l'header d'une requête.
 *
 * @param {Record<string, string>[]} cookies - Un tableau d'objet avec les valeurs et les clés des cookies.
 * @return {string | undefined} La valeur du cookie de session si trouvé ou undefined.
 */
function getSessionCookie(cookies: Record<string, string>[]): string | undefined {
    const sessionCookie = cookies.find(cookie => cookie.key === SESSION_ID_COOKIE);
    return sessionCookie ? sessionCookie.value : undefined;
}

/**
 * Route : /api/user/auth/logout
 * METHOD : PUT
 * 
 * Route de l'api pour permettre la déconnexion d'un utilisateur.
 * 
 * @param req - La requête de déconnexion.
 * @returns La réponse de la requête de déconnexion.
 */
export async function PUT(req: Request): Promise<Response> {
    try {
        const cookieString = req.headers.get('cookie');
        if (cookieString) {
            const cookies = deserializeCookie(cookieString);
            const sessionID = getSessionCookie(cookies);

            if (sessionID) {
                await deleteWebToken(sessionID);

                return new Response(JSON.stringify({ message: 'Déconnexion réussi !', valid: true }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Set-Cookie': `${SESSION_ID_COOKIE}=; Path=/; Max-Age=-1`
                    },
                    status: 200
                });
            }
        }
        return new Response(JSON.stringify({ message: 'Impossible de retrouver votre cookie de session !', valid: false }), { status: 401 });
    } catch (err) {
        return ServerError('/api/user/auth/logout', err);
    }
}