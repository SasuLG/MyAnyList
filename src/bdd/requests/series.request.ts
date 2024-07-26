import { Serie, TmdbId } from '@/tmdb/types/series.type';
import Query from '../postgre.middleware';

export async function importSerie(serieData: Serie) {
    const {
        id, name, overview, poster_path, backdrop_path, media_type, original_name, status,
        first_air_date, last_air_date, episode_run_time, number_of_seasons, number_of_episodes, genres,
        spoken_languages, production_countries, production_companies, seasons, vote_average, vote_count, origin_country,
        popularity, budget, revenue, total_time
    } = serieData;

    try {
        // Insertion ou mise à jour de la série
        const { rows: serieRows } = await Query(`
            INSERT INTO "Serie" ("tmdb_id", "title", "overview", "poster", "backdrop", "media", "original_name", "status", "first_air_date", "last_air_date", "episode_run_time", "nb_seasons", "nb_episodes", "vote_average", "vote_count", "popularity", "budget", "revenue", "total_time")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            ON CONFLICT ("tmdb_id") DO UPDATE
            SET "title" = EXCLUDED."title",
                "overview" = EXCLUDED."overview",
                "poster" = EXCLUDED."poster",
                "backdrop" = EXCLUDED."backdrop",
                "media" = EXCLUDED."media",
                "original_name" = EXCLUDED."original_name",
                "status" = EXCLUDED."status",
                "first_air_date" = EXCLUDED."first_air_date",
                "last_air_date" = EXCLUDED."last_air_date",
                "episode_run_time" = EXCLUDED."episode_run_time",
                "nb_seasons" = EXCLUDED."nb_seasons",
                "nb_episodes" = EXCLUDED."nb_episodes",
                "vote_average" = EXCLUDED."vote_average",
                "vote_count" = EXCLUDED."vote_count",
                "popularity" = EXCLUDED."popularity",
                "budget" = EXCLUDED."budget",
                "revenue" = EXCLUDED."revenue"
            RETURNING "id"
        `, [id, name, overview, poster_path, backdrop_path, media_type, original_name, status, first_air_date, last_air_date, episode_run_time, number_of_seasons, number_of_episodes, vote_average, vote_count, popularity, budget, revenue, total_time]);

        const serieId = serieRows[0].id;

        // Gestion des genres
        for (const genre of genres) {
            const { rows: genreRows } = await Query(`
                INSERT INTO "Genre" ("tmdb_id", "name")
                VALUES ($1, $2)
                ON CONFLICT ("tmdb_id") DO NOTHING
                RETURNING "id"
            `, [genre.id, genre.name]);

            const genreId = genreRows[0]?.id;
            if (genreId) {
                await Query(`
                    INSERT INTO "Genre_serie" ("serieId", "genreId")
                    VALUES ($1, $2)
                    ON CONFLICT ("serieId", "genreId") DO NOTHING
                `, [serieId, genreId]);
            }
        }

        // Gestion des langues
        for (const language of spoken_languages) {
            const { rows: languageRows } = await Query(`
                INSERT INTO "Language" ("iso_639_1", "name", "english_name")
                VALUES ($1, $2, $3)
                ON CONFLICT ("iso_639_1") DO NOTHING
                RETURNING "id"
            `, [language.iso_639_1, language.name, language.english_name]);

            const languageId = languageRows[0]?.id;
            if (languageId) {
                await Query(`
                    INSERT INTO "Language_serie" ("serieId", "languageId")
                    VALUES ($1, $2)
                    ON CONFLICT ("serieId", "languageId") DO NOTHING
                `, [serieId, languageId]);
            }
        }

        // Gestion des pays de production
        for (const country of production_countries) {
            const { rows: countryRows } = await Query(`
                INSERT INTO "Country" ("name", "iso_3166_1")
                VALUES ($1, $2)
                ON CONFLICT ("iso_3166_1") DO NOTHING
                RETURNING "id"
            `, [country.name, country.iso_3166_1]);

            const countryId = countryRows[0]?.id;
            if (countryId) {
                await Query(`
                    INSERT INTO "ProductionCountry_serie" ("serieId", "countryId")
                    VALUES ($1, $2)
                    ON CONFLICT ("serieId", "countryId") DO NOTHING
                `, [serieId, countryId]);
            }

            if (countryId && origin_country.includes(country.iso_3166_1)) {
                await Query(`
                    INSERT INTO "OriginCountry_serie" ("serieId", "countryId")
                    VALUES ($1, $2)
                    ON CONFLICT ("serieId", "countryId") DO NOTHING
                `, [serieId, countryId]);
            }
        }

        // Gestion des sociétés de production
        for (const company of production_companies) {
            const { rows: companyRows } = await Query(`
                INSERT INTO "ProductionCompany" ("tmdb_id", "name")
                VALUES ($1, $2)
                ON CONFLICT ("tmdb_id") DO NOTHING
                RETURNING "id"
            `, [company.id, company.name]);

            const companyId = companyRows[0]?.id;
            if (companyId) {
                await Query(`
                    INSERT INTO "ProductionCompany_serie" ("serieId", "productionCompanyId")
                    VALUES ($1, $2)
                    ON CONFLICT ("serieId", "productionCompanyId") DO NOTHING
                `, [serieId, companyId]);
            }
        }

        // Gestion des saisons et des épisodes
        for (const season of seasons) {
            const { rows: seasonRows } = await Query(`
                INSERT INTO "Season" ("tmdb_id", "serie_id", "number", "overview", "poster_path", "air_date", "vote_average", "total_time", "name")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT ("tmdb_id") DO UPDATE
                SET "number" = EXCLUDED."number",
                    "overview" = EXCLUDED."overview",
                    "poster_path" = EXCLUDED."poster_path",
                    "air_date" = EXCLUDED."air_date",
                    "vote_average" = EXCLUDED."vote_average",
                    "total_time" = EXCLUDED."total_time",
                    "name" = EXCLUDED."name"
                RETURNING "id"
            `, [season.id, serieId, season.season_number, season.overview, season.poster_path, season.air_date, season.vote_average, 0, season.name]);

            const seasonId = seasonRows[0].id;

            for (const episode of season.episodes) {
                await Query(`
                    INSERT INTO "Episode" ("tmdb_id", "season_id", "number", "overview", "name", "runtime", "still_path")
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT ("tmdb_id") DO UPDATE
                    SET "runtime" = EXCLUDED."runtime",
                        "still_path" = EXCLUDED."still_path"
                `, [episode.id, seasonId, episode.episode_number, episode.overview, episode.name, episode.runtime, episode.still_path]);
            }
        }
    } catch (error) {
        console.error('Erreur lors de l\'importation de la série:', error);
        throw error;
    }
}

