import { getAllTags } from "@/bdd/requests/manga.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/mangas/tags
 * METHOD : GET
 * 
 * Route de l'api pour récupérer tous les tags de mangas.
 * 
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {

        const data = await getAllTags();
        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });

    } catch (err) {
        return ServerError('GET : /api/mangas/tags', err);
    }
}