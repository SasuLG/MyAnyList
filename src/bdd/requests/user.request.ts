import { User } from "../model/user";
import Query from "../postgre.middleware";

/**
 * Fonction qui permet de créer un utilisateur
 * @param {string} username - Le nom d'utilisateur
 * @param {string} password - Le mot de passe
 * @param {string} email - L'email de l'utilisateur
 * @param {string} verifToken - Le token de vérification de l'utilisateur
 */
export async function createUser(login: string,  password: string, email: string, verifToken: string): Promise<any> {
    await Query('INSERT INTO "User" ("login", "password", "email", "verifToken") VALUES ($1, $2, $3, $4)', [login, password, email, verifToken]);
}

/**
 * Fonction qui permet de récupérer un utilisateur par son 'login'.
 * ! Le login est unique dans la bdd !
 *
 * @param {string} login - L'identifiant de connexion de la personne.
 * @return {User | undefined} L'utilisateur si trouvé ou undefined.
 */
export async function getUserByLogin(login: string): Promise<User | undefined> {
    const bddResponse = await Query(`select * from "User" where "login"=$1;`, [login]);
    return bddResponse.rows[0] as User | undefined;
}

/**
 * Fonction qui permet de récupérer un utilisateur par son 'email'.
 * ! L'email est unique dans la bdd !
 *
 * @param {string} email - L'email de la personne.
 * @return {User | undefined} L'utilisateur si trouvé ou undefined.
 */
export async function getUserByMail(email: string): Promise<User | undefined> {
    const bddResponse = await Query(`select * from "User" where "email"=$1;`, [email]);
    return bddResponse.rows[0] as User | undefined;
}

/**
 * Fonction qui permet de récupérer un utilisateur par son 'id'.
 * ! L'id est unique dans la bdd !
 *
 * @param {number} id - L'identifiant de la personne.
 * @return {User | undefined} L'utilisateur si trouvé ou undefined.
 */
export async function getUserById(id: number): Promise<User | undefined> {
    const bddResponse = await Query(`select * from "User" where "id"=$1;`, [id]);
    return bddResponse.rows[0] as User | undefined;
}

/**
 * Fonction qui permet de récupérer tous les utilisateurs.
 * 
 * @return {User[]} La liste des utilisateurs.
 */
export async function getUsers(): Promise<User[]> {
    const bddResponse = await Query(`select * from "User";`);
    return bddResponse.rows as User[];
}

/**
 * Fonction qui permet de récupérer un utilisateur par son 'web_token'.
 * ! Le web_token est unique dans la bdd !
 *
 * @param {string} webToken - Le token de connexion de la personne.
 * @return {User | undefined} L'utilisateur si trouvé ou undefined.
 */
export async function getUserByToken(webToken: string): Promise<User | undefined> {
    const bddResponse = await Query(`select * from "User" where "web_token"=$1;`, [webToken]);
    return bddResponse.rows[0] as User | undefined;
}

/**
 * Fonction qui permet de récupérer un utilisateur par son 'verifToken'.
 * ! Le verifToken est unique dans la bdd !
 *
 * @param {string} verifToken - Le token de connexion de la personne.
 * @return {User | undefined} L'utilisateur si trouvé ou undefined.
 */
export async function getUserByVerifToken(verifToken: string): Promise<User | undefined> {
    const bddResponse = await Query(`select * from "User" where "verifToken"=$1;`, [verifToken]);
    return bddResponse.rows[0] as User | undefined;
}

/**
 * Fonction qui permet de vérifier si un utilisateur est un administrateur.
 * @param {number} id - L'identifiant de la personne.
 * @returns - true si l'utilisateur est un administrateur, false sinon.
 */
export async function isUserAdmin(id: number): Promise<boolean> {
    const bddResponse = await Query(`select "admin" from "User" where "id"=$1;`, [id]);
    return bddResponse.rows[0].admin;
}

/**
 * Fonction qui permet de vérifier si un utilisateur est banni.
 * @param {number} id - L'identifiant de la personne.
 * @returns 
 */
export async function isUserBanned(id: number): Promise<boolean> {
    const bddResponse = await Query(`select "banned" from "User" where "id"=$1;`, [id]);
    return bddResponse.rows[0].banned;
}

/**
 * Fonction qui permet de supprimer le verifToken de l'utilisateur par son verifToken
 * @param {number} verifToken - Le verifToken de l'utilisateur
 */
export async function deleteVerifToken(verifToken: string): Promise<void> {
    await Query(`update "User" set "verifToken"=null where "verifToken"=$1;`, [verifToken]);
}

