import { editUserName } from "@/bdd/requests/user.request";
import { WrongCredentials } from "@/lib/api/response/auth.response";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/user/edit/login
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
        const { userId, newName } = requestBody;
        
        if(!userId || !newName) return ServerError('/api/user/edit/login', 'No userId or newName provided');
        if (newName.trim() === '') { return WrongCredentials(); }

        await editUserName(userId, newName);
        return new Response(JSON.stringify({ valid: true }), { status: 200 });
    } catch (err) {
        return ServerError('/api/user/edit/login', err);
    }
}