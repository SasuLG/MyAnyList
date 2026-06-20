import { MinimalManga } from '@/types/mangas.type';
import Query from '../postgre.middleware';

export async function getRecommendedMangas(userId: string, limit: number, page: number): Promise<{ id: number; total_score: number }[]> {
    const offset = (page - 1) * limit;

    try {
        const result = await Query(`
            WITH "UerGenres" AS (
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
                            FROM "UerGenres" AS "ug"
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


export async function getMangaById(id:string) {
    const result = await Query(`SELECT * FROM "Manga" WHERE "anilist_id" = $1`, [id]);
    return result.rows[0];
}
