import { Genre, MinimalSerie, ProductionCompany, ProductionCountry, Serie, Tag, TmdbId } from '@/tmdb/types/series.type';
import Query from '../postgre.middleware';

/**
 * Fonction qui permet de récupérer les détails d'une série en fonction de son identifiant.
 * @param {string} serieId 
 * @returns 
 */
export async function getSerieDetailsById(serieId: string): Promise<Serie | null> {
    try {
        const { rows: serieRows } = await Query(`
            SELECT
                "s"."id" AS "id",
                "s"."tmdb_id" AS "tmdb_id",
                "s"."title" AS "name",
                "s"."overview" AS "overview",
                "s"."poster" AS "poster_path",
                "s"."backdrop" AS "backdrop_path",
                "s"."media" AS "media_type",
                "s"."original_name" AS "original_name",
                "s"."romaji_name" AS "romaji_name",
                "s"."status" AS "status",
                "s"."first_air_date" AS "first_air_date",
                "s"."last_air_date" AS "last_air_date",
                "s"."total_time" AS "total_time",
                "s"."nb_seasons" AS "number_of_seasons",
                "s"."nb_episodes" AS "number_of_episodes",
                "s"."episode_run_time" AS "episode_run_time",
                "s"."vote_average" AS "vote_average",
                "s"."vote_count" AS "vote_count",
                "s"."popularity" AS "popularity",
                "s"."budget" AS "budget",
                "s"."revenue" AS "revenue",
                ARRAY_AGG(DISTINCT "oc"."iso_3166_1") AS "origin_country"
            FROM "Serie" s
            LEFT JOIN "OriginCountry_serie" "ocs" ON "s"."id" = "ocs"."serieId"
            LEFT JOIN "Country" "oc" ON "ocs"."countryId" = "oc"."id"
            WHERE "s"."id" = $1
            GROUP BY "s"."id"
        `, [serieId]);

        if (serieRows.length === 0) {
            return null;
        }

        const serie = serieRows[0];

        // Récupérer les genres associés
        const { rows: genreRows } = await Query(`
            SELECT "g"."id", "g"."tmdb_id", "g"."name"
            FROM "Genre" g
            INNER JOIN "Genre_serie" "gs" ON "g"."id" = "gs"."genreId"
            WHERE "gs"."serieId" = $1
        `, [serieId]);

        // Récupérer les langues associées
        const { rows: languageRows } = await Query(`
            SELECT "l"."id", "l"."iso_639_1", "l"."name", "l"."english_name"
            FROM "Language" l
            INNER JOIN "Language_serie" "ls" ON "l"."id" = "ls"."languageId"
            WHERE "ls"."serieId" = $1
        `, [serieId]);

        // Récupérer les pays de production associés
        const { rows: countryRows } = await Query(`
            SELECT "c"."id", "c"."iso_3166_1", "c"."name"
            FROM "Country" c
            INNER JOIN "ProductionCountry_serie" "pcs" ON "c"."id" = "pcs"."countryId"
            WHERE "pcs"."serieId" = $1
        `, [serieId]);

        // Récupérer les sociétés de production associées
        const { rows: companyRows } = await Query(`
            SELECT "pc"."id", "pc"."name"
            FROM "ProductionCompany" pc
            INNER JOIN "ProductionCompany_serie" "pcs" ON "pc"."id" = "pcs"."productionCompanyId"
            WHERE "pcs"."serieId" = $1
        `, [serieId]);

        // Récupérer les tags associés
        const { rows: tagRows } = await Query(`
            SELECT "t"."id", "t"."name"
            FROM "Tag" t
            INNER JOIN "Tag_serie" "ts" ON "t"."id" = "ts"."tagId"
            WHERE "ts"."serieId" = $1
        `, [serieId]);

        // Récupérer les saisons associées avec leurs épisodes
        const { rows: seasonRows } = await Query(`
            SELECT
                "sn"."id" AS "id",
                "sn"."tmdb_id" AS "tmdb_id",
                "sn"."serie_id" AS "serie_id",
                "sn"."number" AS "season_number",
                "sn"."name" AS "name",
                "sn"."overview" AS "overview",
                "sn"."poster_path" AS "poster_path",
                "sn"."air_date" AS "air_date",
                "sn"."vote_average" AS "vote_average",
                "sn"."total_time" AS "total_time",
                (
                    SELECT json_agg(json_build_object(
                        'id', "e"."id",
                        'season_id', "e"."season_id",
                        'episode_number', "e"."number",
                        'overview', "e"."overview",
                        'name', "e"."name",
                        'runtime', "e"."runtime",
                        'still_path', "e"."still_path"
                    ))
                    FROM "Episode" e
                    WHERE "e"."season_id" = "sn"."id"
                ) AS "episodes"
            FROM "Season" sn
            WHERE "sn"."serie_id" = $1
        `, [serieId]);

        // Construction de l'objet `Serie`
        const serieDetails: Serie = {
            id: serie.id,
            tmdb_id: serie.tmdb_id,
            name: serie.name,
            overview: serie.overview,
            poster_path: serie.poster_path,
            backdrop_path: serie.backdrop_path,
            media_type: serie.media_type,
            original_name: serie.original_name,
            romaji_name: serie.romaji_name,
            status: serie.status,
            first_air_date: serie.first_air_date,
            last_air_date: serie.last_air_date,
            total_time: serie.total_time,
            number_of_seasons: serie.number_of_seasons,
            number_of_episodes: serie.number_of_episodes,
            episode_run_time: serie.episode_run_time,
            genres: genreRows,
            spoken_languages: languageRows,
            production_countries: countryRows,
            production_companies: companyRows,
            seasons: seasonRows,
            vote_average: serie.vote_average,
            vote_count: serie.vote_count,
            origin_country: serie.origin_country,
            popularity: serie.popularity,
            budget: serie.budget,
            revenue: serie.revenue,
            tags: tagRows
        };

        return serieDetails;
    } catch (error) {
        console.error('Erreur lors de la récupération des détails de la série:', error);
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
                    "s"."original_name" AS "original_name",
                    "s"."romaji_name" AS "romaji_name",
                    "s"."overview" AS "overview",
                    "s"."poster" AS "poster_path",
                    "s"."media" AS "media_type",
                    "s"."status" AS "status",
                    "s"."first_air_date" AS "first_air_date",
                    "s"."last_air_date" AS "last_air_date",
                    "s"."nb_episodes" AS "number_of_episodes",
                    "s"."vote_average" AS "vote_average",
                    "s"."popularity" AS "popularity",
                    "s"."episode_run_time" AS "episode_run_time",
                    "s"."total_time" AS "total_time"
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
                SELECT "ocs"."serieId" AS "serieId", 
                       JSON_AGG("c"."iso_3166_1") AS "origin_country"
                FROM "OriginCountry_serie" AS "ocs"
                JOIN "Country" AS "c" ON "ocs"."countryId" = "c"."id"
                WHERE "ocs"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "ocs"."serieId"
            ),
            "ProductionCountries" AS (
                SELECT "pcs"."serieId" AS "serieId", 
                       JSON_AGG(
                           JSON_BUILD_OBJECT(
                               'name', "c"."name",
                               'iso_3166_1', "c"."iso_3166_1"
                           )
                       ) AS "production_countries"
                FROM "ProductionCountry_serie" AS "pcs"
                JOIN "Country" AS "c" ON "pcs"."countryId" = "c"."id"
                WHERE "pcs"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "pcs"."serieId"
            ),
            "ProductionCompanies" AS (
                SELECT "pcs"."serieId" AS "serieId", 
                       JSON_AGG(
                           JSON_BUILD_OBJECT(
                               'id', "c"."id",
                               'name', "c"."name"
                           )
                       ) AS "production_companies"
                FROM "ProductionCompany_serie" AS "pcs"
                JOIN "ProductionCompany" AS "c" ON "pcs"."productionCompanyId" = "c"."id"
                WHERE "pcs"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "pcs"."serieId"
            ),
            "Tags" AS (
                SELECT "ts"."serieId" AS "serieId", 
                       JSON_AGG(
                           JSON_BUILD_OBJECT(
                               'id', "t"."id",
                               'name', "t"."name"
                           )
                       ) AS "tags"
                FROM "Tag_serie" AS "ts"
                JOIN "Tag" AS "t" ON "ts"."tagId" = "t"."id"
                WHERE "ts"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "ts"."serieId"
            )
            SELECT
                "SerieData".*,
                COALESCE("Genres"."genres", '[]') AS "genres",
                COALESCE("OriginCountries"."origin_country", '[]') AS "origin_country",
                COALESCE("ProductionCountries"."production_countries", '[]') AS "production_countries",
                COALESCE("ProductionCompanies"."production_companies", '[]') AS "production_companies",
                COALESCE("Tags"."tags", '[]') AS "tags"
            FROM "SerieData"
            LEFT JOIN "Genres" ON "Genres"."serieId" = "SerieData"."id"
            LEFT JOIN "OriginCountries" ON "OriginCountries"."serieId" = "SerieData"."id"
            LEFT JOIN "ProductionCountries" ON "ProductionCountries"."serieId" = "SerieData"."id"
            LEFT JOIN "ProductionCompanies" ON "ProductionCompanies"."serieId" = "SerieData"."id"
            LEFT JOIN "Tags" ON "Tags"."serieId" = "SerieData"."id"
        `, [limit, offset]);

        return result.rows.map(row => ({
            ...row,
            genres: row.genres ? row.genres : [],
            production_countries: row.production_countries ? row.production_countries : [],
            production_companies: row.production_companies ? row.production_companies : [],
            tags: row.tags ? row.tags : [],
        })) as MinimalSerie[];
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
 * @param {boolean} waited - Indique si on récupère les séries en waitlist
 * @returns {Promise<MinimalSerie[]>}
 */
export async function getSeriesFollowed(limit: number, page: number, userId: string, waited: boolean=false): Promise<MinimalSerie[]> {
    const offset = (page - 1) * limit;
    const table = waited ? 'User_wait_serie' : 'User_serie';
    try {
        const result = await Query(`
            WITH "SerieData" AS (
                SELECT
                    "s"."id" AS "id",
                    "s"."tmdb_id" AS "tmdb_id",
                    "s"."title" AS "name",
                    "s"."original_name" AS "original_name",
                    "s"."romaji_name" AS "romaji_name",
                    "s"."overview" AS "overview",
                    "s"."poster" AS "poster_path",
                    "s"."media" AS "media_type",
                    "s"."status" AS "status",
                    "s"."first_air_date" AS "first_air_date",
                    "s"."last_air_date" AS "last_air_date",
                    "s"."nb_episodes" AS "number_of_episodes",
                    "s"."vote_average" AS "vote_average",
                    "s"."popularity" AS "popularity",
                    "s"."episode_run_time" AS "episode_run_time",
                    "us"."date" AS "follow_date",
                    "s"."total_time" AS "total_time"
                FROM "Serie" AS "s"
                JOIN "${table}" AS "us" ON "s"."id" = "us"."serie_id"
                WHERE "us"."user_id" = $3
                LIMIT $1 OFFSET $2
            ),
            "Genres" AS (
                SELECT 
                    "gs"."serieId" AS "serieId", 
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', "g"."id",
                                'name', "g"."name"
                            )
                        )::jsonb, '[]'::jsonb
                    ) AS "genres"
                FROM "Genre_serie" AS "gs"
                JOIN "Genre" AS "g" ON "gs"."genreId" = "g"."id"
                GROUP BY "gs"."serieId"
            ),
            "User_note" AS (
                SELECT "n"."serie_id" AS "serieId", "n"."note" AS "note", "n"."comment" AS "comment"
                FROM "User_note" AS "n"
                WHERE "n"."user_id" = $3
            ),
            "OriginCountries" AS (
                SELECT 
                    "ocs"."serieId" AS "serieId", 
                    COALESCE(
                        JSONB_AGG(
                            JSON_BUILD_OBJECT(
                                'iso_3166_1', "c"."iso_3166_1"
                            )
                        ), '[]'::jsonb
                    ) AS "origin_country"
                FROM "OriginCountry_serie" AS "ocs"
                JOIN "Country" AS "c" ON "ocs"."countryId" = "c"."id"
                GROUP BY "ocs"."serieId"
            ),
            "ProductionCountries" AS (
                SELECT 
                    "pcs"."serieId" AS "serieId", 
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', "c"."id",
                                'iso_3166_1', "c"."iso_3166_1",
                                'name', "c"."name"
                            )
                        )::jsonb, '[]'::jsonb
                    ) AS "production_countries"
                FROM "ProductionCountry_serie" AS "pcs"
                JOIN "Country" AS "c" ON "pcs"."countryId" = "c"."id"
                GROUP BY "pcs"."serieId"
            ),
            "ProductionCompanies" AS (
                SELECT 
                    "pcs"."serieId" AS "serieId", 
                    COALESCE(
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'id', "pc"."id",
                                'name', "pc"."name"
                            )
                        )::jsonb, '[]'::jsonb
                    ) AS "production_companies"
                FROM "ProductionCompany_serie" AS "pcs"
                JOIN "ProductionCompany" AS "pc" ON "pcs"."productionCompanyId" = "pc"."id"
                GROUP BY "pcs"."serieId"
            ),
            "Tags" AS (
                SELECT 
                    "ts"."serieId" AS "serieId", 
                    COALESCE(
                        JSONB_AGG(
                            JSON_BUILD_OBJECT(
                                'name', "t"."name"
                            )
                        ), '[]'::jsonb
                    ) AS "tags"
                FROM "Tag_serie" AS "ts"
                JOIN "Tag" AS "t" ON "ts"."tagId" = "t"."id"
                GROUP BY "ts"."serieId"
            )
            SELECT
                "SerieData".*,
                COALESCE("Genres"."genres", '[]'::jsonb) AS "genres",
                COALESCE("OriginCountries"."origin_country", '[]'::jsonb) AS "origin_country",
                COALESCE("ProductionCountries"."production_countries", '[]'::jsonb) AS "production_countries",
                COALESCE("ProductionCompanies"."production_companies", '[]'::jsonb) AS "production_companies",
                COALESCE("User_note"."note", NULL) AS "note",
                COALESCE("User_note"."comment", NULL) AS "comment",
                COALESCE("Tags"."tags", '[]'::jsonb) AS "tags"
            FROM "SerieData"
            LEFT JOIN "Genres" ON "SerieData"."id" = "Genres"."serieId"
            LEFT JOIN "OriginCountries" ON "SerieData"."id" = "OriginCountries"."serieId"
            LEFT JOIN "ProductionCountries" ON "SerieData"."id" = "ProductionCountries"."serieId"
            LEFT JOIN "ProductionCompanies" ON "SerieData"."id" = "ProductionCompanies"."serieId"
            LEFT JOIN "User_note" ON "SerieData"."id" = "User_note"."serieId"
            LEFT JOIN "Tags" ON "Tags"."serieId" = "SerieData"."id"
        `, [limit, offset, userId]);

        return result.rows as MinimalSerie[];
    } catch (error) {
        console.error('Erreur lors de la récupération des séries suivies:', error);
        throw error;
    }
}

/**
 * Fonction qui permet de récupérer les détails d'une série suivie par un utilisateur.
 * @param {string} serieId - Identifiant de la série 
 * @param {string} userId - Identifiant de l'utilisateur
 * @returns 
 */
export async function getUserSerieDetails(serieId: string, userId: string): Promise<{ note: number | null, follow_date: string | null, comment: string | null } | null> {
    try {
        const { rows: userSerieDetails } = await Query(`
            SELECT
                us."date" AS "follow_date",
                un."note" AS "note",
				un."comment" AS "comment"
            FROM "User_serie" us
            LEFT JOIN "User_note" un ON us."serie_id" = un."serie_id" AND us."user_id" = un."user_id"
            WHERE us."serie_id" = $1 AND us."user_id" = $2
        `, [serieId, userId]);

        if (userSerieDetails.length === 0) {
            return null;
        }

        return {
            note: userSerieDetails[0].note,
            follow_date: userSerieDetails[0].follow_date,
            comment: userSerieDetails[0].comment
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des détails de la série pour l\'utilisateur:', error);
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
 * Fonction qui permet de récupérer les identifiants des séries en waitlist pour un utilisateur.
 * @param {string} userId - Identifiant de l'utilisateur
 * @returns 
 */
export async function getSeriesIdWaited(userId: string): Promise<TmdbId[]> {
    try {
        return (await Query(`
            SELECT
                "s"."id"
            FROM "Serie" AS "s"
            JOIN "User_wait_serie" AS "us" ON "s"."id" = "us"."serie_id"
            WHERE "us"."user_id" = $1
        `, [userId])).rows.map((row) => row.id);
    } catch (error) {
        console.error('Erreur lors de la récupération des séries en waitlist:', error);
        throw error;
    }
}

export async function getImageSerie(userId: string, isWaitList: boolean): Promise<string[]> {
    try {
        const table = isWaitList ? 'User_wait_serie' : 'User_serie';
        const result = await Query(`
            SELECT
                "s"."poster" AS "poster_path"
            FROM "Serie" AS "s"
            JOIN "${table}" AS "us" ON "s"."id" = "us"."serie_id"
            WHERE "us"."user_id" = $1
        `, [userId]);

        return result.rows.map(row => row.poster_path);
    } catch (error) {
        console.error('Erreur lors de la récupération des images des séries suivies:', error);
        throw error;
    }
}

/**
 * Fonction qui permet de vérifier si une série existe par son id.
 * @param {number} id 
 */
export async function isSerieExists(id:number) {
    const result = await Query(`SELECT EXISTS(SELECT 1 FROM "Serie" WHERE "id" = $1)`, [id]);
    return result.rows[0].exists;
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
 * Fonction qui permet de mettre une série en waitlist.
 * @param {string} userId - L'identifiant de l'utilisateur
 * @param {string} serieId - L'dentifiant de la série
 * @returns 
 */
export async function addWaitSerie(userId: string, serieId: string): Promise<boolean> {
    try {
        await Query(`
            INSERT INTO "User_wait_serie" ("user_id", "serie_id")
            VALUES ($1, $2)
        `, [userId, serieId]);

        return true;
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la série en waitlist:', error);
        return false;
    }
}

/**
 * Fonction qui permet de retirer une série de la waitlist.
 * @param {string} userId - Identifiant de l'utilisateur
 * @param {string} serieId - Identifiant de la série
 * @returns 
 */
export async function removeWaitSerie(userId: string, serieId: string): Promise<boolean> {
    try {
        await Query(`
            DELETE FROM "User_wait_serie"
            WHERE "user_id" = $1 AND "serie_id" = $2
        `, [userId, serieId]);

        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression de la série en waitlist:', error);
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
 * Fonction qui permet de mettre à jour la date de suivi d'une série.
 * @param {string} userId - Identifiant de l'utilisateur
 * @param {string} serieId - Identifiant de la série
 * @param {Date} date - Nouvelle date de suivi
 * @returns 
 */
export async function updateDateFollowSerie(userId: string, serieId: string, date: Date): Promise<boolean> {
    try {
        await Query(`
            UPDATE "User_serie"
            SET "date" = $3
            WHERE "user_id" = $1 AND "serie_id" = $2
        `, [userId, serieId, date]);

        return true;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la date de suivi de la série:', error);
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

/**
 * Fonction qui permet de récupérer les noms des genres des séries.
 * @returns 
 */
export async function getAllGenresNames(): Promise<string[]> {
    try {
        const result = await Query(`
            SELECT "name"
            FROM "Genre"
            ORDER BY "name"
        `);

        return result.rows.map((row) => row.name);
    } catch (error) {
        console.error('Erreur lors de la récupération des genres:', error);
        throw error;
    }
}

/**
 * Fonction qui permet de récupérer les genres des séries.
 * @returns 
 */
export async function getAllGenres(): Promise<Genre[]> {
    try {
        const result = await Query(`
            SELECT "id", "name", "tmdb_id"
            FROM "Genre"
            ORDER BY "name"
        `);

        return result.rows as Genre[];
    } catch (error) {
        console.error('Erreur lors de la récupération des genres:', error);
        throw error;
    }
}

/**
 * Fonction qui permet de récupérer les tags des séries.
 * @returns 
 */
export async function getAllTags(): Promise<Tag[]> {
    try {
        const result = await Query(`
            SELECT "id", "name"
            FROM "Tag"
            ORDER BY "name"
        `);

        return result.rows as Tag[];
    } catch (error) {
        console.error('Erreur lors de la récupération des tags:', error);
        throw error;
    }
}

/**
 * Fonction qui permet de récupérer les pays d'origin des séries.
 * @returns 
 */
export async function getAllOriginCountries(): Promise<string[]> {
    try {
        const result = await Query(`
            SELECT "iso_3166_1"
            FROM "Country"
            ORDER BY "iso_3166_1"
        `);

        return result.rows.map((row) => row.iso_3166_1);
    } catch (error) {
        console.error('Erreur lors de la récupération des pays d\'origine:', error);
        throw error;
    }
}

/**
 * Fonction qui permet de récupérer les companies de production des séries.
 * @returns 
 */
export async function getAllProductionCompanies(): Promise<ProductionCompany[]> {
    try {
        const result = await Query(`
            SELECT "id", "name"
            FROM "ProductionCompany"
            ORDER BY "name"
        `);

        return result.rows as ProductionCompany[];
    } catch (error) {
        console.error('Erreur lors de la récupération des companies de production:', error);
        throw error;
    }
}

/**
 * Fonction qui permet de récupérer les pays de production des séries.
 * @returns 
 */
export async function getAllProductionCountries(): Promise<ProductionCountry[]> {
    try {
        const result = await Query(`
            SELECT "name" AS "name", "iso_3166_1" AS "iso_3166_1", "id" AS "id"
            FROM "Country"
            ORDER BY "name"
        `);

        return result.rows as ProductionCountry[];
    } catch (error) {
        console.error('Erreur lors de la récupération des pays de production:', error);
        throw error;
    }
}

/**
 * Fonction qui permet de récupérer les séries recommandées pour un utilisateur.
 * @param {string} userId - Identifiant de l'utilisateur
 * @param {number} limit - Nombre de séries à récupérer
 * @param {number} page - Page de séries à récupérer
 * @returns 
 */
export async function getRecommendedSeries(userId: string, limit: number, page: number): Promise<{ id: number; total_score: number }[]> {
    try {
        const offset = (page - 1) * limit;

        const result = await Query(`
            WITH "UserGenres" AS (
                SELECT
                    "g"."name" AS "genre_name",
                    COUNT(*) AS "genre_count"
                FROM "User_serie" AS "us"
                JOIN "Serie" AS "s" ON "us"."serie_id" = "s"."id"
                LEFT JOIN "Genre_serie" AS "gs" ON "s"."id" = "gs"."serieId"
                LEFT JOIN "Genre" AS "g" ON "gs"."genreId" = "g"."id"
                WHERE "us"."user_id" = $1
                GROUP BY "g"."name"
            ),
            "UserCountries" AS (
                SELECT
                    "c"."iso_3166_1" AS "country_code",
                    COUNT(*) AS "country_count"
                FROM "User_serie" AS "us"
                JOIN "Serie" AS "s" ON "us"."serie_id" = "s"."id"
                LEFT JOIN "ProductionCountry_serie" AS "pcs" ON "s"."id" = "pcs"."serieId"
                LEFT JOIN "Country" AS "c" ON "pcs"."countryId" = "c"."id"
                WHERE "us"."user_id" = $1
                GROUP BY "c"."iso_3166_1"
            ),
            "UserProductionCompanies" AS (
                SELECT
                    "pc"."name" AS "company_name",
                    COUNT(*) AS "company_count"
                FROM "User_serie" AS "us"
                JOIN "Serie" AS "s" ON "us"."serie_id" = "s"."id"
                LEFT JOIN "ProductionCompany_serie" AS "pcs_comp" ON "s"."id" = "pcs_comp"."serieId"
                LEFT JOIN "ProductionCompany" AS "pc" ON "pcs_comp"."productionCompanyId" = "pc"."id"
                WHERE "us"."user_id" = $1
                GROUP BY "pc"."name"
            ),
            "UserTags" AS (
                SELECT
                    "t"."name" AS "tag_name",
                    COUNT(*) AS "tag_count"
                FROM "User_serie" AS "us"
                JOIN "Serie" AS "s" ON "us"."serie_id" = "s"."id"
                LEFT JOIN "Tag_serie" AS "ts" ON "s"."id" = "ts"."serieId"
                LEFT JOIN "Tag" AS "t" ON "ts"."tagId" = "t"."id"
                WHERE "us"."user_id" = $1
                GROUP BY "t"."name"
            ),
            "SeriesScores" AS (
                SELECT
                    "s"."id",
                    COALESCE(
                        (
                            SELECT COUNT(*)
                            FROM "User_serie" AS "us"
                            JOIN "Serie" AS "s_user" ON "us"."serie_id" = "s_user"."id"
                            WHERE "s_user"."media" = "s"."media"
                            AND "us"."user_id" = $1
                        ), 0) * 6 AS "media_score",
                    COALESCE(
                        (
                            SELECT SUM("ug"."genre_count")
                            FROM "UserGenres" AS "ug"
                            WHERE "ug"."genre_name" IN (
                                SELECT "g"."name"
                                FROM "Genre_serie" AS "gs"
                                JOIN "Genre" AS "g" ON "gs"."genreId" = "g"."id"
                                WHERE "gs"."serieId" = "s"."id"
                            )
                        ), 0
                    ) AS "genre_score",
                    COALESCE(
                        (
                            SELECT SUM("uc"."country_count")
                            FROM "UserCountries" AS "uc"
                            WHERE "uc"."country_code" IN (
                                SELECT "c"."iso_3166_1"
                                FROM "ProductionCountry_serie" AS "pcs"
                                JOIN "Country" AS "c" ON "pcs"."countryId" = "c"."id"
                                WHERE "pcs"."serieId" = "s"."id"
                            )
                        ), 0
                    ) AS "country_score",
                    COALESCE(
                        (
                            SELECT SUM("upc"."company_count")
                            FROM "UserProductionCompanies" AS "upc"
                            WHERE "upc"."company_name" IN (
                                SELECT "pc"."name"
                                FROM "ProductionCompany_serie" AS "pcs_comp"
                                JOIN "ProductionCompany" AS "pc" ON "pcs_comp"."productionCompanyId" = "pc"."id"
                                WHERE "pcs_comp"."serieId" = "s"."id"
                            )
                        ), 0
                    ) AS "company_score",
                    COALESCE(
                        (
                            SELECT SUM("ut"."tag_count")
                            FROM "UserTags" AS "ut"
                            WHERE "ut"."tag_name" IN (
                                SELECT "t"."name"
                                FROM "Tag_serie" AS "ts"
                                JOIN "Tag" AS "t" ON "ts"."tagId" = "t"."id"
                                WHERE "ts"."serieId" = "s"."id"
                            )
                        ), 0
                    ) AS "tag_score"
                FROM "Serie" AS "s"
            )
            SELECT
                "s"."id",
                COALESCE(
                    (
                        "s"."media_score" +
                        "s"."genre_score" +
                        "s"."country_score" +
                        "s"."company_score" +
                        "s"."tag_score"
                    ) / 6.0, 0
                ) AS "total_score"
            FROM "SeriesScores" AS "s"
            WHERE "s"."id" NOT IN (
                SELECT "serie_id" FROM "User_serie" WHERE "user_id" = $1
            )
            ORDER BY "total_score" DESC
            LIMIT $2 OFFSET $3;
        `, [userId, limit, offset]);

        return result.rows;
    } catch (error) {
        console.error('Error in getRecommendedSeries:', error);
        throw error;
    }
}



/**
 * Fonction qui permet de récupérer les détails des séries en fonction d'un tableau d'IDs.
 * @param {number[]} ids - Tableau d'IDs des séries à récupérer
 * @returns {Promise<MinimalSerie[]>}
 */
export async function getSeriesByIds(ids: number[]): Promise<MinimalSerie[]> {
    try {
        if (ids.length === 0) {
            return [];
        }

        // Créez des placeholders pour les IDs
        const idsPlaceholder = ids.map((_, index) => `$${index + 1}`).join(', ');

        const result = await Query(`
            WITH "SerieData" AS (
                SELECT
                    "s"."id" AS "id",
                    "s"."tmdb_id" AS "tmdb_id",
                    "s"."title" AS "name",
                    "s"."original_name" AS "original_name",
                    "s"."romaji_name" AS "romaji_name",
                    "s"."overview" AS "overview",
                    "s"."poster" AS "poster_path",
                    "s"."media" AS "media_type",
                    "s"."status" AS "status",
                    "s"."first_air_date" AS "first_air_date",
                    "s"."last_air_date" AS "last_air_date",
                    "s"."nb_episodes" AS "number_of_episodes",
                    "s"."vote_average" AS "vote_average",
                    "s"."popularity" AS "popularity",
                    "s"."episode_run_time" AS "episode_run_time",
                    "s"."total_time" AS "total_time"
                FROM "Serie" AS "s"
                WHERE "s"."id" IN (${idsPlaceholder})
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
                SELECT "ocs"."serieId" AS "serieId", 
                       JSON_AGG("c"."iso_3166_1") AS "origin_country"
                FROM "OriginCountry_serie" AS "ocs"
                JOIN "Country" AS "c" ON "ocs"."countryId" = "c"."id"
                WHERE "ocs"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "ocs"."serieId"
            ),
            "ProductionCountries" AS (
                SELECT "pcs"."serieId" AS "serieId", 
                       JSON_AGG(
                           JSON_BUILD_OBJECT(
                               'name', "c"."name",
                               'iso_3166_1', "c"."iso_3166_1"
                           )
                       ) AS "production_countries"
                FROM "ProductionCountry_serie" AS "pcs"
                JOIN "Country" AS "c" ON "pcs"."countryId" = "c"."id"
                WHERE "pcs"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "pcs"."serieId"
            ),
            "ProductionCompanies" AS (
                SELECT "pcs"."serieId" AS "serieId", 
                       JSON_AGG(
                           JSON_BUILD_OBJECT(
                               'id', "c"."id",
                               'name', "c"."name"
                           )
                       ) AS "production_companies"
                FROM "ProductionCompany_serie" AS "pcs"
                JOIN "ProductionCompany" AS "c" ON "pcs"."productionCompanyId" = "c"."id"
                WHERE "pcs"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "pcs"."serieId"
            ),
            "Tags" AS (
                SELECT "ts"."serieId" AS "serieId", 
                       JSON_AGG(
                           JSON_BUILD_OBJECT(
                               'id', "t"."id",
                               'name', "t"."name"
                           )
                       ) AS "tags"
                FROM "Tag_serie" AS "ts"
                JOIN "Tag" AS "t" ON "ts"."tagId" = "t"."id"
                WHERE "ts"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "ts"."serieId"
            )
            SELECT
                "SerieData".*,
                COALESCE("Genres"."genres", '[]') AS "genres",
                COALESCE("OriginCountries"."origin_country", '[]') AS "origin_country",
                COALESCE("ProductionCountries"."production_countries", '[]') AS "production_countries",
                COALESCE("ProductionCompanies"."production_companies", '[]') AS "production_companies",
                COALESCE("Tags"."tags", '[]') AS "tags"
            FROM "SerieData"
            LEFT JOIN "Genres" ON "Genres"."serieId" = "SerieData"."id"
            LEFT JOIN "OriginCountries" ON "OriginCountries"."serieId" = "SerieData"."id"
            LEFT JOIN "ProductionCountries" ON "ProductionCountries"."serieId" = "SerieData"."id"
            LEFT JOIN "ProductionCompanies" ON "ProductionCompanies"."serieId" = "SerieData"."id"
            LEFT JOIN "Tags" ON "Tags"."serieId" = "SerieData"."id"
            ORDER BY ARRAY_POSITION(ARRAY[${idsPlaceholder}], "SerieData"."id")
        `, ids);

        return result.rows.map(row => ({
            ...row,
            genres: row.genres ? row.genres : [],
            production_countries: row.production_countries ? row.production_countries : [],
            production_companies: row.production_companies ? row.production_companies : [],
            tags: row.tags ? row.tags : [],
        })) as MinimalSerie[];
    } catch (error) {
        console.error('Erreur lors de la récupération des séries:', error);
        throw error;
    }
}


export async function getPopularSeries(limit: number, page: number): Promise<MinimalSerie[]> {
    const offset = (page - 1) * limit;

    try {
        const result = await Query(`
            WITH "SerieData" AS (
                SELECT
                    "s"."id" AS "id",
                    "s"."tmdb_id" AS "tmdb_id",
                    "s"."title" AS "name",
                    "s"."original_name" AS "original_name",
                    "s"."romaji_name" AS "romaji_name",
                    "s"."overview" AS "overview",
                    "s"."poster" AS "poster_path",
                    "s"."media" AS "media_type",
                    "s"."status" AS "status",
                    "s"."first_air_date" AS "first_air_date",
                    "s"."last_air_date" AS "last_air_date",
                    "s"."nb_episodes" AS "number_of_episodes",
                    "s"."vote_average" AS "vote_average",
                    "s"."popularity" AS "popularity",
                    "s"."episode_run_time" AS "episode_run_time",
                    "s"."total_time" AS "total_time"
                FROM "Serie" AS "s"
                ORDER BY "s"."popularity" DESC
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
                SELECT "ocs"."serieId" AS "serieId", 
                       JSON_AGG("c"."iso_3166_1") AS "origin_country"
                FROM "OriginCountry_serie" AS "ocs"
                JOIN "Country" AS "c" ON "ocs"."countryId" = "c"."id"
                WHERE "ocs"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "ocs"."serieId"
            ),
            "ProductionCountries" AS (
                SELECT "pcs"."serieId" AS "serieId", 
                       JSON_AGG(
                           JSON_BUILD_OBJECT(
                               'name', "c"."name",
                               'iso_3166_1', "c"."iso_3166_1"
                           )
                       ) AS "production_countries"
                FROM "ProductionCountry_serie" AS "pcs"
                JOIN "Country" AS "c" ON "pcs"."countryId" = "c"."id"
                WHERE "pcs"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "pcs"."serieId"
            ),
            "ProductionCompanies" AS (
                SELECT "pcs"."serieId" AS "serieId", 
                       JSON_AGG(
                           JSON_BUILD_OBJECT(
                               'id', "c"."id",
                               'name', "c"."name"
                           )
                       ) AS "production_companies"
                FROM "ProductionCompany_serie" AS "pcs"
                JOIN "ProductionCompany" AS "c" ON "pcs"."productionCompanyId" = "c"."id"
                WHERE "pcs"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "pcs"."serieId"
            ),
            "Tags" AS (
                SELECT "ts"."serieId" AS "serieId", 
                       JSON_AGG(
                           JSON_BUILD_OBJECT(
                               'id', "t"."id",
                               'name', "t"."name"
                           )
                       ) AS "tags"
                FROM "Tag_serie" AS "ts"
                JOIN "Tag" AS "t" ON "ts"."tagId" = "t"."id"
                WHERE "ts"."serieId" IN (SELECT "id" FROM "SerieData")
                GROUP BY "ts"."serieId"
            )
            SELECT
                "SerieData".*,
                COALESCE("Genres"."genres", '[]') AS "genres",
                COALESCE("OriginCountries"."origin_country", '[]') AS "origin_country",
                COALESCE("ProductionCountries"."production_countries", '[]') AS "production_countries",
                COALESCE("ProductionCompanies"."production_companies", '[]') AS "production_companies",
                COALESCE("Tags"."tags", '[]') AS "tags"
            FROM "SerieData"
            LEFT JOIN "Genres" ON "Genres"."serieId" = "SerieData"."id"
            LEFT JOIN "OriginCountries" ON "OriginCountries"."serieId" = "SerieData"."id"
            LEFT JOIN "ProductionCountries" ON "ProductionCountries"."serieId" = "SerieData"."id"
            LEFT JOIN "ProductionCompanies" ON "ProductionCompanies"."serieId" = "SerieData"."id"
            LEFT JOIN "Tags" ON "Tags"."serieId" = "SerieData"."id"
            ORDER BY "SerieData"."popularity" DESC
        `, [limit, offset]);

        return result.rows.map(row => ({
            ...row,
            genres: row.genres ? row.genres : [],
            production_countries: row.production_countries ? row.production_countries : [],
            production_companies: row.production_companies ? row.production_companies : [],
            tags: row.tags ? row.tags : [],
        })) as MinimalSerie[];
    }
    catch (error) {
        console.error('Erreur lors de la récupération des séries populaires:', error);
        throw error;
    }
}