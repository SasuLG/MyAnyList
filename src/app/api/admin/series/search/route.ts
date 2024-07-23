import { ServerError } from "@/lib/api/response/server.response";
import { getSeriesBySearch } from "@/tmdb/requests/tseries.request";

/**
 * Route : /api/admin/series/search
 * METHOD : GET
 * 
 * Route de l'api pour récupérer les séries par recherche
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function GET(req: Request): Promise<Response> {
    try {
        const url = new URL(req.url);
        const query = url.searchParams.get('query') || '';

        const response = await getSeriesBySearch(query);
        return new Response(JSON.stringify(response), {
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (err) {
        return ServerError('/api/series/import', err);
    }
}
