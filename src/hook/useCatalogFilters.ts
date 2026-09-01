import { useEffect, useState } from "react";
import { CatalogItem } from "@/types/catalog-item.type";
import { Range } from '@/types/series.type';

export const useCatalogFilters = (page:"search" | "myList" | "waitList", series: CatalogItem[],filtersReady: boolean,seriesIdFollowed: string[], seriesIdWaited: string[], defaultSortBy:string, minYear: number, maxYear: number, maxEpisodes: number, mode: "mangas" | "series") => {

  const [filteredSeries, setFilteredSeries] = useState<CatalogItem[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderAsc, setOrderAsc] = useState<boolean>(true);

  const [withFollowed, setwithFollowed] = useState<boolean>(false);

  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);

  const [selectedSortBy, setSelectedSortBy] = useState<string>(defaultSortBy);
  
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const [selectedOriginCountries, setSelectedOriginCountries] = useState<string[]>([]);

  const [selectedProductionCompanies, setSelectedProductionCompanies] = useState<string[]>([]);

  const [selectedProductionCountries, setSelectedProductionCountries] = useState<string[]>([]);

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [yearRange, setYearRange] = useState<Range>({ min: minYear, max: maxYear, minimalRange: minYear, maximalRange: maxYear });

  const [voteRange, setVoteRange] = useState<Range>({ min: 0, max: 10, minimalRange: 0, maximalRange: 10 });

  const [episodeRange, setEpisodeRange] = useState<Range>({ min: 0, max: maxEpisodes, minimalRange: 0, maximalRange: maxEpisodes });


  const [selectedNotFormats, setSelectedNotFormats] = useState<string[]>([]);

  const [selectedNotGenres, setSelectedNotGenres] = useState<string[]>([]);

  const [selectedNotStatuses, setSelectedNotStatuses] = useState<string[]>([]);

  const [selectedNotOriginCountries, setSelectedNotOriginCountries] = useState<string[]>([]);

  const [selectedNotProductionCompanies, setSelectedNotProductionCompanies] = useState<string[]>([]);

  const [selectedNotProductionCountries, setSelectedNotProductionCountries] = useState<string[]>([]);

  const [selectedNotTags, setSelectedNotTags] = useState<string[]>([]);
  const [isOrdering, setIsOrdering] = useState<boolean>(false);

    /**
   * Fonction pour appliquer les filtres et le tri
   */
  const applyFiltersAndSort = () => {
    if (!filtersReady) return;

    let filtered = series.filter(serie => {
      if(page==="search"){
        if (!withFollowed && seriesIdFollowed.includes(serie.id)) {
          return false;
        }
      }
      if (page === "myList" && !seriesIdFollowed.includes(serie.id)) return false;

      if (page === "waitList" && !seriesIdWaited.includes(serie.id)) return false;
      // Apply format filters
      const matchesFormat = selectedFormats.length === 0 || selectedFormats.includes(serie.media_type);

      const matchesGenre = selectedGenres.length === 0 || selectedGenres.every(genre => serie.genres.some(g => g.name === genre));
      const searchWords = searchQuery.toLowerCase().split(/\s+/);
      const matchesSearchQuery = [serie.name, serie.original_name, serie.romaji_name]
        .filter(name => name)
        .some(name =>
          searchWords.every(word => name.toLowerCase().includes(word))
        );
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(serie.status);
      //const matchesOriginCountry = selectedOriginCountries.length === 0 || selectedOriginCountries.every(country => serie.origin_country.includes(country));

      const matchesOriginCountry =
        selectedOriginCountries.length === 0 ||
        selectedOriginCountries.every(country =>
          serie.origin_country.some(origin => origin.iso_3166_1.iso_3166_1 === country)
        );
      const matchesProductionCompany = selectedProductionCompanies.every(company => serie.production_companies && serie.production_companies.some(prod => prod.name === company));
      const matchesProductionCountry = selectedProductionCountries.every(country => serie.production_countries.some(c => c.name === country));
      const matchesTags = selectedTags.every(tag => serie.tags.some(t => t.name === tag));
      const serieYear = new Date(serie.first_air_date).getFullYear();
      const matchesYearRange = serieYear >= yearRange.min && serieYear <= yearRange.max;
      const matchesVoteRange = page==="search"?(serie.vote_average || 0) >= voteRange.min && (serie.vote_average || 0) <= voteRange.max
      :(serie.note || 0) >= voteRange.min && (serie.note || 0) <= voteRange.max;

      const matchesEpisodeRange = serie.number_of_episodes >= episodeRange.min && serie.number_of_episodes <= episodeRange.max;

      const matchesNotFormat = selectedNotFormats.length === 0 || !selectedNotFormats.includes(serie.media_type);

      const matchesNotGenre = selectedNotGenres.every(genre => !serie.genres.some(g => g.name === genre));
      const matchesNotStatus = selectedNotStatuses.length === 0 || !selectedNotStatuses.includes(serie.status);
      const matchesNotOriginCountry = selectedNotOriginCountries.length === 0 || !selectedNotOriginCountries.some(country => serie.origin_country.some(origin => origin.iso_3166_1.iso_3166_1 === country));
      const matchesNotTags = selectedNotTags.every(tag => !serie.tags.some(t => t.name === tag));
      const matchesNotProductionCompany = selectedNotProductionCompanies.every(company => !(serie.production_companies && serie.production_companies.some(prod => prod.name === company)));
      const matchesNotProductionCountry = selectedNotProductionCountries.every(country => !serie.production_countries.some(c => c.name === country));

      return matchesNotFormat && matchesNotGenre && matchesNotStatus && matchesNotOriginCountry && matchesNotTags && matchesNotProductionCompany && matchesNotProductionCountry && matchesFormat && matchesGenre && matchesSearchQuery && matchesStatus && matchesOriginCountry && matchesProductionCompany && matchesProductionCountry && matchesYearRange && matchesVoteRange && matchesEpisodeRange && matchesTags;
    });

    // Apply sorting
    switch (selectedSortBy) {
      case 'popularity':
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'Vote average':
        filtered.sort((a, b) => b.vote_average - a.vote_average);
        break;
      case 'Start date':
        filtered.sort((a, b) => new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime());
        break;
      case 'End date':
        filtered.sort((a, b) => new Date(b.last_air_date).getTime() - new Date(a.last_air_date).getTime());
        break;
      case 'Number episodes':
        filtered.sort((a, b) => b.number_of_episodes - a.number_of_episodes);
        break;
      case 'Number chapters':
        filtered.sort((a, b) => b.number_of_episodes - a.number_of_episodes);
        break;
      case 'Added':
        filtered.sort((a, b) => (b.follow_date ? new Date(b.follow_date).getTime() : Number(b.id) || 0) - (a.follow_date ? new Date(a.follow_date).getTime() : Number(a.id) || 0));
        break;
      case 'Name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Total time':
        filtered.sort((a, b) => b.total_time - a.total_time);
        break;
      case 'Note':
        filtered.sort((a, b) => (b.note || 0) - (a.note || 0));
        break;
      case 'Followed':
        filtered.sort((a, b) => {
          const dateA = a.follow_date ? new Date(a.follow_date).getTime() : 0;
          const dateB = b.follow_date ? new Date(b.follow_date).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'Waited':
        filtered.sort((a, b) => {
          const dateA = a.follow_date ? new Date(a.follow_date).getTime() : 0;
          const dateB = b.follow_date ? new Date(b.follow_date).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default:
        break;
    }

    if (!orderAsc) filtered.reverse();
    setFilteredSeries(filtered);
  };
  /**
   * Fonction pour retirer un filtre
   * @param {string} type - Type de filtre
   * @param {string} value - Valeur du filtre
   */
  const removeFilter = (type: string, value: string) => {
    switch (type) {
      case 'genre':
        setSelectedGenres(selectedGenres.filter((genre) => genre !== value));
        setSelectedNotGenres(selectedNotGenres.filter((genre) => genre !== value));
        break;
      case 'format':
        setSelectedFormats(selectedFormats.filter((format) => format !== value));
        setSelectedNotFormats(selectedNotFormats.filter((format) => format !== value));
        break;
      case 'status':
        setSelectedStatuses(selectedStatuses.filter((status) => status !== value));
        setSelectedNotStatuses(selectedNotStatuses.filter((status) => status !== value));
        break;
      case 'originCountry':
        setSelectedOriginCountries(selectedOriginCountries.filter((country) => country !== value));
        setSelectedNotOriginCountries(selectedNotOriginCountries.filter((country) => country !== value));
        break;
      case 'productionCompany':
        setSelectedProductionCompanies(selectedProductionCompanies.filter((company) => company !== value));
        setSelectedNotProductionCompanies(selectedNotProductionCompanies.filter((company) => company !== value));
        break;
      case 'productionCountry':
        setSelectedProductionCountries(selectedProductionCountries.filter((country) => country !== value));
        setSelectedNotProductionCountries(selectedNotProductionCountries.filter((country) => country !== value));
        break;
      case 'tag':
        setSelectedTags(selectedTags.filter((tag) => tag !== value));
        setSelectedNotTags(selectedNotTags.filter((tag) => tag !== value));
        break;
      default:
        break;
    }
  };

    const clearYearRange = () => {
    setYearRange({ min: minYear, max: maxYear, minimalRange: minYear, maximalRange: maxYear });
    applyFiltersAndSort();
  };

  const clearVoteRange = () => {
    setVoteRange({ min: 0, max: 10, minimalRange: 0, maximalRange: 10 });
    applyFiltersAndSort();
  };

  const clearEpisodeRange = () => {
    setEpisodeRange({ min: 0, max: maxEpisodes, minimalRange: 0, maximalRange: maxEpisodes });
    applyFiltersAndSort();
  };

    /**
   * Fonction pour réinitialiser tous les filtres
   */
  const clearAllFilters = () => {
    setSelectedGenres([]);
    setSelectedFormats([]);
    setSelectedSortBy(defaultSortBy);
    setSearchQuery('');
    setSelectedStatuses([]);
    setSelectedOriginCountries([]);
    setSelectedProductionCompanies([]);
    setSelectedProductionCountries([]);
    setYearRange({ min: minYear, max: maxYear, minimalRange: minYear, maximalRange: maxYear });
    setVoteRange({ min: 0, max: 10, minimalRange: 0, maximalRange: 10 });
    setEpisodeRange({ min: 0, max: maxEpisodes, minimalRange: 0, maximalRange: maxEpisodes });
    setwithFollowed(false);
    setSelectedTags([]);
    setOrderAsc(true);

    setSelectedNotFormats([]);
    setSelectedNotGenres([]);
    setSelectedNotStatuses([]);
    setSelectedNotOriginCountries([]);
    setSelectedNotProductionCompanies([]);
    setSelectedNotProductionCountries([]);
    setSelectedNotTags([]);
  };
  useEffect(() => {
      applyFiltersAndSort();
  }, [
      filtersReady,
      series,
      seriesIdWaited,
      selectedGenres,
      selectedFormats,
      searchQuery,
      selectedSortBy,
      selectedStatuses,
      selectedOriginCountries,
      selectedProductionCompanies,
      selectedProductionCountries,
      yearRange,
      voteRange,
      episodeRange,
      withFollowed,
      seriesIdFollowed,
      orderAsc,
      selectedTags,
      selectedNotFormats,
      selectedNotGenres,
      selectedNotStatuses,
      selectedNotOriginCountries,
      selectedNotProductionCompanies,
      selectedNotProductionCountries,
      selectedNotTags
  ]);


    useEffect(() => {
      if (selectedSortBy === defaultSortBy) {
        setIsOrdering(false);
        return;
      }
      setIsOrdering(true);
    }, [selectedSortBy, page]);

    useEffect(()=>{
      setYearRange({ min: minYear, max: maxYear, minimalRange: minYear, maximalRange: maxYear });
    }, [minYear, maxYear]);

    useEffect(() => {
      setEpisodeRange({ min: 0, max: maxEpisodes, minimalRange: 0, maximalRange: maxEpisodes });
    }, [maxEpisodes])


    const hasActiveFilters =
      selectedGenres.length > 0 ||
      selectedFormats.length > 0 ||
      selectedStatuses.length > 0 ||
      selectedOriginCountries.length > 0 ||
      selectedProductionCompanies.length > 0 ||
      selectedProductionCountries.length > 0 ||
      selectedTags.length > 0 ||
      (yearRange.min !== yearRange.minimalRange || yearRange.max !== yearRange.maximalRange) ||
      (voteRange.min !== voteRange.minimalRange || voteRange.max !== voteRange.maximalRange) ||
      (episodeRange.min !== episodeRange.minimalRange || episodeRange.max !== episodeRange.maximalRange) ||

      selectedNotFormats.length > 0 ||
      selectedNotGenres.length > 0 ||
      selectedNotStatuses.length > 0 ||
      selectedNotOriginCountries.length > 0 ||
      selectedNotProductionCompanies.length > 0 ||
      selectedNotProductionCountries.length > 0 ||
      selectedNotTags.length > 0;

  return {

      filteredSeries,

      selectedGenres,
      setSelectedGenres,

      selectedFormats,
      setSelectedFormats,

      selectedSortBy,
      setSelectedSortBy,

      searchQuery,
      setSearchQuery,

      selectedStatuses,
      setSelectedStatuses,

      selectedOriginCountries,
      setSelectedOriginCountries,

      selectedProductionCompanies,
      setSelectedProductionCompanies,

      selectedProductionCountries,
      setSelectedProductionCountries,

      selectedTags,
      setSelectedTags,

      yearRange,
      setYearRange,

      voteRange,
      setVoteRange,

      episodeRange,
      setEpisodeRange,

      withFollowed,
      setwithFollowed,

      orderAsc,
      setOrderAsc,

      selectedNotFormats,
      setSelectedNotFormats,

      selectedNotGenres,
      setSelectedNotGenres,

      selectedNotStatuses,
      setSelectedNotStatuses,

      selectedNotOriginCountries,
      setSelectedNotOriginCountries,

      selectedNotProductionCompanies,
      setSelectedNotProductionCompanies,

      selectedNotProductionCountries,
      setSelectedNotProductionCountries,

      selectedNotTags,
      setSelectedNotTags,

      removeFilter,

      clearAllFilters,

      clearYearRange,

      clearVoteRange,

      clearEpisodeRange,

      hasActiveFilters,

      isOrdering
  };
};