import { followManga } from "@/bdd/requests/manga.request";
import { getUserByToken } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/[token]/mangas/follow
 * METHOD : POST
 * 
 * Route de l'api pour suivre un manga.
 * 
 * @param {Request} req - La requête de follow.
 * @returns {Response} La réponse de la requête de follow.
 */
export async function POST(req: Request, context: any): Promise<Response> {
    try {
        const { token } = await context.params;
        const webToken = decodeURIComponent(token);
        const userRequest = await getUserByToken(webToken);

        if(userRequest){
            const requestBody = await req.json();
            const { mangaId } = requestBody;
            if(mangaId){
                const response = await followManga(userRequest.id, mangaId);
                if(response){
                    return new Response(JSON.stringify({ message: 'Manga followed' }), {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        status: 200
                    });
                }
                return new Response(JSON.stringify({ message: 'Une erreur est survenue' }), {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    status: 400
                });
            }
            return new Response(JSON.stringify({ message: 'Manga not found' }), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 400
            });
        }
        return new Response(JSON.stringify({ message: 'User not found' }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 404
        });
    } catch (err) {
        return ServerError('/api/[token]/mangas/follow', err);
    }
}