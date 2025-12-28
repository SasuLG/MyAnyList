import Query from '../postgre.middleware';
import { Manga } from '@/anilist/type/mangas.type';

/**
 * Fonction qui permet d'ajouter un manga à la base de données.
 * @param {Manga} mangaData - Les données du manga à importer.
 */
export async function importManga(mangaData: Manga) {
    const {
        anilist_id, title_romaji, title_native, title_english, synopsis, cover_image, banner_image, format, status,
        isAdult, chapters, volumes, averageScore, meanScore, popularity, source, start_date, end_date, last_modified, 
        synonyms, origin_country, genres, tags, stats
    } = mangaData;

    try {
        // Insertion ou mise à jour du manga
        const { rows: mangaRows } = await Query(`
            INSERT INTO "Manga" ("anilist_id", "title_romaji", "title_native", "title_english", "synopsis", "cover_image", "banner_image", "format", "status", "isAdult", "chapters", "volumes", "averageScore", "meanScore", "popularity", "source", "start_date", "end_date", "last_modified")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            ON CONFLICT ("anilist_id") DO UPDATE
            SET "title_romaji" = EXCLUDED."title_romaji",
                "title_native" = EXCLUDED."title_native",
                "title_english" = EXCLUDED."title_english",
                "synopsis" = EXCLUDED."synopsis",
                "cover_image" = EXCLUDED."cover_image",
                "banner_image" = EXCLUDED."banner_image",
                "format" = EXCLUDED."format",
                "status" = EXCLUDED."status",
                "chapters" = EXCLUDED."chapters",
                "volumes" = EXCLUDED."volumes",
                "averageScore" = EXCLUDED."averageScore",
                "meanScore" = EXCLUDED."meanScore",
                "popularity" = EXCLUDED."popularity",
                "source" = EXCLUDED."source",
                "start_date" = EXCLUDED."start_date",
                "end_date" = EXCLUDED."end_date",
                "last_modified" = EXCLUDED."last_modified"
            RETURNING "id"
        `, [anilist_id, title_romaji, title_native, title_english,  synopsis, cover_image, banner_image, format, status, isAdult, chapters, volumes, averageScore, meanScore, popularity, source, start_date, end_date, last_modified]);

        if (mangaRows.length === 0) {
            throw new Error('Impossible de récupérer l\'ID du manga après l\'insertion.');
        }

        const mangaId = mangaRows[0].id;

        // Gestion des genres
        for (const genre of genres) {
            const { rows: genreRows } = await Query(`
                INSERT INTO "Genre_external" ("name")
                VALUES ($1)
                ON CONFLICT ("name") DO NOTHING
                RETURNING "id"
            `, [genre.name]);

            let genreId = genreRows.length > 0 ? genreRows[0].id : null;
            if (!genreId) {
                const { rows: existingGenreRows } = await Query(`
                    SELECT "id" FROM "Genre_external" WHERE "name" = $1
                `, [genre.name]);

                if (existingGenreRows.length === 0) {
                    throw new Error(`Genre non trouvé pour le nom: ${genre.name}`);
                }
                genreId = existingGenreRows[0].id;
            }
            await Query(`
                INSERT INTO "Genre_manga" ("mangaId", "genreId")
                VALUES ($1, $2)
                ON CONFLICT ("mangaId", "genreId") DO NOTHING
            `, [mangaId, genreId]);
        }

        // Gestion des pays d'origine
        const countries = Array.isArray(origin_country) ? origin_country : (origin_country ? [origin_country] : []);
        // Normalize origin_country values to an array of ISO strings for safe includes checks
        const originCountryIsos: string[] = Array.isArray(origin_country)
            ? origin_country.map(c => typeof c === 'string' ? c : (c && (c as any).iso_3166_1)).filter(Boolean)
            : (origin_country ? [typeof origin_country === 'string' ? origin_country : (origin_country as any).iso_3166_1].filter(Boolean) : []);

        for (const country of countries) {
            const iso = typeof country === 'string' ? country : (country?.iso_3166_1);
            if (!iso) continue;
            
            const { rows: countryRows } = await Query(`
                INSERT INTO "Country" ("name", "iso_3166_1")
                VALUES ($1, $2)
                ON CONFLICT ("iso_3166_1") DO NOTHING
                RETURNING "id"
            `, ["", iso]);


            let countryId = countryRows.length > 0 ? countryRows[0].id : null;
            if (!countryId) {
                const { rows: existingCountryRows } = await Query(`
                    SELECT "id" FROM "Country" WHERE "iso_3166_1" = $1
                `, [iso]);

                if (existingCountryRows.length === 0) {
                    throw new Error(`Pays non trouvé pour iso_3166_1: ${iso}`);
                }
                countryId = existingCountryRows[0].id;
            }

            if (originCountryIsos.includes(iso)) {
                await Query(`
                    INSERT INTO "OriginCountry_manga" ("mangaId", "countryId")
                    VALUES ($1, $2)
                    ON CONFLICT ("mangaId", "countryId") DO NOTHING
                `, [mangaId, countryId]);
            }
        }

        // Gestion des tags
        for (const tag of tags) {
            const { rows: tagRows } = await Query(`
                INSERT INTO "Tag_external" ("anilist_id", "name", "description", "category", "rank", "isAdult")
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT ("anilist_id") DO NOTHING
                RETURNING "id"
            `, [tag.anilist_id, tag.name, tag.description, tag.category, tag.rank, tag.isAdult]);

            let tagId = tagRows.length > 0 ? tagRows[0].id : null;
            if (!tagId) {
                const { rows: existingTagRows } = await Query(`
                    SELECT "id" FROM "Tag_external" WHERE "name" = $1
                `, [tag.name]);

                if (existingTagRows.length === 0) {
                    throw new Error(`Tag non trouvé pour le nom: ${tag.name}`);
                }
                tagId = existingTagRows[0].id;
            }

            await Query(`
                INSERT INTO "Tag_external_manga" ("mangaId", "tagExternalId")
                VALUES ($1, $2)
                ON CONFLICT ("mangaId", "tagExternalId") DO NOTHING
            `, [mangaId, tagId]);
        }

        // Gestion des statistiques
        if (stats && stats.scoreDistribution) {
            await Query(`
                INSERT INTO "Manga_stats" ("mangaId", "scoreDistribution")
                VALUES ($1, $2)
                ON CONFLICT ("mangaId") DO UPDATE
                    SET "scoreDistribution" = EXCLUDED."scoreDistribution"
            `, [mangaId, JSON.stringify(stats.scoreDistribution)]);
        }

        // Gestion des synonymes
        for (const synonym of synonyms) {
            await Query(`
                INSERT INTO "Synonym_manga" ("mangaId", "name")
                VALUES ($1, $2)
                ON CONFLICT ("mangaId", "name") DO NOTHING
            `, [mangaId, synonym.name]);
        }
        
    } catch (error) {
        console.error('Erreur lors de l\'importation de la série:', error);
        throw error;
    }
}

