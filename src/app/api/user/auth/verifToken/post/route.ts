import { getUserByVerifToken } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";
import { sendEmail } from "@/lib/mail";

/**
 * Route : /api/user/auth/verifToken/post
 * METHOD : POST
 * 
 * Route api qui permet de renvoyer un email de vérification à l'utilisateur.
* 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function POST(req: Request): Promise<Response> {
    try {
        const requestBody = await req.json();
        const { verifToken } = requestBody;
        const user = await getUserByVerifToken(verifToken);
        if(user){
            const verificationUrl = `${process.env.MODE === "production" ? process.env.NEXT_PUBLIC_BASE_URL_PROD: process.env.NEXT_PUBLIC_BASE_URL_DEV}/verify-email?token=${user.verifToken}`;
            await sendEmail(user.email, 'Vérifiez votre adresse email', `${verificationUrl}`);
            return new Response(JSON.stringify({ valid: true, message: 'Un email de vérification vous a été envoyé.' }), { status: 200 });
        }
        return new Response(JSON.stringify({ valid: false, message: 'Utilisateur introuvable.' }), { status: 400 });
    } catch (err) {
        return ServerError('/api/user/auth/verifToken/post', err);
    }
}

