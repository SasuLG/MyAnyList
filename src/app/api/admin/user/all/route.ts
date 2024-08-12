import { getAllUsers } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/admin/user/all
 * METHOD : GET
 * 
 * Route de l'api pour récupérer tous les utilisateurs.
 * 
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request): Promise<Response>{
    try {
        const user = await getAllUsers();
        return new Response(JSON.stringify(user), { status: 200 });
    } catch (err) {
        return ServerError('/api/admin/user/all', err);
    }
}