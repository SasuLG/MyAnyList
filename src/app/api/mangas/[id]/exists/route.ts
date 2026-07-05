import { isMangaExists } from "@/bdd/requests/manga.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/mangas/[id]
 * METHOD : GET
 * 
 * Route de l'api pour vérifier si un manga existe.
 * 
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const { id } = await context.params;
        const decodedId = Number(decodeURIComponent(id));

        if(decodedId){
            const data = await isMangaExists(decodedId);
            return new Response(JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 200
            });
        }
        return new Response(JSON.stringify({ message: 'Missing id in request body', valid:false }), {
            headers: {
                'Content-Type': 'application/json'
                },
                status: 400
            });


    } catch (err) {
        return ServerError('GET : /api/mangas/[id]', err);
    }
}