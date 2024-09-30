import { getUserByResetToken } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";
import { sendPasswordResetEmail } from "@/lib/mail";

/**
 * Route : /api/user/auth/resetToken/post
 * METHOD : POST
 * 
 * Route api qui permet de renvoyer un email de reset de mdp à l'utilisateur.
* 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function POST(req: Request): Promise<Response> {
    try {
        const requestBody = await req.json();
        const { data } = requestBody;
        const resetToken = data.resetToken;
        const user = await getUserByResetToken(resetToken);
        if(user){
            const resetUrl = `${process.env.MODE === "production" ? process.env.NEXT_PUBLIC_BASE_URL_PROD: process.env.NEXT_PUBLIC_BASE_URL_DEV}/user/reset-password?token=${user.resetToken}`;
            await sendPasswordResetEmail(user.email, `${resetUrl}`);
            return new Response(JSON.stringify({ valid: true, message: 'Un email de réinitialisation vous a été envoyé.' }), { status: 200 });
        }
        return new Response(JSON.stringify({ valid: false, message: 'Utilisateur introuvable.' }), { status: 400 });
    } catch (err) {
        return ServerError('/api/user/auth/resetToken/post', err);
    }
}

