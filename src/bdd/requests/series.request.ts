import { MinimalSerie, Serie, TmdbId } from '@/tmdb/types/series.type';
import Query from '../postgre.middleware';

export async function getSerie(tmdb_id: number): Promise<Serie> {
    try {
        const result = await Query(`
            WITH "SerieData" AS (
                SELECT
                    "s"."id" AS "id",
                    "s"."tmdb_id" AS "tmdb_id",
                    "s"."title" AS "name",
                    "s"."overview" AS "overview",
                    "s"."poster" AS "poster_path",
                    "s"."backdrop" AS "backdrop_path",
                    "s"."media" AS "media_type",
                    "s"."original_name" AS "original_name",
                    "s"."status" AS "status",
                    "s"."first_air_date" AS "first_air_date",
                    "s"."last_air_date" AS "last_air_date",
                    "s"."episode_run_time" AS "episode_run_time",
                    "s"."nb_seasons" AS "number_of_seasons",
                    "s"."nb_episodes" AS "number_of_episodes",
                    "s"."vote_average" AS "vote_average",
                    "s"."vote_count" AS "vote_count",
                    "s"."popularity" AS "popularity",
                    "s"."budget" AS "budget",
                    "s"."revenue" AS "revenue"
                FROM "Serie" AS "s"
                WHERE "s"."tmdb_id" = $1
            ),
            "Genres" AS (
                SELECT "g"."name"
                FROM "Genre_serie" AS "gs"
                JOIN "Genre" AS "g" ON "gs"."genreId" = "g"."id"
                WHERE "gs"."serieId" = (SELECT "id" FROM "SerieData")
            ),
            "Languages" AS (
                SELECT "l"."iso_639_1", "l"."name", "l"."english_name"
                FROM "Language_serie" AS "ls"
                JOIN "Language" AS "l" ON "ls"."languageId" = "l"."id"
                WHERE "ls"."serieId" = (SELECT "id" FROM "SerieData")
            ),
            "ProductionCountries" AS (
                SELECT "c"."name", "c"."iso_3166_1"
                FROM "ProductionCountry_serie" AS "pcs"
                JOIN "Country" AS "c" ON "pcs"."countryId" = "c"."id"
                WHERE "pcs"."serieId" = (SELECT "id" FROM "SerieData")
            ),
            "OriginCountries" AS (
                SELECT "c"."iso_3166_1"
                FROM "OriginCountry_serie" AS "ocs"
                JOIN "Country" AS "c" ON "ocs"."countryId" = "c"."id"
                WHERE "ocs"."serieId" = (SELECT "id" FROM "SerieData")
            ),
            "ProductionCompanies" AS (
                SELECT "pc"."tmdb_id", "pc"."name"
                FROM "ProductionCompany_serie" AS "pcs"
                JOIN "ProductionCompany" AS "pc" ON "pcs"."productionCompanyId" = "pc"."id"
                WHERE "pcs"."serieId" = (SELECT "id" FROM "SerieData")
            ),
            "Seasons" AS (
                SELECT "s"."id" AS "id", "s"."tmdb_id" AS "tmdb_id", "s"."number" AS "season_number", "s"."overview", "s"."poster_path", "s"."air_date", "s"."vote_average", "s"."total_time", "s"."name"
                FROM "Season" AS "s"
                WHERE "s"."serie_id" = (SELECT "id" FROM "SerieData")
            ),
            "Episodes" AS (
                SELECT "e"."tmdb_id" AS "id", "e"."season_id", "e"."number" AS "episode_number", "e"."overview", "e"."name", "e"."runtime", "e"."still_path"
                FROM "Episode" AS "e"
                WHERE "e"."season_id" IN (SELECT "id" FROM "Seasons")
            )
            SELECT
                "SerieData".*,
                ARRAY_AGG(DISTINCT "Genres"."name") AS "genres",
                ARRAY_AGG(DISTINCT JSON_BUILD_OBJECT('iso_639_1', "Languages"."iso_639_1", 'name', "Languages"."name", 'english_name', "Languages"."english_name")) AS "spoken_languages",
                ARRAY_AGG(DISTINCT JSON_BUILD_OBJECT('name', "ProductionCountries"."name", 'iso_3166_1', "ProductionCountries"."iso_3166_1")) AS "production_countries",
                ARRAY_AGG(DISTINCT JSON_BUILD_OBJECT('tmdb_id', "ProductionCompanies"."tmdb_id", 'name', "ProductionCompanies"."name")) AS "production_companies",
                JSON_AGG(DISTINCT JSON_BUILD_OBJECT('id', "Seasons"."id", 'season_number', "Seasons"."season_number", 'overview', "Seasons"."overview", 'poster_path', "Seasons"."poster_path", 'air_date', "Seasons"."air_date", 'vote_average', "Seasons"."vote_average", 'total_time', "Seasons"."total_time", 'name', "Seasons"."name", 'episodes', JSON_AGG(DISTINCT JSON_BUILD_OBJECT('id', "Episodes"."id", 'episode_number', "Episodes"."episode_number", 'overview', "Episodes"."overview", 'name', "Episodes"."name", 'runtime', "Episodes"."runtime", 'still_path', "Episodes"."still_path")))) AS "seasons"
            FROM "SerieData"
            LEFT JOIN "Genres" ON TRUE
            LEFT JOIN "Languages" ON TRUE
            LEFT JOIN "ProductionCountries" ON TRUE
            LEFT JOIN "OriginCountries" ON TRUE
            LEFT JOIN "ProductionCompanies" ON TRUE
            LEFT JOIN "Seasons" ON TRUE
            LEFT JOIN "Episodes" ON "Episodes"."season_id" = "Seasons"."id"
            GROUP BY "SerieData"."id"
        `, [tmdb_id]);

        if (!result.rows[0]) {
            throw new Error('Serie non trouvée');
        }

        return result.rows[0] as Serie;
    } catch (error) {
        console.error('Erreur lors de la récupération de la série:', error);
        throw error;
    }
}

