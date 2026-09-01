/* --- Types pour Manga (basés sur la base SQL et l'API AniList) --- */

type AnilistId = {
    anilist_id: string;
};

type ApiManga = {
    id: string;
    title: {
        romaji: string | null;
        english: string | null;
        native: string | null;
    };
    description: string | null;
    coverImage: {
        extraLarge: string | null;
    };
    bannerImage: string | null;
    format: string | null;                   // MANGA / MANHWA / NOVEL / ...
    status: string | null;                   // FINISHED / RELEASING / ...
    isAdult: boolean;
    chapters: number | null;
    volumes: number | null;
    averageScore: number | null;
    meanScore: number | null;
    popularity: number | null;
    source: string | null;                   // Source type (ex: MANGA)
    startDate: {
        year: number | null;
        month: number | null;
        day: number | null;
    } | null;
    endDate: {
        year: number | null;
        month: number | null;
        day: number | null;
    } | null;
    countryOfOrigin: string | null;
    genres: string[];
    synonyms: string[];
    tags: {
        id: number;
        name: string;
        description: string | null;
        category: string | null;
        rank: number | null;
        isAdult: boolean;
    }[];
    recommendations: {
        nodes: {
            mediaRecommendation: {
                id: number;
            } | null;
        }[];
    };
    relations: {
        nodes: {
            id: number;
            type: string;
            format: string | null;
        }[];
        edges: {
            relationType: string;
        }[];
    };
    stats: {
        scoreDistribution: {
            score: number;
            amount: number;
        }[];
    }
};

/* --- Types de base --- */

type Genre = {
    id: string;
    name: string;
};

type TagExternal = {
    id: string;
    anilist_id: string;
    name: string;
    description: string | null;
    category: string | null;
    rank: number | null;
    isAdult: boolean;
};

type OriginCountry = {
    id: string;
    iso_3166_1?: string;
    name: string;
};

type MangaStats = {
    mangaId: string;
    scoreDistribution: {
        score: number;
        amount: number;
    }[];
};

/* --- Types utilisateurs --- */

type UserManga = {
    user_id: string;
    manga_id: string;
    date: string;
};

type UserWaitManga = {
    user_id: string;
    manga_id: string;
    date: string;
};


/* --- Type principal : Manga (utilisé dans votre application / BD) --- */

type Manga = {
    id: string;
    anilist_id: string;
    title_romaji: string | null;
    title_native: string | null;
    title_english: string | null;
    synopsis: string;
    cover_image: string | null;
    banner_image: string | null;
    format: string | null;
    status: string | null;
    isAdult: boolean;
    chapters: number | null;
    volumes: number | null;
    averageScore: number | null;
    meanScore: number | null;
    popularity: number | null;
    source: string | null;
    start_date: string | null;
    end_date: string | null;
    last_modified: string;

    /* relations */
    synonyms: { id: string; name: string }[];
    origin_country: OriginCountry;
    genres: Genre[];
    tags: TagExternal[];
    stats?: MangaStats | null;

    /* relations utilisateur (optionnelles) */
    follow_date?: string;
    comment?: string;
    note?: number;
};

type MinimalManga = {
    id: string;
    anilist_id: string;
    title_romaji: string | null;
    title_native: string | null;
    title_english: string | null;
    synopsis: string;
    cover_image: string | null;
    format: string | null;
    status: string | null;
    chapters: number | null;
    meanScore: number | null;
    popularity: number | null;
    source: string | null;
    synonyms: { id: string; name: string }[];
    origin_country: OriginCountry;
    genres: Genre[];
    tags: TagExternal[];
    note?: number;
    comment?: string;
    follow_date?: string;
    start_date: string | null;
    end_date: string | null;
}

type SearchManga = {
    id: string;
    anilist_id: string;
    title_romaji: string | null;
    title_native: string | null;
    title_english: string | null;
    cover_image: string | null;
    format: string | null;
    note?: number;
    synonyms: { id: string; name: string }[];
    //nb chapitres, status, start_date?
};

export type {
    AnilistId,
    ApiManga,
    Manga,
    Genre,
    TagExternal,
    OriginCountry,
    MangaStats,
    UserManga,
    UserWaitManga,
    MinimalManga,
    SearchManga
};
