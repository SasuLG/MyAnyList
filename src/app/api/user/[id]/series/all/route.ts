import { getSeriesFollowed } from "@/bdd/requests/series.request";
import { getUserById, getUserByLogin } from "@/bdd/requests/user.request";
import { ServerError } from "@/lib/api/response/server.response";

/**
 * Route : /api/user/[id]/series/all
 * METHOD : GET
 * 
 * Route de l'api pour récupérer toutes les séries suivies par un utilisateur en tant qu'admin.
 * 
 * @returns {Response} La réponse de la requête.
 */
export async function GET(req: Request, context: any): Promise<Response>{
    try {
        const { params } = context;
        const id = Number(decodeURIComponent(params.id));
        const userRequest = await getUserById(id);
        
        if (userRequest) {
            const url = new URL(req.url);
            const limit = Number(url.searchParams.get('limit')) || 10;
            const page = Number(url.searchParams.get('page')) || 1;
            const isWaitList = url.searchParams.get('waitList') === 'true';

            const data = await getSeriesFollowed(limit, page, userRequest.id, isWaitList);
            return new Response(JSON.stringify(data), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 200
            });
        }
        return new Response(JSON.stringify({ message: 'User not found' }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 404
        });
    } catch (err) {
        return ServerError('/api/user/[id]/series/all', err);
    }
}