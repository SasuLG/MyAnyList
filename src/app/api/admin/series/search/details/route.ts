import { ServerError } from "@/lib/api/response/server.response";
import { getDetailsMovieById, getDetailsSeriesById } from "@/tmdb/requests/tseries.request";

/**
 * Route : /api/admin/series/search/details
 * METHOD : GET
 * 
 * Route de l'api pour récupérer les détails d'une série
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function GET(req: Request): Promise<Response> {
    try {
        const url = new URL(req.url);
        const id = Number(url.searchParams.get('id')) || 0;
        const media_type = url.searchParams.get('media_type') || '';
        let response;
        if(media_type === "tv"){
            response = await getDetailsMovieById(id);
        }else{
            response = await getDetailsSeriesById(id);
        }

        return new Response(JSON.stringify(response), {
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (err) {
        return ServerError('/api/user/auth/login', err);
    }
}