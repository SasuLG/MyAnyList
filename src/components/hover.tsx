import { MinimalSerie } from "@/tmdb/types/series.type";
import {
    ReactNode,
    useState,
    MouseEvent,
    useRef,
    memo
} from "react";
import {
    SmileyHappy,
    SmileyNeutral,
    SmileySad
} from "./svg/smileys.svg";

type HoverToolBoxProps = {
    serie: MinimalSerie;
    children: ReactNode;
    isMyList: boolean;
    enabled?: boolean;
};

const TOOLTIP_WIDTH = 350;
const TOOLTIP_MAX_HEIGHT = 300;
const OFFSET = 10;
const HOVER_CLOSE_DELAY = 80;

const HoverToolBox = ({
    serie,
    children,
    isMyList,
    enabled = true
}: HoverToolBoxProps) => {
    const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });
    const [tooltipVisible, setTooltipVisible] = useState(false);

    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const clearHoverTimeout = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
    };

    const showTooltip = () => {
        if (!enabled) return;
        clearHoverTimeout();
        setTooltipVisible(true);
    };

    const hideTooltip = () => {
        if (!enabled) return;
        clearHoverTimeout();
        hoverTimeoutRef.current = setTimeout(() => {
            setTooltipVisible(false);
        }, HOVER_CLOSE_DELAY);
    };

    const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
        if (!enabled) return;

        clearHoverTimeout();

        const rect = event.currentTarget.getBoundingClientRect();

        let left = rect.right + OFFSET;
        let top = rect.top;

        if (left + TOOLTIP_WIDTH > window.innerWidth) {
            left = rect.left - TOOLTIP_WIDTH - OFFSET;
        }

        if (top + TOOLTIP_MAX_HEIGHT > window.innerHeight) {
            top = window.innerHeight - TOOLTIP_MAX_HEIGHT - OFFSET;
        }

        setHoverPosition({ top, left });
        setTooltipVisible(true);
    };

    if (!enabled) {
        return <>{children}</>;
    }

    const hours = Math.floor(serie.episode_run_time / 60);
    const minutes = serie.episode_run_time % 60;

    const note = isMyList
        ? serie.note ?? undefined
        : serie.vote_average;

    return (
        <>
            <div
                id={serie.id}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={hideTooltip}
                style={{ position: "relative" }}
            >
                {children}
            </div>

            {tooltipVisible && (
                <div
                    id={`${serie.id}-info`}
                    className="hover-info"
                    style={{
                        position: "fixed",
                        top: hoverPosition.top,
                        left: hoverPosition.left,
                        width: TOOLTIP_WIDTH,
                        maxHeight: TOOLTIP_MAX_HEIGHT,
                        overflowY: "auto",
                        zIndex: 1000
                    }}
                    onMouseEnter={showTooltip}
                    onMouseLeave={hideTooltip}
                >
                    <div className="hover-info-content">
                        <div className="hover-info-items initial">
                            <span>
                                {serie.romaji_name
                                    ? serie.romaji_name.length > 35
                                        ? serie.romaji_name.substring(0, 30).concat("…")
                                        : serie.romaji_name
                                    : "Après reset BD"}
                            </span>

                            <span>
                                {note !== undefined && (
                                    note < 4.5 ? (
                                        <SmileySad width={20} height={20} />
                                    ) : note < 7 ? (
                                        <SmileyNeutral width={20} height={20} />
                                    ) : (
                                        <SmileyHappy width={20} height={20} />
                                    )
                                )}
                                {note !== undefined && ` ${Math.ceil(note * 10)}%`}
                            </span>
                        </div>

                        <div className="hover-info-items initial">
                            <span>{serie.first_air_date.substring(0, 4)}</span>
                            <span>{serie.status === "Ended" ? "✔️" : "🔄"}</span>
                        </div>

                        <div className="hover-info-items">
                            <span>
                                {serie.media_type !== "tv"
                                    ? serie.media_type.charAt(0).toUpperCase() +
                                    serie.media_type.slice(1)
                                    : serie.media_type}
                            </span>
                            <span className="circle" />
                            <span>
                                {serie.media_type === "movie" ||
                                    serie.media_type === "film d'animation"
                                    ? `${hours}h ${minutes}min`
                                    : `${serie.number_of_episodes} épisodes`}
                            </span>
                        </div>

                        <div className="hover-info-items hover-info-genres">
                            {serie.genres.slice(0, 3).map((genre) => (
                                <span key={genre.id}>{genre.name}</span>
                            ))}
                        </div>

                        <hr />

                        <div>
                            <span>{serie.overview}</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

HoverToolBox.displayName = "HoverToolBox";

export default memo(HoverToolBox);
