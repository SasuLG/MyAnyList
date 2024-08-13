
import { getUserById, updateUserWebToken } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";
import { HashWord } from "@/lib/hash";
import crypto from 'crypto';

/**
 * Variable qui représente la valeur du nom de la clé pour le cookie de session.
 */
const SESSION_ID_COOKIE = 'session_id';
/***
 * Variable qui représente la valeur du nom de la clé pour l'ancien cookie de session lors d'un incarn.
 */
const SESSION_ID_COOKIE_INCARN = 'old_session_id';

/**
 * Route : /api/admin/user/incarn
 * METHOD : POST
 * 
 * Route de l'api pour permettre l'incarnation des utilisateurs.
 * 
 * @param {Request} req - La requête de connexion.
 * @param {any} context - Le contexte de la requête.
 * @returns {Response} La réponse de la requête.
 */
export async function POST(req: Request, context: any): Promise<Response> {
    try {
        const requestBody = await req.json();
        const { incarnId } = requestBody;

        const userRequest = await getUserById(incarnId);
        if (!userRequest) {
            return new Response(JSON.stringify({ message: 'User not found' }), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 404
            });
        }

        const cookies = req.headers.get('cookie') || '';
        const sessionCookie = cookies
            .split('; ')
            .find(row => row.startsWith(`${SESSION_ID_COOKIE}=`))
            ?.split('=')[1];

        const responseHeaders = new Headers();

        if (sessionCookie) {
            responseHeaders.append('Set-Cookie', `${SESSION_ID_COOKIE_INCARN}=${sessionCookie}; Path=/`);
        }

        let hashed_token = userRequest.web_token;
        if (!hashed_token) {
            const web_token = crypto.randomUUID();
            hashed_token = await HashWord(web_token);
            await updateUserWebToken(userRequest, hashed_token);
        }
        const token_expires = 60 * 60 * 24 * 180; // 6 mois

        responseHeaders.append('Set-Cookie', `${SESSION_ID_COOKIE}=${hashed_token}; Path=/; Max-Age=${token_expires}`);

        return new Response(JSON.stringify({ message: 'User incarnation successful', valid:true }), {
            headers: responseHeaders,
            status: 200,
        });

    } catch (err) {
        return ServerError('/api/admin/user/incarn', err);
    }
}
