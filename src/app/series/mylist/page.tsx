"use client"

import Loader from "@/components/loader";
import SeriesList from "@/components/seriesList";
import { MinimalSerie, ProductionCountry } from "@/tmdb/types/series.type";
import { useUserContext } from "@/userContext";
import { useEffect, useState } from "react";
import { Range } from '@/tmdb/types/series.type';
import { Filter } from "@/components/svg/filter.svg";
import Filters from "@/components/filters";


export default function MyList(){

  /**
   * Récupérer les informations de l'utilisateur
   */
  const { user, setAlert, setSelectedMenu } = useUserContext();

  /**
   * Hook pour stocker les séries
   */
  const [series, setSeries] = useState<MinimalSerie[]>([]);

  /**
   * Hook pour stocker les séries filtrées
   */
  const [filteredSeries, setFilteredSeries] = useState<MinimalSerie[]>([]);

  /**
   * Hook pour stocker le type de style
   */
  const [styleType, setStyleType] = useState<'grid' | 'list'>('grid');

  /**
   * Hook pour stocker l'état de la récupération des données
   */
  const [fetchDataFinished, setFetchDataFinished] = useState<boolean>(false);

  /**
   * Hook pour stocker l'état de la récupération des filtres
   */
  const [filtersReady, setFiltersReady] = useState<boolean>(false);

  //FILTRES
  
  /**
   * Hook pour stocker l'état de l'ordre des séries
   */
  const [orderAsc, setOrderAsc] = useState<boolean>(true);

  /**
   * Hook pour stocker les genres
   */
  const [genres, setGenres] = useState<string[]>([]);

  /**
   * Hook pour stocker les genres sélectionnés
   */
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  /**
   * Hook pour stocker les formats
   */
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);

  /**
   * Hook pour stocker le tri sélectionné
   */
  const [selectedSortBy, setSelectedSortBy] = useState<string>('followed');

  /**
   * Hook pour stocker la recherche
   */
  const [searchQuery, setSearchQuery] = useState<string>('');

  /**
   * Hook pour stocker les statuts
   */
  const [statuses, setStatuses] = useState<string[]>(["Returning Series", "Ended", "Canceled"]);/*todo ajouter a la toute fin pour check "Planned", "In Production" */

  /**
   * Hook pour stocker les statuts sélectionnés
   */
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  /**
   * Hook pour stocker les pays d'origine
   */
  const [originCountries, setOriginCountries] = useState<string[]>([]);

  /**
   * Hook pour stocker les pays d'origine sélectionnés
   */
  const [selectedOriginCountries, setSelectedOriginCountries] = useState<string[]>([]);

  /**
   * Hook pour stocker les compagnies de production
   */
  const [productionCompanies, setProductionCompanies] = useState<string[]>([]);

  /**
   * Hook pour stocker les compagnies de production sélectionnées
   */
  const [selectedProductionCompanies, setSelectedProductionCompanies] = useState<string[]>([]);

  /**
   * Hook pour stocker les pays de production
   */
  const [productionCountries, setProductionCountries] = useState<ProductionCountry[]>([]);

  /**
   * Hook pour stocker les pays de production sélectionnés
   */
  const [selectedProductionCountries, setSelectedProductionCountries] = useState<string[]>([]);

  //SLIDER
  /**
   * Hook pour stocker les plages d'années
   */
  const [yearRange, setYearRange] = useState<Range>({ min: 1900, max: new Date().getFullYear(), minimalRange: 1900, maximalRange: new Date().getFullYear() });

  /**
   * Hook pour stocker les plages de votes
   */
  const [voteRange, setVoteRange] = useState<Range>({ min: 0, max: 10, minimalRange: 0, maximalRange: 10 });

  /**
   * Hook pour stocker les plages d'épisodes
   */
  const [episodeRange, setEpisodeRange] = useState<Range>({ min: 1, max: 2000, minimalRange: 1, maximalRange: 2000 });

  /**
   * Récupérer les séries
   */
  const fetchData = async () => {
    if(user === undefined){
        return;
    }
    const response = await fetch(`/api/${encodeURIComponent(user.web_token)}/series/all?limit=${encodeURIComponent(20)}&page=${encodeURIComponent(1)}`);
    const data = await response.json();
    setFetchDataFinished(true);

    if(response.ok){
        setSeries(data);
        setFilteredSeries(data);
    }else{
        setAlert({ message: 'Erreur lors de la récupération des séries', valid: false });
    }
    console.log(data);
    if (data.length > 0) {
      const minYear = Math.min(...data.map((serie: MinimalSerie) => new Date(serie.first_air_date).getFullYear()));
      const maxEpisodes = Math.max(...data.map((serie: MinimalSerie) => serie.number_of_episodes));

      setYearRange((prevRange) => ({
        ...prevRange,
        minimalRange: minYear,
        maximalRange: new Date().getFullYear(),
        min: minYear,
      }));

      setEpisodeRange((prevRange) => ({
        ...prevRange,
        maximalRange: maxEpisodes,
        max: maxEpisodes,
      }));

      setFiltersReady(true);
    }    
  };
  
  /**
   * Fonction pour récupérer tous les genres
   */
  const fetchGenres = async () => {
    const response = await fetch('/api/series/genre');
    const data = await response.json();
    setGenres(data);
  };
  
  /**
   * Fonction pour récupérer tous les pays d'origine
   */
  const fetchOriginCountries = async () => {
    const response = await fetch('/api/series/origin_country');
    const data = await response.json();
    setOriginCountries(data);
  };
  
  /**
   * Fonction pour récupérer toutes les compagnies de production
   */
  const fetchProductionCompanies = async () => {
    const response = await fetch('/api/series/production_companies');
    const data = await response.json();
    setProductionCompanies(data);
  };
  
  /**
   * Fonction pour récupérer tous les pays de production
   */
  const fetchProductionCountries = async () => {
    const response = await fetch('/api/series/production_countries');
    const data = await response.json();
    setProductionCountries(data);
  };

  /**
   * Basculer entre les styles de liste
   */
  const toggleLayout = () => {
      setStyleType((prevStyleType) => (prevStyleType === 'grid' ? 'list' : 'grid'));
  };

  /**
   * Fonction pour gérer le clic sur le coeur, qui permet de suivre ou de ne plus suivre une série
   * @param {MinimalSerie} serie - La série
   * @returns 
   */
  const onClickHeart = async (serie: MinimalSerie) => {
    if(user === undefined){
        return;
    }
    let route = `/api/${encodeURIComponent(user.web_token)}/series/follow`;
    if(series.map(serie=>serie.id.toString()).includes(serie.id.toString())){
        route = `/api/${encodeURIComponent(user.web_token)}/series/unfollow`;
    }
    const response = await fetch(route, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ serieId: serie.id })
    });
    if(response.ok){
        const data = await response.json();
        if(data){
          if(route.includes('unfollow')){
              setSeries(series.filter(s=>s.id.toString()!==serie.id.toString()));
          }else{
              setSeries([...series, serie]);
          }
        }
    }else{
        setAlert({ message: 'Erreur lors de la récupération des séries suivies', valid: false });
    }
  }

  /**
   * Fonction pour gérer le changement de la plage d'années
   * @param {Range} range - Plage d'années
   */
  const handleYearRangeChange = (range: Range) => {
    setYearRange(range);
  };
  
  /**
   * Fonction pour gérer le changement de la plage de votes
   * @param {Range} range - Plage de votes
   */
  const handleVoteRangeChange = (range: Range) => {
    setVoteRange(range);
  };
  
  /**
   * Fonction pour gérer le changement de la plage d'épisodes
   * @param {Range} range - Plage d'épisodes
   */
  const handleEpisodeRangeChange = (range: Range) => {
    setEpisodeRange(range);
  };

  /**
   * Fonction pour gérer le changement de l'ordre des séries
   * @param {boolean} order - Ordre des séries
   */
  const handleOrderChange = (order: Boolean) => {
    setOrderAsc(Boolean(order));
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
        break;
      case 'format':
        setSelectedFormats(selectedFormats.filter((format) => format !== value));
        break;
      case 'status':
        setSelectedStatuses(selectedStatuses.filter((status) => status !== value));
        break;
      case 'originCountry':
        setSelectedOriginCountries(selectedOriginCountries.filter((country) => country !== value));
        break;
      case 'productionCompany':
        setSelectedProductionCompanies(selectedProductionCompanies.filter((company) => company !== value));
        break;
      case 'productionCountry':
        setSelectedProductionCountries(selectedProductionCountries.filter((country) => country !== value));
        break;
      default:
        break;
    }
    applyFiltersAndSort();
  };
  
  const clearYearRange = () => {
    setYearRange({ min: 1900, max: new Date().getFullYear(), minimalRange: 1900, maximalRange: new Date().getFullYear() });
    applyFiltersAndSort();
  };
  
  const clearVoteRange = () => {
    setVoteRange({ min: 0, max: 10, minimalRange: 0, maximalRange: 10 });
    applyFiltersAndSort();
  };
  
  const clearEpisodeRange = () => {
    setEpisodeRange({ min: 1, max: 2000, minimalRange: 1, maximalRange: 2000 });
    applyFiltersAndSort();
  };

   /**
   * Fonction pour appliquer les filtres et le tri
   */
  const applyFiltersAndSort = () => {
    if (!filtersReady) return;

    let filtered = series.filter((serie) => {
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.every((genre) => serie.genres.some((g) => g.name === genre));
      const matchesFormat = selectedFormats.length === 0 || selectedFormats.includes(serie.media_type);
      const matchesSearchQuery = serie.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(serie.status);
      const matchesOriginCountry = selectedOriginCountries.length === 0 || 
      selectedOriginCountries.every((country) => serie.origin_country.includes(country));
      const matchesProductionCompany = selectedProductionCompanies.every((company) => serie.production_companies.some((prod) => prod.name === company));
      const matchesProductionCountry = selectedProductionCountries.every((country) => serie.production_countries.some((c) => c.name === country));

      const serieYear = new Date(serie.first_air_date).getFullYear();
      const matchesYearRange = serieYear >= yearRange.min && serieYear <= yearRange.max;
      const matchesVoteRange = serie.vote_average >= voteRange.min && serie.vote_average <= voteRange.max;
      const matchesEpisodeRange = serie.number_of_episodes >= episodeRange.min && serie.number_of_episodes <= episodeRange.max;
      return matchesGenre && matchesFormat && matchesSearchQuery && matchesStatus && matchesOriginCountry && matchesProductionCompany && matchesProductionCountry && matchesYearRange && matchesVoteRange && matchesEpisodeRange;
    });
  
    // Apply sorting
    switch (selectedSortBy) {
      case 'popularity':
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'vote_average':
        filtered.sort((a, b) => b.vote_average - a.vote_average);
        break;
      case 'first_air_date':
        filtered.sort((a, b) => new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime());
        break;
      case 'last_air_date':
        filtered.sort((a, b) => new Date(b.last_air_date).getTime() - new Date(a.last_air_date).getTime());
        break;
      case 'number_of_episodes':
        filtered.sort((a, b) => b.number_of_episodes - a.number_of_episodes);
        break;
      case 'followed':
        filtered.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    if(!orderAsc){
      filtered.reverse();
    }
    setFilteredSeries(filtered);
  };

  /**
   * Fonction pour réinitialiser tous les filtres
   */
  const clearAllFilters = () => {
    setSelectedGenres([]);
    setSelectedFormats([]);
    setSelectedSortBy('added');
    setSearchQuery('');
    setSelectedStatuses([]);
    setSelectedOriginCountries([]);
    setSelectedProductionCompanies([]);
    setSelectedProductionCountries([]);
    setYearRange({ min: 1900, max: new Date().getFullYear(), minimalRange: 1900, maximalRange: new Date().getFullYear() });
    setVoteRange({ min: 0, max: 10, minimalRange: 0, maximalRange: 10 });
    setEpisodeRange({ min: 1, max: 2000, minimalRange: 1, maximalRange: 2000 });
    setOrderAsc(true);
  };

  useEffect(() => {
    fetchData();
    fetchGenres();
    fetchOriginCountries();
    fetchProductionCompanies();
    fetchProductionCountries();
  }, [user]);

  useEffect(() => {
    if (filtersReady) {
      applyFiltersAndSort();
    }
  }, [filtersReady, series, selectedGenres, selectedFormats, searchQuery, selectedSortBy, selectedStatuses, selectedOriginCountries, selectedProductionCompanies, selectedProductionCountries, yearRange, voteRange, episodeRange, series, orderAsc]);

  useEffect(() => setSelectedMenu("myList"), [setSelectedMenu]);

  const hasActiveFilters = 
  selectedGenres.length > 0 ||
  selectedFormats.length > 0 ||
  selectedStatuses.length > 0 ||
  selectedOriginCountries.length > 0 ||
  selectedProductionCompanies.length > 0 ||
  selectedProductionCountries.length > 0 ||
  (yearRange.min !== yearRange.minimalRange || yearRange.max !== yearRange.maximalRange) ||
  (voteRange.min !== voteRange.minimalRange || voteRange.max !== voteRange.maximalRange) ||
  (episodeRange.min !== episodeRange.minimalRange || episodeRange.max !== episodeRange.maximalRange);

  return (
    <div style={{ height: "100%", padding: "2rem 4rem", backgroundColor: "var(--background-color)" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button style={{ padding: "0.9rem", border: "none", backgroundColor: "var(--button-background)", color: "var(--button-text)", borderRadius: "4px", cursor: "pointer" }} onClick={toggleLayout}>
          Toggle Layout
        </button>
      </div>

      <Filters
        genres={genres}
        selectedGenres={selectedGenres}
        onSelectGenres={setSelectedGenres}
        formats={['tv', 'movie']}
        selectedFormats={selectedFormats}
        onSelectFormats={setSelectedFormats}
        sortByOptions={['popularity', 'vote_average', 'first_air_date', 'last_air_date', 'number_of_episodes', 'added', 'name']}
        selectedSortBy={selectedSortBy}
        onSelectSortBy={setSelectedSortBy}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statuses={statuses}
        selectedStatuses={selectedStatuses}
        onSelectStatuses={setSelectedStatuses}
        originCountries={originCountries}
        selectedOriginCountries={selectedOriginCountries}
        onSelectOriginCountries={setSelectedOriginCountries}
        productionCompanies={productionCompanies}
        selectedProductionCompanies={selectedProductionCompanies}
        onSelectProductionCompanies={setSelectedProductionCompanies}
        productionCountries={productionCountries.map(country => country.name)}
        selectedProductionCountries={selectedProductionCountries}
        onSelectProductionCountries={setSelectedProductionCountries}
        yearRange={filtersReady ? yearRange : undefined}
        onYearRangeChange={handleYearRangeChange}
        voteRange={filtersReady ? voteRange : undefined}
        onVoteRangeChange={handleVoteRangeChange}
        episodeRange={filtersReady ? episodeRange : undefined}
        onEpisodeRangeChange={handleEpisodeRangeChange}
        orderAsc={orderAsc}
        setOrderChange={handleOrderChange}
      />

      <div className="filter-container">
        {hasActiveFilters && (
          <Filter width={20} height={20} />
        )}

        {selectedGenres.length > 0 && selectedGenres.map((genre) => (
          <span key={genre} className="filter-label" onClick={() => removeFilter('genre', genre)}> {genre} </span>
        ))}
        {selectedFormats.length > 0 && selectedFormats.map((format) => (
          <span key={format} className="filter-label" onClick={() => removeFilter('format', format)} > {format} </span>
        ))}
        {selectedStatuses.length > 0 && selectedStatuses.map((status) => (
          <span key={status} className="filter-label" onClick={() => removeFilter('status', status)} >{status}</span>
        ))}
        {selectedOriginCountries.length > 0 && selectedOriginCountries.map((country) => (
          <span
            key={country}
            className="filter-label"
            onClick={() => removeFilter('originCountry', country)}
          >
            {country}
          </span>
        ))}
        {selectedProductionCompanies.length > 0 && selectedProductionCompanies.map((company) => (
          <span key={company} className="filter-label" onClick={() => removeFilter('productionCompany', company)}> {company}</span>
        ))}
        {selectedProductionCountries.length > 0 && selectedProductionCountries.map((country) => (
          <span key={country} className="filter-label" onClick={() => removeFilter('productionCountry', country)}>{country}</span>
        ))}
        {(yearRange.min !== yearRange.minimalRange || yearRange.max !== yearRange.maximalRange) && (
          <span className="filter-label" onClick={() => clearYearRange()}> Year: {yearRange.min} - {yearRange.max} </span>
        )}
        {(voteRange.min !== voteRange.minimalRange || voteRange.max !== voteRange.maximalRange) && (
          <span className="filter-label" onClick={() => clearVoteRange()}>Vote: {voteRange.min} - {voteRange.max}</span>
        )}
        {(episodeRange.min !== episodeRange.minimalRange || episodeRange.max !== episodeRange.maximalRange) && (
          <span className="filter-label" onClick={() => clearEpisodeRange()}>Episodes: {episodeRange.min} - {episodeRange.max}</span>
        )}
        {hasActiveFilters && (
          <span className="clear-all" onClick={clearAllFilters}>Clear All</span>
        )}
      </div>

      <div style={{ textAlign: 'center', margin: '1rem 0' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
          {filteredSeries.length} {filteredSeries.length === 1 ? 'result' : 'results'} found
        </span>
      </div>

      {fetchDataFinished === false ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <Loader />
        </div>
      ) : (
        <SeriesList series={filteredSeries} styleType={styleType} followedIds={series.map(serie=>Number(serie.id))} onClickHeart={onClickHeart}/>
      )}
    </div>
  );
}