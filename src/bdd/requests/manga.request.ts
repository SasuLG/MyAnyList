import { MinimalManga, TagExternal } from '@/types/mangas.type';
import Query from '../postgre.middleware';

export async function getMangas(limit: number, page: number): Promise<MinimalManga[]> {
    const offset = (page - 1) * limit;

    try {
        const result = await Query(`
            WITH "MangaData" AS (
                SELECT
                    "m"."id",
                    "m"."anilist_id",
                    "m"."title_romaji",
                    "m"."title_english",
                    "m"."title_native",
                    "m"."cover_image",
                    "m"."synopsis",
                    "m"."status",
                    "m"."format",
                    "m"."chapters",
                    "m"."averageScore",
                    "m"."meanScore",
                    "m"."source",
                    "m"."start_date",
                    "m"."end_date",
                    "m"."popularity"
                FROM "Manga" AS "m"
                ORDER BY "m"."id" DESC
                LIMIT $1 OFFSET $2
            ),

            "Genres" AS (
                SELECT
                    "gm"."mangaId" AS "id",
                    json_agg(json_build_object('id', "ge"."id", 'name', "ge"."name")) AS "genres"
                FROM "Genre_manga" AS "gm"
                JOIN "Genre_external" AS "ge" ON "gm"."genreId" = "ge"."id"
                WHERE "gm"."mangaId" IN (SELECT "id" FROM "MangaData")
                GROUP BY "gm"."mangaId"
            ),

            "Tags" AS (
                SELECT
                    "tem"."mangaId" AS "id",
                    json_agg(json_build_object(
                        'id', "te"."id",
                        'anilist_id', "te"."anilist_id",
                        'name', "te"."name",
                        'description', "te"."description",
                        'category', "te"."category",
                        'rank', "te"."rank",
                        'isAdult', "te"."isAdult"
                    )) AS "tags"
                FROM "Tag_external_manga" AS "tem"
                JOIN "Tag_external" AS "te" ON "tem"."tagExternalId" = "te"."id"
                WHERE "tem"."mangaId" IN (SELECT "id" FROM "MangaData")
                GROUP BY "tem"."mangaId"
            ),

            "OriginCountries" AS (
                SELECT
                    "ocm"."mangaId" AS "id",
                    json_agg(json_build_object('id', "c"."id", 'name', "c"."name")) AS "origin_country"
                FROM "OriginCountry_manga" AS "ocm"
                JOIN "Country" AS "c" ON "ocm"."countryId" = "c"."id"
                WHERE "ocm"."mangaId" IN (SELECT "id" FROM "MangaData")
                GROUP BY "ocm"."mangaId"
            ),

            "Synonyms" AS (
                SELECT
                    "sm"."mangaId" AS "id",
                    json_agg(json_build_object('id', "sm"."id", 'name', "sm"."name")) AS "synonyms"
                FROM "Synonym_manga" AS "sm"
                WHERE "sm"."mangaId" IN (SELECT "id" FROM "MangaData")
                GROUP BY "sm"."mangaId"
            )

            SELECT
                "md".*,
                COALESCE("g"."genres", '[]') AS "genres",
                COALESCE("t"."tags", '[]') AS "tags",
                COALESCE("o"."origin_country", '[]') AS "origin_country",
                COALESCE("s"."synonyms", '[]') AS "synonyms"
            FROM "MangaData" AS "md"
            LEFT JOIN "Genres" AS "g" ON "md"."id" = "g"."id"
            LEFT JOIN "Tags" AS "t" ON "md"."id" = "t"."id"
            LEFT JOIN "OriginCountries" AS "o" ON "md"."id" = "o"."id"
            LEFT JOIN "Synonyms" AS "s" ON "md"."id" = "s"."id"
            ORDER BY "md"."id" DESC;
        `, [limit, offset]);

        return result.rows;
    } catch (error) {
        console.error('Erreur lors de la récupération des mangas:', error);
        throw error;
    }
}

