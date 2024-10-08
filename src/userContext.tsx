"use client";

import { Dispatch, ReactNode, SetStateAction, createContext, useCallback, useContext, useEffect, useState } from "react";
import { User } from "./bdd/model/user";
import { ApiResponse } from "./types/api/api.response.type";
import { SESSION_ID_COOKIE } from "./constants/session.const";
import { getCookie } from "./lib/cookie";
import { getUserByToken } from "./bdd/requests/user.request";
import { getUserInfo } from "./bdd/miidleware/user.middleware";
import AlertBox from "./components/alert.box";
import { usePathname } from "next/navigation";
import { Header, MenuList } from "./components/header";
import { Footer } from "./components/footer";

/**
 * Interface qui décrit les éléments accessible depuis le context.
 *
 * @interface UserContextValue
 */
interface UserContextValue {
    userCookie: string; // La valeur do cookie de session de la personne.
    setUserCookie: Dispatch<SetStateAction<string>>; // Permet de modifier la valeur du cookie de session de la personne.
    user: User | undefined; // Contient les informations de l'utilisateur connecté.
    setUser: Dispatch<SetStateAction<User | undefined>>; // Permet de modifier les données de l'utilisateur connecté.
    userAdmin: boolean; // True si l'utilisateur est administrateur du site.
    setUserAdmin: Dispatch<SetStateAction<boolean>>; // Permet de modifier si l'utilisateur est administrateur du site.
    setAlert: Dispatch<SetStateAction<ApiResponse | undefined>>; // Permet de modifier l'alerte affichée.
    setSelectedMenu: Dispatch<SetStateAction<MenuList>>; // Permet de modifier le menu sélectionné.
    updateUserInfo: () => Promise<void>; // Fonction qui permet de mettre à jour les informations de l'utilisateur connecté.
}

// Création du context de l'application pour les informations d'un utilisateur.
const UserContext = createContext<UserContextValue | undefined>(undefined);


/**
 * Fonction qui permet de créer un context à l'application pour stocker toutes les variables communnes
 * à un utilisateur aux pages du site.
 *
 * @export
 * @param {AppContextProps} { children }
 * @return {*} 
 */
export function UserContextProvider({ children }: { children: ReactNode }) {

    /**
     * React hook qui stock la valeur du token de connexion de l'utilisateur.
     */
    const [userCookie, setUserCookie] = useState<string>('');

    /**
     * React hook qui stock les informations de l'utilisateur connecté.
     */
    const [user, setUser] = useState<User | undefined>();

    /**
     * React hook qui indique si l'utilisateur connecté est un administrateur du site.
     */
    const [userAdmin, setUserAdmin] = useState<boolean>(false);

    /**
     * React hook de la réponse en provenance de l'api, pour être affiché dans l'alert box.
     */
    const [alert, setAlert] = useState<ApiResponse | undefined>();

    /**
     * React hook qui stock le menu actuellement sélectionné.
     */
    const [selectedMenu, setSelectedMenu] = useState<MenuList>("");

    /**
     * Fonction qui permet de mettre à jour les informations de l'utilisateur connecté.
     * 
     */
    const updateUserInfo = useCallback(async () => {
        getUserInfo(userCookie).then(userInfo => {
            if (userInfo) {
                setUser(userInfo);
                setUserAdmin(userInfo.admin);
            }else{
                setUser(undefined);
            }
        });
    }, [userCookie]);

    /**
     * Effect trigger à chaque modification du cookie de session.
     */
    useEffect(() => {
        setUserCookie(getCookie(SESSION_ID_COOKIE) as string);
        updateUserInfo();
    }, [userCookie, updateUserInfo]);

    const alertBoxColor = alert?.valid ? 'var(--color-green)' : 'var(--color-red)'; // Variable qui représente une couleur en fonction du status de la réponse.

    useEffect(() => {
        let docTitle = document.title;
        const handleBlur = () => {
          document.title = "reviens bebou";
        };
        const handleFocus = () => {
          document.title = docTitle;
        };
        window.addEventListener("blur", handleBlur);
        window.addEventListener("focus", handleFocus);
        return () => {
          window.removeEventListener("blur", handleBlur);
          window.removeEventListener("focus", handleFocus);
        };
      }, []);
      
      // Utilisation de usePathname pour déterminer le chemin actuel
      const pathname = usePathname();
      const shouldShowFooter = pathname ? !pathname.startsWith('/admin') : true;
      const hide = pathname ? pathname.startsWith('/404') : false;
    return (
        <>
            <UserContext.Provider value={{ userCookie, setUserCookie, user, setUser, userAdmin, setUserAdmin, setAlert, setSelectedMenu, updateUserInfo }}>
                {alert && <AlertBox message={alert?.message} color={alertBoxColor} onDelay={() => setAlert(undefined)} />}
                    
                {!hide && <Header selected_menu={selectedMenu}/>}
                {children}

            </UserContext.Provider>
            {shouldShowFooter && !hide && <Footer />}
        </>
    )
};

/**
 * Fonction qui permet d'accéder au différentes variables stockées dans le context de l'utilisateur.
 *
 * @export
 * @return {*} Le context si trouvé
 */
export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext must be used within a UserContextProvider");
    }
    return context;
}