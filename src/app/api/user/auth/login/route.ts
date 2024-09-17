import { ServerError } from "@/lib/api/response/server.response";
import bcrypt from 'bcryptjs';
import { User } from "@/bdd/model/user";
import { getUserByLogin, getUserByMail, updateUserWebToken } from "@/bdd/requests/user.request";
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
    const userByMail = await getUserByMail(login);
    if (userByMail && await bcrypt.compare(password, userByMail.password)) {
        return userByMail;
    }
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
            if(foundUser.verifToken){
                return new Response(JSON.stringify({ message: 'Votre compte n\'est pas vérifié !', redirect: '', valid: false }), {headers: {'Content-Type': 'application/json' }, status: 200 });
            }
            if(foundUser.banned){
                return new Response(JSON.stringify({ message: 'Votre compte a été banni !', redirect: '', valid: false }), {headers: { 'Content-Type': 'application/json'  },status: 200});
            }
            const [serverResponse, sessionID, token] = await AuthRouteResponse(foundUser.web_token || '','Connexion en cours...', HOME_ROUTE, 200, true) as [Response, string, string];
            if(token === ''){
                await updateUserWebToken(foundUser, sessionID);
            }
            return serverResponse;
        }
        return WrongCredentials();
    } catch (err) {
        return ServerError('/api/user/auth/login', err);
    }
}