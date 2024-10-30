import fetch from 'node-fetch';

/**
 * Route : /api/images
 * METHOD : POST
 * 
 * Route de l'api pour récupérer des images en base64.
 * 
 * @returns {Response} La réponse de la requête.
 */
export async function POST(req: Request): Promise<Response> {
    try {
        const { imageUrls } = await req.json();

        if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
            return new Response(JSON.stringify({ message: 'No images provided' }), {
                headers: { 'Content-Type': 'application/json' },
                status: 204,
            });
        }

        const imagePromises = imageUrls.map(async (imageUrl: string) => {
            try {
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    return { imageUrl, error: 'Image not found' };
                }
                const buffer = await response.buffer();
                const base64 = buffer.toString('base64');
                const mimeType = response.headers.get('content-type') || 'image/jpeg';

                return { imageUrl, image: `data:${mimeType};base64,${base64}` };
            } catch (err) {
                return { imageUrl, error: 'Error fetching image' };
            }
        });

        const images = await Promise.all(imagePromises);

        return new Response(JSON.stringify(images), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (err) {
        return new Response(JSON.stringify({ message: 'Error processing images', error: err }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
}
