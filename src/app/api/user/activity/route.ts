import { updateLastActivityByName } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/user/activity
 * METHOD : POST
 * 
 * Route de l'api pour mettre à jour la date de dernière activité d'un utilisateur.
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function POST(req: Request): Promise<Response> {
    try {
        const requestBody = await req.json();
        const { login } = requestBody;

        if(!login) return ServerError('/api/user/activity', 'No login provided');
        await updateLastActivityByName(login);
        return new Response(JSON.stringify({ valid: true }), { status: 200 });
    } catch (err) {
        return ServerError('/api/user/activity', err);
    }
}