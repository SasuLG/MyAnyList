import { getUserByLogin } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/user/
 * METHOD : GET
 * 
 * Route de l'api pour vérifier si un utilisateur existe.
 * 
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request): Promise<Response>{
    try {
        const url = new URL(req.url);
        const username = url.searchParams.get('username');
        if(!username){
            return new Response(JSON.stringify(undefined), {status: 400});
        }
        const user = await getUserByLogin(username);
        if(user !== undefined){
            return new Response(JSON.stringify(user), {status: 200});
        }
        return new Response(JSON.stringify(undefined), {status: 400});
    } catch (err) {
        return ServerError('/api/user/', err);
    }
}