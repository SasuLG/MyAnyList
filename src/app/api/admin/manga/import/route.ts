import { getTmdbIdsMangas } from "@/bdd/requests/admin-manga.request";
import { importManga } from "@/bdd/requests/admin-manga.request";
import { ServerError } from "@/lib/api/response/server.response";
export const maxDuration = 60; // This function can run for a maximum of 10 seconds

/**
 * Route : /api/admin/manga/import
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
        const mangaData = await req.json();
        await importManga(mangaData);
        return new Response(JSON.stringify({ message: 'Manga importé avec succès', valid: true }), {
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
 * Route : /api/admin/manga/import
 * METHOD : GET
 *
 * Route de l'api pour récupérer l'id des mangas importés.
 *
 * @returns {Response} La réponse de la requête de récupération.
 * @params {any} [token, name] - Le paramètre dynamique de la route de l'api.
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const anilistIds = await getTmdbIdsMangas();
        if(!anilistIds || anilistIds.length <= 0) {
            return new Response(JSON.stringify({ message: 'Aucun manga à importer' }), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 400
            });
        }
        return new Response(JSON.stringify(anilistIds), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });

    } catch (err) {
        return ServerError('GET : /api/amdin/series/import', err);
    }
}