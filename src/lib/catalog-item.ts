import { MinimalSerie } from '@/types/series.type';
import { MinimalManga } from '@/types/mangas.type';
import { CatalogItem } from '@/types/catalog-item.type';
import { IMG_THUMB_SRC } from '@/constants/tmdb.consts';

const MANGA_IMG_SRC = 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/';

const normalizeScore = (score?: number | null) => {
    if (score === null || score === undefined) return 0;
    return score > 10 ? score / 10 : score;
};

const normalizeStatus = (status?: string | null) => {
    if (!status) return '';

    const normalized = status.toLowerCase();

    if (['returning series', 'releasing', 'ongoing'].includes(normalized)) return 'En cours';
    if (['ended', 'released', 'finished'].includes(normalized)) return 'Terminé';
    if (['canceled', 'cancelled', 'dropped'].includes(normalized)) return 'Annulé';
    if (['hiatus', 'paused'].includes(normalized)) return 'En pause';

    return status;
};

const normalizeTags = (tags: Array<{ id: string | number; name: string }> = []) =>
    tags.map((tag) => ({ id: String(tag.id), name: tag.name }));

const normalizeOriginCountry = (country?: { iso_3166_1?: string | null; name: string } | string | null) => {
    if (!country) return '';
    if (typeof country === 'string') return country;
    return country.iso_3166_1 ?? country.name;
};

export const serieToCatalogItem = (serie: MinimalSerie): CatalogItem => ({
    id: serie.id,
    tmdb_id: serie.tmdb_id,
    name: serie.name,
    original_name: serie.original_name,
    romaji_name: serie.romaji_name,
    overview: serie.overview,
    poster_path: serie.poster_path,
    media_type: serie.media_type,
    status: normalizeStatus(serie.status),
    first_air_date: serie.first_air_date ?? '',
    last_air_date: serie.last_air_date ?? '',
    number_of_episodes: serie.number_of_episodes ?? 0,
    genres: serie.genres ?? [],
    vote_average: serie.vote_average ?? 0,
    popularity: serie.popularity ?? 0,
    origin_country: (serie.origin_country ?? []).map((c: string) => ({ iso_3166_1: c })),
    episode_run_time: serie.episode_run_time ?? 0,
    note: serie.note,
    comment: serie.comment,
    follow_date: serie.follow_date,
    production_countries: serie.production_countries ?? [],
    production_companies: serie.production_companies ?? [],
    total_time: serie.total_time ?? 0,
    total_time_exclude_special: serie.total_time_exclude_special ?? 0,
    tags: serie.tags ?? [],
});

export const mangaToCatalogItem = (manga: MinimalManga): CatalogItem => ({
    id: manga.id,
    tmdb_id: manga.anilist_id,
    name: manga.title_english || manga.title_romaji || manga.title_native || manga.id,
    original_name: manga.title_native || manga.title_english || manga.title_romaji || '',
    romaji_name: manga.title_romaji || manga.title_english || manga.title_native || '',
    overview: manga.synopsis,
    poster_path: manga.cover_image,
    media_type: (manga.format ?? '').toLowerCase(),
    status: normalizeStatus(manga.status),
    first_air_date: manga.start_date ?? '',
    last_air_date: manga.end_date ?? '',
    number_of_episodes: manga.chapters ?? 0,
    genres: manga.genres ?? [],
    vote_average: normalizeScore(manga.meanScore ?? manga.meanScore),
    popularity: manga.popularity ?? 0,
    origin_country: [{ iso_3166_1: "" }],
    episode_run_time: 0,
    note: manga.note,
    comment: manga.comment,
    follow_date: manga.follow_date,
    production_countries: [],
    production_companies: [],
    total_time: 0,
    tags: normalizeTags(manga.tags ?? []),
});

export const normalizeCatalogItems = (items: MinimalSerie[] | MinimalManga[], mode: 'mangas' | 'series'): CatalogItem[] =>
    mode === 'series'
        ? (items as MinimalSerie[]).map(serieToCatalogItem)
        : (items as MinimalManga[]).map(mangaToCatalogItem);

export const getCatalogPosterSrc = (posterPath: string | null | undefined, mode: 'mangas' | 'series') => {
    if (!posterPath) return '';
    if (posterPath.startsWith('http://') || posterPath.startsWith('https://') || posterPath.startsWith('data:')) {
        return posterPath;
    }

    if (mode === 'series') {
        return `${IMG_THUMB_SRC}${posterPath}`;
    }

    const trimmedPath = posterPath.startsWith('/') ? posterPath.slice(1) : posterPath;
    return `${MANGA_IMG_SRC}${trimmedPath}`;
};
