"use client";

import { useCallback, useEffect, useState } from "react";
import Loader from "@/components/loader";
import { BrokenHeart, Heart } from "@/components/svg/heart.svg";
import { IMG_SRC } from "@/constants/tmdb.consts";
import { Serie } from "@/tmdb/types/series.type";
import { useUserContext } from "@/userContext";
import { Star, StarColored, StarHalfColored } from "@/components/svg/stars.svg";

export default function SerieDetails({ params }: { params: { id: string } }) {

    /**
     * Récupération des informations de l'utilisateur.
     */
    const { user, setAlert, setSelectedMenu } = useUserContext();

    /**
     * Hook qui permet de stocker les informations de la série.
     */
    const [serie, setSerie] = useState<Serie | undefined>(undefined);

    /**
     * Hook qui permet de savoir si les données ont été récupérées.
     */
    const [fetchDataFinished, setFetchDataFinished] = useState<boolean>(false);

    /**
     * Hook qui permet de stocker la saison sélectionnée.
     */
    const [selectedSeason, setSelectedSeason] = useState<number>(0);

    /**
     * Hook qui permet de stocker la note de l'utilisateur.
     */
    const [rating, setRating] = useState<number>(serie?.note ?? 0);

    /**
     * Hook qui permet de stocker la note survolée.
     */
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    /**
     * Hook qui permet de stocker l'état de l'affichage du synopsis.
     */
    const [showMore, setShowMore] = useState<boolean>(false);

    /**
     * Hook qui permet de stocker l'état de l'édition de la note.
     */
    const [isEditing, setIsEditing] = useState<boolean>(false);

    /**
     * Hook qui permet de stocker l'état de l'affichage des informations supplémentaires.
     */
    const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);

    /**
     * Fonction pour récupérer les informations de la série.
     */
    const fetchSerie = async () => {
        const response = await fetch(`/api/series/${encodeURIComponent(params.id)}`);
        if (!response.ok) {
            setAlert(await response.json());
            return;
        }
        const data: Serie = await response.json();
        if(data.seasons) data.seasons.sort((a, b) => a.season_number - b.season_number);
        data.seasons.forEach(season => {
            if(season.episodes) season.episodes.sort((a, b) => a.episode_number - b.episode_number);
        });

        if (user) {
            const userResponse = await fetch(`/api/series/${encodeURIComponent(params.id)}/user/${encodeURIComponent(user.id)}`);
            if (userResponse.ok) {
                const userData = await userResponse.json();
                if (userData) {
                    data.note = userData.note;
                    data.follow_date = userData.follow_date;
                    data.comment = userData.comment;
                    setRating(userData.note);
                }
            }
        }
        setSerie(data);
        setFetchDataFinished(true);
    };

    /**
     * Fonction pour suivre ou arrêter de suivre une série.
     */
    const onClickHeart = async (serie: Serie) => {
        if (!user) return;

        if (serie.follow_date) {
            const confirmUnfollow = confirm("Êtes-vous sûr de vouloir arrêter de suivre cette série ?");
            if (!confirmUnfollow) return; 
        }
        let route = `/api/${encodeURIComponent(user.web_token)}/series/follow`;
        if (serie.follow_date) {
            route = `/api/${encodeURIComponent(user.web_token)}/series/unfollow`;
        }
        const response = await fetch(route, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ serieId: serie.id }),
        });
        if (response.ok) {
            await fetchSerie();
            await fetch("/api/user/activity", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ login: user.login }),
            });
        } else {
            setAlert({ message: "Erreur lors de la récupération des séries suivies", valid: false });
        }
    };

    /**
     * Fonction pour mettre à jour le vote de l'utilisateur.
     */
    const updateVote = async () => {
        if (!user || !serie) return;
        const note = rating ?? serie.note;
        const comment = (document.getElementById("serie-comment") as HTMLTextAreaElement).value;
        if (note === null || note < 0 || note > 10) return setAlert({ message: "La note doit être comprise entre 0 et 10", valid: false });
        if (comment.length > 1000) return setAlert({ message: "Le commentaire ne doit pas dépasser 1000 caractères", valid: false });
        const response = await fetch(`/api/${encodeURIComponent(user.web_token)}/series/${encodeURIComponent(serie.id)}/vote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ note, comment, newVote: serie.note === undefined }),
        });
        if (response.ok) {
            await fetchSerie();
            setAlert({ message: "Vote ajouté", valid: true });
        } else {
            setAlert({ message: "Erreur lors de l'ajout du vote", valid: false });
        }
    };

    /**
     * Fonction pour gérer l'événement de touche enfoncée.
     * @param {React.KeyboardEvent<HTMLInputElement>} event 
     */
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if(isEditing) setIsEditing(false);
        }
    };
    
    /**
     * Fonction pour gérer le changement de note.
     * @param {number} - newRating
     */
    const handleRating = (newRating: number) => {
        setRating(newRating);
    };

    /**
     * Fonction pour gérer l'événement de survol de la note.
     * @param {number} - index
     * @param {React.MouseEvent<HTMLSpanElement, MouseEvent>} - event
     */
    const handleMouseEnter = (index: number, event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const halfWidth = rect.width / 2;
        const newHoverRating = x < halfWidth ? index + 0.5 : index + 1;
        setHoverRating(newHoverRating);
    };

    /**
     * Fonction pour gérer l'événement de sortie de la note.
     */
    const handleMouseLeave = () => {
        setHoverRating(null);
    };

    /**
     * Fonction pour gérer le clic sur une note.
     * @param {number} - index
     * @param {React.MouseEvent<HTMLSpanElement, MouseEvent>} - event
     */
    const handleClick = (index: number, event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const halfWidth = rect.width / 2;
        const newRating = x < halfWidth ? index + 0.5 : index + 1;
        handleRating(newRating);
    };

    /**
     * Fonction pour formater la note.
     * @param {number} - rating
     */
    const formatRating = (rating: number) => {
        return rating % 1 === 0 ? `${rating}.0` : rating.toFixed(1);
    };

    /**
     * Fonction pour tronquer un texte.
     * @param {string} - text
     * @param {number} - length
     */
    const truncateText = (text: string, length: number) => {
        return text.length > length ? text.substring(0, length) + '...' : text;
    };

    /**
     * Fonction pour obtenir l'icône de la note.
     * @param {number} - index
     * @return {JSX.Element}
     */
    const getStarIcon = (index: number) => {
        if (hoverRating !== null) {
            return hoverRating >= index + 1 ? <StarColored width={30} height={30} /> : hoverRating > index ? <StarHalfColored width={30} height={30} /> : <Star width={30} height={30} />;
        } else if (rating !== null) {
            return rating >= index + 1 ? <StarColored width={30} height={30} /> : rating > index ? <StarHalfColored width={30} height={30} /> : <Star width={30} height={30} />;
        }
        return <Star width={30} height={30} />;
    };

    /**
     * Fonction pour gérer le changement de note.
     * @param {React.ChangeEvent<HTMLInputElement>}
     */
    const handleRatingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRating = parseFloat(event.target.value);
        if (!isNaN(newRating)) {
            setRating(newRating);
        }
    };
    
    /**
     * Fonction pour formater le temps total.
     */
    const formatTime = useCallback((totalMinutes: number) => {
        if (totalMinutes < 60) {
            return `${totalMinutes}m`;
        }
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;
        return `${days ? `${days}j ` : ''}${hours ? `${hours}h ` : ''}${minutes ? `${minutes}` : ''}`.trim();
    }, []);

    useEffect(() => {
        fetchSerie();
    }, [params.id, user]);

    useEffect(() => {
        setSelectedMenu("");
    }, [setSelectedMenu]);

    if (!fetchDataFinished || !serie) return <Loader />;

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                {user && (
                    <>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {[...Array(10)].map((_, index) => (
                            <span key={index} onClick={(e) => handleClick(index, e)} onMouseEnter={(e) => handleMouseEnter(index, e)} onMouseLeave={handleMouseLeave} onMouseMove={(e) => handleMouseEnter(index, e)} style={{ cursor: "pointer" }}>
                                {getStarIcon(index)}
                            </span>
                        ))}
                    </div>
                    {isEditing ? (
                        <input type="number" value={rating ?? 0} onChange={handleRatingChange} onBlur={() => { setIsEditing(false) }} onKeyDown={handleKeyDown} min="0" max="10" step="1" style={{ fontSize: "1.6rem", fontWeight: "bold", width: "70px", textAlign: "center", border: "1px solid #ddd", borderRadius: "8px", padding: "6px", outline: "none" }} />
                    ) : (
                        <>
                            <span style={{ fontSize: "1.6rem", fontWeight: "bold", cursor: "pointer" }} tabIndex={0} onClick={() => setIsEditing(true)}>
                                {formatRating(rating ?? 0)}
                            </span>
                            <button onClick={(e) => { updateVote(); setIsEditing(false) }} style={{ background: "none", border: "none", cursor: `${serie.note === rating ? "default" : "pointer"}`, marginLeft: "-2px", fontSize: "1rem", color: `${serie.note === rating ? "var(--titre-color)" : "#007bff"}` }} disabled={serie.note === rating}>
                                ✎
                            </button>
                        </>
                    )}
                </div>
                    <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => onClickHeart(serie)}>
                        <span style={{ marginRight: "10px" }}>
                            {serie.follow_date ? <Heart width={30} height={30} /> : <BrokenHeart width={30} height={30} />}
                        </span>
                        <span style={{ fontWeight: "bold" }}>{serie.follow_date ? `Suivi depuis le ${new Date(serie.follow_date).toLocaleDateString()}` : "Suivre cette série"}</span>
                    </div>
                    </>
                )}
            </div>
    
            <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
                <img src={`${IMG_SRC}${serie.poster_path}`} alt={serie.name} style={{ width: "300px", height: "450px", borderRadius: "10px", objectFit: "cover", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }} />
                <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: "20px", backgroundColor: "#f9f9f9", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }}>
                        <h2 style={{ fontSize: "2rem", color: "#333", marginBottom: "10px", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)" }}>{serie.name}</h2>
                        {serie.status === "Ended" && <p style={{ color: "red", fontWeight: "bold" }}>Cette série est terminée</p>}
                        <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: "1.1rem", marginBottom: "5px" }}><strong>Nom Original:</strong> {serie.original_name}</p>
                                {serie.romaji_name && <p style={{ fontSize: "1.1rem", marginBottom: "5px" }}><strong>Nom Romaji:</strong> {serie.romaji_name}</p>}
                                <p style={{ fontSize: "1.1rem", marginBottom: "5px" }}><strong>Status:</strong> {serie.status}</p>
                                <p style={{ fontSize: "1.1rem", marginBottom: "5px" }}><strong>Date de Première Diffusion:</strong> {new Date(serie.first_air_date).toLocaleDateString()}</p>
                            </div>
                            <div style={{ flex: 1, textAlign: "right" }}>
                                <p style={{ fontSize: "1.1rem", marginBottom: "5px" }}><strong>Nombre de Saisons:</strong> {serie.number_of_seasons}</p>
                                <p style={{ fontSize: "1.1rem", marginBottom: "5px" }}><strong>Nombre d&apos;Épisodes:</strong> {serie.number_of_episodes}</p>
                                {serie.number_of_episodes > 1 && <p style={{ fontSize: "1.1rem", marginBottom: "5px" }}><strong>Temps Épisodes:</strong> {serie.episode_run_time} minutes</p>}
                                <p style={{ fontSize: "1.1rem", marginBottom: "5px" }}><strong>Genres:</strong> {serie.genres.map((genre) => genre.name).join(", ")}</p>
                                <p style={{ fontSize: "1.1rem", marginBottom: "5px" }}><strong>Durée Totale:</strong> {formatTime(serie.total_time)}minutes</p>
                            </div>
                        </div>
                        <p style={{ fontSize: "1.1rem", marginBottom: "10px" }}><strong>Synopsis:</strong></p>
                        <p style={{ fontSize: "1rem", color: "#666", marginBottom: "20px" }}>
                            {showMore ? serie.overview : truncateText(serie.overview, 200)}
                            {serie.overview.length > 200 && (
                                <button onClick={() => setShowMore(!showMore)} style={{ color: "#007bff", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                                    {showMore ? "Voir moins" : "Voir plus"}
                                </button>
                            )}
                        </p>
                    </div>
    
                    {showMoreInfo ? (
                        <div style={{ marginBottom: "40px" }}>
                            <h2 style={{ fontSize: "1.5rem", color: "#333", marginBottom: "20px" }}>Détails Secondaires</h2>
                            <ul style={{ listStyleType: "none", paddingLeft: "0", fontSize: "1.1rem", color: "#555" }}>
                                <li style={{ marginBottom: "5px" }}><strong>Tags:</strong> {serie.tags.map(tag => tag.name).join(", ")}</li>
                            </ul>
                            <h2 style={{ fontSize: "1.5rem", color: "#333", marginBottom: "20px" }}>Production Companies</h2>
                            <ul style={{ listStyleType: "none", paddingLeft: "0", fontSize: "1.1rem", color: "#555" }}>
                                {serie.production_companies.map((company) => (
                                    <li key={company.id} style={{ marginBottom: "5px" }}>{company.name}</li>
                                ))}
                            </ul>
                            <h2 style={{ fontSize: "1.5rem", color: "#333", marginBottom: "20px" }}>Production Countries</h2>
                            <ul style={{ listStyleType: "none", paddingLeft: "0", fontSize: "1.1rem", color: "#555" }}>
                                {serie.production_countries.map((country) => (
                                    <li key={country.iso_3166_1} style={{ marginBottom: "5px" }}>{country.name}</li>
                                ))}
                            </ul>
                            <button onClick={() => setShowMoreInfo(false)} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                                Voir moins
                            </button>
                        </div>
                    ):(
                        <button onClick={() => setShowMoreInfo(true)} style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            Voir plus de détails
                        </button>
                    )}

                </div>
            </div>
    
            {user && (
                <div style={{ marginTop: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", color: "#333", marginBottom: "20px" }}>Commentaire</h2>
                    <textarea id="serie-comment" defaultValue={serie.comment || ""} style={{ width: "100%", height: "150px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "1rem" }} />
                    <button onClick={updateVote} style={{ marginTop: "10px", padding: "10px 20px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                        Mettre à jour le commentaire
                    </button>
                </div>
            )}
            
            {(serie.media_type === "anime" || serie.media_type === "tv") && (
                <div style={{ marginTop: "40px" }}>
                    <h2 style={{ fontSize: "1.5rem", color: "#333", marginBottom: "20px" }}>Saisons</h2>
                    {serie.seasons.length > 1 && (
                        <select onChange={(e) => setSelectedSeason(Number(e.target.value))} value={selectedSeason} style={{ padding: "10px", marginBottom: "20px", fontSize: "1rem", borderRadius: "5px", border: "1px solid #ccc", cursor: "pointer" }}>
                            {serie.seasons.map((season, index) => (
                                <option key={season.id} value={index}>
                                    Saison {season.season_number}: {season.name} ({season.episodes ? season.episodes.length:0} épisodes)
                                </option>
                            ))}
                        </select>
                    )}
                    {serie.seasons[selectedSeason] && (
                        <div style={{ padding: "20px", backgroundColor: "#f4f4f4", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }}>
                            <h3 style={{ fontSize: "1.3rem", color: "#333", marginBottom: "10px" }}>{serie.seasons[selectedSeason].name}</h3>
                            <img src={`${IMG_SRC}${serie.seasons[selectedSeason].poster_path}`} alt={serie.seasons[selectedSeason].name} style={{ width: "200px", borderRadius: "10px", objectFit: "cover", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)" }} />
                            <p style={{ fontSize: "1.1rem", color: "#666", marginTop: "10px" }}>{serie.seasons[selectedSeason].overview}</p>
                            <h4 style={{ fontSize: "1.2rem", color: "#333", marginTop: "20px", marginBottom: "10px" }}>Episodes</h4>
                            <ul style={{ listStyleType: "none", paddingLeft: "0" }}>
                                {serie.seasons[selectedSeason].episodes && serie.seasons[selectedSeason].episodes.map((episode) => (
                                    <li key={episode.id} style={{ marginBottom: "20px" }}>
                                        <h5 style={{ fontSize: "1.1rem", color: "#007bff" }}>Episode {episode.episode_number}: {episode.name}</h5>
                                        <img src={`${IMG_SRC}${episode.still_path}`} alt={episode.name} style={{ width: "150px", borderRadius: "5px", objectFit: "cover" }} />
                                        <p style={{ fontSize: "1rem", color: "#666" }}>{episode.overview}</p>
                                        <p style={{ fontSize: "0.9rem", color: "#999" }}>Durée: {episode.runtime} minutes</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}
