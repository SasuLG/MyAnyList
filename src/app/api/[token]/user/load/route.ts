import { getUserByToken, isUserAdmin } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/[token]/user/load
 * METHOD : GET
 * 
 * Route de l'api pour récupérer les informations d'une personne en fonction de son token.
 *  - Toutes ces informations
 *  - Les projets dans lequel il se trouve
 *  - Si l'utilisateur est administrateur du site
 * 
 * @param {Request} req - La requête de récupération des informations.
 * @params {any} [token] - Le paramètre dynamique de la route de l'api.
 * @returns {Response} La réponse de la requête de récupération.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const { params } = context;
        const webToken = decodeURIComponent(params.token);

        const user = await getUserByToken(webToken);
        if (user) {

            return new Response(JSON.stringify(user), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 200
            });
        }
        return new Response(JSON.stringify({ message: 'Impossible de retrouver votre compte !', valid: false }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 400
        });
    } catch (err) {
        return ServerError('/api/[token]/user/load', err);
    }
}