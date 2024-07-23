"use client";

import { ImportSeries, ApiSeries } from "@/tmdb/types/series.type";
import { use, useEffect, useState } from "react";

export default function Import() {
    const [series, setSeries] = useState<ApiSeries[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [styleType, setStyleType] = useState<'grid' | 'list'>('list');
    const [importedSeriesIds, setImportedSeriesIds] = useState<string[]>([]);

    const searchSeries = async () => {
        const response = await fetch(`/api/admin/series/search?query=${encodeURIComponent(searchQuery)}`);
        const data = await response.json() as ApiSeries[];
        console.log(data);
        setSeries(data);
    };

    const detailsSeries = async () => {
        const response = await fetch(`/api/admin/series/search/details?id=${encodeURIComponent(204832)}`);
        const data = await response.json();
        console.log(data);
    };

    const detailsSeason = async () => {
        const response = await fetch(`/api/admin/series/search/details/seasonDeatails?id=${encodeURIComponent(204832)}&season_number=${encodeURIComponent(0)}`);
        const data = await response.json();
        console.log(data);
    };

    const importSerie = async (serie: ApiSeries) => {
        try {
            const detailsResponse = await fetch(`/api/admin/series/search/details?id=${encodeURIComponent(serie.id)}`);
            const detailsData = await detailsResponse.json();
        
            // Vérifier si la saison 0 est "Épisodes spéciaux"
            const seasonZero = detailsData.seasons.find((season: any) => season.season_number === 0);
            const isSpecialEpisodes = seasonZero && /épisodes spéciaux/i.test(seasonZero.name);
        
            // Récupérer les détails de chaque saison
            const seasonDetailsPromises = detailsData.seasons.map((season: any) =>
                fetch(`/api/admin/series/search/details/seasonDeatails?id=${encodeURIComponent(serie.id)}&season_number=${encodeURIComponent(season.season_number)}`)
            );
            const seasonDetailsResponses = await Promise.all(seasonDetailsPromises);
            const seasonDetailsDataArray = await Promise.all(seasonDetailsResponses.map(response => response.json()));
        
            // Préparer l'objet ImportSeries avec les données reçues
            const importSeriesData: ImportSeries = {
                id: serie.id,
                name: serie.name,
                original_name: serie.original_name,
                overview: serie.overview,
                poster_path: serie.poster_path,
                backdrop_path: detailsData.backdrop_path,
                first_air_date: detailsData.first_air_date,
                last_air_date: detailsData.last_air_date,
                vote_average: detailsData.vote_average,
                vote_count: detailsData.vote_count,
                genres: detailsData.genres || [],
                languages: detailsData.languages || [],
                number_of_episodes: detailsData.number_of_episodes,
                number_of_seasons: detailsData.number_of_seasons,
                origin_country: detailsData.origin_country || [],
                status: detailsData.status,
                media_type: serie.media_type,
                seasons: detailsData.seasons.map((season: any, index: number) => {
                    // Utiliser background_path ou poster_path selon ce qui est disponible
                    const seasonPosterPath = season.background_path || season.poster_path;
        
                    // Incrémenter le numéro de saison seulement si la saison 0 n'est pas "Épisodes spéciaux"
                    const adjustedSeasonNumber = isSpecialEpisodes ? season.season_number : season.season_number + 1;
        
                    // Récupérer les épisodes de la saison actuelle
                    const seasonEpisodes = (seasonDetailsDataArray[index].episodes || []).filter((e: any) => e.season_number === season.season_number);
                    return { ...season, poster_path: seasonPosterPath, season_number: adjustedSeasonNumber, episodes: seasonEpisodes };
                }) || [],
                episodes: seasonDetailsDataArray.flatMap(seasonData => seasonData.episodes) || [],
                production_companies: detailsData.production_companies || [],
                production_countries: detailsData.production_countries || [],
                spoken_languages: detailsData.spoken_languages || [],
                created_by: detailsData.created_by || [],
                episode_run_time: detailsData.episode_run_time[0] ?? detailsData.last_air_date // Assigner un runtime par défaut ou null
            };
    
            const response = await fetch(`/api/admin/series/import`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(importSeriesData)
            });
        
            if (!response.ok) {
                const errorData = await response.json(); 
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Erreur lors de l'importation des détails de la série:", error);
            throw error;
        }
    };

    const getImportedSeriesIds = async () => {
        const response = await fetch(`/api/admin/series/import`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        console.log(data);
        setImportedSeriesIds(data);
    }

    useEffect(() => {
        getImportedSeriesIds();
    }, []);
    

    return (
        <div style={{ height: "100%", padding: "2rem", backgroundColor: "var(--var-background)" }}>
            <h1 style={{ color: "var(--var-titre)", textAlign: "center", marginBottom: "2rem" }}>Import page</h1>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                <input style={{ width: "60%", padding: "0.5rem", border: "1px solid var(--var-border)", borderRadius: "4px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", color:"var(--var-titre)", backgroundColor:"var(--var-background)" }} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search series" />
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button style={{ padding: "0.9rem" }} className="button-validate" onClick={searchSeries}>Search series</button>
                    <button style={{ padding: "0.9rem" }} className="button-validate" onClick={detailsSeries}>Details series</button>
                    <button style={{ padding: "0.9rem" }} className="button-validate" onClick={detailsSeason}>Details season</button>
                    <button style={{ padding: "0.9rem" }} className="button-validate" onClick={() => setStyleType(styleType === 'grid' ? 'list' : 'grid')}>
                        Toggle Layout
                    </button>
                </div>
            </div>

            {series.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0, display: styleType === 'grid' ? 'grid' : 'flex', gridTemplateColumns: styleType === 'grid' ? 'repeat(auto-fit, minmax(250px, 1fr))' : 'none', gap: "1rem", flexDirection:"column" }}>
                    {series.map((serie) => (
                        serie.media_type !== "person" && (
                            <li key={serie.id} style={{ display: "flex", flexDirection: styleType === 'grid' ? 'column' : 'row', alignItems: styleType === 'grid' ? 'center' : 'flex-start', padding: "1rem", backgroundColor: "var(--var-background)", borderRadius: "8px", boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)" }}>
                            {styleType === 'grid' && (
                                <>
                                    <div style={{ marginBottom: "1rem" }}>
                                        {serie.poster_path && <img src={`https://image.tmdb.org/t/p/w500${serie.poster_path}`} alt={serie.name} style={{ width: "100%", borderRadius: "4px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)" }} />}
                                    </div>
                                    <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                        <div>
                                            <h2 style={{ color: "var(--var-titre)" }}>{serie.name}</h2>
                                            <p style={{ color: "var(--var-text)" }}>{serie.overview}</p>
                                            <h2 style={{ color: "var(--var-titre)" }}>{serie.media_type}</h2>
                                        </div>
                                        <div>
                                            {!importedSeriesIds.includes(serie.id) ? (
                                                <button style={{ marginTop: "1rem" }} className="button-validate" onClick={() => importSerie(serie)}>Import</button>
                                            ) : (
                                                <button style={{ marginTop: "1rem" }} className="button-validate" onClick={()=>importSerie(serie)}>Update</button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                            {styleType === 'list' && (
                                <>
                                    <div style={{ marginRight: "1rem" }}>
                                        {serie.poster_path && <img src={`https://image.tmdb.org/t/p/w500${serie.poster_path}`} alt={serie.name} style={{ width: "100px", borderRadius: "4px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)" }} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h2 style={{ color: "var(--var-titre)" }}>{serie.name}</h2>
                                        <p style={{ color: "var(--var-text)" }}>{serie.overview}</p>
                                        <h2 style={{ color: "var(--var-titre)" }}>{serie.media_type}</h2>
                                        {series.length >= 6 ? (
                                            <button style={{ marginTop: "1rem" }} className="button-validate" onClick={()=>importSerie(serie)}>Import</button>
                                        ) : (
                                            <button style={{ marginTop: "1rem" }} className="button-validate" onClick={()=>importSerie(serie)}>Update</button>
                                        )}
                                    </div>
                                </>
                            )}
                        </li>)
                    ))}
                </ul>
            )}
        </div>
    );
}