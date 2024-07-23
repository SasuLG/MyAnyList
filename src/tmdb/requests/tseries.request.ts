"use server";

import fetch from "node-fetch";
import https from "node:https";
import { ImportSeries, SearchSeries } from "../types/series.type";

export async function getSeriesBySearch(query: string): Promise<SearchSeries[]> {
    const data = await fetch(`https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=fr-FR&page=1`, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_TOKEN}`
        },
        agent: new https.Agent({
            rejectUnauthorized: false
        })
    });
    const response = await data.json();
    const results = (response as any).results as any[];

    // Mapper les résultats pour gérer les champs alternatifs
    const series: SearchSeries[] = results.map(result => ({
        id: result.id,
        tmdb_id: result.tmdb_id || '',
        name: result.name || result.title || '', // Utiliser `title` si `name` est absent
        overview: result.overview || '',
        poster_path: result.poster_path || '',
        first_air_date: result.first_air_date || '',
        original_language: result.original_language || '',
        original_name: result.original_name || result.original_title || '', // Utiliser `original_title` si `original_name` est absent
        media_type: result.media_type || ''
    }));

    return series;
}

/**
 * Fonction qui permet de récupérer les détails d'une série
 * @param id - id de la série
 */
export async function getDetailsSeriesById(id: number){
    const data = await fetch(`https://api.themoviedb.org/3/tv/${id}?language=fr-FR`, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_TOKEN}`
        },
        agent: new https.Agent({
            rejectUnauthorized: false
        })
    });
    const response = await data.json() as ImportSeries;
    return response;
}

/**
 * Fonction qui permet de récupérer les détails d'un film
 * @param id - id du film
 */
export async function getDetailsMovieById(id: number){
    const data = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=fr-FR`, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_TOKEN}`
        },
        agent: new https.Agent({
            rejectUnauthorized: false
        })
    });
    const response = await data.json() as ImportSeries;
    return response;
}

/**
 * Fonction qui permet de récupérer les détails d'une saison d'une série
 * @param id - id de la série
 * @param season_number - numéro de la saison
 */
export async function getDetailsSeasonsBySeasonNumber(id: number, season_number: number){
    const data = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${season_number}?language=fr-FR`, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_TOKEN}`
        },
        agent: new https.Agent({
            rejectUnauthorized: false
        })
    });
    const response = await data.json() as ImportSeries;
    return response;
}
