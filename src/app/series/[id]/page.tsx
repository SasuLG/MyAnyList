"use client"

import Loader from "@/components/loader";
import { BrokenHeart, Heart } from "@/components/svg/heart.svg";
import { IMG_SRC } from "@/constants/tmdb.consts";
import { Serie } from "@/tmdb/types/series.type";
import { useUserContext } from "@/userContext";
import { useEffect, useState } from "react";

export default function SerieDetails({ params }: { params: { id: string } }) {

    /**
     * Récupérer les informations de l'utilisateur
     */
    const { user, setAlert, setSelectedMenu } = useUserContext();

    /**
     * Hook qui stock les détails de la série
     */
    const [serie, setSerie] = useState<Serie | undefined>(undefined);

    /**
     * Hook qui stock l'état de la fin du chargement des données
     */
    const [fetchDataFinished, setFetchDataFinished] = useState<boolean>(false);

    /**
     * Fonction qui récupère les détails de la série
     */
    const fetchSerie = async () => {
        const response = await fetch(`/api/series/${encodeURIComponent(params.id)}`);
        if (!response.ok) {
            setAlert(await response.json());
            return;
        }
        const data: Serie = await response.json();
        if(user){
            const userResponse = await fetch(`/api/series/${encodeURIComponent(params.id)}/user/${encodeURIComponent(user.id)}`);
            if (!userResponse.ok) {
                setAlert(await userResponse.json());
                return;
            }
            const userData = await userResponse.json();
            if(userData !== null){
                data.note = userData.note;
                data.follow_date = userData.follow_date;
                data.comment = userData.comment;
            }
        }
        console.log(data);
        setSerie(data);
        setFetchDataFinished(true);
    };

    /**
     * Fonction qui récupère les détails de l'utilisateur pour la série
     */
    const fetchUserSerie = async () => {
        if (user && serie) {
            const userResponse = await fetch(`/api/series/${encodeURIComponent(params.id)}/user/${encodeURIComponent(user.id)}`);
            if (!userResponse.ok) {
                setAlert(await userResponse.json());
                return;
            }

            const userData = await userResponse.json();
            const updatedSerie = { 
                ...serie, 
                note: userData?.note || undefined, 
                follow_date: userData?.follow_date || undefined ,
                comment: userData?.comment || undefined
            };
            setSerie(updatedSerie); 
        }
    };
    

     /**
     * Fonction pour gérer le clic sur le coeur, qui permet de suivre ou de ne plus suivre une série
     * @param {MinimalSerie} serie - La série
     * @returns 
     */
    const onClickHeart = async (serie: Serie) => {
        if(user === undefined){
            return;
        }
        let route = `/api/${encodeURIComponent(user.web_token)}/series/follow`;
        if(serie.follow_date !== undefined){
            route = `/api/${encodeURIComponent(user.web_token)}/series/unfollow`;
        }
        const response = await fetch(route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ serieId: serie.id })
        });
        if(response.ok){
            const data = await response.json();
            if(data){
                await fetchUserSerie(); 
                await fetch('/api/user/activity', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ login: user.login }),
                });
            }
        }else{
            setAlert({ message: 'Erreur lors de la récupération des séries suivies', valid: false });
        }
    }

    const updateVote = async () => {
        if(!user || !serie) return;
        const note = Number((document.getElementById('serie-note') as HTMLInputElement).value);
        const comment = (document.getElementById('serie-comment') as HTMLTextAreaElement).value;
        if(note < 0 || note > 10) setAlert({ message: 'La note doit être comprise entre 0 et 10', valid: false });
        if(comment.length > 1000) setAlert({ message: 'Le commentaire ne doit pas dépasser 1000 caractères', valid: false });
        const response = await fetch(`/api/${encodeURIComponent(user.web_token)}/series/${encodeURIComponent(serie.id)}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ note, comment, newVote:serie.note===undefined })
        });
        if(response.ok){
            await fetchUserSerie();
        }
        setAlert(response.ok ? { message: 'Vote ajouté', valid: true } : { message: 'Erreur lors de l\'ajout du vote', valid: false });
    }

    useEffect(() => {
        fetchSerie();
    }, [user]);

    useEffect(() => {
        setSelectedMenu("");
    }, []);

    return (
        <div>
            {fetchDataFinished && serie ? (
                <div>
                    <h1>{serie.name}</h1> 
                    {user && (
                        <div>
                            <div onClick={()=>onClickHeart(serie)} >
                                <span style={{cursor:"pointer"}}>{serie.follow_date ?<Heart width={50} height={50} />:<BrokenHeart width={50} height={50} />}</span>
                                {/* Affichage de la date de suivi */}
                                {serie.follow_date && (
                                    <div>
                                        <h2>Date de Suivi</h2>
                                        <p>{new Date(serie.follow_date).toLocaleDateString()}</p>
                                    </div>
                                )}
                                </div>
                            <div>
                                <label>Note</label>
                                <input id="serie-note" type="number" defaultValue={serie.note} onChange={(e) => setSerie({...serie, note: Number(e.target.value)})} />
                                <label>Commentaire</label>
                                <textarea id="serie-comment" defaultValue={serie.comment}/>
                                <button onClick={updateVote}>Valider</button>
                            </div>
                        </div>
                    )}
                    <img src={`${IMG_SRC}${serie.poster_path}`} alt={serie.name} />
                    <img src={`${IMG_SRC}${serie.backdrop_path}`} alt={serie.name} />

                    <p>{serie.overview}</p>


                    <h2>Details</h2>
                    <ul>
                        <li><strong>Original Name:</strong> {serie.original_name}</li>
                        <li><strong>Romaji Name:</strong> {serie.romaji_name}</li>
                        <li><strong>Status:</strong> {serie.status}</li>
                        <li><strong>First Air Date:</strong> {serie.first_air_date}</li>
                        <li><strong>Last Air Date:</strong> {serie.last_air_date}</li>
                        <li><strong>Total Time:</strong> {serie.total_time} minutes</li>
                        <li><strong>Number of Seasons:</strong> {serie.number_of_seasons}</li>
                        <li><strong>Number of Episodes:</strong> {serie.number_of_episodes}</li>
                        <li><strong>Episode Runtime:</strong> {serie.episode_run_time ? `${serie.episode_run_time} minutes` : 'N/A'}</li>
                        <li><strong>Average Vote:</strong> {serie.vote_average}</li>
                        <li><strong>Vote Count:</strong> {serie.vote_count}</li>
                        <li><strong>Popularity:</strong> {serie.popularity}</li>
                        <li><strong>Budget:</strong> ${serie.budget && serie.budget.toLocaleString()}</li>
                        <li><strong>Revenue:</strong> ${serie.revenue && serie.revenue.toLocaleString()}</li>
                    </ul>

                    <h2>Genres</h2>
                    <ul>
                        {serie.genres.map(genre => (
                            <li key={genre.id}>{genre.name}</li>
                        ))}
                    </ul>

                    <h2>Languages</h2>
                    <ul>
                        {serie.spoken_languages.map(lang => (
                            <li key={lang.id}>{lang.name} ({lang.english_name})</li>
                        ))}
                    </ul>

                    <h2>Production Countries</h2>
                    <ul>
                        {serie.production_countries.map(country => (
                            <li key={country.id}>{country.name} ({country.iso_3166_1})</li>
                        ))}
                    </ul>

                    <h2>Production Companies</h2>
                    <ul>
                        {serie.production_companies.map(company => (
                            <li key={company.id}>{company.name}</li>
                        ))}
                    </ul>

                    <h2>Seasons</h2>
                    <ul>
                        {serie.seasons.map(season => (
                            <li key={season.id}>
                                <h3>Season {season.season_number}: {season.name}</h3>
                                <img src={`${IMG_SRC}${season.poster_path}`} alt={season.name} />
                                <p>{season.overview}</p>
                                <p><strong>Air Date:</strong> {season.air_date}</p>
                                <p><strong>Vote Average:</strong> {season.vote_average}</p>
                                <p><strong>Total Time:</strong> {season.total_time} minutes</p>

                                <h4>Episodes</h4>
                                <ul>
                                    {season.episodes.map(episode => (
                                        <li key={episode.id}>
                                            <h5>Episode {episode.episode_number}: {episode.name}</h5>
                                            <img src={`${IMG_SRC}${episode.still_path}`} alt={episode.name} />
                                            <p>{episode.overview}</p>
                                            <p><strong>Runtime:</strong> {episode.runtime} minutes</p>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <Loader />
            )}
        </div>
    )
}
