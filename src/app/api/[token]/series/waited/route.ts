import { addWaitSerie } from "@/bdd/requests/series.request";
import { getUserByToken } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/[token]/series/waited
 * METHOD : POST
 * 
 * Route de l'api pour ajouter une série en waitList.
 * 
 * @returns {Response} La réponse de la requête d'ajout en waitList.
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
                const response = await addWaitSerie(userRequest.id, serieId);
                if(response){
                    return new Response(JSON.stringify({ message: 'Serie add to the waitList' }), {
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
        return ServerError('/api/[token]/series/waited', err);
    }
}