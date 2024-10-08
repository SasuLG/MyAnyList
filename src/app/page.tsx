"use client";
import { useState, useEffect } from "react";
import { useUserContext } from "@/userContext";
import Link from "next/link";
import { IMG_SRC } from "@/constants/tmdb.consts";
import { MinimalSerie } from "@/tmdb/types/series.type";
import { BASE_DETAILS_SERIE_ROUTE } from "@/constants/app.route.const";
import Image from "next/image";

export default function Home() {

  /**
   * Récupérer les informations de l'utilisateur
   */
  const { user, setSelectedMenu } = useUserContext();

  /**
   * Hook qui permet de stocker les séries recommandées
   */
  const [recommendedSeries, setRecommendedSeries] = useState<MinimalSerie[]>([]);

  /**
   * Hook qui permet de stocker la rotation du slider
   */
  const [rotation, setRotation] = useState(0);

  /**
   * Hook qui permet de stocker la position de départ du slider
   */
  const [startX, setStartX] = useState<number | null>(null);

  /**
   * Hook qui permet de stocker l'état du slider
   */
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Hook qui permet de stocker le temps de la dernière interaction
   */
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  /**
   * Fonction qui permet de récupérer les séries populaires
   */
  const fetchPopularSeries = async () => {
    if (!user) {
      const response = await fetch(`/api/series/popular?limit=10&page=1`);
      const data = await response.json();
      setRecommendedSeries(data);
    }
  };

  /**
   * Fonction qui permet de récupérer les séries recommandées
   */
  const fetchRecommendedSeries = async () => {
    if (!user) return;
    const response = await fetch(`/api/${encodeURIComponent(user.web_token)}/series/recommanded?limit=10&page=1`);
    const data = await response.json();
    setRecommendedSeries(data);
  };

  /**
   * Fonction qui permet de gérer la rotation du slider
   * @param {number} angle - L'angle de rotation
   */
  const handleRotation = (angle: number) => {
    setRotation((prev) => prev + angle);
    setLastInteractionTime(Date.now());
  };

  /**
   * Fonction qui permet de gérer le clic sur le slider
   * @param {React.MouseEvent} e - L'événement de clic
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setStartX(e.clientX);
    setIsDragging(true);
    setLastInteractionTime(Date.now());
  };

  /**
   * Fonction qui permet de gérer le déplacement de la souris
   * @param {MouseEvent} e - L'événement de déplacement de la souris
   */
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || startX === null) return;
    const deltaX = e.clientX - startX;
    const sensitivity = 0.2;
    handleRotation(deltaX * sensitivity);
    setStartX(e.clientX);
  };

  /**
   * Fonction qui permet de gérer le relâchement de la souris
   */
  const handleMouseUp = () => {
    setIsDragging(false);
    setStartX(null);
  };

  /**
   * Effet qui permet de gérer les événements de la souris
   */
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [startX, isDragging]);

  /**
   * Effet qui permet de gérer le défilement automatique du slider
   */
  useEffect(() => {
    const autoScroll = setInterval(() => {
      if (Date.now() - lastInteractionTime >= 3000) {
        handleRotation(-360 / recommendedSeries.length);
      }
    }, 3000);
    return () => clearInterval(autoScroll);
  }, [lastInteractionTime, recommendedSeries.length]);

  
  useEffect(() => { if (!user) fetchPopularSeries(); }, [user]);
  useEffect(() => { if (user) fetchRecommendedSeries(); }, [user]);
  useEffect(() => { setSelectedMenu("home") }, [setSelectedMenu]);

  return (
    <div style={{ height: "100%", padding: "2rem 4rem", backgroundColor: "var(--background-color)", color: "var(--main-text-color)", fontFamily: "Arial, sans-serif", }} onMouseDown={handleMouseDown}>
      <main>
        <section style={{ marginBottom: "2rem", padding: "1.5rem", backgroundColor: "var(--secondary-background-color)", borderRadius: "8px", color: "var(--secondary-text-color)", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", }}>
          <h2 style={{ fontSize: "1.75rem", color: "var(--titre-color)", marginBottom: "1rem", }}>Bienvenue sur notre plateforme</h2>
          <p style={{ fontSize: "1rem", lineHeight: "1.6", marginBottom: "1.5rem", }}>Explorez un monde de divertissement sans fin avec notre large sélection de séries. Que vous soyez un passionné de drames, un amateur de comédies, ou un fan de science-fiction, vous trouverez sûrement quelque chose qui vous plaira.</p>
          <p style={{ fontSize: "0.875rem", lineHeight: "1.5", }}>Nous mettons à jour régulièrement notre catalogue pour vous offrir les meilleurs contenus. Restez avec nous pour des expériences de visionnage exceptionnelles.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.75rem", color: "var(--titre-color)", marginBottom: "1.5rem", }}>{user ? "Recommandations pour vous" : "Séries Populaires"}</h2>
          <p style={{ fontSize: "1rem", lineHeight: "1.6", marginBottom: "1.5rem", color: "var(--main-text-color)", }}>Voici une sélection de séries qui pourraient vous plaire. Explorez nos recommandations pour découvrir des contenus captivants et divertissants.</p>
        </section>

        <section style={{ marginBottom: "2rem", }}>
          <div className="banner">
            <button onClick={() => handleRotation(360 / recommendedSeries.length)} className="nav-btn" >←</button>
            <button onClick={() => handleRotation(-360 / recommendedSeries.length)} className="nav-btn" >→</button>
            <div className="slider" style={{ "--quantity": recommendedSeries.length, transform: `perspective(1000px) rotateX(-8deg) rotateY(${rotation}deg)`, } as React.CSSProperties}>
              {recommendedSeries.length>0 && recommendedSeries.map((serie, index) => (
                <div className="item" key={index} style={{ "--position": index } as React.CSSProperties}>
                  <div style={{ backgroundColor: "var(--secondary-background-color)", borderRadius: "8px", overflow: "hidden", transition: "transform 0.3s", cursor: "pointer", }}>
                    <Link href={`${BASE_DETAILS_SERIE_ROUTE}/${serie.id}`} onMouseDown={(e) => e.stopPropagation()}>
                      <Image src={`${IMG_SRC}${serie.poster_path}`} alt={serie.name} width={500} height={750} style={{ borderRadius: "4px" }} />
                    </Link>
                    <div style={{ padding: "1rem", color: "var(--secondary-text-color)", height: "90px", display: "flex", alignItems: "center", justifyContent: "center", }}>
                      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", }}>{serie.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