export async function getMangasFollowed(
    limit: number,
    page: number,
    userId: string,
    waited: boolean = false
): Promise<MinimalManga[]> {
    const offset = (page - 1) * limit;
    const table = waited ? 'User_wait_manga' : 'User_manga';

    try {
        const result = await Query(`
            WITH "MangaData" AS (
                SELECT
                    "m"."id",
                    "m"."anilist_id",
                    "m"."title_romaji",
                    "m"."title_english",
                    "m"."title_native",
                    "m"."cover_image",
                    "m"."synopsis",
                    "m"."status",
                    "m"."format",
                    "m"."chapters",
                    "m"."averageScore",
                    "m"."meanScore",
                    "m"."source",
                    "m"."start_date",
                    "m"."end_date",
                    "m"."popularity",
                    "um"."date" AS "follow_date"
                FROM "Manga" AS "m"
                JOIN "${table}" AS "um" ON "m"."id" = "um"."manga_id"
                WHERE "um"."user_id" = $3
                ORDER BY "um"."date" DESC
                LIMIT $1 OFFSET $2
            ),

            "Genres" AS (
                SELECT
                    "gm"."mangaId" AS "id",
                    COALESCE(
                        json_agg(json_build_object('id', "ge"."id", 'name', "ge"."name")),
                        '[]'
                    ) AS "genres"
                FROM "Genre_manga" AS "gm"
                JOIN "Genre_external" AS "ge" ON "gm"."genreId" = "ge"."id"
                GROUP BY "gm"."mangaId"
            ),

            "Tags" AS (
                SELECT
                    "tm"."mangaId" AS "id",
                    COALESCE(
                        json_agg(json_build_object(
                            'id', "t"."id",
                            'anilist_id', "t"."anilist_id",
                            'name', "t"."name",
                            'description', "t"."description",
                            'category', "t"."category",
                            'rank', "t"."rank",
                            'isAdult', "t"."isAdult"
                        )),
                        '[]'
                    ) AS "tags"
                FROM "Tag_external_manga" AS "tm"
                JOIN "Tag_external" AS "t" ON "tm"."tagExternalId" = "t"."id"
                GROUP BY "tm"."mangaId"
            ),

            "OriginCountries" AS (
                SELECT
                    "ocm"."mangaId" AS "id",
                    COALESCE(
                        json_agg(json_build_object('id', "c"."id", 'name', "c"."name")),
                        '[]'
                    ) AS "origin_country"
                FROM "OriginCountry_manga" AS "ocm"
                JOIN "Country" AS "c" ON "ocm"."countryId" = "c"."id"
                GROUP BY "ocm"."mangaId"
            ),
            "User_note_manga" AS (
                SELECT "n"."manga_id" AS "mangaId", "n"."note" AS "note", "n"."comment" AS "comment"
                FROM "User_note_manga" AS "n"
                WHERE "n"."user_id" = $3
            ),

            "Synonyms" AS (
                SELECT
                    "sm"."mangaId" AS "id",
                    COALESCE(
                        json_agg(json_build_object('id', "sm"."id", 'name', "sm"."name")),
                        '[]'
                    ) AS "synonyms"
                FROM "Synonym_manga" AS "sm"
                GROUP BY "sm"."mangaId"
            )

            SELECT
                "md".*,
                COALESCE("g"."genres", '[]') AS "genres",
                COALESCE("t"."tags", '[]') AS "tags",
                COALESCE("o"."origin_country", '[]') AS "origin_country",
                COALESCE("un"."note", NULL) AS "note",
                COALESCE("un"."comment", NULL) AS "comment",
                COALESCE("s"."synonyms", '[]') AS "synonyms"
            FROM "MangaData" AS "md"
            LEFT JOIN "Genres" AS "g" ON "md"."id" = "g"."id"
            LEFT JOIN "Tags" AS "t" ON "md"."id" = "t"."id"
            LEFT JOIN "OriginCountries" AS "o" ON "md"."id" = "o"."id"
            LEFT JOIN "User_note_manga" AS "un" ON "md"."id" = "un"."mangaId"
            LEFT JOIN "Synonyms" AS "s" ON "md"."id" = "s"."id"
            ORDER BY "md"."follow_date" DESC
        `, [limit, offset, userId]);

        return result.rows;
    } catch (error) {
        console.error('Erreur lors de la récupération des mangas suivis:', error);
        throw error;
    }
}

