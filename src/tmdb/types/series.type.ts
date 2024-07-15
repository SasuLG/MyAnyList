type ImportSeries = {
    id: string;
    name: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
    genres: [];
    original_language: string;
    origin_country: [];
    original_name: string;
    popularity: number;
}   

type series = {
    id: string;
    name: string;
    overview: string;
    poster_path: string;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
    genres: {
        id: number;
        name: string;
    }[];

    created_by: {
        id: number;
        name: string
    }[];
    episode_run_time: number[];
    homepage: string;
    in_production: boolean;

    languages: string[];
    last_air_date: string;


    networks: {
        name: string;
        id: number;
        logo_path: string;
        origin_country: string;
    }[];
    number_of_episodes: number;
    number_of_seasons: number;
    production_companies: {
        id: number;
        logo_path: string;
        name: string;
        origin_country: string;
    }[];
    status: string;

    type: string;
    backdrop_path: string;
    seasons: {
        air_date: string;
        episode_count: number;
        id: number;
        name: string;
        overview: string;
        poster_path: string;
        season_number: number;
    }[];
}

export type { ImportSeries, series };