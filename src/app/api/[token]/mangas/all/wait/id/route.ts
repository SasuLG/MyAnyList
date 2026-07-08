import { getMangasIdWaited } from "@/bdd/requests/manga.request";
import { getUserByToken } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/[token]/mangas/all/wait/id
 * METHOD : GET
 * 
 * Route de l'api pour récupérer tous les mangas.
 * 
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const { token } = await context.params;
        const webToken = decodeURIComponent(token);
        const userRequest = await getUserByToken(webToken);
        
        if (userRequest) {
            const data = await getMangasIdWaited(userRequest.id);
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
        return ServerError('GET :/api/[token]/mangas/all/wait/id', err);
    }
}