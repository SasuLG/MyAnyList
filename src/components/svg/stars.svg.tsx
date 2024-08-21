import { memo } from "react";

/**
 * Fonction qui permet d'afficher l'icone de l'étoile.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const Star = memo(({ width, height }: { width: number, height: number }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_32_57)">
                <path d="M470.938 333.037H700.125L514.7 467.75L585.525 685.725L400.113 551.012L214.688 685.725L285.513 467.75L100.1 333.037H329.288L400.113 115.062C423.713 187.725 447.325 260.375 470.938 333.037ZM365.85 383.362H254.988L344.675 448.525L310.425 553.962L400.113 488.8L489.8 553.962L455.538 448.525L545.225 383.362H434.363L400.113 277.937C388.688 313.075 377.275 348.225 365.85 383.362Z" fill="var(--titre-color)"/>
            </g>
            <defs>
                <clipPath id="clip0_32_57">
                    <rect width="800" height="800" fill="var(--background-color)"/>
                </clipPath>
            </defs>
        </svg>
    )
});
Star.displayName = 'Star';

/**
 * Fonction qui permet d'afficher l'icone de l'étoile à moitié colorié.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const StarHalfColored = memo(({ width, height }: { width: number, height: number }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_32_2)">
                <path d="M470.866 332.66H700.058L514.649 467.372L585.468 685.339L400.046 550.626L214.624 685.339L285.444 467.372L100.034 332.66H329.226L400.046 114.679C423.653 187.339 447.259 260 470.866 332.66ZM400.046 277.547V488.416L489.74 553.584L455.474 448.143L545.169 382.988H434.3L400.046 277.547Z" fill="rgb(255, 204, 0)"/>
            </g>
            <defs>
                <clipPath id="clip0_32_2">
                    <rect width="800" height="800" fill="var(--background-color)"/>
                </clipPath>
            </defs>
        </svg>
    )
});
StarHalfColored.displayName = 'StarHalfColored';

/**
 * Fonction qui permet d'afficher l'icone de l'étoile colorié.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const StarColored = memo(({ width, height }: { width: number, height: number }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_32_107)">
                <path fillRule="evenodd" clipRule="evenodd" d="M400.012 114.85L470.837 332.825H700.025L514.612 467.537L585.437 685.512L400.012 550.8L214.6 685.512L285.425 467.537L100 332.825H329.187L400.012 114.85Z" fill="rgb(255, 204, 0)"/>
            </g>
            <defs>
                <clipPath id="clip0_32_107">
                    <rect width="800" height="800" fill="rgb(255, 204, 0)"/>
                </clipPath>
            </defs>
        </svg>
    )
});
StarColored.displayName = 'StarColored';