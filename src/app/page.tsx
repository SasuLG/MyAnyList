"use client";
import { useState, useEffect } from "react";
import { useUserContext } from "@/userContext";
import Link from "next/link";
import { IMG_SRC } from "@/constants/tmdb.consts";
import { MinimalSerie } from "@/tmdb/types/series.type";
import { BASE_DETAILS_SERIE_ROUTE } from "@/constants/app.route.const";
import Image from "next/image";

export default function Home() {
  const { user, setSelectedMenu } = useUserContext();
  const [recommendedSeries, setRecommendedSeries] = useState<MinimalSerie[]>([]);
  const [rotation, setRotation] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  const fetchPopularSeries = async () => {
    console.log("fetchPopularSeries");
    if (!user) {
      const response = await fetch(`/api/series/popular?limit=10&page=1`);
      const data = await response.json();
      setRecommendedSeries(data);
    }
  };

  const fetchRecommendedSeries = async () => {
    if (!user) return;
    const response = await fetch(`/api/${user.web_token}/series/recommanded?limit=10&page=1`);
    const data = await response.json();
    setRecommendedSeries(data);
  };

  const handleRotation = (angle: number) => {
    setRotation((prev) => prev + angle);
    setLastInteractionTime(Date.now());
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setStartX(e.clientX);
    setIsDragging(true);
    setLastInteractionTime(Date.now());
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || startX === null) return;
    const deltaX = e.clientX - startX;
    const sensitivity = 0.2;
    handleRotation(deltaX * sensitivity);
    setStartX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setStartX(null);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [startX, isDragging]);

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
              {recommendedSeries && recommendedSeries.map((serie, index) => (
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
