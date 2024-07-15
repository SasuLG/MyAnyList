"use client";

import { Dispatch, ReactNode, SetStateAction, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ProjectContext = createContext<undefined>(undefined);
/**
 * Fonction qui permet de créer un context pour un projet pour stocker toutes les variables communes
 * à un projet.
 *
 * @export
 * @param {*} { children, params }
 * @return {*} 
 */
export function ProjectContextProvider({ children, params }: { children: ReactNode, params: any }) {
    return (
        <div></div>
    );
};

/**
 * Fonction qui permet d'accéder au différentes variables stockées dans le context du projet.
 *
 * @export
 * @return {*} Le context si trouvé
 */
export function useProjectContext() {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error("useProjectContext must be used within a ProjectContextProvider");
    }
    return context;
}