import { removeWaitManga } from "@/bdd/requests/manga.request";
import { getUserByToken } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/[token]/mangas/unwaited
 * METHOD : POST
 * 
 * Route de l'api pour supprimer un manga de la waitList.
 * 
 * @returns {Response} La réponse de la requête de suppression du manga de la waitList.
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
                const response = await removeWaitManga(userRequest.id, mangaId);
                if(response){
                    return new Response(JSON.stringify({ message: 'Manga remove from the waitList' }), {
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
        return ServerError('/api/[token]/mangas/unwaited', err);
    }
}