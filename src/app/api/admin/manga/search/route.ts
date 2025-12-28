import { getMangasBySearch } from "@/anilist/requests/mangas.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/admin/manga/search
 * METHOD : GET
 *
 * Route de l'api pour récupérer les mangas par recherche
 *
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function GET(req: Request): Promise<Response> {
    try {
        const url = new URL(req.url);
        const query = url.searchParams.get('query') || '';

        const response = await getMangasBySearch(query);
        console.log(response);
        return new Response(JSON.stringify(response), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });

    } catch (err) {
        return ServerError('/api/series/import', err);
    }
}
