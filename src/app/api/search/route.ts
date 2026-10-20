import { getMangasSearch } from "@/bdd/requests/manga.request";
import { getSeriesSearch } from "@/bdd/requests/series.request";
import { getUserByToken } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/search
 * METHOD : GET
 *
 * Route de l'api pour récupérer les infos par recherche
 *
 * @param {Request} req - La requête de connexion.
 * @returns {Response} La réponse de la requête de connexion.
 */
export async function GET(req: Request): Promise<Response> {
    try {
        const url = new URL(req.url);
        const query = url.searchParams.get('query')?.trim() || '';
        const mode = url.searchParams.get('mode') || 'manga';
        const sessionToken = req.headers.get('cookie')
            ?.split(';')
            .map(cookie => cookie.trim())
            .find(cookie => cookie.startsWith('session_id='))
            ?.slice('session_id='.length);
        const user = sessionToken ? await getUserByToken(decodeURIComponent(sessionToken)) : undefined;

        if (!query) {
            return new Response(JSON.stringify([]), {
                headers: { 'Content-Type': 'application/json' },
                status: 200
            });
        }

        const response = mode === 'manga'
            ? await getMangasSearch(query, user?.id)
            : await getSeriesSearch(query, user?.id);

        return new Response(JSON.stringify(response), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });

    } catch (err) {
        return ServerError('/api/search', err);
    }
}
