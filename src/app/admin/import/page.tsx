"use client";

import { ApiSerie, Serie, TmdbId } from "@/tmdb/types/series.type";
import { useUserContext } from "@/userContext";
import { use, useEffect, useState } from "react";

export default function Import() {

    /**
     * Hook qui permet de gérer l'affichage du mot de passe.
     */
    const { setAlert } = useUserContext();

    /**
     * Hooks qui permettent de gérer les séries à importer.
     */
    const [series, setSeries] = useState<ApiSerie[]>([]);

    /**
     * Hooks qui permettent de gérer la recherche de séries.
     */
    const [searchQuery, setSearchQuery] = useState("");

    /**
     * Hooks qui permettent de gérer le type de style d'affichage des séries.
     */
    const [styleType, setStyleType] = useState<'grid' | 'list'>('list');

    /**
     * Hooks qui permettent de gérer les identifiants des séries déjà importées.
     */
    const [importedSeriesIds, setImportedSeriesIds] = useState<string[]>([]);

    /**
     * Fonction qui permet de rechercher des séries en fonction d'une requête.
     */
    const searchSeries = async () => {
        const response = await fetch(`/api/admin/series/search?query=${encodeURIComponent(searchQuery)}`);
        const data = await response.json() as ApiSerie[];
        console.log(data);
        setSeries(data);
    };

    const detailsSeries = async () => {
        const response = await fetch(`/api/admin/series/search/details?id=${encodeURIComponent(204832)}&media_type=tv`);
        const data = await response.json();
        console.log(data);
    };

    const detailsSeason = async () => {
        const response = await fetch(`/api/admin/series/search/details/seasonDeatails?id=${encodeURIComponent(204832)}&season_number=${encodeURIComponent(0)}`);
        const data = await response.json();
        console.log(data);
    };

    /**
     * Fonction qui permet d'importer les détails d'une série dans la base de données.
     * @param {ApiSerie} serie - La série à importer.
     */
    const importSerie = async (serie: ApiSerie) => {
        try {
            // Récupérer les détails de la série
            const detailsResponse = await fetch(`/api/admin/series/search/details?id=${encodeURIComponent(serie.id)}&media_type=${encodeURIComponent(serie.media_type)}`);
            const detailsData = await detailsResponse.json();
        
            // Vérifier si c'est un film ou une série
            const isMovie = serie.media_type === 'movie';
            const isSpecialEpisodes = detailsData.seasons && detailsData.seasons.some((season: any) => season.season_number === 0 && /épisodes spéciaux/i.test(season.name));
        
            // Préparer les détails de chaque saison si ce n'est pas un film
            let seasonDetailsDataArray: any[] = [];
            if (!isMovie && detailsData.seasons) {
                const seasonDetailsPromises = detailsData.seasons.map((season: any) =>
                    fetch(`/api/admin/series/search/details/seasonDeatails?id=${encodeURIComponent(serie.id)}&season_number=${encodeURIComponent(season.season_number)}`)
                );
                const seasonDetailsResponses = await Promise.all(seasonDetailsPromises);
                seasonDetailsDataArray = await Promise.all(seasonDetailsResponses.map(response => response.json()));
            }

            // Si pas d'episode run_time pour une série , on prend la moyenne des run_time des épisodes
            const totalEpisodes = seasonDetailsDataArray.reduce((total: number, season: any) => total + season.episodes.length, 0);
            const totalTime = seasonDetailsDataArray.reduce((total: number, season: any) => {
                return total + season.episodes.reduce((episodeTotal: number, episode: any) => episodeTotal + (episode.runtime || 0), 0);
            }, 0);
            const averageTime = totalEpisodes > 0 ? Math.round(totalTime / totalEpisodes) : 0;

            // Préparer l'objet ImportSeries avec les données reçues
            const importSeriesData: Serie = {
                id: serie.id,
                tmdb_id: serie.tmdb_id,
                name: serie.name,
                original_name: serie.original_name,
                overview: serie.overview,
                poster_path: serie.poster_path,
                backdrop_path: detailsData.backdrop_path || "",
                first_air_date: isMovie ? detailsData.release_date || "" : detailsData.first_air_date || "",
                last_air_date: isMovie ? detailsData.release_date || "" : detailsData.last_air_date || "",
                vote_average: detailsData.vote_average || 0,
                vote_count: detailsData.vote_count || 0,
                genres: detailsData.genres || [],
                spoken_languages: detailsData.spoken_languages || [],
                production_countries: detailsData.production_countries || [],
                production_companies: detailsData.production_companies || [],
                number_of_episodes: !isMovie ? detailsData.number_of_episodes || 0 : 1,
                number_of_seasons: !isMovie ? detailsData.number_of_seasons || 0 : 1,
                episode_run_time: isMovie ? detailsData.runtime || null : (detailsData.episode_run_time && detailsData.episode_run_time.length > 0) ? detailsData.episode_run_time[0] : averageTime,
                status: detailsData.status || "",
                media_type: serie.media_type || "",
                total_time: !isMovie && detailsData.seasons ? detailsData.seasons.reduce((total: number, season: any) => total + (season.total_time || 0), 0) : (detailsData.runtime || 0),
                origin_country: isMovie ? detailsData.origin_country : serie.origin_country || [],
                popularity: detailsData.popularity || 0,
                budget: detailsData.budget || 0,
                revenue: detailsData.revenue || 0,
                seasons: !isMovie ? detailsData.seasons.map((season: any, index: number) => {
                    const seasonPosterPath = season.background_path || season.poster_path;
                    const adjustedSeasonNumber = isSpecialEpisodes ? season.season_number : season.season_number + 1;
                    const seasonEpisodes = (seasonDetailsDataArray[index]?.episodes || []).map((e: any) => ({
                        ...e,
                        season_id: season.id,
                        season_number: adjustedSeasonNumber
                    }));
                    return { 
                        ...season, 
                        poster_path: seasonPosterPath, 
                        season_number: adjustedSeasonNumber, 
                        episodes: seasonEpisodes,
                        total_time: (season.episodes || []).reduce((total: number, episode: any) => total + (episode.runtime || 0), 0)
                    };
                }) : []
            };
        
            console.log(importSeriesData);
            // Envoyer les données d'importation à l'API
            const response = await fetch(`/api/admin/series/import`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(importSeriesData)
            });
            
            setAlert(await response.json());

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Erreur lors de l'importation des détails de la série:", error);
            throw error;
        }
    };

    /**
     * Fonction qui permet de récupérer les identifiants des séries déjà importées.
     */
    const getImportedSeriesIds = async () => {
        const response = await fetch(`/api/admin/series/import`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if(response.ok) {
            const data = await response.json() as TmdbId[];
            console.log(data);
            setImportedSeriesIds(data.map((id) => id.tmdb_id));
        }
    }

    /**
     * Fonction qui permet de gérer l'appui sur la touche "Entrée" pour lancer la recherche.
     * @param event - L'événement du clavier.
     */
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            searchSeries();
        }
    };

    useEffect(() => {
        getImportedSeriesIds();
    }, []);
    

    return (
        <div style={{ height: "100%", padding: "2rem", backgroundColor: "var(--background-color)" }}>
            <h1 style={{ color: "var(--titre-color)", textAlign: "center", marginBottom: "2rem" }}>Import page</h1>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
                <input onKeyDown={handleKeyPress} style={{ width: "60%", padding: "0.5rem", border: "1px solid var(--border)", borderRadius: "4px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", color:"var(--titre-color)", backgroundColor:"var(--background-color)" }} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search series" />
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
                            <li key={serie.id} style={{ display: "flex", flexDirection: styleType === 'grid' ? 'column' : 'row', alignItems: styleType === 'grid' ? 'center' : 'flex-start', padding: "1rem", backgroundColor: "var(--background-color)", borderRadius: "8px", boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)" }}>
                            {styleType === 'grid' && (
                                <>
                                    <div style={{ marginBottom: "1rem" }}>
                                        {serie.poster_path && <img src={`https://image.tmdb.org/t/p/w500${serie.poster_path}`} alt={serie.name} style={{ width: "100%", borderRadius: "4px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)" }} />}
                                    </div>
                                    <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                        <div>
                                            <h2 style={{ color: "var(--titre-color)" }}>{serie.name}</h2>
                                            <p style={{ color: "var(--main-text-color)" }}>{serie.overview}</p>
                                            <h2 style={{ color: "var(--titre-color)" }}>{serie.media_type}</h2>
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
                                        <h2 style={{ color: "var(--titre-color)" }}>{serie.name}</h2>
                                        <p style={{ color: "var(--main-text-color)" }}>{serie.overview}</p>
                                        <h2 style={{ color: "var(--titre-color)" }}>{serie.media_type}</h2>
                                        {!importedSeriesIds.includes(serie.id) ? (
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