export async function getRecommendedMangas(userId: string, limit: number, page: number): Promise<{ id: number; total_score: number }[]> {
    const offset = (page - 1) * limit;

    try {
        const result = await Query(`
            WITH "UserGenres" AS (
                SELECT
                    "g"."name" AS "genre_name",
                    COUNT(*) AS "genre_count"
                FROM "User_manga" AS "ug"
                JOIN "Manga" AS "m" ON "ug"."manga_id" = "m"."id"
                LEFT JOIN "Genre_manga" AS "gm" ON "m"."id" = "gm"."mangaId"
                LEFT JOIN "Genre_external" AS "g" ON "gm"."genreId" = "g"."id"
                WHERE "ug"."user_id" = $1
                GROUP BY "g"."name"
            ),
            "UserCountries" AS (
                SELECT
                    "c"."iso_3166_1" AS "country_iso",
                    COUNT(*) AS "country_count"
                FROM "User_manga" AS "uc"
                JOIN "Manga" AS "m" ON "uc"."manga_id" = "m"."id"
                LEFT JOIN "OriginCountry_manga" AS "ocm" ON "m"."id" = "ocm"."mangaId"
                LEFT JOIN "Country" AS "c" ON "ocm"."countryId" = "c"."id"
                WHERE "uc"."user_id" = $1
                GROUP BY "c"."iso_3166_1"
            ),
            "UserTags" AS (
                SELECT
                    "te"."name" AS "tag_name",
                    COUNT(*) AS "tag_count"
                FROM "User_manga" AS "ut"
                JOIN "Manga" AS "m" ON "ut"."manga_id" = "m"."id"
                LEFT JOIN "Tag_external_manga" AS "tem" ON "m"."id" = "tem"."mangaId"
                LEFT JOIN "Tag_external" AS "te" ON "tem"."tagExternalId" = "te"."id"
                WHERE "ut"."user_id" = $1
                GROUP BY "te"."name"
            ),
            "MangaScores" AS (
                SELECT
                    "m"."id" AS "id",
                    COALESCE(
                        (
                            SELECT COUNT(*)
                            FROM "User_manga" AS "um"
                            JOIN "Manga" AS "m_user" ON "um"."manga_id" = "m_user"."id"
                            WHERE "m_user"."format" = "m"."format"
                            AND "um"."user_id" = $1
                        ), 0 ) * 6 AS "format_score",
                    COALESCE(
                        (
                            SELECT SUM("ug"."genre_count")
                            FROM "UserGenres" AS "ug"
                            WHERE "ug"."genre_name" IN (
                                SELECT "g"."name"
                                FROM "Genre_manga" AS "gm"
                                JOIN "Genre_external" AS "g" ON "gm"."genreId" = "g"."id"
                                WHERE "gm"."mangaId" = "m"."id"
                            )
                        ) , 0 ) AS "genre_score",
                    COALESCE(
                        (
                            SELECT SUM("uc"."country_count")
                            FROM "UserCountries" AS "uc"
                            WHERE "uc"."country_iso" IN (
                                SELECT "c"."iso_3166_1"
                                FROM "OriginCountry_manga" AS "ocm"
                                JOIN "Country" AS "c" ON "ocm"."countryId" = "c"."id"
                                WHERE "ocm"."mangaId" = "m"."id"
                            )
                        ) , 0 ) AS "country_score",
                    COALESCE(
                        (
                            SELECT SUM("ut"."tag_count")
                            FROM "UserTags" AS "ut"
                            WHERE "ut"."tag_name" IN (
                                SELECT "te"."name"
                                FROM "Tag_external_manga" AS "tem"
                                JOIN "Tag_external" AS "te" ON "tem"."tagExternalId" = "te"."id"
                                WHERE "tem"."mangaId" = "m"."id"
                            )
                        ) , 0 ) AS "tag_score"
                FROM "Manga" AS "m"
            )
            SELECT
                "m"."id",
                COALESCE(
                    (
                        "m"."format_score" +
                        "m"."genre_score" +
                        "m"."country_score" +
                        "m"."tag_score"
                    ) / 6.0, 0
                ) AS "total_score"
            FROM "MangaScores" AS "m"
            WHERE "m"."id" NOT IN (
                SELECT "manga_id" FROM "User_manga" WHERE "user_id" = $1
            )
            ORDER BY "total_score" DESC
            LIMIT $2 OFFSET $3;
        `, [userId, limit, offset])
        return result.rows;
    } catch (error) {
        console.error('Erreur lors de la récupération des mangas recommandés:', error);
        throw error;
    }
}

