import { Filter } from "../svg/filter.svg";
import { Range } from '@/types/series.type';

interface Props {
    selectedGenres: string[];
    selectedFormats: string[];
    selectedStatuses: string[];
    selectedOriginCountries: string[];
    selectedProductionCompanies?: string[];
    selectedProductionCountries?: string[];
    selectedTags: string[];
    selectedNotGenres: string[];
    selectedNotFormats: string[];
    selectedNotStatuses: string[];
    selectedNotOriginCountries: string[];
    selectedNotProductionCompanies?: string[];
    selectedNotProductionCountries?: string[];
    selectedNotTags: string[];

    removeFilter: (type: string, value: string) => void;
    clearAllFilters: () => void;
    hasActiveFilters: boolean;

    yearRange: Range;
    voteRange: Range;
    episodeRange: Range;

    clearYearRange: () => void;
    clearVoteRange: () => void;
    clearEpisodeRange: () => void;
    totalTimeExcludeSpecialRange: Range;
    clearTotalTimeExcludeSpecialRange: () => void;
}

export default function ActiveFilters({
    selectedGenres,
    selectedFormats,
    selectedStatuses,
    selectedOriginCountries,
    selectedProductionCompanies,
    selectedProductionCountries,
    selectedTags,
    selectedNotGenres,
    selectedNotFormats,
    selectedNotStatuses,
    selectedNotOriginCountries,
    selectedNotProductionCompanies,
    selectedNotProductionCountries,
    selectedNotTags,
    removeFilter,
    clearAllFilters,
    hasActiveFilters,
    yearRange,
    voteRange,
    episodeRange,
    clearYearRange,
    clearVoteRange,
    clearEpisodeRange,
    totalTimeExcludeSpecialRange,
    clearTotalTimeExcludeSpecialRange
}: Props) {
    return (
        <div className="filter-container">
            {hasActiveFilters && (
                <Filter width={20} height={20} />
            )}

            {selectedGenres.length > 0 && selectedGenres.map((genre) => (
                <span key={genre} className="filter-label" onClick={() => removeFilter('genre', genre)}> {genre} </span>
            ))}
            {selectedNotGenres.length > 0 && selectedNotGenres.map((genre) => (
                <span key={genre} className="filter-label not-filter" onClick={() => removeFilter('genre', genre)}> Not {genre} </span>
            ))}

            {selectedFormats.length > 0 && selectedFormats.map((format) => (
                <span key={format} className="filter-label" onClick={() => removeFilter('format', format)} > {format} </span>
            ))}
            {selectedNotFormats.length > 0 && selectedNotFormats.map((format) => (
                <span key={format} className="filter-label not-filter" onClick={() => removeFilter('format', format)} > Not {format} </span>
            ))}

            {selectedStatuses.length > 0 && selectedStatuses.map((status) => (
                <span key={status} className="filter-label" onClick={() => removeFilter('status', status)} >{status}</span>
            ))}
            {selectedNotStatuses.length > 0 && selectedNotStatuses.map((status) => (
                <span key={status} className="filter-label not-filter" onClick={() => removeFilter('status', status)} > Not {status} </span>
            ))}

            {selectedOriginCountries.length > 0 && selectedOriginCountries.map((country) => (
                <span key={country} className="filter-label" onClick={() => removeFilter('originCountry', country)}>{country}</span>
            ))}
            {selectedNotOriginCountries.length > 0 && selectedNotOriginCountries.map((country) => (
                <span key={country} className="filter-label not-filter" onClick={() => removeFilter('originCountry', country)}>Not {country}</span>
            ))}

            {selectedProductionCompanies && selectedProductionCompanies.length > 0 && selectedProductionCompanies.map((company) => (
                <span key={company} className="filter-label" onClick={() => removeFilter('productionCompany', company)}> {company}</span>
            ))}
            {selectedNotProductionCompanies && selectedNotProductionCompanies.length > 0 && selectedNotProductionCompanies.map((company) => (
                <span key={company} className="filter-label not-filter" onClick={() => removeFilter('productionCompany', company)}> Not {company}</span>
            ))}

            {selectedProductionCountries && selectedProductionCountries.length > 0 && selectedProductionCountries.map((country) => (
                <span key={country} className="filter-label" onClick={() => removeFilter('productionCountry', country)}>{country}</span>
            ))}
            {selectedNotProductionCountries && selectedNotProductionCountries.length > 0 && selectedNotProductionCountries.map((country) => (
                <span key={country} className="filter-label not-filter" onClick={() => removeFilter('productionCountry', country)}> Not {country} </span>
            ))}

            {selectedTags.length > 0 && selectedTags.map((tag) => (
                <span key={tag} className="filter-label" onClick={() => removeFilter('tag', tag)}>{tag}</span>
            ))}
            {selectedNotTags.length > 0 && selectedNotTags.map((tag) => (
                <span key={tag} className="filter-label not-filter" onClick={() => removeFilter('tag', tag)}> Not {tag} </span>
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
            {(totalTimeExcludeSpecialRange.min !== totalTimeExcludeSpecialRange.minimalRange || totalTimeExcludeSpecialRange.max !== totalTimeExcludeSpecialRange.maximalRange) && (
                <span className="filter-label" onClick={() => clearTotalTimeExcludeSpecialRange()}>Total Time: {totalTimeExcludeSpecialRange.min} - {totalTimeExcludeSpecialRange.max}</span>
            )}
            {hasActiveFilters && (
                <span className="clear-all" onClick={clearAllFilters}>Clear All</span>
            )}
        </div>

    )
}
