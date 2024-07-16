import { ServerError } from "@/lib/api/response/server.response";
import bcrypt from 'bcryptjs';
import { User } from "@/bdd/model/user";
import { getUserByLogin, updateUserWebToken } from "@/bdd/requests/user.request";
import { AuthRouteResponse, WrongCredentials } from "@/lib/api/response/auth.response";
import { HOME_ROUTE } from "@/constants/app.route.const";

/**
 * Fonction qui permet d’authentifier un utilisateur.
 * 
 * @param {string} login - Le login de la personne.
 * @param {string} password - Le mot de passe de la personne
 * @returns {User | undefined} L'utilisateur si trouvé ou undefined
 */
async function authenticateUser(login: string, password: string): Promise<User | undefined> {
    const user = await getUserByLogin(login);
    if (user && await bcrypt.compare(password, user.password)) {
        return user;
    }
    return undefined;
}

/**
 * Route : /api/user/auth/login
 * METHOD : POST
 * 
 * Route de l'api pour permettre la connexion des utilisateurs.
 * 
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function POST(req: Request): Promise<Response> {
    try {
        const requestBody = await req.json();
        const { login, password } = requestBody;

        if (login.trim() === '' || password.trim() === '') { return WrongCredentials(); }
        const foundUser: User | undefined = await authenticateUser(login, password);

        if (foundUser) {
            const [serverResponse, sessionID] = await AuthRouteResponse('Connexion en cours...', HOME_ROUTE, 200, true) as [Response, string];
            await updateUserWebToken(foundUser, sessionID);
            return serverResponse;
        }
        return WrongCredentials();
    } catch (err) {
        return ServerError('/api/user/auth/login', err);
    }
}