import { SESSION_ID_COOKIE, SESSION_ID_COOKIE_INCARN } from "@/constants/session.const";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/admin/user/restore-session
 * METHOD : POST
 * 
 * Route de l'api pour restaurer l'ancien cookie de session.
 * 
 * @param {Request} req - La requête.
 * @returns {Response} La réponse de la requête.
 */
export async function POST(req: Request): Promise<Response> {
    try {
        const cookies = req.headers.get('cookie') || '';
        const oldSessionCookie = cookies
            .split('; ')
            .find(row => row.startsWith(`${SESSION_ID_COOKIE_INCARN}=`))
            ?.split('=')[1];

        if (oldSessionCookie) {
            const responseHeaders = new Headers();
            
            responseHeaders.append('Set-Cookie', `${SESSION_ID_COOKIE}=${oldSessionCookie}; Path=/`);

            responseHeaders.append('Set-Cookie', `${SESSION_ID_COOKIE_INCARN}=; Path=/; Max-Age=0`);

            return new Response(JSON.stringify({ message: 'Restored original user session' }), {
                headers: responseHeaders,
                status: 200
            });
        } else {
            return new Response(JSON.stringify({ message: 'No previous session found', valid:false }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    } catch (err) {
        return ServerError('/api/admin/user/restore-session', err);
    }
}
