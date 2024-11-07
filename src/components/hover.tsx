import { MinimalSerie } from "@/tmdb/types/series.type";
import { ReactNode, useState, MouseEvent } from "react";
import { SmileyHappy, SmileyNeutral, SmileySad } from "./svg/smileys.svg";

type HoverToolBoxProps = {
    serie: MinimalSerie;
    children: ReactNode;
    isMyList: boolean;
};

const HoverToolBox = ({ serie, children, isMyList }: HoverToolBoxProps) => {
    const [hoverPosition, setHoverPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [itemHover, setItemHover] = useState<boolean>(false);
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
    let hoverTimeout: NodeJS.Timeout | null = null;

    const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }

        const element = event.currentTarget;
        const rect = element.getBoundingClientRect();
        const top = rect.top + window.pageYOffset;
        let left = rect.left + rect.width + 10;

        // Adjust position if tooltip exceeds viewport width
        if (left + 350 > window.innerWidth) {
            left = rect.left - 10 - 350;
        }

        // Adjust position if tooltip exceeds viewport height
        const tooltipHeight = 300; // Assume the tooltip's height is around 300px
        let topAdjusted = top;
        if (top + tooltipHeight > window.innerHeight + window.pageYOffset) {
            topAdjusted = top - (top + tooltipHeight - (window.innerHeight + window.pageYOffset));
        }

        setHoverPosition({ top: topAdjusted, left });

        hoverTimeout = setTimeout(() => {
            setItemHover(true);
            setTooltipVisible(true);
        }, 1); // Delay for the tooltip
    };

    const handleMouseLeave = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }

        hoverTimeout = setTimeout(() => {
            setItemHover(false);
            setTooltipVisible(false);
        }, 1); // Delay to hide the tooltip
    };

    const handleMouseEnterHover = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
        setItemHover(true);
        setTooltipVisible(true);
    };

    const handleMouseLeaveHover = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
        hoverTimeout = setTimeout(() => {
            setItemHover(false);
            setTooltipVisible(false);
        }, 1); // Delay to hide the tooltip
    };

    const hours = Math.floor(serie.episode_run_time / 60);
    const minutes = serie.episode_run_time % 60;
    
    const note = isMyList ? serie.note ? serie.note : undefined : serie.vote_average;
    return (
        <>
            <div id={serie.id} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ position: 'relative' }}  >
                {children}
            </div>
            {tooltipVisible && (
                <div id={`${serie.id}-info`} className="hover-info" style={{  top: `${hoverPosition.top}px`, left: `${hoverPosition.left}px`, position: 'absolute',maxWidth: '350px',  pointerEvents: 'none', }} onMouseEnter={handleMouseEnterHover} onMouseLeave={handleMouseLeaveHover} >
                    <div className="hover-info-content">
                        <div className="hover-info-items initial">
                            <span>{serie.romaji_name ? serie.romaji_name.length > 35 ? serie.romaji_name.substring(0, 30).concat("...") : serie.romaji_name : "Apres Reset bd"}</span>
                            <span>{note !== undefined ? note < 4.5 ? <SmileySad width={20} height={20} /> : note < 7 ? <SmileyNeutral width={20} height={20} /> : <SmileyHappy width={20} height={20} /> : null}{Math.ceil((note || 0) * 10)}%</span>
                        </div>
                        <div className="hover-info-items initial">
                            <span>{serie.first_air_date.substring(0, 4)}</span>
                            <span>{serie.status === "Ended" ? "✔️" : "🔄"}</span>
                        </div>
                        <div className="hover-info-items">
                            <span>{serie.media_type != "tv" ? serie.media_type.charAt(0).toUpperCase() + serie.media_type.slice(1) : serie.media_type} </span>
                            <span className="circle"></span>
                            <span>{serie.media_type === "movie" || serie.media_type === "film d'animation" ? `${hours}h ${minutes}min` : serie.number_of_episodes} {serie.media_type === "movie" || serie.media_type === "film d'animation" ? "" : "épisodes"}</span>
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
export default HoverToolBox;
