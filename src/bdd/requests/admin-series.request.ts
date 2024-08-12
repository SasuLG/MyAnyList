import { Serie, TmdbId } from '@/tmdb/types/series.type';
import Query from '../postgre.middleware';

/**
 * Fonction qui permet d'ajouter une série à la base de données.
 * @param {Serie} serieData - Les données de la série à importer.
 */
export async function importSerie(serieData: Serie) {
    const {
        id, name, overview, poster_path, backdrop_path, media_type, original_name, status,
        first_air_date, last_air_date, episode_run_time, number_of_seasons, number_of_episodes, genres,
        spoken_languages, production_countries, production_companies, seasons, vote_average, vote_count, origin_country,
        popularity, budget, revenue, total_time, tags, romaji_name
    } = serieData;

    try {
        // Insertion ou mise à jour de la série
        const { rows: serieRows } = await Query(`
            INSERT INTO "Serie" ("tmdb_id", "title", "overview", "poster", "backdrop", "media", "original_name", "status", "first_air_date", "last_air_date", "episode_run_time", "nb_seasons", "nb_episodes", "vote_average", "vote_count", "popularity", "budget", "revenue", "total_time", "romaji_name")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
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
                "revenue" = EXCLUDED."revenue",
                "romaji_name" = EXCLUDED."romaji_name"
            RETURNING "id"
        `, [id, name, overview, poster_path, backdrop_path, media_type, original_name, status, first_air_date, last_air_date, episode_run_time, number_of_seasons, number_of_episodes, vote_average, vote_count, popularity, budget, revenue, total_time, romaji_name]);

        if (serieRows.length === 0) {
            throw new Error('Impossible de récupérer l\'ID de la série après l\'insertion.');
        }

        const serieId = serieRows[0].id;

        // Gestion des genres
        for (const genre of genres) {
            const { rows: genreRows } = await Query(`
                INSERT INTO "Genre" ("tmdb_id", "name")
                VALUES ($1, $2)
                ON CONFLICT ("name") DO NOTHING
                RETURNING "id"
            `, [genre.id, genre.name]);

            let genreId;
            if (genreRows.length > 0) {
                genreId = genreRows[0].id;
            } else {
                const { rows: existingGenreRows } = await Query(`
                    SELECT "id" FROM "Genre" WHERE "tmdb_id" = $1
                `, [genre.id]);

                if (existingGenreRows.length === 0) {
                    throw new Error(`Genre non trouvé pour tmdb_id: ${genre.id}`);
                }
                genreId = existingGenreRows[0].id;
            }

            await Query(`
                INSERT INTO "Genre_serie" ("serieId", "genreId")
                VALUES ($1, $2)
                ON CONFLICT ("serieId", "genreId") DO NOTHING
            `, [serieId, genreId]);
        }

        // Gestion des langues
        for (const language of spoken_languages) {
            const { rows: languageRows } = await Query(`
                INSERT INTO "Language" ("iso_639_1", "name", "english_name")
                VALUES ($1, $2, $3)
                ON CONFLICT ("iso_639_1") DO NOTHING
                RETURNING "id"
            `, [language.iso_639_1, language.name, language.english_name]);

            let languageId;
            if (languageRows.length > 0) {
                languageId = languageRows[0].id;
            } else {
                const { rows: existingLanguageRows } = await Query(`
                    SELECT "id" FROM "Language" WHERE "iso_639_1" = $1
                `, [language.iso_639_1]);

                if (existingLanguageRows.length === 0) {
                    throw new Error(`Langue non trouvée pour iso_639_1: ${language.iso_639_1}`);
                }
                languageId = existingLanguageRows[0].id;
            }

            await Query(`
                INSERT INTO "Language_serie" ("serieId", "languageId")
                VALUES ($1, $2)
                ON CONFLICT ("serieId", "languageId") DO NOTHING
            `, [serieId, languageId]);
        }

        // Gestion des pays de production
        for (const country of production_countries) {
            const { rows: countryRows } = await Query(`
                INSERT INTO "Country" ("name", "iso_3166_1")
                VALUES ($1, $2)
                ON CONFLICT ("iso_3166_1") DO NOTHING
                RETURNING "id"
            `, [country.name, country.iso_3166_1]);

            let countryId;
            if (countryRows.length > 0) {
                countryId = countryRows[0].id;
            } else {
                const { rows: existingCountryRows } = await Query(`
                    SELECT "id" FROM "Country" WHERE "iso_3166_1" = $1
                `, [country.iso_3166_1]);

                if (existingCountryRows.length === 0) {
                    throw new Error(`Pays non trouvé pour iso_3166_1: ${country.iso_3166_1}`);
                }
                countryId = existingCountryRows[0].id;
            }

            await Query(`
                INSERT INTO "ProductionCountry_serie" ("serieId", "countryId")
                VALUES ($1, $2)
                ON CONFLICT ("serieId", "countryId") DO NOTHING
            `, [serieId, countryId]);

            if (origin_country.includes(country.iso_3166_1)) {
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
                ON CONFLICT ("name") DO UPDATE
                SET "tmdb_id" = EXCLUDED."tmdb_id"
                RETURNING "id"
            `, [company.id, company.name]);

            let companyId;
            if (companyRows.length > 0) {
                companyId = companyRows[0].id;
            } else {
                const { rows: existingCompanyRows } = await Query(`
                    SELECT "id" FROM "ProductionCompany" WHERE "name" = $1
                `, [company.name]);

                if (existingCompanyRows.length === 0) {
                    throw new Error(`Société non trouvée pour le nom: ${company.name}`);
                }
                companyId = existingCompanyRows[0].id;
            }

            await Query(`
                INSERT INTO "ProductionCompany_serie" ("serieId", "productionCompanyId")
                VALUES ($1, $2)
                ON CONFLICT ("serieId", "productionCompanyId") DO NOTHING
            `, [serieId, companyId]);
        }

        // Gestion des tags
        for (const tag of tags) {
            const { rows: tagRows } = await Query(`
                INSERT INTO "Tag" ("name")
                VALUES ($1)
                ON CONFLICT ("name") DO NOTHING
                RETURNING "id"
            `, [tag.name]);

            let tagId;
            if (tagRows.length > 0) {
                tagId = tagRows[0].id;
            } else {
                const { rows: existingTagRows } = await Query(`
                    SELECT "id" FROM "Tag" WHERE "name" = $1
                `, [tag.name]);

                if (existingTagRows.length === 0) {
                    throw new Error(`Tag non trouvé pour le nom: ${tag.name}`);
                }
                tagId = existingTagRows[0].id;
            }

            await Query(`
                INSERT INTO "Tag_serie" ("serieId", "tagId")
                VALUES ($1, $2)
                ON CONFLICT ("serieId", "tagId") DO NOTHING
            `, [serieId, tagId]);
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

            if (seasonRows.length === 0) {
                throw new Error(`Impossible de récupérer l'ID de la saison après l'insertion. tmdb_id: ${season.id}`);
            }

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



/**
 * Fonction qui permet de supprimer une série de la base de données.
 * @param {number} serieId - L'identifiant de la série à supprimer.
 */
export async function deleteSerie(serieId: number) {
    try {
        // Suppression des associations dans la table User_serie
        await Query(`
            DELETE FROM "User_serie"
            WHERE "serie_id" = $1
        `, [serieId]);

        // Suppression des épisodes
        await Query(`
            DELETE FROM "Episode"
            WHERE "season_id" IN (
                SELECT "id" FROM "Season" WHERE "serie_id" = $1
            )
        `, [serieId]);

        // Suppression des saisons
        await Query(`
            DELETE FROM "Season"
            WHERE "serie_id" = $1
        `, [serieId]);

        // Suppression des associations dans la table Genre_serie
        await Query(`
            DELETE FROM "Genre_serie"
            WHERE "serieId" = $1
        `, [serieId]);

        // Suppression des associations dans la table Tag_serie
        await Query(`
            DELETE FROM "Tag_serie"
            WHERE "serieId" = $1
        `, [serieId]);

        // Suppression des associations dans la table Language_serie
        await Query(`
            DELETE FROM "Language_serie"
            WHERE "serieId" = $1
        `, [serieId]);

        // Suppression des associations dans la table ProductionCountry_serie
        await Query(`
            DELETE FROM "ProductionCountry_serie"
            WHERE "serieId" = $1
        `, [serieId]);

        // Suppression des associations dans la table OriginCountry_serie
        await Query(`
            DELETE FROM "OriginCountry_serie"
            WHERE "serieId" = $1
        `, [serieId]);

        await Query(`
            DELETE FROM "Country_serie"
            WHERE "serieId" = $1
        `, [serieId]);

        // Suppression des associations dans la table ProductionCompany_serie
        await Query(`
            DELETE FROM "ProductionCompany_serie"
            WHERE "serieId" = $1
        `, [serieId]);

        await Query(`
            DELETE FROM "User_note"
            WHERE "serie_id" = $1
        `, [serieId]);

        // Suppression de la série
        await Query(`
            DELETE FROM "Serie"
            WHERE "id" = $1
        `, [serieId]);

        console.log(`La série avec l'ID ${serieId} a été supprimée avec succès.`);
    } catch (error) {
        console.error('Erreur lors de la suppression de la série:', error);
        throw error;
    }
}


/**
 * Récupère les identifiants TMDB des séries.
 * @returns Les identifiants TMDB des séries.
 */
export async function getTmdbIdsSeries() {
    const bddResponse = await Query(`select tmdb_id from "Serie"`);
    return bddResponse.rows as TmdbId[];
}