/**
 * Fonction qui permet de récupérer les séries en fonction de la limite et de la page.
 * @param {number} limit - Nombre de séries à récupérer
 * @param {number} page - Page de séries à récupérer
 * @returns {Promise<MinimalSerie[]>}
 */
export async function getSeries(limit: number, page: number): Promise<MinimalSerie[]> {
    try {
        const offset = (page - 1) * limit;
        const result = await Query(`
            WITH "SerieData" AS (
                SELECT
                    "s"."id" AS "id",
                    "s"."tmdb_id" AS "tmdb_id",
                    "s"."title" AS "name",
                    "s"."overview" AS "overview",
                    "s"."poster" AS "poster_path",
                    "s"."media" AS "media_type",
                    "s"."status" AS "status",
                    "s"."first_air_date" AS "first_air_date",
                    "s"."last_air_date" AS "last_air_date",
                    "s"."nb_episodes" AS "number_of_episodes",
                    "s"."vote_average" AS "vote_average",
                    "s"."popularity" AS "popularity",
                    "s"."episode_run_time" AS "episode_run_time"
                FROM "Serie" AS "s"
                LIMIT $1 OFFSET $2
            ),
            "Genres" AS (
                SELECT "gs"."serieId" AS "serieId", 
                       JSON_AGG(
                           JSON_BUILD_OBJECT(
                               'id', "g"."id",
                               'name', "g"."name"
                           )
                       ) AS "genres"
                FROM "Genre_serie" AS "gs"
                JOIN "Genre" AS "g" ON "gs"."genreId" = "g"."id"
                WHERE "gs"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "gs"."serieId"
            ),
            "OriginCountries" AS (
                SELECT "ocs"."serieId" AS "serieId", ARRAY_AGG("c"."iso_3166_1") AS "origin_country"
                FROM "OriginCountry_serie" AS "ocs"
                JOIN "Country" AS "c" ON "ocs"."countryId" = "c"."id"
                WHERE "ocs"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "ocs"."serieId"
            )
            SELECT
                "SerieData".*,
                COALESCE(
                    (
                        SELECT JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', "g"."id",
                                'name', "g"."name"
                            )
                        )
                        FROM "Genre_serie" AS "gs"
                        JOIN "Genre" AS "g" ON "gs"."genreId" = "g"."id"
                        WHERE "gs"."serieId" = "SerieData"."id"
                    ),
                    '[]'
                ) AS "genres",
                COALESCE("OriginCountries"."origin_country", ARRAY[]::text[]) AS "origin_country"
            FROM "SerieData"
            LEFT JOIN "OriginCountries" ON "SerieData"."id" = "OriginCountries"."serieId"
        `, [limit, offset]);

        return result.rows as MinimalSerie[];
    } catch (error) {
        console.error('Erreur lors de la récupération des séries:', error);
        throw error;
    }
}