/**
 * Fonction qui permet de mettre à jour le mot de passe d'un utilisateur.
 * 
 * @param {number} id - L'identifiant de la personne.
 * @param {string} password - Le nouveau mot de passe.
 */
export async function updateLogin(id: number, login: string): Promise<void> {
    await Query(`update "User" set "login"=$1 where "id"=$2;`, [login, id]);
}

/**
 * Fonction qui permet de mettre à jour le mot de passe d'une personne.
 *
 * @param {number} userId - L'id de la personne.
 * @param {string} password - Le nouveau mot de passe. (IL DOIT ETRE HASHE EN BCRYPT !)
 */
export async function updatePassword(userId: number, password: string) {
    await Query(`update "User" set "password"=$1 where "id"=$2;`, [password, userId]);
}


/**
 * Fonction qui permet de bannir un utilisateur.
 * 
 * @param {number} id - L'identifiant de la personne.
 */
export async function banUser(id: number): Promise<void> {
    await Query(`update "User" set "banned"=true where "id"=$1;`, [id]);
}

/**
 * Fonction qui permet de débannir un utilisateur.
 * 
 * @param {number} id - L'identifiant de la personne.
 */
export async function unbanUser(id: number): Promise<void> {
    await Query(`update "User" set "banned"=false where "id"=$1;`, [id]);
}

/**
 * Fonction qui permet de mettre à jour le 'web_token' d'un utilisateur.
 *
 * @param {User} user - L'utilisateur avec le 'web_token' à mettre à jour.
 * @param {string} webToken - La nouvelle valeur de 'web_token'.
 */
export async function updateUserWebToken(user: User, webToken: string) {
    await Query(`update "User" set "web_token"=$1 where "id"=$2;`, [webToken, user.id]);
}

/**
 * Fonction qui permet de supprimer la valeur d'un 'web_token' de la bdd.
 * ! Le 'web_token' est unique dans la bdd !
 *
 * @param {string} webToken - La valeur du 'web_token' à supprimer.
 */
export async function deleteWebToken(webToken: string) {
    await Query(`update "User" set "web_token"=null where "web_token"=$1;`, [webToken]);
}

/**
 * Fonction qui permet de modifier le nom d'un utilisateur.
 * @param {number} id - L'identifiant de l'utilisateur
 * @param {string} name - Le nouveau nom de l'utilisateur
 */
export async function editUserName(id: number, name: string) {
    await Query(`update "User" set "login"=$1 where "id"=$2;`, [name, id]);
}

/**
 * Fonction qui permet de modifier le mot de passe d'un utilisateur.
 * @param {number} id - L'identifiant de l'utilisateur
 * @param {string} password - Le nouveau mot de passe de l'utilisateur
 */
export async function editUserPassword(id: number, password: string) {
    await Query(`update "User" set "password"=$1 where "id"=$2;`, [password, id]);
}

/**
 * Fonction qui permet de mettre un utilisateur en administrateur.
 * @param {number} userId 
 */
export async function setAdmin(userId: number) {
    await Query(`update "User" set "admin"=true where "id"=$1;`, [userId]);
}

/**
 * Fonction qui permet de retirer les droits d'administrateur à un utilisateur.
 * @param {number} userId 
 */
export async function unsetAdmin(userId: number) {
    await Query(`update "User" set "admin"=false where "id"=$1;`, [userId]);
}

/**
 * Fonction qui permet de supprimer un utilisateur.
 * @param {string} userId 
 * @returns 
 */
export async function deleteUser(userId: string): Promise<boolean> {
    try {
        await Query(`
            DELETE FROM "User_serie"
            WHERE "user_id" = $1
        `, [userId]);
        
        await Query(`
            DELETE FROM "User_note"
            WHERE "user_id" = $1
        `, [userId]);

        await Query(`
            DELETE FROM "User"
            WHERE "id" = $1
        `, [userId]);

        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
        return false;
    }
}

/**
 * Fonction qui permet de récupérer tous les utilisateurs.
 * @returns 
 */
export async function getAllUsers(): Promise<User[]> {
    const bddResponse = await Query(`select * from "User";`);
    return bddResponse.rows as User[];
}

/**
 * Fonction qui permet de mettre à jour la date de dernière activité d'un utilisateur par son nom.
 * @param {number} username 
 */
export async function updateLastActivityByName(username: string) {
    await Query(`update "User" set "last_activity"=now() where "login"=$1;`, [username]);
}