import { banUser, editUserName, unbanUser } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/user/edit/ban
 * METHOD : POST
 * 
 * Route de l'api pour permettre la modification du login d'un utilisateur.
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function POST(req: Request): Promise<Response> {
    try {
        const requestBody = await req.json();
        const { userId, isBanned } = requestBody;
        
        if (!userId) {
            return new Response(JSON.stringify({ valid: false }), { status: 400 });
        }
        if(isBanned) {
            unbanUser(userId);
        }else{
            banUser(userId);
        }
        return new Response(JSON.stringify({ valid: true }), { status: 200 });
    } catch (err) {
        return ServerError('/api/user/edit/ban', err);
    }
}