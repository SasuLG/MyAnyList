import { User } from "@/bdd/model/user";
import { createUser, deleteVerifToken, getUserByLogin, getUserByMail, getUserByVerifToken } from "@/bdd/requests/user.request";
import { WrongCredentials } from "@/lib/api/response/auth.response";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/user/auth/verify-email
 * METHOD : GET
 * 
 * Route de l'api pour permettre la vérification de l'email des utilisateurs. 
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const { params } = context;
        const verifToken = decodeURIComponent(params.verifToken);
        const userRequest = await getUserByVerifToken(verifToken);
        if(userRequest){
            return new Response(JSON.stringify(userRequest), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 200
            });
        }
        return new Response(JSON.stringify({ message: 'VerifToken invalide', valid: false }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 400
        });

    } catch (err) {
        return ServerError('/api/user/auth/verify-email', err);
    }
}

/**
 * Route : /api/user/auth/verifToken
 * METHOD : POST
 * 
 * Route de l'api pour permettre de supprimer un verifToken (donc de verifier un user)
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function POST(req: Request): Promise<Response> {
    try {
        const requestBody = await req.json();
        const { verifToken } = requestBody;
        if(verifToken){
            await deleteVerifToken(verifToken);
        }
        return new Response(JSON.stringify({ message: 'VerifToken supprimé', valid: true }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });
    } catch (err) {
        return ServerError('/api/user/auth/verifToken', err);
    }
}

