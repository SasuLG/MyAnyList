"use client"

import { User } from "@/bdd/model/user";
import { HashWord } from "@/lib/hash";
import { MinimalSerie } from "@/tmdb/types/series.type";
import { useUserContext } from "@/userContext";
import { useEffect, useState } from "react";

export default function Profil({ params }: { params: { name: string } }) {

    /**
     * Récupérer les informations de l'utilisateur
     */
    const { user, setAlert, setSelectedMenu } = useUserContext();

    /**
     * Hook qui permet de stoker les informations de l'utilisateur.
     */
    const [userProfil, setUserProfil] = useState<User | null>(null);

    /**
     * Hook qui permet de stoker la liste des séries suivies par l'utilisateur.
     */
    const [seriesFollowed, setSeriesFollowed] = useState<MinimalSerie[]>([]);

    /**
     * Hook qui permet de stoker le nombre de séries TV suivies.
     */
    const [nbTv, setNbTv] = useState<number>(0);

    /**
     * Hook qui permet de stoker le nombre de films suivis.
     */
    const [nbMovie, setNbMovie] = useState<number>(0);

    /**
     * Hook qui permet de stoker le nombre d'animes suivis.
     */
    const [nbAnime, setNbAnime] = useState<number>(0);

    /**
     * Hook qui permet de stoker le temps total passé devant les séries TV
     */
    const [TotalTimeTv, setTotalTimeTv] = useState<number>(0);

    /**
     * Hook qui permet de stoker le temps total passé devant les films
     */
    const [TotalTimeMovie, setTotalTimeMovie] = useState<number>(0);

    /**
     * Hook qui permet de stoker le temps total passé devant les animes
     */
    const [TotalTimeAnime, setTotalTimeAnime] = useState<number>(0);

    /**
     * Hook qui permet de stoker le nombre total de médias suivis
     */
    const [TotalMedia, setTotalMedia] = useState<number>(0);

    /**
     * Hook qui permet de stoker le temps total passé devant les médias
     */
    const [TotalTime, setTotalTime] = useState<number>(0);

    // Etats pour le survol
    const [hoveredElement, setHoveredElement] = useState<string | null>(null);

    const fetchSeriesFollowed = async () => {
        if(userProfil === null){
            return;
        }
        let route = `/api/${encodeURIComponent(userProfil.web_token)}/series/all?limit=${encodeURIComponent(2000000)}&page=${encodeURIComponent(1)}`;
        if(userProfil.web_token === null){
            route = `/api/series/followed/${encodeURIComponent(userProfil.id)}?limit=${encodeURIComponent(2000000)}&page=${encodeURIComponent(1)}`;
        }
        const response = await fetch(route);
        const data = await response.json();
        if(response.ok){
            setSeriesFollowed(data);
        }else{
            setAlert({message: data.message, valid:false});
        }
    }

    const editName = async (name: string) => {
        if(userProfil === null){return;}
        if(name === userProfil.login){setAlert({message:"Login identique", valid: false});return;}
        if(name.includes(' ')){setAlert({message:"Login incorrecte", valid: false});return;}
        if(name.length < 3){setAlert({message:"Login trop court", valid: false});return;}
        const response = await fetch(`/api/user/edit/name`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userProfil.id,
                newName: name
            })
        });
        const data = await response.json();
        setAlert(data);

        if(response.ok){
            await fetch('/api/user/activity', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login: name }),
            });
        }
    }

    const editPassword = async (password: string) => {
        if(userProfil === null){return;}
        if(password === userProfil.password){setAlert({message:"Mot de passe identique", valid: false});return;}
        if(password.length < 3){setAlert({message:"Mot de passe trop court", valid: false});return;}
        const response = await fetch(`/api/user/edit/password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userProfil.id,
                newPassword: await HashWord(password)
            })
        });
        const data = await response.json();
        setAlert(data);

        if(response.ok){
            await fetch('/api/user/activity', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login: userProfil.login }),
            });
        }
    }

    const fetchUser = async () => {
        const response = await fetch(`/api/user/?username=${encodeURIComponent(params.name)}`);
        const data = await response.json();
        console.log(data);
        if(response.ok){
            setUserProfil(data);
        }else{
            setAlert({message: data.message, valid:false});
        }
    }

    useEffect(() => {
        if(user){
            if(params.name !== user?.login && user.admin){
                fetchUser();
            }else{
                setUserProfil(user);
            }
        }
    }, [user]);

    useEffect(() => {
        fetchSeriesFollowed();
    }, [userProfil]);

    useEffect(() => {
        if (userProfil !== null) {
            const tvSeries = seriesFollowed.filter((serie) =>
                serie.media_type === "tv" && !serie.genres.some((genre) => genre.name === "Animation")
            );
            const movies = seriesFollowed.filter((serie) => serie.media_type === "movie");
            const animeSeries = seriesFollowed.filter((serie) =>
                serie.genres.some((genre) => genre.name === "Animation")
            );

            setNbTv(tvSeries.length);
            setNbMovie(movies.length);
            setNbAnime(animeSeries.length);

            const tvTotalTime = tvSeries.reduce((acc, serie) => acc + serie.total_time, 0);
            const movieTotalTime = movies.reduce((acc, serie) => acc + serie.total_time, 0);
            const animeTotalTime = animeSeries.reduce((acc, serie) => acc + serie.total_time, 0);

            setTotalTimeTv(tvTotalTime);
            setTotalTimeMovie(movieTotalTime);
            setTotalTimeAnime(animeTotalTime);

            setTotalMedia(tvSeries.length + movies.length + animeSeries.length);
            setTotalTime(tvTotalTime + movieTotalTime + animeTotalTime);
        }
    }, [seriesFollowed]);

    useEffect(() => {
        setSelectedMenu("userProfil");
    }, []);

    const formatTime = (totalMinutes: number) => {
        if (totalMinutes < 60) {
            return `${totalMinutes}m`;
        }
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;
        return `${days ? `${days}j ` : ''}${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m` : ''}`.trim();
    };

    const getGenreStats = (series: MinimalSerie[]) => {
        const genreStats = series.reduce((acc, serie) => {
            serie.genres.forEach((genre) => {
                if (!acc[genre.name]) {
                    acc[genre.name] = { count: 0, totalEpisodes: 0, totalTime: 0 };
                }
                acc[genre.name].count++;
                acc[genre.name].totalEpisodes += serie.number_of_episodes || 0;
                acc[genre.name].totalTime += serie.total_time || 0;
            });
            return acc;
        }, {} as Record<string, { count: number, totalEpisodes: number, totalTime: number }>);

        return genreStats;
    };

    const genreStatsTv = getGenreStats(seriesFollowed.filter(serie => serie.media_type === "tv" && !serie.genres.some(genre => genre.name === "Animation")));
    const genreStatsMovies = getGenreStats(seriesFollowed.filter(serie => serie.media_type === "movie"));
    const genreStatsAnime = getGenreStats(seriesFollowed.filter(serie => serie.genres.some(genre => genre.name === "Animation")));

    const totalEpisodesTv = seriesFollowed.filter(serie => serie.media_type === "tv" && !serie.genres.some(genre => genre.name === "Animation")).reduce((acc, serie) => acc + (serie.number_of_episodes || 0), 0);
    const totalEpisodesMovies = seriesFollowed.filter(serie => serie.media_type === "movie").reduce((acc, serie) => acc + (serie.number_of_episodes || 0), 0);
    const totalEpisodesAnime = seriesFollowed.filter(serie => serie.genres.some(genre => genre.name === "Animation")).reduce((acc, serie) => acc + (serie.number_of_episodes || 0), 0);
    const totalEpisodesMedia = totalEpisodesTv + totalEpisodesMovies + totalEpisodesAnime;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ fontSize: '2rem', color: '#333' }}>Profil de {userProfil?.login}</h1>
            <div style={{ marginTop: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#555' }}>Informations</h2>
                <div style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                    <div 
                        onMouseEnter={() => setHoveredElement('tv')}
                        onMouseLeave={() => setHoveredElement(null)}
                        style={{ position: 'relative', marginBottom: '10px' }}
                    >
                        <p><strong>Nombre de séries TV suivies :</strong> {nbTv}</p>
                        {hoveredElement === 'tv' && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                backgroundColor: '#f9f9f9',
                                border: '1px solid #ddd',
                                padding: '10px',
                                width: '250px',
                                zIndex: 1
                            }}>
                                <p><strong>Séries TV par genre :</strong></p>
                                {Object.entries(genreStatsTv).map(([genre, stats]) => (
                                    <p key={genre}>{genre}: {stats.count}, {stats.totalEpisodes} épisodes</p>
                                ))}
                                <p><strong>Total des épisodes :</strong> {totalEpisodesTv}</p>
                            </div>
                        )}
                    </div>
                    <div 
                        onMouseEnter={() => setHoveredElement('movie')}
                        onMouseLeave={() => setHoveredElement(null)}
                        style={{ position: 'relative', marginBottom: '10px' }}
                    >
                        <p><strong>Nombre de films suivis :</strong> {nbMovie}</p>
                        {hoveredElement === 'movie' && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                backgroundColor: '#f9f9f9',
                                border: '1px solid #ddd',
                                padding: '10px',
                                width: '250px',
                                zIndex: 1
                            }}>
                                <p><strong>Films par genre :</strong></p>
                                {Object.entries(genreStatsMovies).map(([genre, stats]) => (
                                    <p key={genre}>{genre}: {stats.count}</p>
                                ))}
                                <p><strong>Total des épisodes :</strong> {totalEpisodesMovies}</p>
                            </div>
                        )}
                    </div>
                    <div 
                        onMouseEnter={() => setHoveredElement('anime')}
                        onMouseLeave={() => setHoveredElement(null)}
                        style={{ position: 'relative', marginBottom: '10px' }}
                    >
                        <p><strong>Nombre d'animes suivis :</strong> {nbAnime}</p>
                        {hoveredElement === 'anime' && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                backgroundColor: '#f9f9f9',
                                border: '1px solid #ddd',
                                padding: '10px',
                                width: '250px',
                                zIndex: 1
                            }}>
                                <p><strong>Animes par genre :</strong></p>
                                {Object.entries(genreStatsAnime).map(([genre, stats]) => (
                                    <p key={genre}>{genre}: {stats.count}, {stats.totalEpisodes} épisodes</p>
                                ))}
                                <p><strong>Total des épisodes :</strong> {totalEpisodesAnime}</p>
                            </div>
                        )}
                    </div>
                    <div 
                        onMouseEnter={() => setHoveredElement('media')}
                        onMouseLeave={() => setHoveredElement(null)}
                        style={{ position: 'relative', marginBottom: '10px' }}
                    >
                        <p><strong>Total des médias suivis :</strong> {TotalMedia}</p>
                        {hoveredElement === 'media' && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                backgroundColor: '#f9f9f9',
                                border: '1px solid #ddd',
                                padding: '10px',
                                width: '250px',
                                zIndex: 1
                            }}>
                                <p><strong>Total des médias par genre :</strong></p>
                                {Object.entries({ ...genreStatsTv, ...genreStatsMovies, ...genreStatsAnime }).map(([genre, stats]) => (
                                    <p key={genre}>{genre}: {stats.count}, {stats.totalEpisodes} épisodes</p>
                                ))}
                                <p><strong>Total des épisodes :</strong> {totalEpisodesMedia}</p>
                            </div>
                        )}
                    </div>
                    <div 
                        onMouseEnter={() => setHoveredElement('time')}
                        onMouseLeave={() => setHoveredElement(null)}
                        style={{ position: 'relative', marginBottom: '10px' }}
                    >
                        <p><strong>Temps total passé devant les séries TV :</strong> {formatTime(TotalTimeTv)}</p>
                        <p><strong>Temps total passé devant les films :</strong> {formatTime(TotalTimeMovie)}</p>
                        <p><strong>Temps total passé devant les animes :</strong> {formatTime(TotalTimeAnime)}</p>
                        <p><strong>Temps total passé devant les médias :</strong> {formatTime(TotalTime)}</p>
                        {hoveredElement === 'time' && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                backgroundColor: '#f9f9f9',
                                border: '1px solid #ddd',
                                padding: '10px',
                                width: '250px',
                                zIndex: 1
                            }}>
                                <p><strong>Temps par genre :</strong></p>
                                {Object.entries(genreStatsTv).map(([genre, stats]) => (
                                    <p key={genre}>{genre}: {formatTime(stats.totalTime)}</p>
                                ))}
                                {Object.entries(genreStatsMovies).map(([genre, stats]) => (
                                    <p key={genre}>{genre}: {formatTime(stats.totalTime)}</p>
                                ))}
                                {Object.entries(genreStatsAnime).map(([genre, stats]) => (
                                    <p key={genre}>{genre}: {formatTime(stats.totalTime)}</p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <h2 style={{ fontSize: '1.5rem', color: '#555' }}>Modifier les informations</h2>
                <div>
                    <input 
                        type="text" 
                        placeholder="Nouveau nom" 
                        onChange={(e) => editName(e.target.value)} 
                        style={{ padding: '10px', marginRight: '10px', fontSize: '1rem' }} 
                    />
                    <input 
                        type="password" 
                        placeholder="Nouveau mot de passe" 
                        onChange={(e) => editPassword(e.target.value)} 
                        style={{ padding: '10px', fontSize: '1rem' }} 
                    />
                </div>
            </div>
        </div>
    )
}
