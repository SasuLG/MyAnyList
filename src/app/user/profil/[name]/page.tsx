"use client";

import { User } from "@/bdd/model/user";
import { HashWord } from "@/lib/hash";
import { Genre, MinimalSerie } from "@/types/series.type";
import { useUserContext } from "@/userContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import bcrypt from 'bcryptjs';
import SeriesList from "@/components/seriesList";
import MultiSelectDropdown from "@/components/multiSelectDropdown";
import { Order } from "@/components/svg/filter.svg";
import { LOGIN_ROUTE } from "@/constants/app.route.const";
import { use } from 'react';
import { mangaToCatalogItem, normalizeCatalogItems } from "@/lib/catalog-item";
import { CatalogItem } from "@/types/catalog-item.type";
import { MinimalManga } from "@/types/mangas.type";

export default function Profil({ params }: { params: Promise<{ name: string }> }) {
    const { name } = use(params);

    /**
     * Router pour la redirection.
     */
    const router = useRouter();

    /**
     * Hook pour récupérer les informations de l'utilisateur.
     */
    const { user, setAlert, setSelectedMenu, mangaMode } = useUserContext();

    /**
     * Hook pour gérer les états de la page.
     */
    const [userProfil, setUserProfil] = useState<User | null>(null);

    /**
     * Hook pour gérer les séries suivies par l'utilisateur.
     */
    const [seriesFollowed, setSeriesFollowed] = useState<CatalogItem[]>([]);

    /**
     * Hook pour gérer les éléments survolés.
     */
    const [hoveredElement, setHoveredElement] = useState<string | null>(null);

    /**
     * Hook pour gérer la confirmation de l'edit name.
     */
    const [showConfirmEditName, setShowConfirmEditName] = useState(false);

    /**
     * Hook pour gérer la confirmation de l'edit password.
     */
    const [showConfirmEditPassword, setShowConfirmEditPassword] = useState(false);

    /**
     * Hook pour stocker les séries récentes.
     */
    const [recentSeries, setRecentSeries] = useState<CatalogItem[]>([]);

    /**
     * Hook pour stocker l'ordre des séries récentes.
     */
    const [orderAscRecent, setOrderAscRecent] = useState<boolean>(true);

    /**
     * Hook pour stocker les formats sélectionnés pour les séries récentes.
     */
    const [selectedRecentFormats, setSelectedRecentFormats] = useState<string[]>([]);

    /**
     * Hook pour stocker les séries les mieux notées.
     */
    const [ratedSeries, setRatedSeries] = useState<CatalogItem[]>([]);

    /**
     * Hook pour stocker l'ordre des séries les mieux notées.
     */
    const [orderAscRating, setOrderAscRating] = useState<boolean>(true);

    /**
     * Hook pour stocker les formats sélectionnés pour les séries les mieux notées.
     */
    const [selectedRatingFormats, setSelectedRatingFormats] = useState<string[]>([]);

    /**
     * Hook pour stocker les séries les plus longues.
     */
    const [longSeries, setLongSeries] = useState<CatalogItem[]>([]);

    /**
     * Hook pour stocker l'ordre des séries les plus longues.
     */
    const [orderAscTime, setOrderAscTime] = useState<boolean>(true);

    /**
     * Hook pour stocker les formats sélectionnés pour les séries les plus longues.
     */
    const [selectedLongFormats, setSelectedLongFormats] = useState<string[]>([]);

    /**
     * Fonction pour récupérer les séries suivies par l'utilisateur.
     */
    const fetchSeriesFollowed = useCallback(async () => {
        if (userProfil === null) return;
        try {
            const contentMode = mangaMode ? 'mangas' : 'series';
            let route = `/api/${encodeURIComponent(userProfil.web_token)}/${contentMode}/all?limit=${encodeURIComponent(2000000)}&page=${encodeURIComponent(1)}&waitList=${encodeURIComponent(false)}`;
            if (userProfil.login !== user?.login) route = `/api/user/${encodeURIComponent(userProfil.id)}/${contentMode}/all?limit=${encodeURIComponent(2000000)}&page=${encodeURIComponent(1)}&waitList=${encodeURIComponent(false)}`;
            const response = await fetch(route);
            const data = await response.json();
            if (response.ok) {
                const normalizedData = mangaMode
                    ? (data as MinimalManga[]).map(mangaToCatalogItem)
                    : normalizeCatalogItems(data, 'series');
                setSeriesFollowed(normalizedData);
                setRecentSeries(normalizedData);
                setRatedSeries(normalizedData);
                setLongSeries(normalizedData);
            } else {
                setAlert({ message: data.message, valid: false });
            }
        } catch (error) {
            setAlert({ message: 'Failed to fetch series followed', valid: false });
        }
    }, [userProfil, mangaMode, user?.login, setAlert]);

    /**
     * Fonction pour récupérer les informations de l'utilisateur.
     */
    const fetchUser = useCallback(async () => {
        try {
            const response = await fetch(`/api/user/?username=${encodeURIComponent(name)}`);
            const data = await response.json();
            if (response.ok) {
                setUserProfil(data);
            } else {
                setAlert({ message: data.message, valid: false });
            }
        } catch (error) {
            setAlert({ message: 'Failed to fetch user', valid: false });
        }
    }, [name, setAlert]);

    /**
     * Fonction pour éditer le nom de l'utilisateur
     */
    const editName = async () => {
        if (userProfil === null) { return; }
        const newName = (document.getElementById('editName') as HTMLInputElement).value;
        if (newName === userProfil.login) { setAlert({ message: "Login identique", valid: false }); return; }
        if (newName.includes(' ')) { setAlert({ message: "Login incorrecte", valid: false }); return; }
        if (newName.length < 3) { setAlert({ message: "Login trop court", valid: false }); return; }
        const response = await fetch(`/api/user/edit/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userProfil.id,
                newName: newName
            })
        });
        const data = await response.json();

        if (response.ok) {
            setAlert({ message: "Login modifié avec succès", valid: response.ok });
            await fetch('/api/user/activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login: newName }),
            });
            router.push(`/user/profil/${newName}`);
        } else {
            setAlert({ message: "Erreur lors de la modification du login", valid: response.ok });
        }
    }

    /**
     * Fonction pour éditer le mot de passe de l'utilisateur
     */
    const editPassword = async () => {
        if (userProfil === null) { return; }
        const password = (document.getElementById('editPassword') as HTMLInputElement).value;
        const oldPassword = (document.getElementById('oldPassword') as HTMLInputElement).value;
        if (password === oldPassword) { setAlert({ message: "Mot de passe identique", valid: false }); return; }
        if (password === userProfil.password) { setAlert({ message: "Mot de passe identique", valid: false }); return; }
        if (password.length < 3) { setAlert({ message: "Mot de passe trop court", valid: false }); return; }

        if (!bcrypt.compare(password, oldPassword) || userProfil.login != user?.login && user?.admin) { setAlert({ message: "Ancien mot de passe incorrecte", valid: false }); return; }

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

        if (response.ok) {
            setAlert({ message: "Modification du mot de passe réussi", valid: response.ok });
            (document.getElementById('editPassword') as HTMLInputElement).value = '';
            await fetch('/api/user/activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login: userProfil.login }),
            });
        } else {
            setAlert({ message: "Erreur lors de la modification du mot de passe", valid: response.ok });
        }
    }

    /**
     * Fonction pour gérer le clic sur le coeur, qui permet de suivre ou de ne plus suivre une série
     * @param {MinimalSerie} serie - La série
     * @returns 
     */
    const onClickHeart = async (serie: CatalogItem) => {
        if (user === undefined) {
            router.push(LOGIN_ROUTE);
            return;
        }
        if (serie.follow_date) {
            const confirmUnfollow = confirm("Êtes-vous sûr de vouloir arrêter de suivre cette série ?");
            if (!confirmUnfollow) return;
        }
        const contentMode = mangaMode ? 'mangas' : 'series';
        let route = `/api/${encodeURIComponent(user.web_token)}/${contentMode}/follow`;
        if (seriesFollowed.map(serie => serie.id).includes(serie.id)) {
            route = `/api/${encodeURIComponent(user.web_token)}/${contentMode}/unfollow`;
        }
        const response = await fetch(route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ serieId: serie.id })
        });
        if (response.ok) {
            const data = await response.json();
            if (data) {
                if (route.includes('unfollow')) {
                    setSeriesFollowed(seriesFollowed.filter(s => s.id.toString() !== serie.id.toString()));
                } else {
                    setSeriesFollowed([...seriesFollowed, serie]);
                }

                await fetch('/api/user/activity', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ login: user.login }),
                });
            }
        } else {
            setAlert({ message: 'Erreur lors de la récupération des séries suivies', valid: false });
        }
    }

    /**
     * Fonction pour récupérer les données des séries suivies par l'utilisateur.
     */
    const { nbTv, nbMovie, nbAnime, TotalTimeTv, TotalTimeMovie, TotalTimeAnime, totalEpisodesTv, totalEpisodesMovie, totalEpisodesAnime } = useMemo(() => {
        if (!userProfil) return {
            nbTv: 0, nbMovie: 0, nbAnime: 0,
            TotalTimeTv: 0, TotalTimeMovie: 0, TotalTimeAnime: 0,
            TotalMedia: 0, TotalTime: 0,
            totalEpisodesTv: 0, totalEpisodesMovie: 0, totalEpisodesAnime: 0
        };

        const tvSeries = seriesFollowed.filter(serie =>
            serie.media_type === "tv"
        );
        const movies = seriesFollowed.filter(serie => serie.media_type === "movie" || serie.media_type === "film d'animation");
        const animeSeries = seriesFollowed.filter(serie =>
            serie.media_type === "anime"
        );

        const nbTv = tvSeries.length;
        const nbMovie = movies.length;
        const nbAnime = animeSeries.length;

        const TotalTimeTv = tvSeries.reduce((acc, serie) => acc + (serie.total_time || 0), 0);
        const TotalTimeMovie = movies.reduce((acc, serie) => acc + (serie.total_time || 0), 0);
        const TotalTimeAnime = animeSeries.reduce((acc, serie) => acc + (serie.total_time || 0), 0);

        const totalEpisodesTv = tvSeries.reduce((acc, serie) => acc + (serie.number_of_episodes || 0), 0);
        const totalEpisodesMovie = movies.reduce((acc, serie) => acc + (serie.number_of_episodes || 0), 0);
        const totalEpisodesAnime = animeSeries.reduce((acc, serie) => acc + (serie.number_of_episodes || 0), 0);

        const TotalMedia = nbTv + nbMovie + nbAnime;
        const TotalTime = TotalTimeTv + TotalTimeMovie + TotalTimeAnime;

        return {
            nbTv, nbMovie, nbAnime, TotalTimeTv, TotalTimeMovie, TotalTimeAnime, TotalMedia, TotalTime,
            totalEpisodesTv, totalEpisodesMovie, totalEpisodesAnime
        };
    }, [userProfil, seriesFollowed]);

    // Pour l'affichage dynamique des labels
    const totalContentLabel = mangaMode ? 'mangas' : 'séries suivies';
    const totalUnitLabel = mangaMode ? 'chapitres' : 'épisodes';
    const totalWatchLabel = mangaMode ? 'Nombre total de chapitres' : 'Temps total de visionnage';

    const mangaFormatGroups = [
        { key: 'manga', label: 'Manga', formats: ['manga'] },
        { key: 'manhwa', label: 'Manhwa', formats: ['manhwa'] },
        { key: 'manhua', label: 'Manhua', formats: ['manhua'] },
        { key: 'novel', label: 'Novel', formats: ['novel'] },
        { key: 'one_shot', label: 'One_shot', formats: ['one_shot', 'oneshot', 'one-shot'] },
    ];

    const seriesFormatGroups = [
        { key: 'tv', label: 'Séries TV', formats: ['tv'] },
        { key: 'movie', label: 'Films', formats: ['movie', 'film d\'animation'] },
        { key: 'anime', label: 'Animés', formats: ['anime'] },
    ];

    const contentFormatGroups = mangaMode ? mangaFormatGroups : seriesFormatGroups;

    function getGenreData(items: CatalogItem[]) {
        const genreCount: { [key: string]: number } = {};
        const episodeCount: { [key: string]: number } = {};
        const timeCount: { [key: string]: number } = {};
        items.forEach((item) => {
            item.genres.forEach((genre) => {
                genreCount[genre.name] = (genreCount[genre.name] || 0) + 1;
                episodeCount[genre.name] = (episodeCount[genre.name] || 0) + (item.number_of_episodes || 0);
                timeCount[genre.name] = (timeCount[genre.name] || 0) + (item.total_time || 0);
            });
        });
        return { genreCount, episodeCount, timeCount };
    }

    const contentStats = useMemo(() => {
        const totalFormats = new Set(contentFormatGroups.flatMap(group => group.formats));

        const groups = contentFormatGroups.map(group => {
            const items = seriesFollowed.filter(item => group.formats.includes(item.media_type));
            return {
                ...group,
                items,
                count: items.length,
                totalEpisodes: items.reduce((acc, item) => acc + (item.number_of_episodes || 0), 0),
                totalTime: items.reduce((acc, item) => acc + (item.total_time || 0), 0),
                genreData: getGenreData(items),
            };
        });

        if (mangaMode) {
            const otherItems = seriesFollowed.filter(item => !totalFormats.has(item.media_type));
            if (otherItems.length > 0) {
                groups.push({
                    key: 'other',
                    label: 'Autres',
                    formats: ['other'],
                    items: otherItems,
                    count: otherItems.length,
                    totalEpisodes: otherItems.reduce((acc, item) => acc + (item.number_of_episodes || 0), 0),
                    totalTime: otherItems.reduce((acc, item) => acc + (item.total_time || 0), 0),
                    genreData: getGenreData(otherItems),
                });
            }
        }

        return groups;
    }, [contentFormatGroups, mangaMode, seriesFollowed]);


    const { TotalMedia, TotalEpisodes, TotalTime } = useMemo(() => {
        const mediaCount = contentStats.reduce((acc, group) => acc + group.count, 0);
        const episodesCount = contentStats.reduce((acc, group) => acc + group.totalEpisodes, 0);
        const timeCount = contentStats.reduce((acc, group) => acc + group.totalTime, 0);

        return {
            TotalMedia: mediaCount,
            TotalEpisodes: episodesCount,
            TotalTime: timeCount
        };
    }, [contentStats]);

    /**
     * Fonction pour appliquer les filtres et trier les séries récentes.
     */
    const applyFiltersAndSortRecent = () => {
        let filteredSeries: CatalogItem[] = [];

        const formatSet = new Set(selectedRecentFormats);

        if (formatSet.size === 0) {
            filteredSeries = [...seriesFollowed];
        } else {
            if (!mangaMode) {
                filteredSeries = seriesFollowed.filter(serie => {
                    const isTv = serie.media_type === 'tv';
                    const isMovie = serie.media_type === 'movie';
                    const isAnime = serie.media_type === 'anime';
                    const isFilmAnimation = serie.media_type === 'film d\'animation';

                    return (formatSet.has('tv') && isTv) ||
                        (formatSet.has('movie') && isMovie) ||
                        (formatSet.has('anime') && isAnime) ||
                        (formatSet.has('film d\'animation') && isFilmAnimation);
                });
            } else {
                filteredSeries = seriesFollowed.filter(serie => {
                    const isManga = serie.media_type === 'manga';
                    const isManhwa = serie.media_type === 'manhwa';
                    const isManhua = serie.media_type === 'manhua';
                    const isNovel = serie.media_type === 'novel';
                    const isOneShot = serie.media_type === 'one_shot' || serie.media_type === 'oneshot' || serie.media_type === 'one-shot';

                    return (formatSet.has('manga') && isManga) ||
                        (formatSet.has('manhwa') && isManhwa) ||
                        (formatSet.has('manhua') && isManhua) ||
                        (formatSet.has('novel') && isNovel) ||
                        (formatSet.has('one_shot') && isOneShot);
                })
            }

        }
        filteredSeries.sort((a, b) => {
            const dateA = a.follow_date ? new Date(a.follow_date).getTime() : 0;
            const dateB = b.follow_date ? new Date(b.follow_date).getTime() : 0;
            return dateB - dateA;
        });

        if (!orderAscRecent) {
            filteredSeries.reverse();
        }

        setRecentSeries(filteredSeries.slice(0, 8));
    };

    /**
     * Fonction pour appliquer les filtres et trier les séries les mieux notées.
     */
    const applyFiltersAndSortRating = () => {
        let filteredSeries: CatalogItem[] = [];

        const formatSet = new Set(selectedRatingFormats);

        if (formatSet.size === 0) {
            filteredSeries = [...seriesFollowed];
        } else {
            if (!mangaMode) {
                filteredSeries = seriesFollowed.filter(serie => {
                    const isTv = serie.media_type === 'tv';
                    const isMovie = serie.media_type === 'movie';
                    const isAnime = serie.media_type === 'anime';
                    const isFilmAnimation = serie.media_type === 'film d\'animation';

                    return (formatSet.has('tv') && isTv) ||
                        (formatSet.has('movie') && isMovie) ||
                        (formatSet.has('anime') && isAnime) ||
                        (formatSet.has('film d\'animation') && isFilmAnimation);
                });
            } else {
                filteredSeries = seriesFollowed.filter(serie => {
                    const isManga = serie.media_type === 'manga';
                    const isManhwa = serie.media_type === 'manhwa';
                    const isManhua = serie.media_type === 'manhua';
                    const isNovel = serie.media_type === 'novel';
                    const isOneShot = serie.media_type === 'one_shot' || serie.media_type === 'oneshot' || serie.media_type === 'one-shot';

                    return (formatSet.has('manga') && isManga) ||
                        (formatSet.has('manhwa') && isManhwa) ||
                        (formatSet.has('manhua') && isManhua) ||
                        (formatSet.has('novel') && isNovel) ||
                        (formatSet.has('one_shot') && isOneShot);
                })
            }
        }

        filteredSeries.sort((a, b) => (b.note || 0) - (a.note || 0));
        if (!orderAscRating) filteredSeries.reverse();

        setRatedSeries(filteredSeries.slice(0, 5));
    };

    /**
     * Fonction pour appliquer les filtres et trier les séries les plus longues.
     */
    const applyFiltersAndSortTime = () => {
        let filteredSeries: CatalogItem[] = [];

        const formatSet = new Set(selectedLongFormats);

        if (formatSet.size === 0) {
            filteredSeries = [...seriesFollowed];
        } else {
            if (!mangaMode) {
                filteredSeries = seriesFollowed.filter(serie => {
                    const isTv = serie.media_type === 'tv';
                    const isMovie = serie.media_type === 'movie';
                    const isAnime = serie.media_type === 'anime';
                    const isFilmAnimation = serie.media_type === 'film d\'animation';

                    return (formatSet.has('tv') && isTv) ||
                        (formatSet.has('movie') && isMovie) ||
                        (formatSet.has('anime') && isAnime) ||
                        (formatSet.has('film d\'animation') && isFilmAnimation);
                });
            } else {
                filteredSeries = seriesFollowed.filter(serie => {
                    const isManga = serie.media_type === 'manga';
                    const isManhwa = serie.media_type === 'manhwa';
                    const isManhua = serie.media_type === 'manhua';
                    const isNovel = serie.media_type === 'novel';
                    const isOneShot = serie.media_type === 'one_shot' || serie.media_type === 'oneshot' || serie.media_type === 'one-shot';

                    return (formatSet.has('manga') && isManga) ||
                        (formatSet.has('manhwa') && isManhwa) ||
                        (formatSet.has('manhua') && isManhua) ||
                        (formatSet.has('novel') && isNovel) ||
                        (formatSet.has('one_shot') && isOneShot);
                })
            }
        }

        if (!mangaMode) filteredSeries.sort((a, b) => (b.total_time || 0) - (a.total_time || 0));
        else filteredSeries.sort((a, b) => (b.number_of_episodes || 0) - (a.number_of_episodes || 0));
        if (!orderAscTime) filteredSeries.reverse();

        setLongSeries(filteredSeries.slice(0, 5));
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
        return `${days ? `${days}j ` : ''}${hours ? `${hours}h ` : ''}${minutes ? `${minutes}m` : ''}`.trim();
    }, []);

    useEffect(() => {
        if (user) {
            if (name !== user?.login && user.admin) {
                fetchUser();
            } else {
                setUserProfil(user);
            }
        }
    }, [user, name, fetchUser]);

    useEffect(() => {
        fetchSeriesFollowed();
    }, [fetchSeriesFollowed]);

    useEffect(() => {
        setSelectedMenu("userProfil");
    }, [setSelectedMenu]);

    useEffect(() => {
        applyFiltersAndSortRating();
    }, [selectedRatingFormats, seriesFollowed, orderAscRating]);

    useEffect(() => {
        applyFiltersAndSortTime();
    }, [selectedLongFormats, seriesFollowed, orderAscTime]);

    useEffect(() => {
        applyFiltersAndSortRecent();
    }, [selectedRecentFormats, seriesFollowed, orderAscRecent]);

    const totalTimePercentage = useCallback((time: number, total: number) => total === 0 ? '0%' : ((time / total) * 100).toFixed(1) + '%', []);
    const totalEpisodesPercentage = useCallback((episodes: number, total: number) => total === 0 ? '0%' : ((episodes / total) * 100).toFixed(1) + '%', []);

    const tvGenreData = useMemo(() => getGenreData(seriesFollowed.filter(serie => serie.media_type === 'tv')), [seriesFollowed, getGenreData]);
    const movieGenreData = useMemo(() => getGenreData(seriesFollowed.filter(serie => serie.media_type === 'movie' || serie.media_type === 'film d\'animation')), [seriesFollowed, getGenreData]);
    const animeGenreData = useMemo(() => getGenreData(seriesFollowed.filter(serie => serie.media_type === 'anime')), [seriesFollowed, getGenreData]);

    const totalEpisodes = totalEpisodesTv + totalEpisodesMovie + totalEpisodesAnime;

    const { combinedGenreData, combinedEpisodeData } = useMemo(() => {
        const genCount: { [key: string]: number } = {};
        const epCount: { [key: string]: number } = {};

        contentStats.forEach(group => {
            Object.keys(group.genreData.genreCount).forEach(genre => {
                genCount[genre] = (genCount[genre] || 0) + group.genreData.genreCount[genre];
            });
            Object.keys(group.genreData.episodeCount).forEach(genre => {
                epCount[genre] = (epCount[genre] || 0) + group.genreData.episodeCount[genre];
            });
        });
        return { combinedGenreData: genCount, combinedEpisodeData: epCount };
    }, [contentStats]);
    return (
        <div style={{ margin: '20px' }}>
            <h1 style={{ fontSize: '2rem', color: 'var(--titre-color)', marginBottom: "3rem" }}>Profil : {userProfil?.login}</h1>

            <div style={{ display: "flex", flexDirection: "row", gap: "1rem", width: "100%" }}>
                <div style={{ flex: "1" }}>
                    <h3 style={{ color: "var(--titre-color)" }}>Modifier le nom</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input type="text" id="editName" placeholder="Nouveau nom" defaultValue={userProfil?.login} style={{ flex: "1", padding: "0.5rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "4px", height: "2.5rem", boxSizing: "border-box", color: "var(--titre-color)", backgroundColor: "var(--background-color)" }} />
                        <button className="button-validate" onClick={() => setShowConfirmEditName(true)} style={{ padding: "0 1rem", fontSize: "1rem", border: "none", borderRadius: "4px", backgroundColor: "var(--button-color)", color: "#fff", cursor: "pointer", height: "2.5rem", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", transform: "translate(0px, -12px)" }}>Modifier</button>
                    </div>
                    {showConfirmEditName && (
                        <div className="overlay" style={{ position: "fixed", left: "0", top: "0", backgroundColor: "rgba(0, 0, 0, 0.5)", width: "100%", height: "100%", zIndex: "10" }}>
                            <div className="overlay-content" style={{ margin: "18% auto", padding: "3rem 5rem", borderRadius: "15px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <p style={{ color: "var(--titre-color)" }}>Êtes-vous sûr de vouloir modifier le nom ?</p>
                                    <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                                        <button className="button" onClick={() => { editName(); setShowConfirmEditName(false); }} style={{ padding: "0 1rem", fontSize: "1rem", border: "none", borderRadius: "4px", backgroundColor: "#28a745", color: "#fff", cursor: "pointer", height: "2.5rem", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>Confirmer</button>
                                        <button className="button" onClick={() => setShowConfirmEditName(false)} style={{ padding: "0 1rem", fontSize: "1rem", border: "none", borderRadius: "4px", backgroundColor: "#dc3545", color: "#fff", cursor: "pointer", height: "2.5rem", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>Annuler</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ flex: "1" }}>
                    <h3 style={{ color: "var(--titre-color)" }}>Modifier le mot de passe</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <input type="password" id="editPassword" placeholder="Nouveau mot de passe" style={{ flex: "1", padding: "0.5rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "4px", height: "2.5rem", boxSizing: "border-box", color: "var(--titre-color)", backgroundColor: "var(--background-color)" }} />
                        <button className="button-validate" onClick={() => setShowConfirmEditPassword(true)} style={{ padding: "0 1rem", fontSize: "1rem", border: "none", borderRadius: "4px", backgroundColor: "var(--button-color)", color: "#fff", cursor: "pointer", height: "2.5rem", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", transform: "translate(0px, -12px)" }}>Modifier</button>
                    </div>
                    {showConfirmEditPassword && (
                        <div className="overlay" style={{ position: "fixed", left: "0", top: "0", backgroundColor: "rgba(0, 0, 0, 0.5)", width: "100%", height: "100%", zIndex: "10" }}>
                            <div className="overlay-content" style={{ margin: "18% auto", padding: "3rem 5rem", borderRadius: "15px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                    <p style={{ color: "var(--titre-color)" }}>Êtes-vous sûr de vouloir modifier le mot de passe ?</p>
                                    {userProfil && userProfil.login === user?.login && (
                                        <input type="password" id="oldPassword" placeholder="Ancien mot de passe" style={{ flex: "1", padding: "0.5rem", fontSize: "1rem", border: "1px solid #ccc", borderRadius: "4px", marginBottom: "1rem", height: "2.5rem", boxSizing: "border-box", color: "var(--titre-color)" }} />
                                    )}
                                    <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                                        <button className="button" onClick={() => { editPassword(); setShowConfirmEditPassword(false); }} style={{ padding: "0 1rem", fontSize: "1rem", border: "none", borderRadius: "4px", backgroundColor: "#28a745", color: "#fff", cursor: "pointer", height: "2.5rem", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>Confirmer</button>
                                        <button className="button" onClick={() => setShowConfirmEditPassword(false)} style={{ padding: "0 1rem", fontSize: "1rem", border: "none", borderRadius: "4px", backgroundColor: "#dc3545", color: "#fff", cursor: "pointer", height: "2.5rem", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>Annuler</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '20px auto' }}>

                {/* Section Total */}
                <div style={{ border: '1px solid var(--card-border-color)', borderRadius: '8px', padding: '20px', marginBottom: '20px', backgroundColor: 'var(--tooltip-background-total)' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--titre-color)', fontWeight: 'bold' }}>Total</h2>

                    <div onMouseEnter={() => setHoveredElement('totalMediaEpisodes')} onMouseLeave={() => setHoveredElement(null)} style={{ position: 'relative', marginBottom: '20px' }}>
                        <p><strong>Nombre total de {totalContentLabel} :</strong> </p>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--titre-color)' }}>{TotalMedia}</p>

                        {hoveredElement === 'totalMediaEpisodes' && (
                            <div style={{ position: 'absolute', backgroundColor: 'var(--tooltip-background-hover-total)', border: '2px solid var(--tooltip-border-total)', padding: '10px', zIndex: 1, top: '100%', left: 0, boxShadow: 'var(--shadow)', borderRadius: '4px' }}>
                                {mangaMode ? (
                                    // TODO
                                    <>
                                        {/* TODO 1 : Répartition par nombre de TITRES (Médias) */}
                                        {Object.keys(combinedGenreData).map(genre => (
                                            <p key={genre} style={{ display: 'flex', gap: '1rem', color: 'var(--titre-color)' }}>
                                                <span><strong>{genre} :</strong> {combinedGenreData[genre] || 0} {totalContentLabel}</span>
                                                <span style={{ fontWeight: 'bold' }}>{totalEpisodesPercentage(combinedGenreData[genre] || 0, TotalMedia)}</span>
                                            </p>
                                        ))}
                                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}><strong>Total :</strong> {TotalMedia} {totalContentLabel}</p>
                                    </>
                                ) : (
                                    <>
                                        {Object.keys(combinedEpisodeData).map(genre => (
                                            <p key={genre} style={{ display: 'flex', gap: '1rem', color: 'var(--titre-color)' }}>
                                                <span><strong>{genre} :</strong> {combinedGenreData[genre] || 0} , {combinedEpisodeData[genre] || 0} {totalUnitLabel}</span>
                                                <span style={{ fontWeight: 'bold' }}>{totalEpisodesPercentage(combinedEpisodeData[genre] || 0, totalEpisodesTv + totalEpisodesMovie + totalEpisodesAnime)}</span>
                                            </p>
                                        ))}
                                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}><strong>Total :</strong> {TotalMedia} , {totalEpisodesTv + totalEpisodesMovie + totalEpisodesAnime} {totalUnitLabel}</p>
                                    </>
                                )}

                            </div>
                        )}
                    </div>

                    <div onMouseEnter={() => setHoveredElement('totalTime')} onMouseLeave={() => setHoveredElement(null)} style={{ position: 'relative' }}>
                        <p><strong>{totalWatchLabel} :</strong> </p>
                        {mangaMode ? (
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--titre-color)' }}>{TotalEpisodes}</p>
                        ) : (
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--titre-color)' }}>{formatTime(TotalTime)}</p>
                        )}

                        {hoveredElement === 'totalTime' && (
                            <div style={{ position: 'absolute', backgroundColor: 'var(--tooltip-background-hover-total)', border: '2px solid var(--tooltip-border-total)', padding: '10px', zIndex: 1, top: '100%', left: 0, boxShadow: 'var(--shadow)', borderRadius: '4px' }}>
                                {mangaMode ? (
                                    <>
                                        {/* TODO 2 : Répartition par nombre de CHAPITRES */}
                                        {Object.keys(combinedEpisodeData).map(genre => (
                                            <p key={genre} style={{ display: 'flex', gap: '1rem', color: 'var(--titre-color)' }}>
                                                <span><strong>{genre} :</strong> {combinedEpisodeData[genre] || 0} {totalUnitLabel}</span>
                                                <span style={{ fontWeight: 'bold' }}>{totalEpisodesPercentage(combinedEpisodeData[genre] || 0, TotalEpisodes)}</span>
                                            </p>
                                        ))}
                                        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}><strong>Total :</strong> {TotalEpisodes} {totalUnitLabel}</p>
                                    </>
                                ) : (
                                    <>
                                        {Object.keys(tvGenreData.timeCount).map(genre => (
                                            <p key={genre} style={{ display: 'flex', gap: '1rem', color: 'var(--titre-color)' }}>
                                                <span><strong>{genre} :</strong> {formatTime(tvGenreData.timeCount[genre] || 0)}</span>
                                                <span style={{ fontWeight: 'bold' }}>{totalTimePercentage(tvGenreData.timeCount[genre] || 0, TotalTime)}</span>
                                            </p>
                                        ))}
                                        {Object.keys(movieGenreData.timeCount).map(genre => (
                                            <p key={genre} style={{ display: 'flex', gap: '1rem', color: 'var(--titre-color)' }}>
                                                <span><strong>{genre} :</strong> {formatTime(movieGenreData.timeCount[genre] || 0)}</span>
                                                <span style={{ fontWeight: 'bold' }}>{totalTimePercentage(movieGenreData.timeCount[genre] || 0, TotalTime)}</span>
                                            </p>
                                        ))}
                                        {Object.keys(animeGenreData.timeCount).map(genre => (
                                            <p key={genre} style={{ display: 'flex', gap: '1rem', color: 'var(--titre-color)' }}>
                                                <span><strong>{genre} :</strong> {formatTime(animeGenreData.timeCount[genre] || 0)}</span>
                                                <span style={{ fontWeight: 'bold' }}>{totalTimePercentage(animeGenreData.timeCount[genre] || 0, TotalTime)}</span>
                                            </p>
                                        ))}
                                    </>
                                )}

                            </div>
                        )}
                    </div>
                </div>

                {/* Sections principales en rangée */}
                {mangaMode ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "20px" }}>
                        {contentStats.map((group, index) => (
                            <div key={group.key} style={{ gridColumn: index < 2 ? "span 3" : "span 2", border: '1px solid var(--card-border-color)', borderRadius: '8px', padding: '20px', marginBottom: '20px', backgroundColor: 'var(--card-background-color)', flex: '1 1 calc(33.333% - 20px)', boxSizing: 'border-box' }}>
                                <div style={{ position: 'relative', marginBottom: '20px' }}>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                                        <h2 style={{ marginBottom: '1rem', color: 'var(--titre-color)' }} onMouseEnter={() => setHoveredElement(group.key)} onMouseLeave={() => setHoveredElement(null)}>{group.label}</h2>
                                        <div style={{ position: "relative", width: 53, height: 53 }}>
                                            <svg width="53" height="53" viewBox="23.3 23.3 46.6 46.6">
                                                <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
                                                <circle cx="46.7" cy="46.7" r="20" style={{ fill: 'transparent', stroke: '#191919', strokeWidth: '4' }} />
                                                <circle cx="46.7" cy="46.7" r="20" style={{ strokeDasharray: 2 * Math.PI * 20, strokeDashoffset: 2 * Math.PI * 20 * (1 - group.totalEpisodes / TotalEpisodes), fill: 'transparent', stroke: '#da2121', strokeWidth: '4', transform: "rotate(-90deg)", transformOrigin: "46.7px 46.7px" }} />
                                                <circle cx={46.7 + 20 * Math.cos((group.totalEpisodes / TotalEpisodes) * 2 * Math.PI - Math.PI / 2)} cy={46.7 + 20 * Math.sin((group.totalEpisodes / TotalEpisodes) * 2 * Math.PI - Math.PI / 2)} r="3" fill="#da2121" filter="url(#glow)" />
                                            </svg>
                                            <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.6rem", fontWeight: "bold", color: "var(--titre-color)", pointerEvents: "none" }}>
                                                {totalEpisodesPercentage(group.totalEpisodes, TotalEpisodes)}
                                            </div>
                                        </div>
                                    </div>

                                    {hoveredElement === group.key && (
                                        <div style={{ position: 'absolute', backgroundColor: 'var(--tooltip-background-section)', border: '2px solid var(--tooltip-border-section)', padding: '10px', zIndex: 1, top: '100%', left: 0, boxShadow: 'var(--shadow)', borderRadius: '4px' }}>
                                            <p><strong>% {group.label.toLowerCase()} :</strong> {totalEpisodesPercentage(group.count, TotalMedia)}</p>
                                            <p><strong>% {totalUnitLabel} :</strong> {totalEpisodesPercentage(group.totalEpisodes, TotalEpisodes)}</p>
                                        </div>
                                    )}
                                </div>

                                <div onMouseEnter={() => setHoveredElement(`${group.key}-count`)} onMouseLeave={() => setHoveredElement(null)} style={{ position: 'relative', marginBottom: '20px' }}>
                                    <p><strong>Nombre total de {group.label.toLowerCase()} suivis :</strong> </p>
                                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--titre-color)' }}>{group.count}</p>
                                    {hoveredElement === `${group.key}-count` && (
                                        <div style={{ position: 'absolute', backgroundColor: 'var(--tooltip-background-section)', border: '2px solid var(--tooltip-border-section)', padding: '10px', zIndex: 1, top: '100%', left: 0, boxShadow: 'var(--shadow)', borderRadius: '4px' }}>
                                            {Object.keys(group.genreData.episodeCount).map(genre => (
                                                <p key={genre} style={{ display: 'flex', gap: '1rem', color: 'var(--titre-color)' }}>
                                                    <span><strong>{genre} :</strong> {group.genreData.genreCount[genre]} {group.label}</span>
                                                    <span style={{ fontWeight: 'bold' }}> {totalEpisodesPercentage(group.genreData.genreCount[genre] || 0, group.count || 0)}</span>
                                                </p>
                                            ))}
                                            <p style={{ fontWeight: 'bold' }}><strong>Total :</strong> {group.totalEpisodes} {totalUnitLabel} ({totalEpisodesPercentage(group.totalEpisodes, TotalEpisodes)})</p>
                                        </div>
                                    )}
                                </div>

                                <div onMouseEnter={() => setHoveredElement(`${group.key}-time`)} onMouseLeave={() => setHoveredElement(null)} style={{ position: 'relative' }}>
                                    <p><strong>Total de {totalUnitLabel} :</strong></p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{group.totalEpisodes}</p>
                                    {hoveredElement === `${group.key}-time` && (
                                        <div style={{ position: 'absolute', backgroundColor: 'var(--tooltip-background-section)', border: '2px solid var(--tooltip-border-section)', padding: '10px', zIndex: 1, top: '100%', left: 0, boxShadow: 'var(--shadow)', borderRadius: '4px' }}>
                                            {Object.keys(group.genreData.episodeCount).map(genre => (
                                                <p key={genre} style={{ display: 'flex', gap: '1rem', color: 'var(--titre-color)' }}>
                                                    <span><strong>{genre} :</strong> {group.genreData.episodeCount[genre] || 0} {totalUnitLabel}</span>
                                                    <span style={{ fontWeight: 'bold' }}>{totalEpisodesPercentage(group.genreData.episodeCount[genre] || 0, group.totalEpisodes || 0)}</span>
                                                </p>
                                            ))}
                                            <p style={{ fontWeight: 'bold' }}><strong>Total :</strong> {group.totalEpisodes} {totalUnitLabel} ({totalEpisodesPercentage(group.totalEpisodes, TotalEpisodes)})</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        {/* Section Séries TV */}
                        <div style={{ border: '1px solid var(--card-border-color)', borderRadius: '8px', padding: '20px', marginBottom: '20px', backgroundColor: 'var(--card-background-color)', flex: '1 1 calc(33.333% - 20px)', boxSizing: 'border-box' }}>
                            <div style={{ position: 'relative', marginBottom: '20px' }}>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                                    <h2 style={{ marginBottom: '1rem', color: 'var(--titre-color)' }} onMouseEnter={() => setHoveredElement('totalTV')} onMouseLeave={() => setHoveredElement(null)}>Séries TV</h2>
                                    <div style={{ position: "relative", width: 53, height: 53 }}>
                                        <svg width="53" height="53" viewBox="23.3 23.3 46.6 46.6">
                                            <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
                                            <circle cx="46.7" cy="46.7" r="20" style={{ fill: 'transparent', stroke: '#191919', strokeWidth: '4' }} />
                                            <circle cx="46.7" cy="46.7" r="20" style={{ strokeDasharray: 2 * Math.PI * 20, strokeDashoffset: 2 * Math.PI * 20 * (1 - TotalTimeTv / TotalTime), fill: 'transparent', stroke: '#da2121', strokeWidth: '4', transform: "rotate(-90deg)", transformOrigin: "46.7px 46.7px" }} />
                                            <circle cx={46.7 + 20 * Math.cos((TotalTimeTv / TotalTime) * 2 * Math.PI - Math.PI / 2)} cy={46.7 + 20 * Math.sin((TotalTimeTv / TotalTime) * 2 * Math.PI - Math.PI / 2)} r="3" fill="#da2121" filter="url(#glow)" />
                                        </svg>
                                        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.6rem", fontWeight: "bold", color: "var(--titre-color)", pointerEvents: "none" }}>
                                            {totalTimePercentage(TotalTimeTv, TotalTime)}
                                        </div>
                                    </div>
                                </div>

                                {hoveredElement === "totalTV" && (
                                    <div style={{ position: 'absolute', backgroundColor: 'var(--tooltip-background-section)', border: '2px solid var(--tooltip-border-section)', padding: '10px', zIndex: 1, top: '100%', left: 0, boxShadow: 'var(--shadow)', borderRadius: '4px' }}>
                                        <p><strong>% séries TV :</strong> {totalEpisodesPercentage(nbTv, TotalMedia)}</p>
                                        <p><strong>% épisodes séries TV :</strong> {totalEpisodesPercentage(totalEpisodesTv, totalEpisodes)}</p>
                                        <p><strong>% temps total séries TV :</strong> {totalTimePercentage(TotalTimeTv, TotalTime)}</p>
                                    </div>
                                )}
                            </div>

                            <div onMouseEnter={() => setHoveredElement('totalTvEpisodes')} onMouseLeave={() => setHoveredElement(null)} style={{ position: 'relative', marginBottom: '20px' }}>
                                <p><strong>Nombre total de séries TV suivies :</strong> </p>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--titre-color)' }}>{nbTv}</p>

                                {hoveredElement === 'totalTvEpisodes' && (
                                    <div style={{ position: 'absolute', backgroundColor: 'var(--tooltip-background-section)', border: '2px solid var(--tooltip-border-section)', padding: '10px', zIndex: 1, top: '100%', left: 0, boxShadow: 'var(--shadow)', borderRadius: '4px' }}>
                                        {Object.keys(tvGenreData.episodeCount).map(genre => (
                                            <p key={genre} style={{ display: 'flex', gap: '0.5rem', color: 'var(--titre-color)' }}>
                                                <span><strong>{genre} :</strong> {tvGenreData.genreCount[genre]} , {tvGenreData.episodeCount[genre] || 0} épisodes</span>
                                                <span style={{ fontWeight: 'bold' }}>{totalEpisodesPercentage(tvGenreData.episodeCount[genre] || 0, totalEpisodesTv)}</span>
                                            </p>
                                        ))}
                                        <p style={{ fontWeight: 'bold' }}><strong>Total :</strong> {totalEpisodesTv} épisodes ({totalEpisodesPercentage(totalEpisodesTv, totalEpisodes)})</p>
                                    </div>
                                )}
                            </div>

                            <div onMouseEnter={() => setHoveredElement('totalTvTime')} onMouseLeave={() => setHoveredElement(null)} style={{ position: 'relative' }}>
                                <p><strong>Temps total pour les séries TV :</strong> </p>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--titre-color)' }}>{formatTime(TotalTimeTv)}</p>

                                {hoveredElement === 'totalTvTime' && (
                                    <div style={{ position: 'absolute', backgroundColor: 'var(--tooltip-background-section)', border: '2px solid var(--tooltip-border-section)', padding: '10px', zIndex: 1, top: '100%', left: 0, boxShadow: 'var(--shadow)', borderRadius: '4px' }}>
                                        {Object.keys(tvGenreData.timeCount).map(genre => (
                                            <p key={genre} style={{ display: 'flex', gap: '1rem', color: 'var(--titre-color)' }}>
                                                <span><strong>{genre} :</strong> {formatTime(tvGenreData.timeCount[genre] || 0)}</span>
                                                <span style={{ fontWeight: 'bold' }}>{totalTimePercentage(tvGenreData.timeCount[genre] || 0, TotalTimeTv)}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section Animés */}
                        <div style={{ border: '1px solid var(--card-border-color)', borderRadius: '8px', padding: '20px', marginBottom: '20px', backgroundColor: 'var(--card-background-color)', flex: '1 1 calc(33.333% - 20px)', boxSizing: 'border-box' }}>
                            <div style={{ position: 'relative', marginBottom: '20px' }}>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                                    <h2 style={{ marginBottom: '1rem', color: 'var(--titre-color)' }} onMouseEnter={() => setHoveredElement('totalAnime')} onMouseLeave={() => setHoveredElement(null)}>Animés</h2>
                                    <div style={{ position: "relative", width: 53, height: 53 }}>
                                        <svg width="53" height="53" viewBox="23.3 23.3 46.6 46.6">
                                            <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
                                            <circle cx="46.7" cy="46.7" r="20" style={{ fill: 'transparent', stroke: '#191919', strokeWidth: '4' }} />
                                            <circle cx="46.7" cy="46.7" r="20" style={{ strokeDasharray: 2 * Math.PI * 20, strokeDashoffset: 2 * Math.PI * 20 * (1 - TotalTimeAnime / TotalTime), fill: 'transparent', stroke: '#200ec2', strokeWidth: '4', transform: "rotate(-90deg)", transformOrigin: "46.7px 46.7px" }} />
                                            <circle cx={46.7 + 20 * Math.cos((TotalTimeAnime / TotalTime) * 2 * Math.PI - Math.PI / 2)} cy={46.7 + 20 * Math.sin((TotalTimeAnime / TotalTime) * 2 * Math.PI - Math.PI / 2)} r="3" fill="#200ec2" filter="url(#glow)" />
                                        </svg>
                                        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.6rem", fontWeight: "bold", color: "var(--titre-color)", pointerEvents: "none" }}>
                                            {totalTimePercentage(TotalTimeAnime, TotalTime)}
                                        </div>
                                    </div>
                                </div>

                                {hoveredElement === "totalAnime" && (
                                    <div style={{ position: 'absolute', backgroundColor: 'var(--tooltip-background-section)', border: '2px solid var(--tooltip-border-section)', padding: '10px', zIndex: 1, top: '100%', left: 0, boxShadow: 'var(--shadow)', borderRadius: '4px' }}>
                                        <p><strong>% anime :</strong> {totalEpisodesPercentage(nbAnime, TotalMedia)}</p>
                                        <p><strong>% épisodes anime :</strong> {totalEpisodesPercentage(totalEpisodesAnime, totalEpisodes)}</p>
                                        <p><strong>% temps total anime :</strong> {totalTimePercentage(TotalTimeAnime, TotalTime)}</p>
                                    </div>
                                )}
                            </div>

                            <div onMouseEnter={() => setHoveredElement('totalAnimeEpisodes')} onMouseLeave={() => setHoveredElement(null)} style={{ position: 'relative', marginBottom: '20px' }}>
                                <p><strong>Nombre total d&apos;animés suivis :</strong> </p>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--titre-color)' }}>{nbAnime}</p>

                                {hoveredElement === 'totalAnimeEpisodes' && (
                                    <div style={{ position: 'absolute', backgroundColor: 'var(--tooltip-background-section)', border: '2px solid var(--tooltip-border-section)', padding: '10px', zIndex: 1, top: '100%', left: 0, boxShadow: 'var(--shadow)', borderRadius: '4px' }}>
                                        {Object.keys(animeGenreData.episodeCount).map(genre => (
                                            <p key={genre} style={{ display: 'flex', gap: '1rem', color: 'var(--titre-color)' }}>
                                                <span><strong>{genre} :</strong> {animeGenreData.genreCount[genre]} , {animeGenreData.episodeCount[genre] || 0} épisodes</span>
                                                <span style={{ fontWeight: 'bold' }}>{totalEpisodesPercentage(animeGenreData.episodeCount[genre] || 0, totalEpisodesAnime)}</span>
                                            </p>
                                        ))}
                                        <p style={{ fontWeight: 'bold' }}><strong>Total :</strong> {totalEpisodesAnime} épisodes ({totalEpisodesPercentage(totalEpisodesAnime, totalEpisodes)})</p>
                                    </div>
                                )}
                            </div>

                            <div onMouseEnter={() => setHoveredElement('totalAnimeTime')} onMouseLeave={() => setHoveredElement(null)} style={{ position: 'relative' }}>
                                <p><strong>Temps total pour les animés :</strong> </p>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--titre-color)' }}>{formatTime(TotalTimeAnime)}</p>

                                {hoveredElement === 'totalAnimeTime' && (
                                    <div style={{ position: 'absolute', backgroundColor: 'var(--tooltip-background-section)', border: '2px solid var(--tooltip-border-section)', padding: '10px', zIndex: 1, top: '100%', left: 0, boxShadow: 'var(--shadow)', borderRadius: '4px' }}>
                                        {Object.keys(animeGenreData.timeCount).map(genre => (
                                            <p key={genre} style={{ display: 'flex', gap: '1rem', color: 'var(--titre-color)' }}>
                                                <span><strong>{genre} :</strong> {formatTime(animeGenreData.timeCount[genre] || 0)}</span>
                                                <span style={{ fontWeight: 'bold' }}>{totalTimePercentage(animeGenreData.timeCount[genre] || 0, TotalTimeAnime)}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section Films */}
                        <div style={{ border: '1px solid var(--card-border-color)', borderRadius: '8px', padding: '20px', marginBottom: '20px', backgroundColor: 'var(--card-background-color)', flex: '1 1 calc(33.333% - 20px)', boxSizing: 'border-box' }}>
                            <div style={{ position: 'relative', marginBottom: '20px' }}>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                                    <h2 style={{ marginBottom: '1rem', color: 'var(--titre-color)' }} onMouseEnter={() => setHoveredElement('totalFilm')} onMouseLeave={() => setHoveredElement(null)}>Films</h2>
                                    <div style={{ position: "relative", width: 53, height: 53 }}>
                                        <svg width="53" height="53" viewBox="23.3 23.3 46.6 46.6">
                                            <defs><filter id="glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
                                            <circle cx="46.7" cy="46.7" r="20" style={{ fill: 'transparent', stroke: '#191919', strokeWidth: '4' }} />
                                            <circle cx="46.7" cy="46.7" r="20" style={{ strokeDasharray: 2 * Math.PI * 20, strokeDashoffset: 2 * Math.PI * 20 * (1 - TotalTimeMovie / TotalTime), fill: 'transparent', stroke: '#21da2a', strokeWidth: '4', transform: "rotate(-90deg)", transformOrigin: "46.7px 46.7px" }} />
                                            <circle cx={46.7 + 20 * Math.cos((TotalTimeMovie / TotalTime) * 2 * Math.PI - Math.PI / 2)} cy={46.7 + 20 * Math.sin((TotalTimeMovie / TotalTime) * 2 * Math.PI - Math.PI / 2)} r="3" fill="#21da2a" filter="url(#glow)" />
                                        </svg>
                                        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.6rem", fontWeight: "bold", color: "var(--titre-color)", pointerEvents: "none" }}>
                                            {totalTimePercentage(TotalTimeMovie, TotalTime)}
                                        </div>
                                    </div>
                                </div>

                                {hoveredElement === "totalFilm" && (
                                    <div style={{ position: 'absolute', backgroundColor: 'var(--tooltip-background-section)', border: '2px solid var(--tooltip-border-section)', padding: '10px', zIndex: 1, top: '100%', left: 0, boxShadow: 'var(--shadow)', borderRadius: '4px' }}>
                                        <p><strong>% films :</strong> {totalEpisodesPercentage(nbMovie, TotalMedia)}</p>
                                        <p><strong>% épisodes films :</strong> {totalEpisodesPercentage(totalEpisodesMovie, totalEpisodes)}</p>
                                        <p><strong>% temps total films :</strong> {totalTimePercentage(TotalTimeMovie, TotalTime)}</p>
                                    </div>
                                )}
                            </div>

                            <div onMouseEnter={() => setHoveredElement('totalMovieEpisodes')} onMouseLeave={() => setHoveredElement(null)} style={{ position: 'relative', marginBottom: '20px' }}>
                                <p><strong>Nombre total de films suivis :</strong> </p>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--titre-color)' }}>{nbMovie}</p>

                                {hoveredElement === 'totalMovieEpisodes' && (
                                    <div style={{ position: 'absolute', backgroundColor: 'var(--tooltip-background-section)', border: '2px solid var(--tooltip-border-section)', padding: '10px', zIndex: 1, top: '100%', left: 0, boxShadow: 'var(--shadow)', borderRadius: '4px' }}>
                                        {Object.keys(movieGenreData.episodeCount).map(genre => (
                                            <p key={genre} style={{ display: 'flex', gap: '1rem', color: 'var(--titre-color)' }}>
                                                <span><strong>{genre} :</strong> {movieGenreData.genreCount[genre]} , {movieGenreData.episodeCount[genre] || 0} épisodes</span>
                                                <span style={{ fontWeight: 'bold' }}>{totalEpisodesPercentage(movieGenreData.episodeCount[genre] || 0, totalEpisodesMovie)}</span>
                                            </p>
                                        ))}
                                        <p style={{ fontWeight: 'bold' }}><strong>Total :</strong> {totalEpisodesMovie} épisodes ({totalEpisodesPercentage(totalEpisodesMovie, totalEpisodes)})</p>
                                    </div>
                                )}
                            </div>

                            <div onMouseEnter={() => setHoveredElement('totalMovieTime')} onMouseLeave={() => setHoveredElement(null)} style={{ position: 'relative' }}>
                                <p><strong>Temps total pour les films :</strong> </p>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--titre-color)' }}>{formatTime(TotalTimeMovie)}</p>

                                {hoveredElement === 'totalMovieTime' && (
                                    <div style={{ position: 'absolute', backgroundColor: 'var(--tooltip-background-section)', border: '2px solid var(--tooltip-border-section)', padding: '10px', zIndex: 1, top: '100%', left: 0, boxShadow: 'var(--shadow)', borderRadius: '4px' }}>
                                        {Object.keys(movieGenreData.timeCount).map(genre => (
                                            <p key={genre} style={{ display: 'flex', gap: '1rem', color: 'var(--titre-color)' }}>
                                                <span><strong>{genre} :</strong> {formatTime(movieGenreData.timeCount[genre] || 0)}</span>
                                                <span style={{ fontWeight: 'bold' }}>{totalTimePercentage(movieGenreData.timeCount[genre] || 0, TotalTimeMovie)}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>


            <div>
                <h1 style={{ color: "var(--titre-color)" }}>TOP</h1>
                <div>
                    <h2 style={{ color: "var(--titre-color)" }}>Récemment vue</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span style={{ color: "var(--titre-color)" }}>Format</span>
                        <MultiSelectDropdown options={mangaMode ? ['manga', 'manhwa', 'manhua', 'novel', 'one_shot'] : ['tv', 'movie', 'anime', "film d'animation"]} selectedOptions={selectedRecentFormats} onSelect={setSelectedRecentFormats} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative', cursor: 'pointer', marginRight: '-1.5rem', width: "max-content" }} onClick={() => setOrderAscRecent(!orderAscRecent)}  >
                        <Order width={30} height={30} orderAsc={orderAscRecent} />
                    </div>
                    <SeriesList series={recentSeries} styleType={"grid"} followedIds={recentSeries.map(serie => serie.id)} onClickHeart={onClickHeart} limit={8} size="very-small" isList={true} mode={mangaMode ? 'mangas' : 'series'} />
                </div>

                <div>
                    <h2 style={{ color: "var(--titre-color)" }}>Les mieux notés</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span style={{ color: "var(--titre-color)" }}>Format</span>
                        <MultiSelectDropdown options={mangaMode ? ['manga', 'manhwa', 'manhua', 'novel', 'one_shot'] : ['tv', 'movie', 'anime', "film d'animation"]} selectedOptions={selectedRatingFormats} onSelect={setSelectedRatingFormats} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative', cursor: 'pointer', marginRight: '-1.5rem', width: "max-content" }} onClick={() => setOrderAscRating(!orderAscRating)}  >
                        <Order width={30} height={30} orderAsc={orderAscRating} />
                    </div>
                    <SeriesList series={ratedSeries} styleType={"grid"} followedIds={ratedSeries.map(serie => serie.id)} onClickHeart={onClickHeart} limit={8} size="very-small" isList={true} mode={mangaMode ? 'mangas' : 'series'} />
                </div>

                <div>
                    <h2 style={{ color: "var(--titre-color)" }}>Les plus longs</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span style={{ color: "var(--titre-color)" }}>Format</span>
                        <MultiSelectDropdown options={mangaMode ? ['manga', 'manhwa', 'manhua', 'novel', 'one_shot'] : ['tv', 'movie', 'anime', "film d'animation"]} selectedOptions={selectedLongFormats} onSelect={setSelectedLongFormats} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', position: 'relative', cursor: 'pointer', marginRight: '-1.5rem', width: "max-content" }} onClick={() => setOrderAscTime(!orderAscTime)}  >
                        <Order width={30} height={30} orderAsc={orderAscTime} />
                    </div>
                    <SeriesList series={longSeries} styleType={"grid"} followedIds={longSeries.map(serie => serie.id)} onClickHeart={onClickHeart} limit={8} size="very-small" isList={true} mode={mangaMode ? 'mangas' : 'series'} />
                </div>
            </div>
        </div>
    );
}