export async function getSerie(tmdb_id: number): Promise<Serie> {
    try {
        const result = await Query(`
            WITH "SerieData" AS (
                SELECT
                    "s"."id"::text AS "id",
                    "s"."tmdb_id"::text AS "tmdb_id",
                    "s"."title" AS "name",
                    "s"."overview" AS "overview",
                    "s"."poster" AS "poster_path",
                    "s"."backdrop" AS "backdrop_path",
                    "s"."media" AS "media_type",
                    "s"."original_name" AS "original_name",
                    "s"."status" AS "status",
                    "s"."first_air_date"::text AS "first_air_date",
                    "s"."last_air_date"::text AS "last_air_date",
                    "s"."episode_run_time"::int AS "episode_run_time",
                    "s"."nb_seasons"::int AS "number_of_seasons",
                    "s"."nb_episodes"::int AS "number_of_episodes",
                    "s"."vote_average"::float AS "vote_average",
                    "s"."vote_count"::int AS "vote_count",
                    "s"."popularity"::float AS "popularity",
                    "s"."budget"::int AS "budget",
                    "s"."revenue"::int AS "revenue"
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
                SELECT "s"."id"::text AS "id", "s"."tmdb_id"::text AS "tmdb_id", "s"."number"::int AS "season_number", "s"."overview", "s"."poster_path", "s"."air_date", "s"."vote_average", "s"."total_time", "s"."name"
                FROM "Season" AS "s"
                WHERE "s"."serie_id" = (SELECT "id" FROM "SerieData")
            ),
            "Episodes" AS (
                SELECT "e"."tmdb_id"::text AS "id", "e"."season_id", "e"."number"::int AS "episode_number", "e"."overview", "e"."name", "e"."runtime", "e"."still_path"
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

export async function getTmdbIdsSeries() {
    const bddResponse = await Query(`select tmdb_id from "Serie"`);
    return bddResponse.rows as TmdbId[];
}