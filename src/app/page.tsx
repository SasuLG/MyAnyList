"use client"
import { useUserContext } from "@/userContext";
import { useEffect } from "react";

/**
 * Fonction qui permet de générer la page d’accueil pour un utilisateur.
 * 
 * @returns le code JSX de la page.
 */
export default function Home() {


  /**
   * Récupérer les informations de l'utilisateur
   */
  const { user, setAlert, setSelectedMenu } = useUserContext();
  
  useEffect(() => {
    setSelectedMenu("home");
}, []);

  return (
    <div style={{height:"100%"}}>
      <h1>Home page</h1>
    </div>
  );
}
