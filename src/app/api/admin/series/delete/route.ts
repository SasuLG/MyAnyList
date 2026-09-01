import { deleteSerie } from "@/bdd/requests/admin-series.request";
import { ServerError } from "@/lib/api/response/server.response";

export async function POST(req: Request, context: any): Promise<Response> {
    try {
        const serieId = await req.json();
        await deleteSerie(serieId);
        return new Response(JSON.stringify({ message: 'Série supprimée avec succès', valid: true }), {
            headers: {
                'Content-Type': 'application/json'
            },
            status: 200
        });

    } catch (err) {
        return ServerError('POST : /api/amdin/series/delete', err);
    }
}
