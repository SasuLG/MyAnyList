import { getAllGenres, getIdTmdbIdAndMedia } from "@/bdd/requests/series.request";
import { sendSeriesUpdateEmail } from "@/lib/mail";
import { updateSerieFromTmdb } from "@/lib/updateSerieFromTmdb";

export async function POST(req: Request) {
    try {
        const rows = await getIdTmdbIdAndMedia();
        const modifiedSeries: any[] = [];
        const existingGenresData = await getAllGenres();
        const existingGenresMap = new Map<string, any>();
        existingGenresData.forEach((genre: any) => {
            existingGenresMap.set(genre.name.toLowerCase(), genre);
        });
        // let i = 0;
        for (const serie of rows) {
            const modified = await updateSerieFromTmdb(serie.id, serie.tmdb_id, serie.media, existingGenresMap);
            if (modified) {
                modifiedSeries.push(modified);
            }
            // if(i % 100 === 0) {
            //     console.log(`Progress: ${i}/${rows.length}`);
            // }
            // i++;
        }
        if (!process.env.EMAIL_UPDATE) {
            throw new Error("EMAIL_UPDATE environment variable is not defined");
        }
        await sendSeriesUpdateEmail(process.env.EMAIL_UPDATE, modifiedSeries);

        return new Response(JSON.stringify({ 
            message: "Mise à jour terminée",
            modified: modifiedSeries
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Erreur mise à jour" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
