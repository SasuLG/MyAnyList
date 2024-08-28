import { getTmdbIdsSeries, importSerie } from "@/bdd/requests/admin-series.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/amdin/series/import
 * METHOD : POST
 * 
 * Route de l'api pour insérer une nouvelle série dans la base de données.
 * 
 * @returns {Response} La réponse de la requête de modification.
 * @params {any} [token, name] - Le paramètre dynamique de la route de l'api.
 * @returns {Response} La réponse de la requête.
 */
export async function POST(req: Request, context: any): Promise<Response> {
    try {
        const serieData = await req.json();
        await importSerie(serieData);
        return new Response(JSON.stringify({ message: 'Série importée avec succès', valid: true }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });

    } catch (err) {
        return ServerError('POST : /api/amdin/series/import', err);
    }
}


/**
 * Route : /api/amdin/series/import
 * METHOD : GET
 * 
 * Route de l'api pour récupérer le vote d'une personne d'un sprint.
 * 
 * @returns {Response} La réponse de la requête de récupération.
 * @params {any} [token, name] - Le paramètre dynamique de la route de l'api.
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const tmdbIds = await getTmdbIdsSeries();
        if(!tmdbIds || tmdbIds.length <= 0) {
            return new Response(JSON.stringify({ message: 'Aucune série à importer' }), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 400
            });
        }
        return new Response(JSON.stringify(tmdbIds), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });

    } catch (err) {
        return ServerError('GET : /api/amdin/series/import', err);
    }
}