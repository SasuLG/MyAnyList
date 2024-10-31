import { getImageSerie } from "@/bdd/requests/series.request";
import { getUserById } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/user/[id]/series/image
 * METHOD : GET
 * 
 * Route de l'api pour récupérer toutes les images des séries d'un utilisateur. (waitlist ou suivies)
 * 
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request, context: any): Promise<Response>{
    try {
        const { params } = context;
        const id = Number(decodeURIComponent(params.id));
        const userRequest = await getUserById(id);
        
        if (userRequest) {
            const url = new URL(req.url);
            const isWaitList = url.searchParams.get('waitList') === 'true';

            const data = await getImageSerie(userRequest.id, isWaitList);
            return new Response(JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 200
            });
        }
        return new Response(JSON.stringify({ message: 'User not found' }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 404
        });
    } catch (err) {
        return ServerError('/api/user/[id]/series/image', err);
    }
}