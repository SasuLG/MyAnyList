import { getUserSerieDetails } from "@/bdd/requests/series.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/series/[id]/user/[userid]
 * METHOD : GET
 * 
 * Route de l'api pour récupérer les détails d'une série
 * 
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const { params } = context;
        const id = decodeURIComponent(params.id);
        const userId = decodeURIComponent(params.userid);
        if(id){
            if(userId){
                const data = await getUserSerieDetails(id, userId);
                return new Response(JSON.stringify(data), {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    status: 200
                });
            }
            return new Response(JSON.stringify({ message: 'Missing userid in request body', valid:false }), {
                headers: {
                    'Content-Type': 'application/json'
                    },
                    status: 400
                });
        }
        return new Response(JSON.stringify({ message: 'Missing id in request body', valid:false }), {
            headers: {
                'Content-Type': 'application/json'
                },
                status: 400
            });


    } catch (err) {
        return ServerError('GET : /api/series/[id]/user/[userid]', err);
    }
}