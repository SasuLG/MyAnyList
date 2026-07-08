"use client"
import { useCatalogFilters } from "@/hook/useCatalogFilters";
import SeriesList from "../seriesList";
import Filters from "../filters";
import DisplayControls from "./DisplayControls";
import Loader from '@/components/loader';
import { useUserContext } from '@/userContext';
import { useEffect, useMemo, useState } from 'react';
import { Range } from '@/types/series.type';
import { CatalogItem } from '@/types/catalog-item.type';
import { useSeriesActions } from '@/hook/useSeriesActions';
import ActiveFilters from '@/components/catalog/ActiveFilters';
import { useCatalogData } from '@/hook/useCatalogData';

interface CatalogPageProps { page: "search" | "myList" | "waitList"; emptyMessage?: string | React.ReactNode; renderExtraContent?: (series: CatalogItem[]) => React.ReactNode; defaultSortBy: string }

export default function CatalogPage({ page, emptyMessage, renderExtraContent, defaultSortBy }: CatalogPageProps) {

    /**
     * Hook pour stocker la largeur de la fenêtre
     */
    const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined);

    const { user, setSelectedMenu, mangaMode } = useUserContext();

    /**
     * Hook pour stocker le type de style (grille ou liste)
     */
    const [styleType, setStyleType] = useState<'grid' | 'list'>('grid');

    /**
     * Hook pour stocker la taille de l'affichage
     */
    const [displaySize, setDisplaySize] = useState<'large' | 'normal' | 'small' | 'very-small' | 'extra-small'>('normal');

    /**
     * Hook pour stocker la visibilité des boutons de settings
     */
    const [buttonsVisible, setButtonsVisible] = useState(true);

    /**
     * Hook pour stocker l'état de la rotation des boutons de settings
     */
    const [Rotating, setRotating] = useState<boolean | undefined>(undefined);

    const {
        series,
        genres,
        originCountries,
        productionCompanies,
        productionCountries,
        tags,
        minYear,
        maxYear,
        maxEpisodes,
        filtersReady,
        fetchDataFinished,
        seriesIdFollowed,
        setSeriesIdFollowed,
        seriesIdWaited,
        setSeriesIdWaited
    } = useCatalogData({ page, user, mode: mangaMode ? "mangas" : "series" });

    const statuses = useMemo(() => Array.from(new Set(series.map((item) => item.status).filter(Boolean))), [series]);
    const formats = useMemo(() => Array.from(new Set(series.map((item) => item.media_type).filter(Boolean))), [series]);
    const tagNames = Array.isArray(tags) ? tags.map((tag) => tag.name) : [];

    const {
        filteredSeries,
        selectedGenres, setSelectedGenres,
        selectedFormats, setSelectedFormats,
        selectedSortBy, setSelectedSortBy,
        searchQuery, setSearchQuery,
        selectedStatuses, setSelectedStatuses,
        selectedOriginCountries, setSelectedOriginCountries,
        selectedProductionCompanies, setSelectedProductionCompanies,
        selectedProductionCountries, setSelectedProductionCountries,
        selectedTags, setSelectedTags,

        yearRange, setYearRange,
        voteRange, setVoteRange,
        episodeRange, setEpisodeRange,
        withFollowed, setwithFollowed,
        orderAsc, setOrderAsc,

        selectedNotFormats, setSelectedNotFormats,
        selectedNotGenres, setSelectedNotGenres,
        selectedNotStatuses, setSelectedNotStatuses,
        selectedNotOriginCountries, setSelectedNotOriginCountries,
        selectedNotProductionCompanies, setSelectedNotProductionCompanies,
        selectedNotProductionCountries, setSelectedNotProductionCountries,
        selectedNotTags, setSelectedNotTags,

        removeFilter,
        clearAllFilters,
        clearYearRange,
        clearVoteRange,
        clearEpisodeRange,
        hasActiveFilters,
        isOrdering
    } = useCatalogFilters(page, series, filtersReady, seriesIdFollowed, seriesIdWaited, defaultSortBy, minYear, maxYear, maxEpisodes, mangaMode ? "mangas" : "series");


    const { onClickHeart, onClickHourGlass } = useSeriesActions(user, seriesIdFollowed, setSeriesIdFollowed, seriesIdWaited, setSeriesIdWaited, mangaMode ? "mangas" : "series");

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
        const sizes = ['large', 'normal', 'small', 'very-small', 'extra-small'];
        const currentIndex = sizes.indexOf(displaySize);
        setDisplaySize(sizes[currentIndex - 1] as 'large' | 'normal' | 'small' | 'very-small' | 'extra-small');
    };

    /**
     * Fonction pour diminuer la taille d'affichage
     */
    const decreaseSize = () => {
        if (displaySize === 'extra-small') return;
        const sizes = ['large', 'normal', 'small', 'very-small', 'extra-small'];
        const currentIndex = sizes.indexOf(displaySize);
        setDisplaySize(sizes[currentIndex + 1] as 'large' | 'normal' | 'small' | 'very-small' | 'extra-small');
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

    const handleWindowResize = () => {
        setWindowWidth(window.innerWidth);
    }

    useEffect(() => {
        handleWindowResize();
        window.addEventListener('resize', handleWindowResize);
        return () => window.removeEventListener('resize', handleWindowResize);
    }, []);

    useEffect(() => {
        if (windowWidth) windowWidth > 500 ? setButtonsVisible(buttonsVisible) : setButtonsVisible(false);
    }, [windowWidth]);


    useEffect(() => {
        if (mangaMode) document.documentElement.classList.toggle('manga-mode', mangaMode);
    }, [mangaMode]);

    useEffect(() => setSelectedMenu(page), [setSelectedMenu]);

    return (
        <div style={{ height: "100%", padding: windowWidth && windowWidth > 500 ? "2rem 5rem" : "2rem 2rem", backgroundColor: "var(--background-color)" }}>

            <DisplayControls
                buttonsVisible={buttonsVisible}
                rotating={Rotating}
                styleType={styleType}
                toggleButtonsVisibility={toggleButtonsVisibility}
                setRotating={setRotating}
                toggleLayout={toggleLayout}
                increaseSize={increaseSize}
                decreaseSize={decreaseSize}
                mode={mangaMode ? 'mangas' : 'series'}
                filteredSeries={page === "myList" ? filteredSeries : undefined}
            />
            {renderExtraContent?.(filteredSeries)}
            <Filters
                genres={genres}
                selectedGenres={selectedGenres}
                onSelectGenres={setSelectedGenres}
                formats={formats}
                selectedFormats={selectedFormats}
                onSelectFormats={setSelectedFormats}
                sortByOptions={[page === "search" ? 'Added' : page === "myList" ? "Followed" : "Waited", 'Popularity', 'Start date', 'End date', page === "search" ? 'Vote average' : "Note", 'Name', mangaMode ? 'Number chapters' : 'Number episodes'].concat(mangaMode ? [] : ['Total time'])}
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
                {...(!mangaMode && { productionCompanies: productionCompanies.map(pc => pc.name) })}
                {...(!mangaMode && { selectedProductionCompanies: selectedProductionCompanies })}
                {...(!mangaMode && { onSelectProductionCompanies: setSelectedProductionCompanies })}
                {...(!mangaMode && { productionCountries: productionCountries.map(country => country.name) })}
                {...(!mangaMode && { selectedProductionCountries: selectedProductionCountries })}
                {...(!mangaMode && { onSelectProductionCountries: setSelectedProductionCountries })}
                yearRange={filtersReady ? yearRange : undefined}
                onYearRangeChange={handleYearRangeChange}
                voteRange={filtersReady ? voteRange : undefined}
                onVoteRangeChange={handleVoteRangeChange}
                episodeRange={filtersReady ? episodeRange : undefined}
                onEpisodeRangeChange={handleEpisodeRangeChange}
                {...(page === "search" && { withFollowed, onwithFollowedChange: handleWithFollowedChange })}
                orderAsc={orderAsc}
                setOrderChange={handleOrderChange}
                tags={tagNames}
                selectedTags={selectedTags}
                onSelectTags={setSelectedTags}

                selectedNotTags={selectedNotTags}
                onSelectNotTags={setSelectedNotTags}
                selectedNotFormats={selectedNotFormats}
                onSelectNotFormats={setSelectedNotFormats}
                selectedNotGenres={selectedNotGenres}
                onSelectNotGenres={setSelectedNotGenres}
                selectedNotStatuses={selectedNotStatuses}
                onSelectNotStatuses={setSelectedNotStatuses}
                selectedNotOriginCountries={selectedNotOriginCountries}
                onSelectNotOriginCountries={setSelectedNotOriginCountries}
                {...(!mangaMode && { selectedNotProductionCompanies: selectedNotProductionCompanies })}
                {...(!mangaMode && { onSelectNotProductionCompanies: setSelectedNotProductionCompanies })}
                {...(!mangaMode && { selectedNotProductionCountries: selectedNotProductionCountries })}
                {...(!mangaMode && { onSelectNotProductionCountries: setSelectedNotProductionCountries })}
            />

            <ActiveFilters
                selectedGenres={selectedGenres}
                selectedFormats={selectedFormats}
                selectedStatuses={selectedStatuses}
                selectedOriginCountries={selectedOriginCountries}
                {...(!mangaMode && { selectedProductionCompanies: selectedProductionCompanies })}
                {...(!mangaMode && { selectedProductionCountries: selectedProductionCountries })}
                selectedTags={selectedTags}
                selectedNotGenres={selectedNotGenres}
                selectedNotFormats={selectedNotFormats}
                selectedNotStatuses={selectedNotStatuses}
                selectedNotOriginCountries={selectedNotOriginCountries}
                {...(!mangaMode && { selectedNotProductionCompanies: selectedNotProductionCompanies })}
                {...(!mangaMode && { selectedNotProductionCountries: selectedNotProductionCountries })}
                selectedNotTags={selectedNotTags}

                removeFilter={removeFilter}
                clearAllFilters={clearAllFilters}
                hasActiveFilters={hasActiveFilters}

                yearRange={yearRange}
                voteRange={voteRange}
                episodeRange={episodeRange}

                clearYearRange={clearYearRange}
                clearVoteRange={clearVoteRange}
                clearEpisodeRange={clearEpisodeRange}
            />

            <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {filteredSeries.length} {filteredSeries.length === 1 ? 'result' : 'results'} found
                </span>
            </div>

            {fetchDataFinished === false ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                    <Loader />
                </div>
            ) : (
                series.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                        {emptyMessage ? (
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{emptyMessage}</span>
                        ) : (
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>No series found</span>
                        )}
                    </div>
                ) : (
                    <SeriesList series={filteredSeries} styleType={styleType} followedIds={seriesIdFollowed} waitedIds={seriesIdWaited} onClickHeart={onClickHeart} onClickHourGlass={onClickHourGlass} size={displaySize} isMylist={page === "myList"} isOrdering={isOrdering} mode={mangaMode ? "mangas" : "series"} />
                )
            )}
        </div>
    );
}