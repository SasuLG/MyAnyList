import { MinimalSerie } from "@/tmdb/types/series.type";
import { ReactNode, useState, MouseEvent } from "react";
import { SmileyHappy, SmileyNeutral, SmileySad } from "./svg/smileys.svg";

type HoverToolBoxProps = {
    serie: MinimalSerie;
    children: ReactNode;
};

const HoverToolBox = ({ serie, children }: HoverToolBoxProps) => {

    /**
     * Hook qui stock la position du tooltip
     */
    const [hoverPosition, setHoverPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    /**
     * Hooks qui stock l'état du tooltip
     */
    const [itemHover, setItemHover] = useState<boolean>(false);

    /**
     * Hooks qui stock l'état de la visibilité du tooltip
     */
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);

    let hoverTimeout: NodeJS.Timeout | null = null;

    /**
     * Fonction qui gère l'entrée de la souris sur l'élément
     * @param {MouseEvent<HTMLDivElement>} event 
     */
    const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }

        const element = event.currentTarget;
        const rect = element.getBoundingClientRect();
        const top = rect.top + window.pageYOffset;
        let left = rect.left + rect.width + 10;

        if (left + 350 > window.innerWidth) {
            left = rect.left - 10 - 350;
        }
        setHoverPosition({ top, left });

        hoverTimeout = setTimeout(() => {
            setItemHover(true);
            setTooltipVisible(true);
        }, 1); // Délai pour le tooltip

        // Gérer l'ID global du tooltip si nécessaire
    };


    /**
     * Fonction qui gère la sortie de la souris de l'élément
     */ 
    const handleMouseLeave = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }

        hoverTimeout = setTimeout(() => {
            setItemHover(false);
            setTooltipVisible(false);
        }, 1); // Délai pour cacher le tooltip
    };

    /**
     * Fonction qui gère l'entrée de la souris sur le tooltip
     */
    const handleMouseEnterHover = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
        setItemHover(true);
        setTooltipVisible(true);
    };

    /**
     * Fonction qui gère la sortie de la souris du tooltip
     */
    const handleMouseLeaveHover = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
        hoverTimeout = setTimeout(() => {
            setItemHover(false);
            setTooltipVisible(false);
        }, 1); // Délai pour cacher le tooltip
    };

    const hours = Math.floor(serie.episode_run_time / 60);
    const minutes = serie.episode_run_time % 60;

    return (
        <>
            <div
                id={serie.id}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ position: 'relative' }}
            >
                {children}
            </div>
            {tooltipVisible && (
                <div
                    id={`${serie.id}-info`}
                    className="hover-info"
                    style={{
                        top: `${hoverPosition.top}px`,
                        left: `${hoverPosition.left}px`,
                        position: 'absolute',
                    }}
                    onMouseEnter={handleMouseEnterHover}
                    onMouseLeave={handleMouseLeaveHover}
                >
                    <div className="hover-info-content">
                        <div className="hover-info-items initial">
                            <span>{serie.romaji_name ? serie.romaji_name.length > 35 ? serie.romaji_name.substring(0, 30).concat("...") : serie.romaji_name:"Apres Reset bd"}</span>
                            <span>{serie.vote_average < 4.5 ? <SmileySad width={20} height={20} /> : serie.vote_average < 7 ? <SmileyNeutral width={20} height={20} /> : <SmileyHappy width={20} height={20} />}{Math.ceil(serie.vote_average * 10)}%</span>
                        </div>
                        <div className="hover-info-items initial">
                            <span>{serie.first_air_date.substring(0, 4)}</span>
                            <span>{serie.status === "Ended" ? "✔️" : "🔄"}</span>
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
