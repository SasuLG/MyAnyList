// pages/api/images/[...imageUrl].ts
import fetch from 'node-fetch';

export async function GET(req: Request, context: any): Promise<Response> {
    try {
        const { params } = context;
        const imageUrl = decodeURIComponent(params.imageUrl);
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return new Response(JSON.stringify({ message: 'Image not found' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 404,
            });
        }

        const buffer = await response.buffer();
        const base64 = buffer.toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/jpeg';

        return new Response(JSON.stringify({ image: `data:${mimeType};base64,${base64}` }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (err) {
        return new Response(JSON.stringify({ message: 'Error fetching image', error: err }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
}
