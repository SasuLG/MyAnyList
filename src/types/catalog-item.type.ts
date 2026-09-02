import { Genre, OriginCountry, ProductionCompany, ProductionCountry, Tag } from '@/types/series.type';

type CatalogItem = {
    id: string;
    tmdb_id: string;
    name: string;
    original_name: string;
    romaji_name: string;
    overview: string;
    poster_path: string | null;
    media_type: string;
    status: string;
    first_air_date: string;
    last_air_date: string;
    number_of_episodes: number;
    genres: Genre[];
    vote_average: number;
    popularity: number;
    origin_country: OriginCountry[];
    episode_run_time: number;
    note?: number;
    comment?: string;
    follow_date?: string;
    production_countries: ProductionCountry[];
    production_companies: ProductionCompany[];
    total_time: number;
    total_time_exclude_special?: number;
    tags: Tag[];
};

export type { CatalogItem };
