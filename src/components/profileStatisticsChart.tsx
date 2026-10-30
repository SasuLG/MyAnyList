"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CatalogItem } from "@/types/catalog-item.type";

type Metric = "time" | "episodes" | "count";
type ChartMode = "line" | "bar";
type FilterKind = "genre" | "tag" | "country";
type Period = "all" | "current-month" | "previous-month" | "current-year" | "previous-year" | "custom";
type FormatOption = { key: string; label: string; formats: string[] };
type Curve = { id: string; label: string; color: string; items: CatalogItem[] };
type Granularity = "day" | "week" | "month";
type TimeWindow = { start: Date; end: Date };
type ChartBin = TimeWindow & { key: string; label: string };

const COLORS = ["#4f8cff", "#e76f51", "#2a9d8f", "#e9c46a", "#a855f7", "#ef476f", "#06b6d4", "#84cc16", "#f97316", "#14b8a6"];
const SERIES_FORMATS: FormatOption[] = [
    { key: "tv", label: "Séries TV", formats: ["tv"] },
    { key: "movie", label: "Films", formats: ["movie"] },
    { key: "anime", label: "Animés", formats: ["anime"] },
    { key: "animation", label: "Films d'animation", formats: ["film d'animation"] },
];
const MANGA_FORMATS: FormatOption[] = [
    { key: "manga", label: "Mangas", formats: ["manga"] },
    { key: "manhwa", label: "Manhwas", formats: ["manhwa"] },
    { key: "manhua", label: "Manhuas", formats: ["manhua"] },
    { key: "novel", label: "Romans", formats: ["novel"] },
    { key: "one-shot", label: "One-shots", formats: ["one_shot", "oneshot", "one-shot"] },
];

const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
// const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const parseFollowDate = (value: string) => {
    const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnly) return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};
const getItemValues = (item: CatalogItem, kind: FilterKind) => {
    if (kind === "genre") return item.genres.map((value) => String(value.name));
    if (kind === "tag") return item.tags.map((value) => String(value.name));
    return item.production_countries
        .map((value) => typeof value === "string" ? value : value?.name)
        .filter((value): value is string => Boolean(value))
        .map(String);
};
const formatDate = (date: Date, granularity: Granularity) => new Intl.DateTimeFormat("fr-FR", granularity === "month" ? { month: "short", year: "numeric" } : { day: "numeric", month: "short", year: "numeric" }).format(date);
const formatTooltipDate = (bin: ChartBin, granularity: Granularity) => {
    if (granularity === "day") return formatDate(bin.start, granularity);
    return `${formatDate(bin.start, granularity)} - ${formatDate(bin.end, granularity)}`;
};

function getPeriodWindow(period: Period, startDate: string, endDate: string, items: CatalogItem[]): TimeWindow {
    const today = new Date();
    if (period === "current-month") return { start: startOfDay(new Date(today.getFullYear(), today.getMonth(), 1)), end: endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0)) };
    if (period === "previous-month") return { start: startOfDay(new Date(today.getFullYear(), today.getMonth() - 1, 1)), end: endOfDay(new Date(today.getFullYear(), today.getMonth(), 0)) };
    if (period === "current-year") return { start: startOfDay(new Date(today.getFullYear(), 0, 1)), end: endOfDay(new Date(today.getFullYear(), 11, 31)) };
    if (period === "previous-year") return { start: startOfDay(new Date(today.getFullYear() - 1, 0, 1)), end: endOfDay(new Date(today.getFullYear() - 1, 11, 31)) };
    if (period === "custom" && startDate && endDate) {
        return { start: startOfDay(new Date(`${startDate}T00:00:00`)), end: endOfDay(new Date(`${endDate}T00:00:00`)) };
    }
    const dates = items.map((item) => item.follow_date ? parseFollowDate(item.follow_date) : null).filter((date): date is Date => date !== null);
    if (dates.length === 0) return { start: startOfDay(today), end: endOfDay(today) };
    return { start: startOfDay(new Date(Math.min(...dates.map((date) => date.getTime())))), end: endOfDay(new Date(Math.max(...dates.map((date) => date.getTime())))) };
}

