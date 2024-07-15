"use server";

import fetch from "node-fetch";
import https from "node:https";
import { ImportSeries } from "@/tmdb/types/series.type";

export async function getSeriesBySearch(){//TODO mettre en parametre avec un query
    const data = await fetch("https://api.themoviedb.org/3/search/multi?query=attack%20on%20titan&include_adult=false&language=fr-FR&page=1", {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_TOKEN}`
        },
        agent: new https.Agent({
            rejectUnauthorized: false
        })
    });
    const response = await data.json() ;
    const res = (response as any).results as ImportSeries[];
    return res;
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
    const response = await data.json() ;
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
    const response = await data.json() ;
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
    const response = await data.json() ;
    return response;
}
