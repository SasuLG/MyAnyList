import { getMangaDetailsById } from '@/bdd/requests/manga.request';
import { ServerError } from '@/lib/api/response/server.response';

export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const { id } = await context.params;
        const decodedId = decodeURIComponent(id);
        const data = await getMangaDetailsById(decodedId);

        if (!data) {
            return new Response(JSON.stringify({ message: 'Manga not found' }), {
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
        return ServerError('GET : /api/mangas/[id]', err);
    }
}
