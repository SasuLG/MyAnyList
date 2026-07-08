import { addVote, updateVote } from "@/bdd/requests/manga.request";
import { getUserByToken } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/[token]/mangas/[id]/vote
 * METHOD : POST
 * 
 * Route de l'api pour permettre d'ajouter ou de modifier une note et un commentaire à un manga.
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function POST(req: Request, context: any): Promise<Response> {
    try {
        const { token, id } = await context.params;
        const webToken = decodeURIComponent(token);
        const userRequest = await getUserByToken(webToken);
        const mangaId = id;

        if(userRequest){
            if(mangaId){
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
                    response = await addVote(userRequest.id, mangaId, note, comment);
                }else{
                    response = await updateVote(userRequest.id, mangaId, note, comment);
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
            return new Response(JSON.stringify({ message: 'Manga not found' }), {
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
        return ServerError('/api/[token]/mangas/[id]/vote', err);
    }
}