/**
 * Fonction qui permet de récupérer les séries suivies par un utilisateur en fonction de la limite et de la page.
 * @param {number} limit - Nombre de séries à récupérer
 * @param {number} page - Page de séries à récupérer
 * @param {string} userId - Identifiant de l'utilisateur
 * @returns 
 */
export async function getSeriesFollowed(limit: number, page: number, userId: string): Promise<MinimalSerie[]> {
    const offset = (page - 1) * limit;

    try {
        return (await Query(`
            WITH "SerieData" AS (
                SELECT
                    "s"."id" AS "id",
                    "s"."tmdb_id" AS "tmdb_id",
                    "s"."title" AS "name",
                    "s"."overview" AS "overview",
                    "s"."poster" AS "poster_path",
                    "s"."media" AS "media_type",
                    "s"."status" AS "status",
                    "s"."first_air_date" AS "first_air_date",
                    "s"."last_air_date" AS "last_air_date",
                    "s"."nb_episodes" AS "number_of_episodes",
                    "s"."vote_average" AS "vote_average",
                    "s"."popularity" AS "popularity"
                FROM "Serie" AS "s"
                JOIN "User_serie" AS "us" ON "s"."id" = "us"."serie_id"
                WHERE "us"."user_id" = $3
                LIMIT $1 OFFSET $2
            ),
            "Genres" AS (
                SELECT "gs"."serieId" AS "serieId", ARRAY_AGG("g"."name") AS "genres"
                FROM "Genre_serie" AS "gs"
                JOIN "Genre" AS "g" ON "gs"."genreId" = "g"."id"
                WHERE "gs"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "gs"."serieId"
            ),
            "OriginCountries" AS (
                SELECT "ocs"."serieId" AS "serieId", ARRAY_AGG("c"."iso_3166_1") AS "origin_country"
                FROM "OriginCountry_serie" AS "ocs"
                JOIN "Country" AS "c" ON "ocs"."countryId" = "c"."id"
                WHERE "ocs"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "ocs"."serieId"
            )
            SELECT
                "SerieData".*,
                COALESCE("Genres"."genres", ARRAY[]::text[]) AS "genres",
                COALESCE("OriginCountries"."origin_country", ARRAY[]::text[]) AS "origin_country"
            FROM "SerieData"
            LEFT JOIN "Genres" ON "SerieData"."id" = "Genres"."serieId"
            LEFT JOIN "OriginCountries" ON "SerieData"."id" = "OriginCountries"."serieId"
        `, [limit, offset, userId])).rows as MinimalSerie[];
    } catch (error) {
        console.error('Erreur lors de la récupération des séries suivies:', error);
        throw error;
    }
}

export async function getSeriesIdFollowed(userId: string): Promise<TmdbId[]> {
    try {
        return (await Query(`
            SELECT
                "s"."id"
            FROM "Serie" AS "s"
            JOIN "User_serie" AS "us" ON "s"."id" = "us"."serie_id"
            WHERE "us"."user_id" = $1
        `, [userId])).rows.map((row) => row.id);
    } catch (error) {
        console.error('Erreur lors de la récupération des séries suivies:', error);
        throw error;
    }
}