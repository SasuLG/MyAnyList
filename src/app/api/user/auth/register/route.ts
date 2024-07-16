import { User } from "@/bdd/model/user";
import { createUser, getUserByLogin } from "@/bdd/requests/user.request";
import { WrongCredentials } from "@/lib/api/response/auth.response";
import { ServerError } from "@/lib/api/response/server.response";

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
        const { login, password } = requestBody;

        if (login.trim() === '' || password.trim() === '') { return WrongCredentials(); }
        const foundUser: User | undefined = await getUserByLogin(login);

        if (foundUser) {
            return new Response(JSON.stringify({ message: 'Ce login est déjà utilisé !', valid: false }), { status: 401 });
        }
        const newUser = await createUser(login, password);

        return new Response(JSON.stringify({ message: 'Inscription réussie !', valid: true }), { status: 200 });
    } catch (err) {
        return ServerError('/api/user/auth/register', err);
    }
}
