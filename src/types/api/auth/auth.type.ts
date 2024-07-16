import { ApiResponse } from "../api.response.type";

/**
 * Type qui définit une réponse pour les routes de l'API 'auth'
 * Utilisé dans :
 *  - POST : /api/auth/login
 *  - POST : /api/auth/logout
 *  - POST : /api/auth/register
 */
type AuthResponse = ApiResponse & {
    redirect: string; // Chemin de redirection suite à la requête de login/register/logout
}

type LoginResponse = AuthResponse & {
    cookie: string; // Le cookie de connexion de la personne.
}

export type {
    AuthResponse,
    LoginResponse
};

