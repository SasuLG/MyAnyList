import { getPopularSeries } from "@/bdd/requests/series.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/series/popular
 * METHOD : GET
 * 
 * Route de l'api pour récupérer les séries populaires.
 * 
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const url = new URL(req.url);
        const limit = Number(url.searchParams.get('limit')) || 10;
        const page = Number(url.searchParams.get('page')) || 1;

        const data = await getPopularSeries(limit, page);
        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });

    } catch (err) {
        return ServerError('GET : /api/series/popular', err);
    }
}