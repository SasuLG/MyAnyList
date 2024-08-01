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
            "User_note" AS (
                SELECT "n"."serie_id" AS "serieId", "n"."note" AS "note"
                FROM "User_note" AS "n"
                WHERE "n"."user_id" = $3 AND "n"."serie_id" IN (SELECT "id" FROM "SerieData")
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

/**
 * Fonction qui permet de récupérer les identifiants des séries suivies par un utilisateur.
 * @param {string} userId - Identifiant de l'utilisateur
 * @returns 
 */
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

/**
 * Fonction qui permet de suivre une série.
 * @param {string} userId - Identifiant de l'utilisateur
 * @param {string} serieId - Identifiant de la série
 * @returns {Promise<boolean>} - Renvoie true si l'opération s'est bien passée, sinon false.
 */
export async function followSerie(userId: string, serieId: string): Promise<boolean> {
    try {
        await Query(`
            INSERT INTO "User_serie" ("user_id", "serie_id")
            VALUES ($1, $2)
        `, [userId, serieId]);

        return true;
    } catch (error) {
        console.error('Erreur lors du suivi de la série:', error);
        return false;
    }
}

/**
 * Fonction qui permet de ne plus suivre une série.
 * @param {string} userId - Identifiant de l'utilisateur
 * @param {string} serieId - Identifiant de la série
 * @returns {Promise<boolean>} - Renvoie true si l'opération s'est bien passée, sinon false.
 */
export async function unFollowSerie(userId: string, serieId: string): Promise<boolean> {
    try {
        await Query(`
            DELETE FROM "User_serie"
            WHERE "user_id" = $1 AND "serie_id" = $2
        `, [userId, serieId]);

        return true;
    } catch (error) {
        console.error('Erreur lors du désabonnement de la série:', error);
        return false;
    }
}

/**
 * Fonction qui permet d'ajouter une note pour une série.
 * @param {string} userId - Identifiant de l'utilisateur
 * @param {string} serieId - Identifiant de la série
 * @param {number} note - Note attribuée à la série
 * @param {number} comment - Commentaire attribué à la série
 * @returns 
 */
export async function addVote(userId: string, serieId: string, note: number, comment?:number): Promise<boolean> {
    try {
        await Query(`
            INSERT INTO "User_note" ("user_id", "serie_id", "note", "comment")
            VALUES ($1, $2, $3, $4)
        `, [userId, serieId, note, comment]);

        return true;
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la note:', error);
        return false;
    }
}

/**
 * Fonction qui permet de mettre à jour une note pour une série.
 * @param {string} userId - Identifiant de l'utilisateur
 * @param {string} serieId - Identifiant de la série
 * @param {number} note - Note attribuée à la série
 * @param {number} comment - Commentaire attribué à la série
 * @returns 
 */
export async function updateVote(userId: string, serieId: string, note: number, comment?:number): Promise<boolean> {
    try {
        await Query(`
            UPDATE "User_note"
            SET "note" = $3, "comment" = $4
            WHERE "user_id" = $1 AND "serie_id" = $2
        `, [userId, serieId, note, comment]);

        return true;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la note:', error);
        return false;
    }
}

/**
 * Fonction qui permet de supprimer une note pour une série.
 * @param {string} userId - Identifiant de l'utilisateur
 * @param {string} serieId - Identifiant de la série
 * @returns 
 */
export async function deleteVote(userId: string, serieId: string): Promise<boolean> {
    try {
        await Query(`
            DELETE FROM "User_note"
            WHERE "user_id" = $1 AND "serie_id" = $2
        `, [userId, serieId]);

        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression de la note:', error);
        return false;
    }
}

export async function deleteSerie(serieId: string): Promise<boolean> { /* TODO User_episode, Season, Episode */
    try {
        
        await Query(`
            DELETE FROM "Country_serie"
            WHERE "serieId" = $1
        `, [serieId]);

        await Query(`
            DELETE FROM "OriginCountry_serie"
            WHERE "serieId" = $1
        `, [serieId]);

        await Query(`
            DELETE FROM "Genre_serie"
            WHERE "serieId" = $1
        `, [serieId]);

        await Query(`
            DELETE FROM "ProductionCompany_serie"
            WHERE "serieId" = $1
        `, [serieId]);

        await Query(`
            DELETE FROM "ProductionCountry_serie"
            WHERE "serieId" = $1
        `, [serieId]);

        await Query(`
            DELETE FROM "User_serie"
            WHERE "serie_id" = $1
        `, [serieId]);

        await Query(`
            DELETE FROM "User_note"
            WHERE "serie_id" = $1
        `, [serieId]);

        await Query(`
            DELETE FROM "Serie"
            WHERE "id" = $1
        `, [serieId]);

        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression de la série:', error);
        return false;
    }
}