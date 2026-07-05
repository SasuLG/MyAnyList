import { getUserMangaDetails } from '@/bdd/requests/manga.request';
import { ServerError } from '@/lib/api/response/server.response';

export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const { id, userid } = await context.params;
        const decodedId = decodeURIComponent(id);
        const decodedUserId = decodeURIComponent(userid);
        const data = await getUserMangaDetails(decodedId, decodedUserId);

        if (!data) {
            return new Response(JSON.stringify({ message: 'User manga details not found' }), {
                headers: {
                    'Content-Type': 'application/json'
                },
                status: 404
            });
        }

        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });
    } catch (err) {
        return ServerError('GET : /api/mangas/[id]/user/[userid]', err);
    }
}