export async function getMangasByIds(ids: string[]):Promise<MinimalManga[]> {
    if (!ids.length) return [];

    try {
        
        // Créez des placeholders pour les IDs
        const idsPlaceholder = ids.map((_, index) => `$${index + 1}`).join(', ');

        const result = await Query(`
            WITH "MangaData" AS (
                SELECT
                    "m"."id",
                    "m"."anilist_id",
                    "m"."title_romaji",
                    "m"."title_english",
                    "m"."title_native",
                    "m"."cover_image",
                    "m"."synopsis",
                    "m"."status",
                    "m"."format",
                    "m"."chapters",
                    "m"."averageScore",
                    "m"."meanScore",
                    "m"."source",
                    "m"."start_date",
                    "m"."end_date",
                    "m"."popularity"
                FROM "Manga" AS "m"
                WHERE "m"."id" IN (${idsPlaceholder})
            ),

            "Genres" AS (
                SELECT
                    "gm"."mangaId" AS "id",
                    json_agg(json_build_object('id', "ge"."id", 'name', "ge"."name")) AS "genres"
                FROM "Genre_manga" AS "gm"
                JOIN "Genre_external" AS "ge" ON "gm"."genreId" = "ge"."id"
                WHERE "gm"."mangaId" IN (SELECT "id" FROM "MangaData")
                GROUP BY "gm"."mangaId"
            ),

            "Tags" AS (
                SELECT
                    "tem"."mangaId" AS "id",
                    json_agg(json_build_object(
                        'id', "te"."id",
                        'anilist_id', "te"."anilist_id",
                        'name', "te"."name",
                        'description', "te"."description",
                        'category', "te"."category",
                        'rank', "te"."rank",
                        'isAdult', "te"."isAdult"
                    )) AS "tags"
                FROM "Tag_external_manga" AS "tem"
                JOIN "Tag_external" AS "te" ON "tem"."tagExternalId" = "te"."id"
                WHERE "tem"."mangaId" IN (SELECT "id" FROM "MangaData")
                GROUP BY "tem"."mangaId"
            ),

            "OriginCountries" AS (
                SELECT
                    "ocm"."mangaId" AS "id",
                    json_agg(json_build_object('id', "c"."id", 'name', "c"."name")) AS "origin_country"
                FROM "OriginCountry_manga" AS "ocm"
                JOIN "Country" AS "c" ON "ocm"."countryId" = "c"."id"
                WHERE "ocm"."mangaId" IN (SELECT "id" FROM "MangaData")
                GROUP BY "ocm"."mangaId"
            ),

            "Synonyms" AS (
                SELECT
                    "sm"."mangaId" AS "id",
                    json_agg(json_build_object('id', "sm"."id", 'name', "sm"."name")) AS "synonyms"
                FROM "Synonym_manga" AS "sm"
                WHERE "sm"."mangaId" IN (SELECT "id" FROM "MangaData")
                GROUP BY "sm"."mangaId"
            )

            SELECT
                "md".*,
                COALESCE("g"."genres", '[]') AS "genres",
                COALESCE("t"."tags", '[]') AS "tags",
                COALESCE("o"."origin_country", '[]') AS "origin_country",
                COALESCE("s"."synonyms", '[]') AS "synonyms"
            FROM "MangaData" AS "md"
            LEFT JOIN "Genres" AS "g" ON "md"."id" = "g"."id"
            LEFT JOIN "Tags" AS "t" ON "md"."id" = "t"."id"
            LEFT JOIN "OriginCountries" AS "o" ON "md"."id" = "o"."id"
            LEFT JOIN "Synonyms" AS "s" ON "md"."id" = "s"."id"
            ORDER BY ARRAY_POSITION(ARRAY[${idsPlaceholder}], "md"."id")
        `, ids);
        return result.rows;
    } catch (error) {
        console.error('Erreur lors de la récupération des mangas par IDs:', error);
        throw error;
    }
}

export async function getMangaDetailsById(mangaId: string): Promise<MinimalManga | null> {
    const mangas = await getMangasByIds([mangaId]);
    return mangas[0] ?? null;
}

