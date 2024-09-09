import { addVote, updateVote } from "@/bdd/requests/series.request";
import { getUserByToken } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/[token]/series/[id]/vote
 * METHOD : POST
 * 
 * Route de l'api pour permettre d'ajouter ou de modifier une note et un commentaire à une série.
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function POST(req: Request, context: any): Promise<Response> {
    try {
        const { params } = context;
        const webToken = decodeURIComponent(params.token);
        const userRequest = await getUserByToken(webToken);
        const serieId = params.id;

        if(userRequest){
            if(serieId){
                const requestBody = await req.json();
                const { note, comment, newVote } = requestBody;
                if(note < 0 || note > 10 || note===undefined || note === null) return new Response(JSON.stringify({ message: 'Note is required' }), {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    status: 400
                });

                let response
                if(newVote){
                    response = await addVote(userRequest.id, serieId, note, comment);
                }else{
                    response = await updateVote(userRequest.id, serieId, note, comment);
                }
                if(response){
                    return new Response(JSON.stringify({ message: 'Vote added' }), {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        status: 200
                    });
                }
                return new Response(JSON.stringify({ message: 'Error adding vote' }), {
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
        return ServerError('/api/[token]/series/[id]/vote', err);
    }
}