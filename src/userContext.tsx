"use client";

import { Dispatch, ReactNode, SetStateAction, createContext, useCallback, useContext, useEffect, useState } from "react";
import { User } from "./bdd/model/user";
import { ApiResponse } from "./types/api/api.response.type";

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
    //updateUserInfo: () => Promise<void>; // Fonction qui permet de mettre à jour les informations de l'utilisateur connecté.
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

    // /**
    //  * Fonction qui permet de mettre à jour les informations de l'utilisateur connecté.
    //  * 
    //  */
    // const updateUserInfo = useCallback(async () => {
    //     getUserInfo(user?.id).then(userInfo => {
    //         if (userInfo) {
    //             setUser(userInfo.user);
    //             setUserAdmin(userInfo.admin);
    //         }
    //     });
    // }, [user]);

    // /**
    //  * Effect trigger à chaque modification du cookie de session.
    //  */
    // useEffect(() => {
    //     updateUserInfo();
    // }, [user, updateUserInfo]);

    const alertBoxColor = alert?.valid ? 'var(--color-green)' : 'var(--color-red)'; // Variable qui représente une couleur en fonction du status de la réponse.

    return (
        <UserContext.Provider value={{ userCookie, setUserCookie, user, setUser, userAdmin, setUserAdmin, setAlert }}>{/* updateUserInfo */}
            {children}
        </UserContext.Provider>
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