import { useEffect, useState } from "react";
import {MinimalSerie, ProductionCompany, ProductionCountry, Tag} from "@/types/series.type";
import { User } from "@/bdd/model/user";

interface UseCatalogDataProps {page: "search" | "myList" | "waitList"; user: User | undefined}

export const useCatalogData = ({page, user}: UseCatalogDataProps) => {//TODO

    const [series, setSeries] = useState<MinimalSerie[]>([]);

    const [genres, setGenres] = useState<string[]>([]);
    const [originCountries, setOriginCountries] = useState<string[]>([]);
    const [productionCompanies, setProductionCompanies] = useState<ProductionCompany[]>([]);
    const [productionCountries, setProductionCountries] = useState<ProductionCountry[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);

    const [seriesIdFollowed, setSeriesIdFollowed] = useState<number[]>([]);
    const [seriesIdWaited, setSeriesIdWaited] = useState<number[]>([]);

    const [loading, setLoading] = useState(true);

    const [minYear, setMinYear] = useState(1900);
    const [maxYear, setMaxYear] = useState(new Date().getFullYear());
    const [maxEpisodes, setMaxEpisodes] = useState(2000);
    const [filtersReady, setFiltersReady] = useState<boolean>(false);
    const [fetchDataFinished, setFetchDataFinished] = useState<boolean>(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                console.log(user)
                const [
                    seriesRes,
                    genresRes,
                    originCountriesRes,
                    productionCompaniesRes,
                    productionCountriesRes,
                    tagsRes
                ] = await Promise.all([
                    page==="search"?fetch("/api/series/all?limit=2000000&page=1"):user?fetch(`/api/${encodeURIComponent(user.web_token)}/series/all?limit=${encodeURIComponent(200000)}&page=${encodeURIComponent(1)}&waitList=${encodeURIComponent(page==="waitList")}`):fetch("/api/series/all?limit=2000000&page=1"),
                    fetch("/api/series/genre"),
                    fetch("/api/series/origin_country"),
                    fetch("/api/series/production_companies"),
                    fetch("/api/series/production_countries"),
                    fetch("/api/series/tags")
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

                setSeries(seriesData);
                setGenres(genresData);
                setOriginCountries(originCountriesData);
                setProductionCompanies(productionCompaniesData);
                setProductionCountries(productionCountriesData);
                setTags(tagsData);

                if (seriesData.length > 0) {
                    setMinYear(Math.min(...seriesData.map((serie: MinimalSerie) => new Date(serie.first_air_date).getFullYear())));
                    setMaxEpisodes(Math.max(...seriesData.map((serie: MinimalSerie) => serie.number_of_episodes)));
                }

                if (user) {

                    const followedIds = page==="search" || page==="waitList"?await (await fetch(`/api/${encodeURIComponent(user.web_token)}/series/all/id`)).json():seriesData.length > 0?seriesData.map((serie: MinimalSerie) => serie.id):await (await fetch(`/api/${encodeURIComponent(user.web_token)}/series/all/id`)).json();
                    const waitedRes = page !=="waitList"?await (await fetch(`/api/${encodeURIComponent(user.web_token)}/series/all/wait/id`)).json():seriesData.length>0?seriesData.map((serie: MinimalSerie) => serie.id):await (await fetch(`/api/${encodeURIComponent(user.web_token)}/series/all/wait/id`)).json();

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

    }, [user]);

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
        maxEpisodes
    };
};