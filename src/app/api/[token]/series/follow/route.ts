import { followSerie } from "@/bdd/requests/series.request";
import { getUserByToken } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/[token]/series/follow
 * METHOD : POST
 * 
 * Route de l'api pour suivre une série.
 * 
 * @param {Request} req - La requête de follow.
 * @returns {Response} La réponse de la requête de follow.
 */
export async function POST(req: Request, context: any): Promise<Response> {
    try {
        const { params } = context;
        const webToken = decodeURIComponent(params.token);
        const userRequest = await getUserByToken(webToken);

        if(userRequest){
            const requestBody = await req.json();
            const { serieId } = requestBody;
            if(serieId){
                const response = await followSerie(userRequest.id, serieId);
                if(response){
                    return new Response(JSON.stringify({ message: 'Serie followed' }), {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        status: 200
                    });
                }
                return new Response(JSON.stringify({ message: 'Une erreur est survenue' }), {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    status: 400
                });
            }
            return new Response(JSON.stringify({ message: 'Serie not found' }), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 400
            });
        }
        return new Response(JSON.stringify({ message: 'User not found' }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 404
        });
    } catch (err) {
        return ServerError('/api/[token]/series/follow', err);
    }
}