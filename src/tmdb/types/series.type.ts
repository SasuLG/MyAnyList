type ApiSeries = {
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
}   

type ImportSeries = { /*id = tmdbId */
    id: string;
    name: string;
    original_name: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    first_air_date: string;
    last_air_date: string;
    vote_average: number;
    vote_count: number;
    genres: {
        id: number;
        name: string;
    }[];
    languages: string[];
    number_of_episodes: number;
    number_of_seasons: number;
    origin_country: string[];
    status: string;
    media_type: string;
    episode_run_time: number;

    seasons: {
        air_date: string;
        episode_count: number;
        id: number;
        name: string;
        overview: string;
        poster_path: string;
        season_number: number;
        vote_average: number;
    }[];

    episodes: {
        air_date: string;
        episode_number: number;
        id: number;
        name: string;
        overview: string;
        runtime: number;
        season_number: number;
        still_path: string;
        vote_average: number;
        vote_count: number;
    }[];

    production_companies: {
        id: number;
        logo_path: string;
        name: string;
        origin_country: string;
    }[];

    production_countries: {
        iso_3166_1: string; /* à ajouter dans les countries? */
        name: string;
    }[];

    spoken_languages: {
        english_name: string;
        iso_639_1: string;
        name: string;
    }[];

    created_by: {
        id: number;
        credit_id: string;
        name: string;
    }[];
}

type Genre = {
    id: number;
    name: string;
}

type Language = {
    id: number;
    name: string;
}

type ProductionCountry = {
    id: number;
    name: string;
}

type ProductionCompany = {
    id: number;
    name: string;
}

type Episode = {
    id: number;
    season_id: number;
    number: number;
    title: string;
    overview: string;
    name: string;
    runtime: number;
    still_path: string;
}

type Season = {
    id: number;
    tmdb_id: number;
    serie_id: number;
    number: number;
    overview: string;
    poster_path: string;
    air_date: string;
    vote_average: number;
    total_time: number;
    episodes: Episode[];
}

type Serie = {
    id: number;
    tmdb_id: number;
    title: string;
    overview: string;
    poster: string;
    backdrop: string;
    media: string;
    original_name: string;
    status: string;
    first_air_date: string;
    last_air_date: string;
    total_time: number;
    nb_seasons: number;
    nb_episodes: number;
    episode_run_time: number | null;
    genres: Genre[];
    spoken_languages: Language[];
    production_countries: ProductionCountry[];
    production_companies: ProductionCompany[];
    seasons: Season[];
}

export type { ApiSeries , ImportSeries, Genre, Language, ProductionCountry, ProductionCompany, Episode, Season, Serie };