export async function getUserMangaDetails(mangaId: string, userId: string): Promise<{ note: number | null, follow_date: string | null, comment: string | null, is_waited: boolean } | null> {
    try {
        const result = await Query(`
            SELECT
                um."date" AS "follow_date",
                un."note" AS "note",
                un."comment" AS "comment",
                EXISTS(
                    SELECT 1
                    FROM "User_wait_manga" uw
                    WHERE uw."user_id" = um."user_id" AND uw."manga_id" = um."manga_id"
                ) AS "is_waited"
            FROM "User_manga" um
            LEFT JOIN "User_note_manga" un ON um."manga_id" = un."manga_id" AND um."user_id" = un."user_id"
            WHERE um."user_id" = $1 AND um."manga_id" = $2
            LIMIT 1
        `, [userId, mangaId]);

        if (result.rows.length === 0) {
            return null;
        }

        return {
            note: result.rows[0].note,
            follow_date: result.rows[0].follow_date,
            comment: result.rows[0].comment,
            is_waited: result.rows[0].is_waited,
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du manga utilisateur:', error);
        throw error;
    }
}

export async function getPopularMangas(limit: number, page: number): Promise<MinimalManga[]> {
    const offset = (page - 1) * limit;

    try {
        const result = await Query(`
            WITH "MangaData" AS (
                SELECT
                    "m"."id",
                    "m"."anilist_id",
                    "m"."title_romaji",
                    "m"."title_english",
                    "m"."title_native",
                    "m"."cover_image",
                    "m"."synopsis",
                    "m"."status",
                    "m"."format",
                    "m"."chapters",
                    "m"."averageScore",
                    "m"."meanScore",
                    "m"."source",
                    "m"."start_date",
                    "m"."end_date",
                    "m"."popularity"
                FROM "Manga" AS "m"
                ORDER BY "m"."popularity" DESC
                LIMIT $1 OFFSET $2
            ),

            "Genres" AS (
                SELECT
                    "gm"."mangaId" AS "id",
                    json_agg(json_build_object('id', "ge"."id", 'name', "ge"."name")) AS "genres"
                FROM "Genre_manga" AS "gm"
                JOIN "Genre_external" AS "ge" ON "gm"."genreId" = "ge"."id"
                WHERE "gm"."mangaId" IN (SELECT "id" FROM "MangaData")
                GROUP BY "gm"."mangaId"
            ),

            "Tags" AS (
                SELECT
                    "tem"."mangaId" AS "id",
                    json_agg(json_build_object(
                        'id', "te"."id",
                        'anilist_id', "te"."anilist_id",
                        'name', "te"."name",
                        'description', "te"."description",
                        'category', "te"."category",
                        'rank', "te"."rank",
                        'isAdult', "te"."isAdult"
                    )) AS "tags"
                FROM "Tag_external_manga" AS "tem"
                JOIN "Tag_external" AS "te" ON "tem"."tagExternalId" = "te"."id"
                WHERE "tem"."mangaId" IN (SELECT "id" FROM "MangaData")
                GROUP BY "tem"."mangaId"
            ),

            "OriginCountries" AS (
                SELECT
                    "ocm"."mangaId" AS "id",
                    json_agg(json_build_object('id', "c"."id", 'name', "c"."name")) AS "origin_country"
                FROM "OriginCountry_manga" AS "ocm"
                JOIN "Country" AS "c" ON "ocm"."countryId" = "c"."id"
                WHERE "ocm"."mangaId" IN (SELECT "id" FROM "MangaData")
                GROUP BY "ocm"."mangaId"
            ),

            "Synonyms" AS (
                SELECT
                    "sm"."mangaId" AS "id",
                    json_agg(json_build_object('id', "sm"."id", 'name', "sm"."name")) AS "synonyms"
                FROM "Synonym_manga" AS "sm"
                WHERE "sm"."mangaId" IN (SELECT "id" FROM "MangaData")
                GROUP BY "sm"."mangaId"
            )

            SELECT
                "md".*,
                COALESCE("g"."genres", '[]') AS "genres",
                COALESCE("t"."tags", '[]') AS "tags",
                COALESCE("o"."origin_country", '[]') AS "origin_country",
                COALESCE("s"."synonyms", '[]') AS "synonyms"
            FROM "MangaData" AS "md"
            LEFT JOIN "Genres" AS "g" ON "md"."id" = "g"."id"
            LEFT JOIN "Tags" AS "t" ON "md"."id" = "t"."id"
            LEFT JOIN "OriginCountries" AS "o" ON "md"."id" = "o"."id"
            LEFT JOIN "Synonyms" AS "s" ON "md"."id" = "s"."id"
            ORDER BY "md"."popularity" DESC;
        `, [limit, offset]);

        return result.rows;
    } catch (error) {
        console.error('Erreur lors de la récupération des mangas populaires:', error);
        throw error;
    }
}

export async function getMangasIdFollowed(userId: string): Promise<string[]> {
    try {
        return (await Query(`
            SELECT
                "m"."id"
            FROM "Manga" AS "m"
            JOIN "User_manga" AS "us" ON "m"."id" = "us"."manga_id"
            WHERE "us"."user_id" = $1
        `, [userId])).rows.map((row) => row.id);
    } catch (error) {
        console.error('Erreur lors de la récupération des mangas suivis:', error);
        throw error;
    }
}

export async function getMangasIdWaited(userId: string): Promise<string[]> {
    try {
        return (await Query(`
            SELECT
                "m"."id"
            FROM "Manga" AS "m"
            JOIN "User_wait_manga" AS "us" ON "m"."id" = "us"."manga_id"
            WHERE "us"."user_id" = $1
        `, [userId])).rows.map((row) => row.id);
    } catch (error) {
        console.error('Erreur lors de la récupération des mangas en waitlist:', error);
        throw error;
    }
}

export async function addVote(userId: string, mangaId: string, note: number, comment?:number): Promise<boolean> {
    try {
        await Query(`
            INSERT INTO "User_note_manga" ("user_id", "manga_id", "note", "comment")
            VALUES ($1, $2, $3, $4)
        `, [userId, mangaId, note, comment]);

        return true;
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la note:', error);
        return false;
    }
}

export async function updateVote(userId: string, mangaId: string, note: number, comment?:number): Promise<boolean> {
    try {
        await Query(`
            UPDATE "User_note_manga"
            SET "note" = $3, "comment" = $4
            WHERE "user_id" = $1 AND "manga_id" = $2
        `, [userId, mangaId, note, comment]);

        return true;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la note:', error);
        return false;
    }
}

export async function followManga(userId: string, mangaId: string): Promise<boolean> {
    try {
        await Query(`
            INSERT INTO "User_manga" ("user_id", "manga_id")
            VALUES ($1, $2)
        `, [userId, mangaId]);

        return true;
    } catch (error) {
        console.error('Erreur lors du suivi du manga:', error);
        return false;
    }
}

export async function unFollowManga(userId: string, mangaId: string): Promise<boolean> {
    try {
        await Query(`
            DELETE FROM "User_manga"
            WHERE "user_id" = $1 AND "manga_id" = $2
        `, [userId, mangaId]);

        return true;
    } catch (error) {
        console.error('Erreur lors du désabonnement du manga:', error);
        return false;
    }
}

export async function addWaitManga(userId: string, mangaId: string): Promise<boolean> {
    try {
        await Query(`
            INSERT INTO "User_wait_manga" ("user_id", "manga_id")
            VALUES ($1, $2)
        `, [userId, mangaId]);

        return true;
    } catch (error) {
        console.error('Erreur lors de l\'ajout du manga en waitlist:', error);
        return false;
    }
}

export async function removeWaitManga(userId: string, mangaId: string): Promise<boolean> {
    try {
        await Query(`
            DELETE FROM "User_wait_manga"
            WHERE "user_id" = $1 AND "manga_id" = $2
        `, [userId, mangaId]);

        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression du manga en waitlist:', error);
        return false;
    }
}

export async function updateDateFollowManga(userId: string, mangaId: string, date: Date): Promise<boolean> {
    try {
        await Query(`
            UPDATE "User_manga"
            SET "date" = $3
            WHERE "user_id" = $1 AND "manga_id" = $2
        `, [userId, mangaId, date]);

        return true;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la date de suivi du manga:', error);
        return false;
    }
}

export async function getImageManga(userId: string, isWaitList: boolean): Promise<string[]> {
    try {
        const table = isWaitList ? 'User_wait_manga' : 'User_manga';
        const result = await Query(`
            SELECT
                "m"."cover_image" AS "poster_path"
            FROM "Manga" AS "m"
            JOIN "${table}" AS "us" ON "m"."id" = "us"."manga_id"
            WHERE "us"."user_id" = $1
        `, [userId]);

        return result.rows.map(row => row.poster_path);
    } catch (error) {
        console.error('Erreur lors de la récupération des images des mangas suivis:', error);
        throw error;
    }
}

export async function getAllGenresNames(): Promise<string[]> {
    try {
        const result = await Query(`
            SELECT "name"
            FROM "Genre_external"
            ORDER BY "name"
        `);

        return result.rows.map((row) => row.name);
    } catch (error) {
        console.error('Erreur lors de la récupération des genres:', error);
        throw error;
    }
}

export async function getAllTags(): Promise<TagExternal[]> {
    try {
        const result = await Query(`
            SELECT "id", "name", "anilist_id", "description", "category", "rank", "isAdult"
            FROM "Tag_external"
            ORDER BY "name"
        `);

        return result.rows as TagExternal[];
    } catch (error) {
        console.error('Erreur lors de la récupération des tags:', error);
        throw error;
    }
}

export async function isMangaExists(id:number) {
    const result = await Query(`SELECT EXISTS(SELECT 1 FROM "Manga" WHERE "id" = $1)`, [id]);
    return result.rows[0].exists;
}