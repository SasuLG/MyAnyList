import React, { useState, useRef, useEffect } from 'react';
import MultiSelectDropdown from '@/components/multiSelectDropdown';
import RangeFilter from './rangeFilter';
import { Range } from '@/tmdb/types/series.type';
import { Order, MoreFilter } from './svg/filter.svg'; 

type FiltersProps = {
  genres: string[];
  selectedGenres: string[];
  onSelectGenres: (genres: string[]) => void;
  formats: string[];
  selectedFormats: string[];
  onSelectFormats: (formats: string[]) => void;
  sortByOptions: string[];
  selectedSortBy: string;
  onSelectSortBy: (sortBy: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statuses: string[];
  selectedStatuses: string[];
  onSelectStatuses?: (statuses: string[]) => void;
  originCountries?: string[];
  selectedOriginCountries?: string[];
  onSelectOriginCountries?: (countries: string[]) => void;
  productionCompanies?: string[];
  selectedProductionCompanies?: string[];
  onSelectProductionCompanies?: (companies: string[]) => void;
  productionCountries?: string[];
  selectedProductionCountries?: string[];
  onSelectProductionCountries?: (countries: string[]) => void;
  yearRange?: Range;
  onYearRangeChange?: (range: Range) => void;
  voteRange?: Range;
  onVoteRangeChange?: (range: Range) => void;
  episodeRange?: Range;
  onEpisodeRangeChange?: (range: Range) => void;
  withFollowed?: boolean;
  onwithFollowedChange?: (onlyFollowed: boolean) => void;
  orderAsc: boolean;
  setOrderChange: (order: boolean) => void;
}

const Filters: React.FC<FiltersProps> = ({
  genres,
  selectedGenres,
  onSelectGenres,
  formats,
  selectedFormats,
  onSelectFormats,
  sortByOptions,
  selectedSortBy,
  onSelectSortBy,
  searchQuery,
  onSearchChange,
  statuses = [],
  selectedStatuses = [],
  onSelectStatuses = () => {},
  originCountries = [],
  selectedOriginCountries = [],
  onSelectOriginCountries = () => {},
  productionCompanies = [],
  selectedProductionCompanies = [],
  onSelectProductionCompanies = () => {},
  productionCountries = [],
  selectedProductionCountries = [],
  onSelectProductionCountries = () => {},
  yearRange,
  onYearRangeChange = () => {},
  voteRange,
  onVoteRangeChange = () => {},
  episodeRange,
  onEpisodeRangeChange = () => {},
  withFollowed,
  onwithFollowedChange = () => {},
  orderAsc = true,
  setOrderChange
}) => {

  /**
   * Hook qui permet de gérer l'affichage du tooltip
   */
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  /**
   * Hook qui permet de gérer l'affichage du popup
   */
  const [showPopup, setShowPopup] = useState<boolean>(false);

  /**
   * Référence vers le popup et le svg
   */
  const popupRef = useRef<HTMLDivElement>(null);

  /**
   * Référence vers le svg
   */
  const svgRef = useRef<HTMLDivElement>(null);

  /**
   * Fonction qui permet de gérer la fermeture du popup lorsqu'on clique en dehors
   * @param {MouseEvent} event - L'événement de type MouseEvent
   */
  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node) && !svgRef.current?.contains(event.target as Node)) {
      setShowPopup(false);
    }
  };

  const handlePopupClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  /**
   * Fonction qui permet de gérer l'affichage du popup
   */
  const handleSvgClick = () => {
    setShowPopup(prev => !prev);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '80%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span>Genres</span>
          <MultiSelectDropdown
            options={genres}
            selectedOptions={selectedGenres}
            onSelect={onSelectGenres}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span>Format</span>
          <MultiSelectDropdown
            options={formats}
            selectedOptions={selectedFormats}
            onSelect={onSelectFormats}
          />
        </div>

        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            position: 'relative', 
            cursor: 'pointer',
            marginRight: '-1.5rem',
          }}
          onClick={() => setOrderChange(!orderAsc)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Order 
            width={30} 
            height={30} 
            orderAsc={orderAsc} 
          />
          {showTooltip && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#333',
                color: '#fff',
                padding: '0.5rem',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                fontSize: '0.875rem',
                zIndex: 10,
                textAlign: 'center',
                marginBottom: '0.5rem',
                pointerEvents: 'none',
              }}
            >
              {orderAsc ? 'Ascending' : 'Descending'}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <span>Sort by</span>
          <MultiSelectDropdown
            options={sortByOptions}
            selectedOptions={[selectedSortBy]}
            onSelect={(options) => onSelectSortBy(options[0] || 'added')}
            singleSelect
          />
        </div>

        {statuses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span>Status</span>
            <MultiSelectDropdown
              options={statuses}
              selectedOptions={selectedStatuses}
              onSelect={onSelectStatuses}
            />
          </div>
        )}

        {voteRange && (
          <div className="slider-filter" >
            <span>Vote Range</span>
            <RangeFilter 
              range={voteRange} 
              onChange={onVoteRangeChange} 
              minLimit={voteRange.minimalRange} 
              maxLimit={voteRange.maximalRange}
            />
          </div>
        )}

        {withFollowed !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id='withFollowed'
              checked={withFollowed}
              onChange={(e) => onwithFollowedChange(e.target.checked)}
              className='input-switch'
              style={{ marginRight: '0.5rem' }}
            />
            <label htmlFor='withFollowed' className='switch' />
            <span>With followed</span>
          </div>
        )}


        <div
          style={{ 
            position: 'relative', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)', // Box-shadow réduit
            padding: '0.5rem',
            borderRadius: '4px',
          }}
          onClick={handleSvgClick}
          ref={svgRef}
        >
          <MoreFilter 
            width={30} 
            height={30} 
            isOpen={showPopup}
          />
          {showPopup && (
            <div
              ref={popupRef}
              className={`popup`}
              onClick={handlePopupClick}
              style={{ top: svgRef.current?.offsetHeight ?? 0 }}
            >
              {originCountries.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <span>Origin Country</span>
                  <MultiSelectDropdown
                    options={originCountries}
                    selectedOptions={selectedOriginCountries}
                    onSelect={onSelectOriginCountries}
                  />
                </div>
              )}

              {productionCompanies.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <span>Production Companies</span>
                  <MultiSelectDropdown
                    options={productionCompanies}
                    selectedOptions={selectedProductionCompanies}
                    onSelect={onSelectProductionCompanies}
                  />
                </div>
              )}

              {productionCountries.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <span>Production Countries</span>
                  <MultiSelectDropdown
                    options={productionCountries}
                    selectedOptions={selectedProductionCountries}
                    onSelect={onSelectProductionCountries}
                  />
                </div>
              )}

              {yearRange && (
                <div style={{ marginBottom: '1rem', width: "40%" }}>
                  <span>Year Range</span>
                  <RangeFilter 
                    range={yearRange} 
                    onChange={onYearRangeChange} 
                    minLimit={yearRange.minimalRange} 
                    maxLimit={yearRange.maximalRange}
                  />
                </div>
              )}

              {episodeRange && (
                <div style={{ marginBottom: '1rem', width: "40%" }}>
                  <span>Episode Range</span>
                  <RangeFilter 
                    range={episodeRange} 
                    onChange={onEpisodeRangeChange} 
                    minLimit={episodeRange.minimalRange} 
                    maxLimit={episodeRange.maximalRange}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Filters;
