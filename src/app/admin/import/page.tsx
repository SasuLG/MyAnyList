"use client";
import Loader from "@/components/loader";
import { IMG_SRC } from "@/constants/tmdb.consts";
import { ApiSerie, Serie, TmdbId } from "@/tmdb/types/series.type";
import { useUserContext } from "@/userContext";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Import() {

    const { setAlert, setSelectedMenu } = useUserContext();

    const [series, setSeries] = useState<ApiSerie[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [styleType, setStyleType] = useState<'grid' | 'list'>('list');
    const [importedSeriesIds, setImportedSeriesIds] = useState<string[]>([]);
    const [fetchDataFinished, setFetchDataFinished] = useState<Boolean | undefined>(undefined);

    const searchSeries = async () => {
        setFetchDataFinished(false);
        const response = await fetch(`/api/admin/series/search?query=${encodeURIComponent(searchQuery)}`);
        const data = await response.json() as ApiSerie[];
        setSeries(data);
        setFetchDataFinished(true);
        console.log(data);
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

    const importSerie = async (serie: ApiSerie) => {
        try {
            // Récupérer les détails de la série
            const detailsResponse = await fetch(`/api/admin/series/search/details?id=${encodeURIComponent(serie.id)}&media_type=${encodeURIComponent(serie.media_type)}`);
            const detailsData = await detailsResponse.json();
        
            // Vérifier si c'est un film ou une série
            const isMovie = serie.media_type === 'movie';
        
            // Préparer les détails de chaque saison si ce n'est pas un film
            let seasonDetailsDataArray: any[] = [];
            if (!isMovie && detailsData.seasons) {
                const seasonDetailsPromises = detailsData.seasons.map((season: any) =>
                    fetch(`/api/admin/series/search/details/seasonDeatails?id=${encodeURIComponent(serie.id)}&season_number=${encodeURIComponent(season.season_number)}`)
                );
                const seasonDetailsResponses = await Promise.all(seasonDetailsPromises);
                seasonDetailsDataArray = await Promise.all(seasonDetailsResponses.map(response => response.json()));
            }
        
            // Récupérer les tags associés à la série
            const tagsResponse = await fetch(`/api/admin/series/search/tags?id=${encodeURIComponent(serie.id)}&media_type=${encodeURIComponent(serie.media_type)}`);
            const tagsData = await tagsResponse.json();
        
            // Déterminer le champ contenant les tags
            const tags = tagsData.results || tagsData.keywords || [];
        
            // Si pas d'episode run_time pour une série, on prend la moyenne des run_time des épisodes
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
                romaji_name: '', // Ajouter le champ romaji_name ici
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
                budget: detailsData.budget || null,
                tags: tags || [],
                revenue: detailsData.revenue || null,
                seasons: !isMovie ? detailsData.seasons.map((season: any, index: number) => {
                    const seasonPosterPath = season.background_path || season.poster_path;
                    const seasonEpisodes = (seasonDetailsDataArray[index]?.episodes || []).map((e: any) => ({
                        ...e,
                        season_id: season.id,
                        runtime: e.runtime || detailsData.episode_run_time[0] || averageTime  
                    }));
                    return { 
                        ...season, 
                        poster_path: seasonPosterPath, 
                        episodes: seasonEpisodes,
                        total_time: (season.episodes || []).reduce((total: number, episode: any) => total + (episode.runtime || 0), 0)
                    };
                }) : []
            };
        
            // Vérification du media type "Released"
            if (importSeriesData.status === 'Released') {
                importSeriesData.status = 'Ended';
            }

            // Liste des genres à vérifier
            const additionalGenres = ["romance", "ecchi", "slice of life", "anime"];
            const existingGenresResponse = await fetch(`/api/admin/series/genre`);
            const existingGenresData = await existingGenresResponse.json();
        
            // Créer un dictionnaire pour accéder aux genres existants par leur nom en minuscules
            const existingGenresMap = new Map<string, any>();
            existingGenresData.forEach((genre: any) => {
                existingGenresMap.set(genre.name.toLowerCase(), genre);
            });
            
            // Liste des genres à ajouter
            const genresToAdd: any[] = [];
            let mediaType = serie.media_type; // Conserver le media type initial
            let hasAnimationGenre = false;
            tags.forEach((tag: any) => {
                const lowerTag = tag.name.toLowerCase();
                if (lowerTag === "romantic comedy") {
                    // Ajouter le genre "Romance" si "Romantic Comedy" est trouvé
                    if (!importSeriesData.genres.some((g: any) => g.name.toLowerCase() === "romance")) {
                        const romanceGenre = existingGenresMap.get("romance");
                        if (romanceGenre) {
                            importSeriesData.genres.push({ id: romanceGenre.tmdb_id, name: romanceGenre.name });
                        }
                    }
                } else if (lowerTag === "anime") {
                    // Modifier le media type en "anime" si le tag "anime" est présent
                    mediaType = "anime";
                } else if (additionalGenres.includes(lowerTag)) {
                    const genre = existingGenresMap.get(lowerTag);
                    if (genre) {
                        // Genre existe déjà, l'ajouter à la liste des genres de la série
                        if (!importSeriesData.genres.some((g: any) => g.id === genre.id)) {
                            importSeriesData.genres.push({ id: genre.tmdb_id, name: genre.name });
                        }
                    } else {
                        // Genre n'existe pas, créer un nouvel objet genre
                        genresToAdd.push({
                            id: tag.id, 
                            name: tag.name.charAt(0).toUpperCase() + tag.name.slice(1) 
                        });
                    }
                }
            });
    
            // Vérifier si le genre "animation" est présent
            if (importSeriesData.genres.some((g: any) => g.name.toLowerCase() === "animation")) {
                hasAnimationGenre = true;
            }
    
            // Modifier le media type si le genre "animation" est présent et que le media type est "movie"
            if (hasAnimationGenre && isMovie) {
                mediaType = "film d'animation";
            }
    
            // Ajouter les nouveaux genres à la liste des genres de la série
            importSeriesData.genres.push(...genresToAdd);
        
            // Ajouter le media type modifié à l'objet importSeriesData
            importSeriesData.media_type = mediaType;
            console.log(importSeriesData);
            // Ajouter le nom en romaji
            const namesResponse = await fetch(`/api/translate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ texts: [serie.original_name] })
            });
            const namesData = await namesResponse.json();
            importSeriesData.romaji_name = namesData.texts[0]; 
        
            console.log(importSeriesData);
        
            // Envoyer les données d'importation à l'API
            const response = await fetch(`/api/admin/series/import`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(importSeriesData)
            });
            
            setAlert(await response.json());
            getImportedSeriesIds();
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
        if(response.ok) {
            const data = await response.json() as TmdbId[];
            setImportedSeriesIds(data.map((id) => id.tmdb_id.toString())); 
        }
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            searchSeries();
        }
    };

    useEffect(() => {
        getImportedSeriesIds();
    }, []);

    useEffect(() => {
        setSelectedMenu("");
    }, [setSelectedMenu]);

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

            {fetchDataFinished === false ? (
                <Loader />
            ) : (
                series.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, display: styleType === 'grid' ? 'grid' : 'flex', gridTemplateColumns: styleType === 'grid' ? 'repeat(auto-fit, minmax(250px, 1fr))' : 'none', gap: "1rem", flexDirection:"column" }}>
                        {series.map((serie) => {
                            const isImported = importedSeriesIds.includes(serie.id.toString());
                            return serie.media_type !== "person" && (
                                <li key={serie.id} style={{ display: "flex", flexDirection: styleType === 'grid' ? 'column' : 'row', alignItems: styleType === 'grid' ? 'center' : 'flex-start', padding: "1rem", backgroundColor: isImported ? "var(--secondary-background-color)" : "var(--background-color)", borderRadius: "8px", boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)" }}>
                                    {styleType === 'list' && (
                                        <>
                                            <div style={{ marginRight: "1rem" }}>
                                                {serie.poster_path && <Image unoptimized src={`${IMG_SRC}${serie.poster_path}`} alt={serie.name}  width={100} height={150}  style={{ borderRadius: "4px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)" }}  />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h2 style={{ color: "var(--titre-color)" }}>{serie.name}</h2>
                                                <p style={{ color: !isImported?"var(--main-text-color)":"var(--secondary-text-color)" }}>{serie.overview}</p>
                                                <h2 style={{ color: "var(--titre-color)" }}>{serie.media_type}</h2>
                                                <h2 style={{ color: "var(--titre-color)" }}>{serie.first_air_date.substring(0, 4)}</h2>
    
                                                <button style={{ marginTop: "1rem" }} className="button-validate" onClick={() => importSerie(serie)}>
                                                    {isImported ? "Update" : "Import"}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                ) : ( fetchDataFinished && <h2 style={{ color: "var(--titre-color)", textAlign: "center", marginTop: "2rem" }}>No series found</h2>)
            )}
        </div>
    );
}
