import { ServerError } from "@/lib/api/response/server.response";
import { getDetailsSeasonsBySeasonNumber } from "@/tmdb/requests/tseries.request";

/**
 * Route : /api/series/import
 * METHOD : GET
 * 
 * Route de l'api 
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function GET(req: Request): Promise<Response> {
    try {

        const response = await getDetailsSeasonsBySeasonNumber(1429, 1);
        return new Response(JSON.stringify(response), {
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (err) {
        return ServerError('/api/user/auth/login', err);
    }
}