import Query from '../postgre.middleware';

/**
 * Fonction qui permet de récupérer le nombre total de séries.
 * @returns 
 */
export async function getNbTotalSeries(){
    const bddResponse = await Query(`select count(*) from "Serie";`);
    return bddResponse.rows[0].count;
}

/**
 * Fonction qui permet de récupérer le nombre total de séries suivies par un utilisateur.
 * @param {number} userId 
 * @returns 
 */
export async function getNbTotalSeriesFollowed(userId: string){
    const bddResponse = await Query(`select count(*) from "User_serie" where "user_id" = $1;`, [userId]);
    return bddResponse.rows[0].count;
}

/**
 * Fonction qui permet de récupérer le nombre total de séries par genre.
 * @param {number} genreId 
 * @param {string} userId 
 * @returns 
 */
export async function getNbTotalSeriesByGenre(genreId: number, userId?: string){
    let query = `select count(*) from "Genre_serie" where "genreId" = $1`;
    let params = [genreId];

    if (userId) {
        query += ` and "serie_id" in (select "serie_id" from "User_serie" where "user_id" = $2)`;
        params.push(Number(userId));
    }

    const bddResponse = await Query(query, params);
    return bddResponse.rows[0].count;
}

/**
 * Fonction qui permet de récupérer le nombre total de séries par pays.
 * @param {number} countryId 
 * @param {string} userId 
 * @returns 
 */
export async function getNbTotalSeriesByCountry(countryId: number, userId?: string){
    let query = `select count(*) from "OriginCountry_serie" where "countryId" = $1`;
    let params = [countryId];

    if (userId) {
        query += ` and "serie_id" in (select "serie_id" from "User_serie" where "user_id" = $2)`;
        params.push(Number(userId));
    }

    const bddResponse = await Query(query, params);
    return bddResponse.rows[0].count;
}

/**
 * Fonction qui permet de récupérer le nombre total de séries par compagnie de production.
 * @param {number} companyId 
 * @param {string} userId 
 * @returns 
 */
export async function getNbTotalSeriesByCompany(companyId: number, userId?: string){
    let query = `select count(*) from "ProductionCompany_serie" where "productionCompanyId" = $1`;
    let params = [companyId];

    if (userId) {
        query += ` and "serie_id" in (select "serie_id" from "User_serie" where "user_id" = $2)`;
        params.push(Number(userId));
    }

    const bddResponse = await Query(query, params);
    return bddResponse.rows[0].count;
}

/**
 * Fonction qui permet de récupérer le nombre total de séries par langue.
 * @param {number} languageId 
 * @param {string} userId 
 * @returns 
 */
export async function getNbTotalSeriesByLanguage(languageId: number, userId?: string){
    let query = `select count(*) from "Language_serie" where "languageId" = $1`;
    let params = [languageId];

    if (userId) {
        query += ` and "serie_id" in (select "serie_id" from "User_serie" where "user_id" = $2)`;
        params.push(Number(userId));
    }

    const bddResponse = await Query(query, params);
    return bddResponse.rows[0].count;
}

/**
 * Fonction qui permet de récupérer le nombre total de séries par statut.
 * @param {string} status 
 * @param {string} userId 
 * @returns 
 */
export async function getNbTotalSeriesByStatus(status: string, userId?: string){
    let query = `select count(*) from "Serie" where "status" = $1`;
    let params = [status];

    if (userId) {
        query += ` and "id" in (select "serie_id" from "User_serie" where "user_id" = $2)`;
        params.push(userId);
    }

    const bddResponse = await Query(query, params);
    return bddResponse.rows[0].count;
}

/**
 * Fonction qui permet de récupérer le nombre total de séries par note.
 * @param {number} note 
 * @param {string} userId 
 * @returns 
 */
export async function getNbTotalSeriesByNote(note: number, userId: string){
    const bddResponse = await Query(`select count(*) from "Serie" as "s" 
        JOIN "User_serie" as "us" ON "s"."id" = "us"."serie_id"
        JOIN "User_note" as "un" ON "s"."id" = "un"."serie_id"
        where "us"."user_id" = $1 AND "un"."note" >= $2 AND "un"."note" < $2 + 1`, [userId, note]);
}

/**
 * Fonction qui permet de récupérer le nombre total de séries par année.
 * @param {number} year 
 * @param {string} userId 
 * @returns 
 */
export async function getNbTotalSeriesByYear(year: number, userId?: string){
    let query = `select count(*) from "Serie" where "first_air_date" = $1`;
    let params = [year];

    if (userId) {
        query += ` and "id" in (select "serie_id" from "User_serie" where "user_id" = $2)`;
        params.push(Number(userId));
    }

    const bddResponse = await Query(query, params);
    return bddResponse.rows[0].count;
}

/**
 * Fonction qui permet de récupérer le nombre total de séries par nombre de saisons.
 * @param {number} nbSeason 
 * @param {string} userId 
 * @returns 
 */
export async function getNbTotalSeriesByNbSeason(nbSeason: number, userId?: string){
    let query = `select count(*) from "Serie" where "nb_seasons" = $1`;
    let params = [nbSeason];

    if (userId) {
        query += ` and "id" in (select "serie_id" from "User_serie" where "user_id" = $2)`;
        params.push(Number(userId));
    }

    const bddResponse = await Query(query, params);
    return bddResponse.rows[0].count;
}

/**
 * Fonction qui permet de récupérer le nombre total de séries par nombre d'épisodes.
 * @param {number} nbEpisode 
 * @param {string} userId 
 * @returns 
 */
export async function getNbTotalSeriesByNbEpisode(nbEpisode: number, userId?: string){
    let query = `select count(*) from "Serie" where "nb_episodes" = $1`;
    let params = [nbEpisode];

    if (userId) {
        query += ` and "id" in (select "serie_id" from "User_serie" where "user_id" = $2)`;
        params.push(Number(userId));
    }

    const bddResponse = await Query(query, params);
    return bddResponse.rows[0].count;
}

/**
 * Fonction qui permet de récupérer le nombre total de séries par type de média.
 * @param {string} media 
 * @param {string} userId 
 * @returns 
 */
export async function getNbTotalSeriesByMedia(media: string, userId?: string){
    let query = `select count(*) from "Serie" where "media" = $1`;
    let params = [media];

    if (userId) {
        query += ` and "id" in (select "serie_id" from "User_serie" where "user_id" = $2)`;
        params.push(userId);
    }

    const bddResponse = await Query(query, params);
    return bddResponse.rows[0].count;
}