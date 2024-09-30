import { createResetToken} from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";
import jwt from 'jsonwebtoken';

/**
 * Route : /api/user/auth/resetToken/create
 * METHOD : POST
 * 
 * Route de l'api pour permettre d'ajouter un resetToken à un user.
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function POST(req: Request): Promise<Response> {
    try {
        const requestBody = await req.json();
        const { user } = requestBody;
        if(user){
            const userId = user.id;
            const emailResetToken = jwt.sign(
                { userId}, 
                process.env.JWT_SECRET ?? "default", 
                { expiresIn: '1h' } // Le token expire dans 1 heure
            );
            await createResetToken(userId, emailResetToken);
            return new Response(JSON.stringify({ message: 'resetToken crée', valid: true, resetToken: emailResetToken }), {
                headers: {
                'Content-Type': 'application/json'
                },
                status: 200
            });
        }
        return new Response(JSON.stringify({ message: 'Utilisateur introuvable', valid: false }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 400
        });

    } catch (err) {
        return ServerError('/api/user/auth/resetToken/create', err);
    }
}

