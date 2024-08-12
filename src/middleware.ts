import { NextRequest, NextResponse } from "next/server";
import { SESSION_ID_COOKIE } from "@/constants/session.const";
import { ERROR_ROUTE, HOME_ROUTE, LOGIN_ROUTE } from "./constants/app.route.const";
import { User } from "./bdd/model/user";

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
    if (req.url.includes('_next')) { return NextResponse.next(); }
    if (req.url.includes('api')) { return NextResponse.next(); }
    if (req.url.includes('manifest.json')) { return NextResponse.next(); }
    if (req.url.includes('favicon.json')) { return NextResponse.next(); }
    if (req.url.includes('assets')) { return NextResponse.next(); }

    if (req.url.match("/404") !== null) { return NextResponse.next(); }
    const isRoute = await isARoute(req);
    if(!isRoute){  return NextResponse.redirect(new URL(`${ERROR_ROUTE}`, req.url)); }
    
    const sessionID = req.cookies.get(SESSION_ID_COOKIE);
    const isLoginRoute = req.url.includes('user/login');
    const isRegisterRoute = req.url.includes('user/register');
    const isHomeRoute = pathname === "/";
    const isMentionsRoute = req.url.includes('mentions');
    const isAboutRoute = req.url.includes('about');
    if (sessionID === undefined) {
        // Autorisation seulement de la route LOGIN
        if (isLoginRoute) { return NextResponse.next(); }
        if (isRegisterRoute) { return NextResponse.next(); }
        if (isHomeRoute) { return NextResponse.next(); }
        if (isMentionsRoute) { return NextResponse.next(); }
        if (isAboutRoute) { return NextResponse.next(); }
        return NextResponse.redirect(new URL(`${LOGIN_ROUTE}`, req.url));
    }
    
    // Si l'utilisateur a un cookie de session
    if (sessionID !== undefined) {

        const userResponse = await fetch(new URL(`/api/${encodeURIComponent(sessionID.value)}/user/load`, req.url));
        const userInfo = await userResponse.json() as User;
        // Vérifier si l'utilisateur est banni
        if(userInfo.banned){
            return NextResponse.redirect(new URL(`${ERROR_ROUTE}`, req.url));
        }

        // Gestion des routes admin
        const isAdminRoute = req.url.includes('admin');
        if(!userInfo.admin){
            if(isAdminRoute){ return NextResponse.redirect(new URL(`${HOME_ROUTE}`, req.url) );}
        }

        // Intediction de la route login et register
        if (isLoginRoute) { return NextResponse.redirect(new URL(`${HOME_ROUTE}`, req.url)); }
        if (isRegisterRoute) { NextResponse.redirect(new URL(`${HOME_ROUTE}`, req.url)); }
    }
}


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
    const isUserProfileRoute = pathname.startsWith("/user/profil/");

    if(isLoginRoute || isRegisterRoute || isHomeRoute || isMentionsRoute || isAboutRoute || isImportRoute || isSearchRoute || isMyListRoute || isUserListRoute || isAdminRoute){
        return true;
    }

    if (isUserProfileRoute) {
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
    }
    return false;
}

async function checkUserExists(username: string, reqUrl: string): Promise<boolean> {
    const response = await fetch(new URL(`/api/user?username=${encodeURIComponent(username)}`, reqUrl));
    if(response.status === 400){ return false}
    const data = await response.json();
    return data !== undefined;
}