function getGranularity(window: TimeWindow): Granularity {
    const days = (window.end.getTime() - window.start.getTime()) / DAY;
    if (days <= 45) return "day";
    if (days <= 180) return "week";
    return "month";
}

function buildBins(window: TimeWindow, granularity: Granularity): ChartBin[] {
    const bins: ChartBin[] = [];
    let cursor = new Date(window.start);
    while (cursor <= window.end) {
        const start = new Date(cursor);
        let end: Date;
        if (granularity === "day") end = endOfDay(start);
        else if (granularity === "week") end = endOfDay(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6));
        else end = endOfDay(new Date(start.getFullYear(), start.getMonth() + 1, 0));
        if (end > window.end) end = new Date(window.end);
        bins.push({ start, end, key: `${start.getTime()}-${end.getTime()}`, label: formatDate(start, granularity) });
        if (granularity === "day") cursor.setDate(cursor.getDate() + 1);
        else if (granularity === "week") cursor.setDate(cursor.getDate() + 7);
        else cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return bins;
}

export default function ProfileStatisticsChart({ items, mangaMode }: { items: CatalogItem[]; mangaMode: boolean }) {
    const formats = mangaMode ? MANGA_FORMATS : SERIES_FORMATS;
    const [period, setPeriod] = useState<Period>("all");
    const [metric, setMetric] = useState<Metric>(mangaMode ? "episodes" : "time");
    const [chartMode, setChartMode] = useState<ChartMode>("line");
    const [selectedFormats, setSelectedFormats] = useState<string[]>(formats.map((format) => format.key));
    const [includeAllFormats, setIncludeAllFormats] = useState(false);
    const [showFormatCurves, setShowFormatCurves] = useState(true);
    const [filterKind, setFilterKind] = useState<FilterKind>("genre");
    const [selectedValues, setSelectedValues] = useState<string[]>([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [hoveredPoint, setHoveredPoint] = useState<{ index: number; x: number; y: number } | null>(null);
    const [zoom, setZoom] = useState<TimeWindow | null>(null);
    const [selectedPoint, setSelectedPoint] = useState<{ title: string; items: CatalogItem[] } | null>(null);
    const chartRef = useRef<SVGSVGElement>(null);

    const periodWindow = useMemo(() => getPeriodWindow(period, startDate, endDate, items), [period, startDate, endDate, items]);
    useEffect(() => {
        setMetric(mangaMode ? "episodes" : "time");
        setSelectedFormats((mangaMode ? MANGA_FORMATS : SERIES_FORMATS).map((format) => format.key));
        setIncludeAllFormats(false);
        setSelectedPoint(null);
    }, [mangaMode]);
    const chartWindow = zoom ?? periodWindow;
    const granularity = getGranularity(chartWindow);
    const filteredItems = useMemo(() => items.filter((item) => {
        const date = item.follow_date ? parseFollowDate(item.follow_date) : null;
        return date !== null && date >= periodWindow.start && date <= periodWindow.end;
    }), [items, periodWindow]);

    const availableValues = useMemo(() => {
        const values = new Set<string>();
        filteredItems.forEach((item) => getItemValues(item, filterKind).forEach((value) => values.add(value)));
        return [...values].sort((a, b) => String(a).localeCompare(String(b), "fr"));
    }, [filteredItems, filterKind]);

    const curves = useMemo<Curve[]>(() => {
        const result: Curve[] = [];
        const isSelectedFormat = (item: CatalogItem) => includeAllFormats || selectedFormats.some((key) => formats.find((format) => format.key === key)?.formats.includes(item.media_type));
        if (showFormatCurves) {
            if (includeAllFormats) result.push({ id: "all-formats", label: "Tous les types", color: COLORS[0], items: filteredItems });
            else selectedFormats.forEach((key) => {
                const format = formats.find((value) => value.key === key);
                if (format) result.push({ id: `format-${key}`, label: format.label, color: COLORS[result.length % COLORS.length], items: filteredItems.filter((item) => format.formats.includes(item.media_type)) });
            });
        }
        selectedValues.forEach((value) => result.push({
            id: `filter-${filterKind}-${value}`,
            label: `${value} (${includeAllFormats ? "tous types" : "types sélectionnés"})`,
            color: COLORS[result.length % COLORS.length],
            items: filteredItems.filter((item) => isSelectedFormat(item) && getItemValues(item, filterKind).includes(value)),
        }));
        return result;
    }, [filteredItems, formats, selectedFormats, includeAllFormats, showFormatCurves, selectedValues, filterKind]);

    const chart = useMemo(() => {
        const bins = buildBins(chartWindow, granularity);
        const values = curves.map((curve) => bins.map((bin) => curve.items.reduce((total, item) => {
            const date = item.follow_date ? parseFollowDate(item.follow_date) : null;
            if (!date || date < bin.start || date > bin.end) return total;
            if (metric === "time") return total + (item.total_time || 0);
            if (metric === "episodes") return total + (item.number_of_episodes || 0);
            return total + 1;
        }, 0)));
        return { bins, values, maximum: Math.max(1, ...values.flat()) };
    }, [chartWindow, granularity, curves, metric]);
    const periodTotals = useMemo(() => curves.map((curve) => curve.items.reduce((total, item) => {
        if (metric === "time") return total + (item.total_time || 0);
        if (metric === "episodes") return total + (item.number_of_episodes || 0);
        return total + 1;
    }, 0)), [curves, metric]);
    useEffect(() => {
        setHoveredPoint((point) => point && point.index < chart.bins.length ? point : null);
    }, [chart.bins.length]);
    const tickIndexes = useMemo(() => {
        const count = Math.min(12, chart.bins.length);
        if (count === 0) return [];
        if (count === 1) return [0];
        return Array.from({ length: count }, (_, index) => Math.round(index * (chart.bins.length - 1) / (count - 1)));
    }, [chart.bins.length]);

    const formatValue = (value: number) => {
        if (metric !== "time") return String(value);
        if (value > 96 * 60) return `${Math.floor(value / 1440)}j${Math.floor((value % 1440) / 60) ? ` ${Math.floor((value % 1440) / 60)}h` : ""}${value % 60 ? ` ${value % 60}m` : ""}`;
        if (value > 300) return `${Math.floor(value / 60)}h${value % 60 ? ` ${value % 60}m` : ""}`;
        return `${value} min`;
    };
    const metricLabel = metric === "time" ? "Temps total" : metric === "episodes" ? (mangaMode ? "Chapitres" : "Épisodes") : "Contenus";
    const resetZoom = () => {
        setZoom(null);
        setHoveredPoint(null);
        setSelectedPoint(null);
    };
    const zoomAroundPointer = (deltaY: number, pointerRatio: number) => {
        if (chartWindow.end.getTime() - chartWindow.start.getTime() < DAY) return;
        const currentDuration = chartWindow.end.getTime() - chartWindow.start.getTime();
        const nextDuration = Math.min(periodWindow.end.getTime() - periodWindow.start.getTime(), Math.max(DAY, deltaY < 0 ? currentDuration * 0.75 : currentDuration * 1.35));
        const pointerTime = chartWindow.start.getTime() + currentDuration * pointerRatio;
        const nextStart = Math.max(periodWindow.start.getTime(), Math.min(periodWindow.end.getTime() - nextDuration, pointerTime - nextDuration * pointerRatio));
        const nextEnd = Math.min(periodWindow.end.getTime(), nextStart + nextDuration);
        setZoom({ start: new Date(nextStart), end: new Date(nextEnd) });
    };
    useEffect(() => {
        const chartElement = chartRef.current;
        if (!chartElement) return;
        const handleNativeWheel = (event: WheelEvent) => {
            event.preventDefault();
            event.stopPropagation();
            const bounds = chartElement.getBoundingClientRect();
            const pointerRatio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
            zoomAroundPointer(event.deltaY, pointerRatio);
        };
        chartElement.addEventListener("wheel", handleNativeWheel, { passive: false });
        return () => chartElement.removeEventListener("wheel", handleNativeWheel);
    }, [chartWindow, periodWindow]);
    const toggleFormat = (key: string) => {
        setIncludeAllFormats(false);
        setSelectedFormats((current) => current.includes(key) ? current.filter((value) => value !== key) : [...current, key]);
    };

    return (
        <section className="profile-statistics">
            <div className="profile-statistics-heading">
                <div><p className="profile-statistics-eyebrow">VOTRE ACTIVITÉ</p><h2>Statistiques d&apos;activité</h2></div>
                {zoom && <button type="button" className="profile-statistics-reset" onClick={resetZoom}>Réinitialiser le zoom</button>}
            </div>
            <div className="profile-statistics-controls">
                <label>Période<select value={period} onChange={(event) => { setPeriod(event.target.value as Period); resetZoom(); }}>
                    <option value="all">Tout le temps</option><option value="current-month">Mois courant</option><option value="previous-month">Mois précédent</option><option value="current-year">Année courante</option><option value="previous-year">Année précédente</option><option value="custom">Période personnalisée</option>
                </select></label>
                <label>Mesure<select value={metric} onChange={(event) => setMetric(event.target.value as Metric)}>{!mangaMode && <option value="time">Temps total</option>}<option value="episodes">{mangaMode ? "Nombre de chapitres" : "Nombre d&apos;épisodes"}</option><option value="count">Nombre de contenus</option></select></label>
                <label>Affichage<select value={chartMode} onChange={(event) => setChartMode(event.target.value as ChartMode)}><option value="line">Courbes</option><option value="bar">Colonnes</option></select></label>
                {period === "custom" && <><label>Du<input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); resetZoom(); }} /></label><label>Au<input type="date" value={endDate} onChange={(event) => { setEndDate(event.target.value); resetZoom(); }} /></label></>}
            </div>
            <div className="profile-statistics-filter"><div className="profile-statistics-filter-title">Courbes par type</div><div className="profile-statistics-checks">
                {formats.map((format) => <label key={format.key}><input type="checkbox" checked={!includeAllFormats && selectedFormats.includes(format.key)} onChange={() => toggleFormat(format.key)} />{format.label}</label>)}
                <label className="profile-statistics-all"><input type="checkbox" checked={includeAllFormats} onChange={(event) => { setIncludeAllFormats(event.target.checked); setSelectedFormats(event.target.checked ? [] : formats.map((format) => format.key)); }} />Tous les types</label>
                <label className="profile-statistics-visibility"><input type="checkbox" checked={showFormatCurves} onChange={(event) => setShowFormatCurves(event.target.checked)} />Afficher les courbes de formats</label>
            </div></div>
            <div className="profile-statistics-filter"><div className="profile-statistics-filter-title">Ajouter des courbes par filtre</div><div className="profile-statistics-filter-row">
                <select value={filterKind} onChange={(event) => { setFilterKind(event.target.value as FilterKind); setSelectedValues([]); }}><option value="genre">Genres</option><option value="tag">Tags</option>{!mangaMode && <option value="country">Pays de production</option>}</select>
                <div className="profile-statistics-values">{availableValues.map((value) => <label key={value}><input type="checkbox" checked={selectedValues.includes(value)} onChange={() => setSelectedValues((current) => current.includes(value) ? current.filter((currentValue) => currentValue !== value) : [...current, value])} />{value}</label>)}</div>
            </div></div>
            {chart.bins.length === 0 ? <p className="profile-statistics-empty">Aucune activité à afficher pour cette période.</p> : <div className="profile-statistics-chart-wrap">
                <svg ref={chartRef} viewBox="0 0 900 460" role="img" aria-label="Graphique des statistiques d'activité" className="profile-statistics-chart" onMouseLeave={() => setHoveredPoint(null)}>
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => { const y = 375 - ratio * 300; return <g key={ratio}><line x1="55" x2="875" y1={y} y2={y} className="profile-statistics-grid" /><text x="48" y={y + 4} textAnchor="end" className="profile-statistics-axis">{formatValue(Math.round(chart.maximum * ratio))}</text></g>; })}
                    {chartMode === "line" && curves.map((curve, curveIndex) => {
                        const points = chart.values[curveIndex].map((value, index) => `${chart.bins.length === 1 ? 465 : 55 + (index / (chart.bins.length - 1)) * 820},${375 - (value / chart.maximum) * 300}`).join(" ");
                        return <g key={curve.id}><polyline points={points} fill="none" stroke={curve.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />{chart.values[curveIndex].map((value, index) => { const x = chart.bins.length === 1 ? 465 : 55 + (index / (chart.bins.length - 1)) * 820; const y = 375 - (value / chart.maximum) * 300; const bin = chart.bins[index]; const pointItems = curve.items.filter((item) => { const date = item.follow_date ? parseFollowDate(item.follow_date) : null; return date !== null && date >= bin.start && date <= bin.end; }); return <circle key={`${curve.id}-${bin.key}`} cx={x} cy={y} r="5" fill={curve.color} className="profile-statistics-point" onMouseEnter={() => setHoveredPoint({ index, x, y })} onClick={() => setSelectedPoint({ title: `${curve.label} — ${formatTooltipDate(bin, granularity)}`, items: pointItems })} />; })}</g>;
                    })}
                    {chartMode === "bar" && chart.values.map((values, curveIndex) => values.map((value, index) => {
                        const bin = chart.bins[index];
                        const groupWidth = 820 / Math.max(chart.bins.length, 1);
                        const barWidth = Math.max(4, (groupWidth * 0.72) / Math.max(curves.length, 1));
                        const x = 55 + index * groupWidth + groupWidth * 0.14 + curveIndex * barWidth;
                        const height = (value / chart.maximum) * 300;
                        const pointItems = curves[curveIndex].items.filter((item) => { const date = item.follow_date ? parseFollowDate(item.follow_date) : null; return date !== null && date >= bin.start && date <= bin.end; });
                        return <rect key={`${curves[curveIndex].id}-${bin.key}`} x={x} y={375 - height} width={barWidth - 1} height={height} rx="2" fill={curves[curveIndex].color} className="profile-statistics-bar" onMouseEnter={() => setHoveredPoint({ index, x: x + barWidth / 2, y: 375 - height })} onClick={() => setSelectedPoint({ title: `${curves[curveIndex].label} — ${formatTooltipDate(bin, granularity)}`, items: pointItems })} />;
                    }))}
                    {tickIndexes.map((index) => { const bin = chart.bins[index]; return <text key={bin.key} x={chart.bins.length === 1 ? 465 : 55 + (index / (chart.bins.length - 1)) * 820} y="410" textAnchor="middle" className="profile-statistics-axis">{bin.label}</text>; })}
                    {hoveredPoint && <line x1={hoveredPoint.x} x2={hoveredPoint.x} y1="35" y2="375" className="profile-statistics-guide" />}
                </svg>
                {hoveredPoint && <div className="profile-statistics-tooltip" style={{ left: `clamp(12%, ${(hoveredPoint.x / 900) * 100}%, 88%)`, top: `clamp(3%, ${(hoveredPoint.y / 460) * 100}%, 68%)` }}>
                    {chart.bins[hoveredPoint.index] && <><strong>{formatTooltipDate(chart.bins[hoveredPoint.index], granularity)}</strong>
                        {curves.map((curve, index) => <div key={curve.id}><span style={{ color: curve.color }}>●</span> {curve.label} : <b>{formatValue(chart.values[index][hoveredPoint.index] ?? 0)}</b></div>)}
                    </>}
                </div>}
            </div>}
            {curves.length > 0 && <div className="profile-statistics-totals">
                <div className="profile-statistics-filter-title">Total de la période sélectionnée — {metricLabel}</div>
                <div className="profile-statistics-total-grid">{curves.map((curve, index) => <div className="profile-statistics-total-card" key={curve.id}><span><i style={{ backgroundColor: curve.color }} />{curve.label}</span><strong>{formatValue(periodTotals[index])}</strong></div>)}</div>
            </div>}
            {selectedPoint && <div className="profile-statistics-content-list">
                <div className="profile-statistics-content-list-heading"><strong>{selectedPoint.title}</strong><button type="button" onClick={() => setSelectedPoint(null)}>Fermer</button></div>
                {selectedPoint.items.length === 0 ? <p>Aucun contenu dans cette tranche.</p> : <ul>{selectedPoint.items.map((item) => <li key={item.id}><span>{item.name}</span><small>{item.media_type}</small></li>)}</ul>}
            </div>}
            <p className="profile-statistics-help">Survolez un point pour afficher le détail. Faites défiler la souris sur le graphique pour zoomer dans le temps.</p>
            <div className="profile-statistics-legend">{curves.map((curve) => <span key={curve.id}><i style={{ backgroundColor: curve.color }} />{curve.label}</span>)}</div>
        </section>
    );
}
