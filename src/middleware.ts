import { NextRequest, NextResponse } from "next/server";
import { SESSION_ID_COOKIE } from "@/constants/session.const";
import { ERROR_ROUTE, HOME_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE } from "./constants/app.route.const";
import { User } from "./bdd/model/user";
import { deleteVerifToken } from "./bdd/requests/user.request";

/**
 * Middleware appelé automatiquement au chargement de n'importe quel page pour vérifier si l'utilisateur à 
 * un cookie de session avant de la charger.
 * Si l'utilisateur n'a pas de cookie de session il est amené à la page home ou connexion.
 * Si l'utilisateur a un cookie de session il est amené à la page home s'il est sur login ou register.
 * 
 * La redirection s'effectue dans deux cas :
 *  - Lorsque l'utilisation n'a pas de cookie de session, les routes accessibles sont :
 *    - auth/login
 *    - auth/register
 *   - /home
 *  - /mentions
 *  - Lorsque l'utilisateur a accès à un cookie de session, les routes accessibles sont :
 *    - /
 *    - /project/
 *    - api/
 * 
 * @param req - La requête de chargement d'une route.
 * @returns Une redirection vers la bonne page.
 */
export default async function userAsASessionIDMiddleware(req: NextRequest) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Si c'est une route de nextJS
    if (req.url.includes('_next') || req.url.includes('api') || req.url.includes('manifest.json') || req.url.includes('favicon.json') || req.url.includes('assets')) {
        return NextResponse.next();
    }

    if (req.url.match("/404") !== null) { return NextResponse.next(); }

    const isRoute = await isARoute(req);
    if (!isRoute) { return NextResponse.redirect(new URL(`${ERROR_ROUTE}`, req.url)); }

    const sessionID = req.cookies.get(SESSION_ID_COOKIE);
    const isLoginRoute = req.url.includes('user/login');
    const isRegisterRoute = req.url.includes('user/register');
    const isHomeRoute = pathname === "/";
    const isMentionsRoute = req.url.includes('mentions');
    const isAboutRoute = req.url.includes('about');
    const isSearchRoute = req.url.includes('series/search');
    const isDetailsRoute = req.url.includes('series/') && !req.url.includes('series/mylist');
    const isResetRoute = req.url.includes('user/reset-password');
    
    if (sessionID === undefined) {
        // Autorisation seulement de la route LOGIN
        if (isLoginRoute || isRegisterRoute || isHomeRoute || isMentionsRoute || isAboutRoute || isSearchRoute || isDetailsRoute || isResetRoute) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL(`${LOGIN_ROUTE}`, req.url));
    }

    // Si l'utilisateur a un cookie de session
    if (sessionID !== undefined) {
        const userResponse = await fetch(new URL(`/api/${encodeURIComponent(sessionID.value)}/user/load`, req.url));
        const userInfo = await userResponse.json() as User;
        
        // Vérifier si l'utilisateur est banni
        if (userInfo.banned) {
            return NextResponse.redirect(new URL(`${ERROR_ROUTE}`, req.url));
        }

        // Gestion des routes admin
        const isAdminRoute = req.url.includes('admin');
        if (!userInfo.admin) {
            if (isAdminRoute) {
                return NextResponse.redirect(new URL(`${HOME_ROUTE}`, req.url));
            }
        }

        // Interdiction de la route login et register
        if (isLoginRoute || isRegisterRoute) {
            return NextResponse.redirect(new URL(`${HOME_ROUTE}`, req.url));
        }
    }
}

/**
 * Vérifie si la route est une route valide.
 * @param req 
 * @returns 
 */
async function isARoute(req: NextRequest) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    const isLoginRoute = pathname === "/user/login";
    const isRegisterRoute = pathname === "/user/register";
    const isHomeRoute = pathname === "/";
    const isMentionsRoute = pathname === "/mentions";
    const isAboutRoute = pathname === "/about";
    const isSearchRoute = pathname === "/series/search";
    const isMyListRoute = pathname === "/series/mylist";
    const isImportRoute = pathname === "/admin/import";
    const isUserListRoute = pathname === "/admin/users";
    const isAdminRoute = pathname === "/admin";

    if (isLoginRoute || isRegisterRoute || isHomeRoute || isMentionsRoute || isAboutRoute || isImportRoute || isSearchRoute || isMyListRoute || isUserListRoute || isAdminRoute) {
        return true;
    }

    const serieId = pathname.split("/series/")[1];
    if (serieId) {
        const serieExists = await checkSerieExists(serieId, req.url);
        if (serieExists) {
            return true;
        }
    }

    const username = pathname.split("/user/profil/")[1];
    if (username) {
        const userExists = await checkUserExists(username, req.url);
        if (userExists) {
            const sessionID = req.cookies.get(SESSION_ID_COOKIE);
            if (sessionID) {
                const userResponse = await fetch(new URL(`/api/${encodeURIComponent(sessionID.value)}/user/load`, req.url));
                const userInfo = await userResponse.json() as User;
                if (userInfo.admin || userInfo.login === username) {
                    return true;
                }
            }
        }
    }

    const isVerifRoute = pathname === "/verify-email";
    if(isVerifRoute){
        const verifToken = url.searchParams.get("token") ?? ""
        const userExist = await checkVerifTokenExists(verifToken, req.url);
        if(userExist){
            const response = await fetch(new URL(`/api/user/auth/verifToken`, req.url), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ verifToken: verifToken })
            });
            if(response.status === 200) return NextResponse.redirect(new URL(`${LOGIN_ROUTE}`, req.url));
            return NextResponse.redirect(new URL(`${REGISTER_ROUTE}`, req.url));
        }
    }

    const isResetRoute = pathname === "/user/reset-password";
    if(isResetRoute){
        const resetToken = url.searchParams.get("token") ?? ""
        const userExist = await checkResetTokenExists(resetToken, req.url);
        if(userExist){
            return true;
        }
    }

    return false;
}

/**
 * Vérifie si l'utilisateur existe.
 * @param username 
 * @param reqUrl 
 * @returns 
 */
async function checkUserExists(username: string, reqUrl: string): Promise<boolean> {
    const response = await fetch(new URL(`/api/user?username=${encodeURIComponent(username)}`, reqUrl));
    if (response.status === 400) { return false; }
    const data = await response.json();
    return data !== undefined;
}

/**
 * Vérifie si la série existe.
 * @param serieId 
 * @param reqUrl 
 * @returns 
 */
async function checkSerieExists(serieId: string, reqUrl: string): Promise<boolean> {
    const response = await fetch(new URL(`/api/series/${encodeURIComponent(serieId)}/exists`, reqUrl));
    if (response.status === 400) { return false; }
    const data = await response.json();
    return data;
}

/**
 * Vérifie si le token de vérification existe.
 * @param token 
 * @param reqUrl 
 * @returns 
 */
async function checkVerifTokenExists(token: string, reqUrl: string): Promise<Boolean> {
    const response = await fetch(new URL(`/api/user/auth/verifToken?verifToken=${encodeURIComponent(token)}`, reqUrl));
    if (response.status === 400) { return false; }
    const data = await response.json();
    return data !== undefined;
}

/**
 * Vérifie si le token de reset mdp existe.
 * @param token 
 * @param reqUrl 
 * @returns 
 */
async function checkResetTokenExists(token: string, reqUrl: string): Promise<Boolean> {
    const response = await fetch(new URL(`/api/user/auth/resetToken?resetToken=${encodeURIComponent(token)}`, reqUrl));
    if (response.status === 400) { return false; }
    const data = await response.json();
    return data !== undefined;
}