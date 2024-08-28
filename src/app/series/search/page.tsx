"use client"
import Loader from '@/components/loader';
import SeriesList from '@/components/seriesList';
import { MinimalSerie, ProductionCompany, ProductionCountry, Tag } from '@/tmdb/types/series.type';
import { useUserContext } from '@/userContext';
import React, { useEffect, useState } from 'react';
import Filters from '@/components/filters';
import { Range } from '@/tmdb/types/series.type';
import { Filter } from '@/components/svg/filter.svg';
import { DecreaseSize, IncreaseSize, Settings, ToggleLayout } from '@/components/svg/buttons.svg';

export default function SearchPage() {

  const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined);

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
   * Hook pour stocker le type de style (grille ou liste)
   */
  const [styleType, setStyleType] = useState<'grid' | 'list'>('grid');

  /**
   * Hook pour stocker la taille de l'affichage
   */
  const [displaySize, setDisplaySize] = useState<'large' | 'normal' | 'small' | 'very-small' | 'extra-small'>('normal');

  /**
   * Hook pour stocker l'état de la récupération des données
   */
  const [fetchDataFinished, setFetchDataFinished] = useState<boolean>(false);

  /**
   * Hook pour stocker l'id des séries suivies
   */
  const [seriesIdFollowed, setSeriesIdFollowed] = useState<number[]>([]);

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
   * Hook pour stocker l'état de l'affichage avec les séries suivies
   */
  const [withFollowed, setwithFollowed] = useState<boolean>(false);

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
  const [selectedSortBy, setSelectedSortBy] = useState<string>('Added');

  /**
   * Hook pour stocker la recherche
   */
  const [searchQuery, setSearchQuery] = useState<string>('');

  /**
   * Hook pour stocker les statuts
   */
  const [statuses, setStatuses] = useState<string[]>(["En cours", "Terminé", "Annulé"]); 

  const statusMapping: Record<string, string> = {
    "Returning Series" : "En cours",
     "Ended" : "Terminé",
    "Canceled" : "Annulé"
  };

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
  const [productionCompanies, setProductionCompanies] = useState<ProductionCompany[]>([]);

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

  /**
   * Hook pour stocker les tags
   */
  const [tags, setTags] = useState<Tag[]>([]);

  /**
   * Hook pour stocker les tags sélectionnés
   */
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
   * Hook pour stocker la visibilité des boutons de settings
   */
  const [buttonsVisible, setButtonsVisible] = useState(true);

  /**
   * Hook pour stocker l'état de la rotation des boutons de settings
   */
  const [Rotating, setRotating] = useState<boolean | undefined>(undefined);

  /**
   * Fonction pour récupérer les données des séries
   */
  const fetchData = async () => {
    const response = await fetch(`/api/series/all?limit=${encodeURIComponent(2000000)}&page=${encodeURIComponent(1)}`);
    const data = await response.json();
    setSeries(data);
    setFetchDataFinished(true);

    if (user !== undefined) {
      const responseFollowed = await fetch(`/api/${encodeURIComponent(user.web_token)}/series/all/id`);
      const dataFollowed = await responseFollowed.json();
      setSeriesIdFollowed(dataFollowed);
    }
    if (data.length > 0) {
      const minYear = Math.min(...data.map((serie: MinimalSerie) => new Date(serie.first_air_date).getFullYear()));
      const maxEpisodes = Math.max(...data.map((serie: MinimalSerie) => serie.number_of_episodes));
      
      // set initial range values
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
   * Fonction pour récupérer tous les tags
   */
  const fetchTags = async () => {
    const response = await fetch('/api/series/tags');
    const data = await response.json();
    setTags(data);
  };  

  /**
   * Fonction pour basculer entre les styles de disposition
   */
  const toggleLayout = () => {
    setStyleType((prevStyleType) => (prevStyleType === 'grid' ? 'list' : 'grid'));
  };

  /**
   * Fonction pour augmenter la taille d'affichage
   */
  const increaseSize = () => {
    if (displaySize === 'large') return;
    const sizes = ['large','normal', 'small', 'very-small', 'extra-small'];
    const currentIndex = sizes.indexOf(displaySize);
    setDisplaySize(sizes[currentIndex - 1] as 'large' | 'normal' | 'small' | 'very-small' | 'extra-small');
  };

  /**
   * Fonction pour diminuer la taille d'affichage
   */
  const decreaseSize = () => {
    if (displaySize === 'extra-small') return;
    const sizes = ['large','normal', 'small', 'very-small', 'extra-small'];
    const currentIndex = sizes.indexOf(displaySize);
    setDisplaySize(sizes[currentIndex + 1] as 'large' | 'normal' | 'small' | 'very-small' | 'extra-small');
  };

  /**
   * Fonction pour suivre ou arrêter de suivre une série
   * @param {MinimalSerie} serie - Série à suivre ou arrêter de suivre
   * @returns 
   */
  const onClickHeart = async (serie: MinimalSerie) => {
    if (user === undefined) {
      return;
    }
    const route = `/api/${encodeURIComponent(user.web_token)}/series/${seriesIdFollowed.includes(Number(serie.id)) ? 'un' : ''}follow`;
    const response = await fetch(route, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serieId: serie.id }),
    });
    const data = await response.json();
    setSeriesIdFollowed(data ? (seriesIdFollowed.includes(Number(serie.id)) ? seriesIdFollowed.filter((id) => id !== Number(serie.id)) : [...seriesIdFollowed, Number(serie.id)]) : seriesIdFollowed);
    
    await fetch('/api/user/activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login: user.login }),
    });
  };

  /**
   * Fonction pour basculer la visibilité des boutons de settings
   */
  const toggleButtonsVisibility = () => {
    setButtonsVisible(!buttonsVisible);
  };

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
   * Fonction pour gérer le changement de l'affichage avec les séries suivies
   * @param {boolean} onlyFollowed - Afficher en plus les séries suivies
   */
  const handleWithFollowedChange = (onlyFollowed: boolean) => {
    setwithFollowed(onlyFollowed);
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
        case 'tag':
          setSelectedTags(selectedTags.filter((tag) => tag !== value));
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
  
    let filtered = series.filter(serie => {
      if (!withFollowed && seriesIdFollowed.includes(Number(serie.id))) {
        return false;
      }
  
      // Apply format filters
      const matchesFormat = selectedFormats.length === 0 || selectedFormats.includes(serie.media_type) &&
        (selectedFormats.includes('tv') && serie.media_type === 'tv' ) ||
        (selectedFormats.includes('movie') && serie.media_type === 'movie' ) ||
        (selectedFormats.includes('anime') && serie.media_type === 'anime') ||
        (selectedFormats.includes('film d\'animation') && serie.media_type === 'film d\'animation');
      
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.every(genre => serie.genres.some(g => g.name === genre));
      const matchesSearchQuery = [serie.name, serie.original_name, serie.romaji_name]
      .filter(name => name) 
      .some(name => name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(statusMapping[serie.status] || serie.status);
      const matchesOriginCountry = selectedOriginCountries.length === 0 || selectedOriginCountries.every(country => serie.origin_country.includes(country));
      const matchesProductionCompany = selectedProductionCompanies.every(company => serie.production_companies.some(prod => prod.name === company));
      const matchesProductionCountry = selectedProductionCountries.every(country => serie.production_countries.some(c => c.name === country));
      const matchesTags = selectedTags.every(tag => serie.tags.some(t => t.name === tag));
      const serieYear = new Date(serie.first_air_date).getFullYear();
      const matchesYearRange = serieYear >= yearRange.min && serieYear <= yearRange.max;
      const matchesVoteRange = (serie.vote_average || 0) >= voteRange.min && (serie.vote_average || 0) <= voteRange.max;
      const matchesEpisodeRange = serie.number_of_episodes >= episodeRange.min && serie.number_of_episodes <= episodeRange.max;
  
      return matchesFormat && matchesGenre && matchesSearchQuery && matchesStatus && matchesOriginCountry && matchesProductionCompany && matchesProductionCountry && matchesYearRange && matchesVoteRange && matchesEpisodeRange && matchesTags;
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
      case 'Added':
        filtered.sort((a, b) => Number(b.id) - Number(a.id));
        break;
      case 'Name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Total time':
        filtered.sort((a, b) => b.total_time - a.total_time);
        break;
      default:
        break;
    }
  
    if (!orderAsc) filtered.reverse();
    setFilteredSeries(filtered);
  };
  

  /**
   * Fonction pour réinitialiser tous les filtres
   */
  const clearAllFilters = () => {
    setSelectedGenres([]);
    setSelectedFormats([]);
    setSelectedSortBy('Added');
    setSearchQuery('');
    setSelectedStatuses([]);
    setSelectedOriginCountries([]);
    setSelectedProductionCompanies([]);
    setSelectedProductionCountries([]);
    setYearRange({ min: 1900, max: new Date().getFullYear(), minimalRange: 1900, maximalRange: new Date().getFullYear() });
    setVoteRange({ min: 0, max: 10, minimalRange: 0, maximalRange: 10 });
    setEpisodeRange({ min: 1, max: 2000, minimalRange: 1, maximalRange: 2000 });
    setwithFollowed(false);
    setSelectedTags([]);
    setOrderAsc(true);
  };

  const handleWindowResize = () => {
    setWindowWidth(window.innerWidth);
  }

  useEffect(() => {
    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);
  
  useEffect(() => {
    fetchData();
    fetchGenres();
    fetchOriginCountries();
    fetchProductionCompanies();
    fetchProductionCountries();
    fetchTags();
  }, [user]);

  useEffect(() => {
    if (filtersReady) {
      applyFiltersAndSort();
    }
  }, [filtersReady, series, selectedGenres, selectedFormats, searchQuery, selectedSortBy, selectedStatuses, selectedOriginCountries, selectedProductionCompanies, selectedProductionCountries, yearRange, voteRange, episodeRange, withFollowed, seriesIdFollowed, orderAsc, selectedTags]);

  useEffect(() => {
    if(typeof window !== "undefined") window.innerWidth > 500 ? setButtonsVisible(buttonsVisible) : setButtonsVisible(false);
  }, [window.innerWidth]);

  useEffect(() => setSelectedMenu("search"), [setSelectedMenu]);

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
  (episodeRange.min !== episodeRange.minimalRange || episodeRange.max !== episodeRange.maximalRange);

  return (
    <div style={{ height: "100%", padding: windowWidth && windowWidth >500?"2rem 5rem":"2rem 2rem", backgroundColor: "var(--background-color)" }}>

      <button
        onClick={(e) => { toggleButtonsVisibility(); setRotating(!Rotating); }} 
        style={{ position: 'absolute', top: '4rem', right: '1rem', border: "1px solid var(--border-color)", borderRadius: "5px", backgroundColor: "var(--button-background-color)", padding: "0.6rem 1.2rem", cursor: "pointer", boxShadow: "0px 1px 3px rgba(0,0,0,0.1)", zIndex: 1000, fontSize: '0.9rem', fontWeight: 'normal', color: "var(--text-color)", transition: "background-color 0.3s, color 0.3s", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--button-hover-background-color)'; e.currentTarget.style.color = 'var(--button-hover-text-color)'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--button-background-color)'; e.currentTarget.style.color = 'var(--text-color)'; }} >
          <Settings width={20} height={20} rotating={Rotating}/>
      </button>

      {buttonsVisible && (
        <div style={{ position: 'absolute', top: '6.5rem', right: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 1000 }}>
          <button
            style={{ border: "1px solid var(--border-color)", borderRadius: "5px", backgroundColor: "var(--button-background-color)", padding: "0.5rem", cursor: "pointer", boxShadow: "0px 1px 2px rgba(0,0,0,0.1)", opacity: 0.8, transition: "opacity 0.3s, background-color 0.3s", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={toggleLayout} onMouseOver={(e) => e.currentTarget.style.opacity = "1"}   onMouseOut={(e) => e.currentTarget.style.opacity = "0.8"}>
            <ToggleLayout width={25} height={25} checked={styleType==="grid"}/>
          </button>

          <button
            style={{ border: "1px solid var(--border-color)", borderRadius: "5px", backgroundColor: "var(--button-background-color)", padding: "0.5rem", cursor: "pointer", boxShadow: "0px 1px 2px rgba(0,0,0,0.1)", opacity: 0.8, transition: "opacity 0.3s, background-color 0.3s", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={increaseSize}  onMouseOver={(e) => e.currentTarget.style.opacity = "1"} onMouseOut={(e) => e.currentTarget.style.opacity = "0.8"}>
            <IncreaseSize width={25} height={25} />
          </button>

          <button
            style={{ border: "1px solid var(--border-color)", borderRadius: "5px", backgroundColor: "var(--button-background-color)", padding: "0.5rem", cursor: "pointer", boxShadow: "0px 1px 2px rgba(0,0,0,0.1)", opacity: 0.8, transition: "opacity 0.3s, background-color 0.3s", display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={decreaseSize} onMouseOver={(e) => e.currentTarget.style.opacity = "1"}onMouseOut={(e) => e.currentTarget.style.opacity = "0.8"} >
            <DecreaseSize width={25} height={25} />
          </button>
        </div>
      )}

      <Filters
        genres={genres}
        selectedGenres={selectedGenres}
        onSelectGenres={setSelectedGenres}
        formats={['tv', 'movie', 'anime', "film d'animation"]}
        selectedFormats={selectedFormats}
        onSelectFormats={setSelectedFormats}
        sortByOptions={['Added', 'Popularity', 'Start date', 'End date',  'Vote average', 'Name', 'Number episodes', 'Total time']}
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
        productionCompanies={productionCompanies.map(pc=> pc.name)}
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
        withFollowed={withFollowed}
        onwithFollowedChange={handleWithFollowedChange}
        orderAsc={orderAsc}
        setOrderChange={handleOrderChange}
        tags={tags.map(tag => tag.name)}
        selectedTags={selectedTags}
        onSelectTags={setSelectedTags}
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
        {selectedTags.length > 0 && selectedTags.map((tag) => (
          <span key={tag} className="filter-label" onClick={() => removeFilter('tag', tag)}>{tag}</span>
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
        <SeriesList series={filteredSeries} styleType={styleType} followedIds={seriesIdFollowed} onClickHeart={onClickHeart} size={displaySize} isMylist={false}/>
      )}
    </div>
  );
}