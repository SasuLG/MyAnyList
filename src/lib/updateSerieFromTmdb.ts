import { importSerie } from "@/bdd/requests/admin-series.request";
import { getSerieById } from "@/bdd/requests/series.request";
import { getDetailsMovieById, getDetailsSeasonsBySeasonNumber, getDetailsSeriesById, getMoviesTagsByMovieId, getSeriesTagsBySerieId } from "@/tmdb/requests/tseries.request";
import { Serie } from "@/tmdb/types/series.type";
import { toRomaji } from "wanakana";
import path from 'path';

function uniqueBy<T>(array: T[], keyFn: (item: T) => string): T[] {
    const seen = new Set<string>();
    return array.filter(item => {
        const key = keyFn(item).toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export async function updateSerieFromTmdb(id: string, tmdbId: string, media: string, existingGenresMap: Map<string, any>) {
    try {
        let mediaType = media
        if(media == "anime"){
            mediaType = "tv"
        }
        else if (media == "film d'animation"){
            mediaType = "movie"
        }
        // Récupérer les détails de la série
        let detailsData;
        if(mediaType === "movie"){
            detailsData = await getDetailsMovieById(Number(tmdbId))
        }else{
            detailsData = await getDetailsSeriesById(Number(tmdbId))
        }
        // Vérifier si c'est un film ou une série
        const isMovie = mediaType === 'movie';
        // Préparer les détails de chaque saison si ce n'est pas un film
        let seasonDetailsDataArray: any[] = [];
        if (!isMovie && detailsData.seasons) {
            const seasonDetailsPromises = detailsData.seasons.map((season: any) =>
                getDetailsSeasonsBySeasonNumber(Number(tmdbId), season.season_number)
            );
            seasonDetailsDataArray = await Promise.all(seasonDetailsPromises);
        }
        // Récupérer les tags associés à la série
        let tagsData;
        if(mediaType === "movie"){
            tagsData = await getMoviesTagsByMovieId(Number(tmdbId));
        }else{
            tagsData = await getSeriesTagsBySerieId(Number(tmdbId));
        }
        
        // Déterminer le champ contenant les tags
        const tags = (tagsData as any).results || (tagsData as any).keywords || (Array.isArray(tagsData) ? tagsData : []);    
        
        // Si pas d'episode run_time pour une série, on prend la moyenne des run_time des épisodes
        const totalEpisodes = seasonDetailsDataArray.reduce((total: number, season: any) => total + season.episodes.length, 0);
        const totalTime = seasonDetailsDataArray.reduce((total: number, season: any) => {
            return total + season.episodes.reduce((episodeTotal: number, episode: any) => episodeTotal + (episode.runtime || 0), 0);
        }, 0);
        const averageTime = totalEpisodes > 0 ? Math.round(totalTime / totalEpisodes) : 0;

                // --- Nettoyage des doublons ---
        const cleanGenres = uniqueBy(detailsData.genres || [], g => g.name);
        const cleanLanguages = uniqueBy(detailsData.spoken_languages || [], l => l.name);
        const cleanCountries = uniqueBy(detailsData.production_countries || [], c => c.name);
        const cleanCompanies = uniqueBy(detailsData.production_companies || [], c => c.name);
        // Préparer l'objet ImportSeries avec les données reçues
        const importSeriesData: Serie = {
            id: tmdbId,
            tmdb_id: id,
            name: (detailsData as any).name || (detailsData as any).title,
            original_name: (detailsData as any).original_name || (detailsData as any).original_title,
            romaji_name: '', // Ajouter le champ romaji_name ici
            overview: detailsData.overview,
            poster_path: detailsData.poster_path,
            backdrop_path: detailsData.backdrop_path || "",
            first_air_date: isMovie ? (detailsData as any).release_date || "" : (detailsData as any).first_air_date || "",
            last_air_date: isMovie ? (detailsData as any).release_date || "" : (detailsData as any).last_air_date || "",
            vote_average: detailsData.vote_average || 0,
            vote_count: detailsData.vote_count || 0,
            genres: cleanGenres,
            spoken_languages: cleanLanguages,
            production_countries: cleanCountries,
            production_companies: cleanCompanies,
            number_of_episodes: !isMovie ? detailsData.number_of_episodes || 0 : 1,
            number_of_seasons: !isMovie ? detailsData.number_of_seasons || 0 : 1,
            episode_run_time: isMovie ? (detailsData as any).runtime || null : (detailsData.episode_run_time && detailsData.episode_run_time > 0) ? (detailsData as any).episode_run_time[0] : averageTime,
            status: detailsData.status || "",
            media_type: mediaType || "",
            total_time: !isMovie && detailsData.seasons ? detailsData.seasons.reduce((total: number, season: any) => total + (season.total_time || 0), 0) : ((detailsData as any).runtime || 0),
            origin_country: isMovie ? detailsData.origin_country : detailsData.origin_country || [],
            popularity: detailsData.popularity || 0,
            budget: detailsData.budget || 0,
            tags: tags || [],
            revenue: detailsData.revenue || 0,
            seasons: !isMovie ? detailsData.seasons.map((season: any, index: number) => {
                const seasonPosterPath = season.background_path || season.poster_path;
                const seasonEpisodes = (seasonDetailsDataArray[index]?.episodes || []).map((e: any) => ({
                    ...e,
                    season_id: season.id,
                    runtime: e.runtime || (detailsData as any).episode_run_time[0] || averageTime  
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
        
        // Liste des genres à ajouter
        const genresToAdd: any[] = [];
        (detailsData.genres || []).forEach((genre: any) => {
            if (genre.name.toLowerCase() === "animation") {
                mediaType = "anime";
            }
        });
        let hasAnimationGenre = false;
        (tags || []).forEach((tag: any) => {
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
    
            // Ajouter le nom en romaji
        const namesResponse = await translate([importSeriesData.original_name]);
        const namesData = await namesResponse.json();
        if (namesData.texts && namesData.texts.length > 0) {
            importSeriesData.romaji_name = namesData.texts[0];
        }
        // Récupérer la série existante
        const existingSerie = await getSerieById(tmdbId);

        // Préparer l'objet qui contiendra les modifications
        const changes: { description: string; important: boolean; ultra?: boolean }[] = [];
        try {
            if (!importSeriesData.name || !importSeriesData.overview) {
                changes.push({
                    description: `Problème critique : données incomplètes pour la série (tmdbId=${tmdbId}). L'ID TMDB a probablement changé.`,
                    important: true,
                    ultra: true
                });
                return {
                    name: `Serie inconnue (tmdbId=${tmdbId})`,
                    changes
                };
            }

            if (!existingSerie || existingSerie.title !== importSeriesData.name) {
                changes.push({ description: `Nom modifié : "${existingSerie?.title || 'N/A'}" → "${importSeriesData.name}"`, important: false });
            }
            if (!existingSerie || existingSerie.overview !== importSeriesData.overview) {
                changes.push({ description: `Synopsis mis à jour`, important: false });
            }
            if (!existingSerie || existingSerie.status !== importSeriesData.status) {
                changes.push({ description: `Statut changé : "${existingSerie?.status || 'N/A'}" → "${importSeriesData.status}"`, important: false });
            }
            if (!existingSerie || existingSerie.nb_seasons !== importSeriesData.number_of_seasons) {
                changes.push({ description: `Nombre de saisons : ${existingSerie?.nb_seasons || 0} → ${importSeriesData.number_of_seasons}`, important: true });
            }
            if (!existingSerie || existingSerie.nb_episodes !== importSeriesData.number_of_episodes) {
                changes.push({ description: `Nombre d'épisodes : ${existingSerie?.nb_episodes || 0} → ${importSeriesData.number_of_episodes}`, important: true });
            }

            if (changes.length > 0) {
                await importSerie(importSeriesData);
                return {
                    name: importSeriesData.name,
                    changes
                };
            } else {
                return null;
            }
        } catch (err) {
            console.error("Erreur critique lors de l'import de la série:", err);
            changes.push({
                description: `Erreur critique lors de la mise à jour de la série (tmdbId=${tmdbId}). Vérifiez l'ID TMDB.`,
                important: true,
                ultra: true
            });
            return {
                name: `Serie inconnue (tmdbId=${tmdbId})`,
                changes
            };
        }
    } catch (error) {
        console.error("Erreur lors de l'importation des détails de la série:", error);
        throw error;
    }
};

// Importation dynamique de kuromoji
const kuromoji = require('kuromoji');

export async function translate(texts: string[]): Promise<Response>  {
    try {

        // Validation des entrées
        if (!Array.isArray(texts) || texts.some(text => typeof text !== 'string')) {
            return new Response(JSON.stringify({ error: "Invalid input format" }), { status: 400 });
        }

        // Initialisation du tokenizer
        let dictPath = 'node_modules/kuromoji/dict';
        if(process.env.NODE_ENV === 'production') dictPath = path.resolve(process.cwd(), 'public/kuromoji-dict');
        const tokenizerPromise = new Promise<any>((resolve, reject) => {
            kuromoji.builder({ dicPath: dictPath }).build((err: any, tokenizer: any) => {
                if (err) reject(err);
                else resolve(tokenizer);
            });
        });

        const tokenizer = await tokenizerPromise;
        // Fonction pour translittérer un texte en romaji
        const transliterateText = (text: string): string => {
            const tokens = tokenizer.tokenize(text);

            let romajiText = '';
            let currentRomajiToken = '';
            let lastWasJapanese = false;

            tokens.forEach((token: any) => {
                const isJapanese = /[\u3040-\u30FF\u4E00-\u9FAF]/.test(token.surface_form);
                const tokenText = token.reading ? toRomaji(token.reading) : token.surface_form;

                if (isJapanese) {
                    if (currentRomajiToken) {
                        romajiText += currentRomajiToken.trim() + ' ';
                        currentRomajiToken = '';
                    }
                    romajiText += tokenText + ' ';
                    lastWasJapanese = true;
                } else {
                    if (lastWasJapanese && romajiText.length > 0) {
                        romajiText += ' ';
                    }
                    currentRomajiToken += tokenText;
                    lastWasJapanese = false;
                }
            });
            // Ajouter le dernier token romaji s'il y en a
            if (currentRomajiToken) {
                romajiText += currentRomajiToken.trim();
            }

            // Supprimer les espaces supplémentaires à la fin
            romajiText = romajiText.trim();

            // Éviter les espaces avant la ponctuation
            romajiText = romajiText.replace(/ \s*([,!?-])/g, '$1');

            // Capitaliser les mots correctement
            romajiText = romajiText
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            return romajiText;
        };

        // Translittérer chaque texte dans le tableau
        const romajiTexts = texts.map(text => transliterateText(text));
        return new Response(JSON.stringify({ texts: romajiTexts }), { status: 200 });
    } catch (err) {
        console.error("Erreur lors de la translittération:", err);
        return new Response(JSON.stringify({ error: "Erreur lors de la translittération" }), { status: 500 });
    }
}
