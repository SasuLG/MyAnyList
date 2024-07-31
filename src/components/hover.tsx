import { MinimalSerie } from "@/tmdb/types/series.type";
import { ReactNode, useState, MouseEvent } from "react";
import { SmileyHappy, SmileyNeutral, SmileySad } from "./svg/smileys.svg";

type HoverToolBoxProps = {
    serie: MinimalSerie;
    children: ReactNode;
};

let currentHoveredId: string | null = null;

const HoverToolBox = ({ serie, children }: HoverToolBoxProps) => {
    const [hoverPosition, setHoverPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [itemHover, setItemHover] = useState<boolean>(false);

    const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
        if (currentHoveredId !== serie.id) {
            currentHoveredId = serie.id;
            setItemHover(true);
        }

        const element = event.currentTarget;
        const top = element.offsetTop;
        let left = element.offsetLeft + element.offsetWidth + 10;
        if (left + 350 > window.innerWidth) {
            left = element.offsetLeft - 10 - 350;
        }
        setHoverPosition({ top, left });
    };

    const handleMouseLeave = () => {
        if (currentHoveredId === serie.id) {
            setItemHover(false);
            currentHoveredId = null;
        }
    };

    const handleMouseEnterHover = () => {
        setItemHover(true);
    };

    const handleMouseLeaveHover = () => {
        setItemHover(false);
        currentHoveredId = null;
    };

    const hours = Math.floor(serie.episode_run_time / 60);
    const minutes = serie.episode_run_time % 60;

    return (
        <>
            <div
                id={serie.id}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>
            {itemHover && currentHoveredId === serie.id && (
                <div
                    id={`${serie.id}-info`}
                    className="hover-info"
                    style={{
                        top: `${hoverPosition.top}px`,
                        left: `${hoverPosition.left}px`
                    }}
                    onMouseEnter={handleMouseEnterHover}
                    onMouseLeave={handleMouseLeaveHover}
                >
                    <div className="hover-info-content">
                        <div className="hover-info-items initial">
                            <span>{serie.name}</span>
                            <span>{serie.vote_average < 4.5 ? <SmileySad width={20} height={20} /> : serie.vote_average < 7 ? <SmileyNeutral width={20} height={20} /> : <SmileyHappy width={20} height={20} />}{Math.ceil(serie.vote_average * 10)}%</span>
                        </div>
                        <div className="hover-info-items initial">
                            <span>{serie.first_air_date.substring(0, 4)}</span>
                            <span>{serie.status === "Ended" || serie.status === "Released" ? "✔️" : "🔄"}</span>
                        </div>
                        <div className="hover-info-items">
                            <span>{serie.media_type} </span>
                            <span className="circle"></span>
                            <span>{serie.media_type === "movie" ? `${hours}h ${minutes}min` : serie.number_of_episodes} {serie.media_type === "movie" ? "" : "épisodes"}</span>
                        </div>
                        <div className="hover-info-items hover-info-genres">
                            {serie.genres.slice(0, 3).map((genre) => (
                                <span key={genre.id}>{genre.name}</span>
                            ))}
                        </div>
                        <hr></hr>
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