export async function deleteManga(anilistId: string) {
    try {
        //Suppresion des associations dans la table User_manga
        await Query(`
            DELETE FROM "User_manga" WHERE "manga_id" = $1
        `, [anilistId]);

        //Suppresion des associations dans la table Genre_manga
        await Query(`
            DELETE FROM "Genre_manga" WHERE "mangaId" = (SELECT "id" FROM "Manga" WHERE "anilist_id" = $1)
        `, [anilistId]);
        
        //Suppresion des associations dans la table Tag_manga
        await Query(`
            DELETE FROM "Tag_manga" WHERE "mangaId" = (SELECT "id" FROM "Manga" WHERE "anilist_id" = $1)
        `, [anilistId]);

        //Suppresion des associations dans la table OriginCountry_manga
        await Query(`
            DELETE FROM "OriginCountry_manga" WHERE "mangaId" = (SELECT "id" FROM "Manga" WHERE "anilist_id" = $1)
        `, [anilistId]);

        //Suppresion des statistiques dans la table Manga_stats
        await Query(`
            DELETE FROM "Manga_stats" WHERE "mangaId" = (SELECT "id" FROM "Manga" WHERE "anilist_id" = $1)
        `, [anilistId]);

        //Suppresion des synonymes dans la table Synonym_manga
        await Query(`
            DELETE FROM "Synonym_manga" WHERE "mangaId" = (SELECT "id" FROM "Manga" WHERE "anilist_id" = $1)
        `, [anilistId]);

        //Suppresion du manga dans la table Manga
        await Query(`
            DELETE FROM "Manga" WHERE "anilist_id" = $1
        `, [anilistId]);
    } catch (error) {
        console.error('Erreur lors de la suppression du manga :', error);
        throw error;
    }
}


/**
 * Récupère les identifiants TMDB des séries.
 * @returns Les identifiants TMDB des mangas.
 */
export async function getTmdbIdsMangas() {
    const bddResponse = await Query(`select anilist_id from "Manga"`);
    return bddResponse.rows as string[];
}