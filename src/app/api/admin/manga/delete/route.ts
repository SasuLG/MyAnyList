import { deleteManga } from "@/bdd/requests/admin-manga.request";
import { ServerError } from "@/lib/api/response/server.response";

export async function POST(req: Request, context: any): Promise<Response> {
    try {
        const mangaId = await req.json();
        await deleteManga(mangaId);
        return new Response(JSON.stringify({ message: 'Manga supprimé avec succès', valid: true }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });

    } catch (err) {
        return ServerError('POST : /api/admin/manga/delete', err);
    }
}
