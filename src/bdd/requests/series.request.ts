import { Serie } from '@/tmdb/types/series.type';
import Query from '../postgre.middleware';

export async function importSerie(serieData: any) {
    const {
        id, name, overview, poster_path, backdrop_path, media_type, original_name, status,
        first_air_date, last_air_date, number_of_episodes, number_of_seasons, genres,
        spoken_languages, production_countries, production_companies, seasons, episode_run_time
    } = serieData;

    try {
        // Insertion ou mise à jour de la série
        const { rows: serieRows } = await Query(`
            INSERT INTO "Serie" ("tmdb_id", "title", "overview", "poster", "backdrop" , "media", "original_name", "status", "first_air_date", "last_air_date", "total_time", "nb_seasons", "nb_episodes", "episode_run_time")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
                "total_time" = EXCLUDED."total_time"
            RETURNING "id"
        `, [id, name, overview, poster_path, backdrop_path, media_type, original_name, status, first_air_date, last_air_date, 0, number_of_seasons, number_of_episodes, episode_run_time]);

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
                INSERT INTO "Language" ("name")
                VALUES ($1)
                ON CONFLICT ("name") DO NOTHING
                RETURNING "id"
            `, [language.name]);

            const languageId = languageRows[0]?.id;
            if (languageId) {
                await Query(`
                    INSERT INTO "Language_serie" ("serieId", "languageId")
                    VALUES ($1, $2)
                    ON CONFLICT ("serieId", "languageId") DO NOTHING
                `, [serieId, languageId]);
            }
        }

        // Gestion des pays
        for (const country of production_countries) {
            const { rows: countryRows } = await Query(`
                INSERT INTO "Country" ("name")
                VALUES ($1)
                ON CONFLICT ("name") DO NOTHING
                RETURNING "id"
            `, [country.name]);

            const countryId = countryRows[0]?.id;
            if (countryId) {
                await Query(`
                    INSERT INTO "ProductionCountry_serie" ("serieId", "countryId")
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
                INSERT INTO "Season" ("tmdb_id", "serie_id", "number", "overview", "poster_path", "air_date", "vote_average", "total_time")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT ("tmdb_id") DO UPDATE
                SET "number" = EXCLUDED."number",
                    "overview" = EXCLUDED."overview",
                    "poster_path" = EXCLUDED."poster_path",
                    "air_date" = EXCLUDED."air_date",
                    "vote_average" = EXCLUDED."vote_average"
                RETURNING "id"
            `, [season.id, serieId, season.season_number, season.overview, season.poster_path, season.air_date, season.vote_average, 0]);

            const seasonId = seasonRows[0].id;

            for (const episode of season.episodes) {
                await Query(`
                    INSERT INTO "Episode" ("tmdb_id", "season_id", "number", "title", "overview", "name", "runtime", "still_path")
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT ("tmdb_id") DO UPDATE
                    SET "runtime" = EXCLUDED."runtime",
                        "still_path" = EXCLUDED."still_path"
                `, [episode.id, seasonId, episode.episode_number, episode.name, episode.overview, episode.name, episode.runtime, episode.still_path]);
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
            WITH SerieData AS (
                SELECT
                    s.id AS "serie_id",
                    s.tmdb_id,
                    s.title,
                    s.overview,
                    s.poster AS "poster_path",
                    s.backdrop AS "backdrop_path",
                    s.media AS "media_type",
                    s.original_name,
                    s.status,
                    s.first_air_date,
                    s.last_air_date,
                    s.total_time,
                    s.nb_seasons,
                    s.nb_episodes,
                    s.episode_run_time
                FROM "Serie" s
                WHERE s.tmdb_id = $1
            ),
            Genres AS (
                SELECT
                    g.id AS "genre_id",
                    g.name AS "genre_name"
                FROM "Genre" g
                JOIN "Genre_serie" gs ON g.id = gs."genreId"
                WHERE gs."serieId" = (SELECT "serie_id" FROM SerieData)
                GROUP BY g.id, g.name
            ),
            Languages AS (
                SELECT
                    l.id AS "language_id",
                    l.name AS "language_name"
                FROM "Language" l
                JOIN "Language_serie" ls ON l.id = ls."languageId"
                WHERE ls."serieId" = (SELECT "serie_id" FROM SerieData)
                GROUP BY l.id, l.name
            ),
            Countries AS (
                SELECT
                    c.id AS "country_id",
                    c.name AS "country_name"
                FROM "Country" c
                JOIN "ProductionCountry_serie" pc ON c.id = pc."countryId"
                WHERE pc."serieId" = (SELECT "serie_id" FROM SerieData)
                GROUP BY c.id, c.name
            ),
            Companies AS (
                SELECT
                    pc.id AS "company_id",
                    pc.name AS "company_name"
                FROM "ProductionCompany" pc
                JOIN "ProductionCompany_serie" pcs ON pc.id = pcs."productionCompanyId"
                WHERE pcs."serieId" = (SELECT "serie_id" FROM SerieData)
                GROUP BY pc.id, pc.name
            ),
            Seasons AS (
                SELECT
                    s.id AS "season_id",
                    s.tmdb_id,
                    s.serie_id,
                    s.number AS "season_number",
                    s.overview,
                    s.poster_path,
                    s.air_date,
                    s.vote_average,
                    s.total_time
                FROM "Season" s
                WHERE s.serie_id = (SELECT "serie_id" FROM SerieData)
            ),
            Episodes AS (
                SELECT
                    e.id AS "episode_id",
                    e.season_id,
                    e.number AS "episode_number",
                    e.title,
                    e.overview,
                    e.name,
                    e.runtime,
                    e.still_path
                FROM "Episode" e
                JOIN "Season" s ON e.season_id = s.id
                WHERE s.serie_id = (SELECT "serie_id" FROM SerieData)
            )
            SELECT
                sd."serie_id",
                sd.tmdb_id,
                sd.title,
                sd.overview,
                sd."poster_path",
                sd."backdrop_path",
                sd."media_type",
                sd.original_name,
                sd.status,
                sd.first_air_date,
                sd.last_air_date,
                sd.total_time,
                sd.nb_seasons,
                sd.nb_episodes,
                sd.episode_run_time,
                (
                    SELECT json_agg(json_build_object('id', g."genre_id", 'name', g."genre_name"))
                    FROM Genres g
                ) AS "genres",
                (
                    SELECT json_agg(json_build_object('id', l."language_id", 'name', l."language_name"))
                    FROM Languages l
                ) AS "spoken_languages",
                (
                    SELECT json_agg(json_build_object('id', c."country_id", 'name', c."country_name"))
                    FROM Countries c
                ) AS "production_countries",
                (
                    SELECT json_agg(json_build_object('id', p."company_id", 'name', p."company_name"))
                    FROM Companies p
                ) AS "production_companies",
                (
                    SELECT json_agg(json_build_object(
                        'id', s."season_id",
                        'tmdb_id', s.tmdb_id,
                        'number', s."season_number",
                        'overview', s.overview,
                        'poster_path', s.poster_path,
                        'air_date', s.air_date,
                        'vote_average', s.vote_average,
                        'total_time', s.total_time,
                        'episodes', (
                            SELECT json_agg(json_build_object(
                                'id', e."episode_id",
                                'season_id', e.season_id,
                                'number', e."episode_number",
                                'title', e.title,
                                'overview', e.overview,
                                'name', e.name,
                                'runtime', e.runtime,
                                'still_path', e.still_path
                            ))
                            FROM Episodes e
                            WHERE e.season_id = s."season_id"
                        )
                    ))
                    FROM Seasons s
                ) AS "seasons"
            FROM SerieData sd
        `, [tmdb_id]);

        if (result.rows.length === 0) {
            throw new Error(`Aucune série trouvée pour TMDB ID: ${tmdb_id}`);
        }

        return result.rows[0] as Serie;
    } catch (error) {
        console.error('Erreur lors de la récupération des informations de la série:', error);
        throw error;
    }
}

export async function getTmdbIdsSeries() {
    const bddResponse = await Query(`select tmdb_id from "Serie"`);
    return bddResponse.rows[0] as number[];
}