import { Pool, QueryConfig, QueryResult } from "pg";

const userPool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    // user: process.env.DB_USER,
    // password: process.env.DB_PASS,
    // host: process.env.DB_HOST,
    // database: process.env.DB_NAME,
    // port: parseInt(process.env.DB_PORT as string)
});

/**
 * Fonction qui permet de faire une requêtre à la bdd postgreSQL.
 * 
 * @param query - La requête à faire
 * @param params - Les paramètres de la requête (optionnel)
 * @returns La réponse à la requête
 */
async function Query(query: string, params?: any[]): Promise<QueryResult> {
    const queryConfig: QueryConfig = { text: query };
    if (params) {
        queryConfig.values = params;
    }
    return await userPool.query(queryConfig);
}

export default Query;