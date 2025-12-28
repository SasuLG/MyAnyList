import { getMangasByIds, getRecommendedMangas } from "@/bdd/requests/manga.request";
import { getUserByToken } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/[token]/mangas/recommanded
 * METHOD : GET
 *
 * Route de l'api pour récupérer les mangas recommandés.
 *
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const { token } = await context.params;
        const webToken = decodeURIComponent(token);
        const userRequest = await getUserByToken(webToken);
        if(userRequest){
            const url = new URL(req.url);
            const limit = Number(url.searchParams.get('limit')) || 10;
            const page = Number(url.searchParams.get('page')) || 1;
    
            const data = await getRecommendedMangas(userRequest.id, limit, page);
            if(data.length > 0){
                const mangas = await getMangasByIds(data.map((manga) => manga.id.toString()));
                return new Response(JSON.stringify(mangas), {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    status: 200
                });
            }
            return new Response(JSON.stringify({ message: 'No mangas found' }), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 404
            });
        }
        return new Response(JSON.stringify({ message: 'User not found' }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 404
        });
    } catch (err) {
        return ServerError('GET : /api/[token]/mangas/recommanded', err);
    }
}