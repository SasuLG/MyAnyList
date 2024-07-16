import { formatDateTime } from "@/lib/date.parser";

/**
 * Fonction prédéfini pour envoyer une réponse indiquant un erreur serveur.
 *
 * @param {string} route - La route qui à eu une erreur.
 * @param {any} err - Le message d'erreur.
 * @return {*}  {Response}
 */
function ServerError(route: string, err: any): Response {
    console.log(`[${formatDateTime(new Date(Date.now()))}] - ${route} \n( ${err} )`);
    return new Response(JSON.stringify({ message: 'Une erreur est survenu !', valid: false }), {
        headers: {
            'Content-Type': 'application/json'
        },
        status: 500
    });
}

export {
    ServerError
};

