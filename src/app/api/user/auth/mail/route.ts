import {  getUserByMail } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/user/auth/mail
 * METHOD : GET
 * 
 * Route de l'api pour récupérer un utilisateur par email
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const url = new URL(req.url);
        const mail = url.searchParams.get('mail') || "";
        const userRequest = await getUserByMail(mail);
        
        if(userRequest){
            return new Response(JSON.stringify(userRequest), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 200
            });
        }

        return new Response(JSON.stringify({ message: 'Mail invalide', valid: false }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 400
        });

    } catch (err) {
        return ServerError('/api/user/auth/mail', err);
    }
}

