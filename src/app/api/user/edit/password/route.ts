import { editUserPassword } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/user/edit/password
 * METHOD : POST
 * 
 * Route de l'api pour permettre la modification du mot de passe d'un utilisateur.
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function POST(req: Request): Promise<Response> {
    try {
        const requestBody = await req.json();
        const { userId, newPassword } = requestBody;

        if(!userId || !newPassword) return ServerError('/api/user/edit/password', 'No userId or newPassword provided');
        if (newPassword.trim() === '') { return ServerError('/api/user/edit/password', 'No password provided'); }
        
        await editUserPassword(userId, newPassword);
        return new Response(JSON.stringify({ valid: true }), { status: 200 });
    } catch (err) {
        return ServerError('/api/user/edit/password', err);
    }
}