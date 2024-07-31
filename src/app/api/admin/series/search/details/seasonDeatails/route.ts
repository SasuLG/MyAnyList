import { ServerError } from "@/lib/api/response/server.response";
import { getDetailsSeasonsBySeasonNumber } from "@/tmdb/requests/tseries.request";

/**
 * Route : /api/admin/series/search/details/seasonDeatails
 * METHOD : GET
 * 
 * Route de l'api pour récupérer les détails d'une saison
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function GET(req: Request): Promise<Response> {
    try {

        const url = new URL(req.url);
        const id = Number(url.searchParams.get('id')) || 0;
        const season_number = Number(url.searchParams.get('season_number')) || 0;

        const response = await getDetailsSeasonsBySeasonNumber(id, season_number);
        return new Response(JSON.stringify(response), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });

    } catch (err) {
        return ServerError('/api/user/auth/login', err);
    }
}