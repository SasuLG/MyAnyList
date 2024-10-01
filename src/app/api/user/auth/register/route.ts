import { User } from "@/bdd/model/user";
import { createUser, getUserByLogin, getUserByMail } from "@/bdd/requests/user.request";
import { WrongCredentials } from "@/lib/api/response/auth.response";
import { ServerError } from "@/lib/api/response/server.response";
import { sendEmail } from "@/lib/mail";
import jwt from 'jsonwebtoken';

/**
 * Route : /api/user/auth/register
 * METHOD : POST
 * 
 * Route de l'api pour permettre l'inscription des utilisateurs.
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function POST(req: Request): Promise<Response> {
    try {
        const requestBody = await req.json();
        const { login, password, email } = requestBody;
        console.log("logn,"+login, password, email);
        if (login.trim() === '' || password.trim() === '' || email.trim() === '') { return WrongCredentials(); }
        console.log("trim");
        const foundUserMail: User | undefined = await getUserByMail(email);
        if (foundUserMail) {
            return new Response(JSON.stringify({ message: 'Cet email est déjà utilisé !', valid: false }), { status: 401 });
        }
        const foundUser: User | undefined = await getUserByLogin(login);
        if (foundUser) {
            return new Response(JSON.stringify({ message: 'Ce login est déjà utilisé !', valid: false }), { status: 401 });
        }

        console.log("found");
        // Générer un token JWT
        const emailVerificationToken = jwt.sign(
            { login }, 
            process.env.JWT_SECRET ?? "default", 
            { expiresIn: '24h' } // Le token expire dans 24 heures
        );
        console.log("token");
        // Envoyer l'email avec le lien de confirmation
        const verificationUrl = `${process.env.MODE === "production" ? process.env.NEXT_PUBLIC_BASE_URL_PROD: process.env.NEXT_PUBLIC_BASE_URL_DEV}/verify-email?token=${emailVerificationToken}`;
        console.log("url");
        await sendEmail(email, 'Vérifiez votre adresse email', `${verificationUrl}`);
        console.log("send");
        await createUser(login, password, email, emailVerificationToken);
        console.log("create");
        return new Response(JSON.stringify({ message: 'Inscription réussie ! Veuillez vérifier votre email', valid: true }), { status: 200 });
    } catch (err) {
        return ServerError('/api/user/auth/register', err);
    }
}
