import { followSerie, unFollowSerie } from "@/bdd/requests/series.request";
import { getUserById } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/[token]/series/unfollow
 * METHOD : POST
 * 
 * Route de l'api pour permettre la connexion des utilisateurs.
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function POST(req: Request, context: any): Promise<Response> {
    try {
        const { params } = context;
        const requestBody = await req.json();
        const { incarnId } = requestBody;
        const userRequest = await getUserById(incarnId);
        
        if(userRequest){

        }
        return new Response(JSON.stringify({ message: 'User not found' }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 404
        });
    } catch (err) {
        return ServerError('/api/[token]/series/unfollow', err);
    }
}