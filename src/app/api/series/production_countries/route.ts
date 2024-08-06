import { getAllProductionCountries } from "@/bdd/requests/series.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/series/production_countries
 * METHOD : GET
 * 
 * Route de l'api pour récupérer tous les pays de production de séries.
 * 
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {

        const data = await getAllProductionCountries();
        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });

    } catch (err) {
        return ServerError('GET : /api/series/production_countries', err);
    }
}