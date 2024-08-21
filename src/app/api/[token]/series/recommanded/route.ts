import { getRecommendedSeries, getSeries, getSeriesByIds } from "@/bdd/requests/series.request";
import { getUserByToken } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/[token]/series/recommanded
 * METHOD : GET
 * 
 * Route de l'api pour récupérer les séries recommandées.
 * 
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const { params } = context;
        const webToken = decodeURIComponent(params.token);
        const userRequest = await getUserByToken(webToken);
        
        if(userRequest){
            const url = new URL(req.url);
            const limit = Number(url.searchParams.get('limit')) || 10;
            const page = Number(url.searchParams.get('page')) || 1;
    
            const data = await getRecommendedSeries(userRequest.id, limit, page);
            if(data.length > 0){
                console.log(data);
                const series = await getSeriesByIds(data.map((serie) => serie.id));
                return new Response(JSON.stringify(series), {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    status: 200
                });
            }
            return new Response(JSON.stringify({ message: 'No series found' }), {
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
        return ServerError('GET : /api/[token]/series/recommanded', err);
    }
}