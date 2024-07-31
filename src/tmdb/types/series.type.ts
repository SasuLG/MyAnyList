type TmdbId = {
    tmdb_id: string;
}

type ApiSerie = {
    id: string;
    tmdb_id: string;
    name: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    first_air_date: string;
    original_language: string;
    original_name: string;
    media_type: string;
    origin_country: string[];
    /*vote average
    vote count */
}   

type Genre = {
    id: string;
    name: string;
}

type Language = {
    id: string;
    iso_639_1: string;
    name: string;
    english_name: string;
}

type ProductionCountry = {
    id: string;
    iso_3166_1: string;
    name: string;
}

type ProductionCompany = {
    id: string;
    name: string;
}

type Episode = {
    id: string;
    season_id: string;
    episode_number: number;
    overview: string;
    name: string;
    runtime: number;
    still_path: string;
}

type Season = {
    id: string;
    tmdb_id: string;
    serie_id: string;
    season_number: number;
    name: string;
    overview: string;
    poster_path: string;
    air_date: string;
    vote_average: number;
    total_time: number;
    episodes: Episode[];
}

type Serie = {
    id: string; 
    tmdb_id: string;
    name: string;
    overview: string;
    poster_path: string; 
    backdrop_path: string; 
    media_type: string;
    original_name: string;
    status: string;
    first_air_date: string;
    last_air_date: string;
    total_time: number;
    number_of_seasons: number;
    number_of_episodes: number;
    episode_run_time: number | null;
    genres: Genre[];
    spoken_languages: Language[];
    production_countries: ProductionCountry[];
    production_companies: ProductionCompany[];
    seasons: Season[];
    vote_average: number; 
    vote_count: number;   
    origin_country: string[];
    popularity: number;
    budget: number;
    revenue: number;
}

type MinimalSerie = {
    id: string;
    tmdb_id: string;
    name: string;
    overview: string;
    poster_path: string;
    media_type: string;
    status: string;
    number_of_episodes: number;
    genres: Genre[];
    vote_average: number;
    popularity: number;//pas sur
    origin_country: string[];
    episode_run_time: number;
    note?: number;

    first_air_date: string;//pas sur
    last_air_date: string;//pas sur
}


export type { TmdbId, ApiSerie, Genre, Language, ProductionCountry, ProductionCompany, Episode, Season, Serie, MinimalSerie };