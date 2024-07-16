import { NextRequest, NextResponse } from "next/server";
import { SESSION_ID_COOKIE } from "@/constants/session.const";
import { LOGIN_ROUTE } from "./constants/app.route.const";

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
    // Si c'est une route de nextJS
    if (req.url.includes('_next')) { return NextResponse.next(); }
    if (req.url.includes('api')) { return NextResponse.next(); }
    if (req.url.includes('manifest.json')) { return NextResponse.next(); }
    if (req.url.includes('favicon.json')) { return NextResponse.next(); }
    if (req.url.includes('assets')) { return NextResponse.next(); }

    const sessionID = req.cookies.get(SESSION_ID_COOKIE);
    const isLoginRoute = req.url.includes('user/login');
    const isRegisterRoute = req.url.includes('user/register');
    const isHomeRoute = req.url.includes('home');
    const isMentionsRoute = req.url.includes('mentions');
    if (sessionID === undefined) {
        // Autorisation seulement de la route LOGIN
        if (isLoginRoute) { return NextResponse.next(); }
        if (isRegisterRoute) { return NextResponse.next(); }
        if (isHomeRoute) { return NextResponse.next(); }
        if (isMentionsRoute) { return NextResponse.next(); }
        return NextResponse.redirect(new URL(`${LOGIN_ROUTE}?errmsg=${encodeURIComponent('Cookie de session expiré !')}`, req.url));
    }
    //TODO
}

/**
 * Middleware appelé automatiquement au chargement de n'importe quel page projet.
 * Il permet de vérifier si l'utilisateur à le droit d'accéder au projet.
 * Si l'utilisateur possède les droits il est redirigé, sinon, il est ramené à la page d’accueil.
 *
 * @param {NextRequest} req - La requête initiale
 * @param {string} session_cookie - Le cookie de session de la personne.
 * @return {*} La réponse du serveur en fonction des droits d'accès au projet de la personne.
 */
async function userAsAccessToProjectMiddleware(req: NextRequest, session_cookie: string, userBanned: boolean) {


    if(userBanned){
        
    }
}