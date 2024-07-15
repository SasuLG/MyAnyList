import Query from "../postgre.middleware";

/**
 * Fonction qui permet de créer un utilisateur
 * @param username - Le nom d'utilisateur
 * @param email - L'adresse email
 * @param password - Le mot de passe
 */
export async function createUser(login: string,  password: string): Promise<any> {
    await Query('INSERT INTO "User" ("login", "password") VALUES ($1, $2)', [login, password]);
}