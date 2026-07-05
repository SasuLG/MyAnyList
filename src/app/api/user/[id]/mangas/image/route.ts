import { getImageManga } from "@/bdd/requests/manga.request";
import { getUserById } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/user/[id]/mangas/image
 * METHOD : GET
 * 
 * Route de l'api pour récupérer toutes les images des mangas d'un utilisateur. (waitlist ou suivies)
 * 
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request, context: any): Promise<Response>{
    try {
        const { id } = await context.params;
        const decodedId = Number(decodeURIComponent(id));
        const userRequest = await getUserById(decodedId);
        
        if (userRequest) {
            const url = new URL(req.url);
            const isWaitList = url.searchParams.get('waitList') === 'true';

            const data = await getImageManga(userRequest.id, isWaitList);
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
        return ServerError('/api/user/[id]/mangas/image', err);
    }
}