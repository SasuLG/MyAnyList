import { deleteResetToken,  getUserByResetToken } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/user/auth/resetToken
 * METHOD : GET
 * 
 * Route de l'api pour récupérer un utilisateur par son resetToken.
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const url = new URL(req.url);
        const resetToken = url.searchParams.get('resetToken') || "";
        const userRequest = await getUserByResetToken(resetToken);
        if(userRequest){
            return new Response(JSON.stringify(userRequest), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 200
            });
        }
        return new Response(JSON.stringify({ message: 'resetToken invalide', valid: false }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 400
        });

    } catch (err) {
        return ServerError('/api/user/auth/resetToken', err);
    }
}

/**
 * Route : /api/user/auth/resetToken
 * METHOD : POST
 * 
 * Route de l'api pour permettre de supprimer un resetToken
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function POST(req: Request): Promise<Response> {
    try {
        const requestBody = await req.json();
        const { resetToken } = requestBody;
        if(resetToken){
            await deleteResetToken(resetToken);
        }
        return new Response(JSON.stringify({ message: 'resetToken supprimé', valid: true }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });
    } catch (err) {
        return ServerError('/api/user/auth/resetToken', err);
    }
}