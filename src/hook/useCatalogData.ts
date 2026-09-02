import { useEffect, useState } from "react";
import { ProductionCompany, ProductionCountry, Tag } from "@/types/series.type";
import { User } from "@/bdd/model/user";
import { TagExternal } from '@/types/mangas.type';
import { CatalogItem } from '@/types/catalog-item.type';
import { normalizeCatalogItems } from '@/lib/catalog-item';

interface UseCatalogDataProps {page: "search" | "myList" | "waitList"; user: User | undefined; mode: "mangas" | "series"}

export const useCatalogData = ({page, user, mode}: UseCatalogDataProps) => {//TODO
    const isSeries = mode === "series";
    const [series, setSeries] = useState<CatalogItem[]>([]);

    const [genres, setGenres] = useState<string[]>([]);
    const [originCountries, setOriginCountries] = useState<string[]>([]);
    const [productionCompanies, setProductionCompanies] = useState<ProductionCompany[]>([]);
    const [productionCountries, setProductionCountries] = useState<ProductionCountry[]>([]);
    const [tags, setTags] = useState<Tag[] | TagExternal>([]);

    const [seriesIdFollowed, setSeriesIdFollowed] = useState<string[]>([]);
    const [seriesIdWaited, setSeriesIdWaited] = useState<string[]>([]);

    const [loading, setLoading] = useState(true);

    const [minYear, setMinYear] = useState(1900);
    const [maxYear, setMaxYear] = useState(new Date().getFullYear());
    const [minTotalTime, setMinTotalTime] = useState<string | number>(0);
    const [maxTotalTime, setMaxTotalTime] = useState<string | number>(0);
    const [maxEpisodes, setMaxEpisodes] = useState(2000);
    const [filtersReady, setFiltersReady] = useState<boolean>(false);
    const [fetchDataFinished, setFetchDataFinished] = useState<boolean>(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [
                    seriesRes,
                    genresRes,
                    originCountriesRes,
                    productionCompaniesRes,
                    productionCountriesRes,
                    tagsRes
                ] = await Promise.all([
                    page==="search"?fetch(`/api/${encodeURIComponent(mode)}/all?limit=2000000&page=1`):user?fetch(`/api/${encodeURIComponent(user.web_token)}/${encodeURIComponent(mode)}/all?limit=${encodeURIComponent(200000)}&page=${encodeURIComponent(1)}&waitList=${encodeURIComponent(page==="waitList")}`):fetch(`/api/${encodeURIComponent(mode)}/all?limit=2000000&page=1`),
                    fetch(`/api/${encodeURIComponent(mode)}/genre`),
                    fetch("/api/series/origin_country"),
                    isSeries ? fetch("/api/series/production_companies") : Promise.resolve({ json: async () => [] } as Response),
                    isSeries ? fetch("/api/series/production_countries") : Promise.resolve({ json: async () => [] } as Response),
                    fetch(`/api/${encodeURIComponent(mode)}/tags`)
                ]);

                const [
                    seriesData,
                    genresData,
                    originCountriesData,
                    productionCompaniesData,
                    productionCountriesData,
                    tagsData
                ] = await Promise.all([
                    seriesRes.json(),
                    genresRes.json(),
                    originCountriesRes.json(),
                    productionCompaniesRes.json(),
                    productionCountriesRes.json(),
                    tagsRes.json()
                ]);

                const normalizedSeries = normalizeCatalogItems(seriesData, mode);

                setSeries(normalizedSeries);
                setGenres(genresData);
                setOriginCountries(isSeries ? originCountriesData : []);
                setProductionCompanies(isSeries ? productionCompaniesData : []);
                setProductionCountries(isSeries ? productionCountriesData : []);
                setTags(tagsData);

                if (normalizedSeries.length > 0) {
                    const years = normalizedSeries
                        .map((serie) => new Date(serie.first_air_date).getFullYear())
                        .filter((year) => !Number.isNaN(year));

                    if (years.length > 0) {
                        setMinYear(Math.min(...years));
                    }
                    console.log(Math.max(...normalizedSeries.map((serie) => serie.total_time_exclude_special || 0)));
                    setMaxEpisodes(Math.max(...normalizedSeries.map((serie) => serie.number_of_episodes)));
                    setMinTotalTime((Math.min(...normalizedSeries.map((serie) => serie.total_time_exclude_special || 0))/60).toFixed(2));
                    setMaxTotalTime((Math.max(...normalizedSeries.map((serie) => serie.total_time_exclude_special || 0))/60).toFixed(2));
                }

                if (user) {
                    const followedIds = page==="search" || page==="waitList"?await (await fetch(`/api/${encodeURIComponent(user.web_token)}/${encodeURIComponent(mode)}/all/id`)).json():normalizedSeries.length > 0?normalizedSeries.map((serie) => serie.id):await (await fetch(`/api/${encodeURIComponent(user.web_token)}/${encodeURIComponent(mode)}/all/id`)).json();
                    const waitedRes = page !=="waitList"?await (await fetch(`/api/${encodeURIComponent(user.web_token)}/${encodeURIComponent(mode)}/all/wait/id`)).json():normalizedSeries.length>0?normalizedSeries.map((serie) => serie.id):await (await fetch(`/api/${encodeURIComponent(user.web_token)}/${encodeURIComponent(mode)}/all/wait/id`)).json();

                    setSeriesIdFollowed(followedIds);
                    setSeriesIdWaited(waitedRes);
                }

            } finally {
                setLoading(false);
                setFiltersReady(true);
                setFetchDataFinished(true);
            }
        };
        load();
    }, [user, mode]);

    return {
        loading,

        series,

        genres,
        originCountries,
        productionCompanies,
        productionCountries,
        tags,

        filtersReady,
        fetchDataFinished,

        seriesIdFollowed,
        setSeriesIdFollowed,
        seriesIdWaited,
        setSeriesIdWaited,

        minYear,
        maxYear,
        minTotalTime,
        maxTotalTime,
        maxEpisodes
    };
};