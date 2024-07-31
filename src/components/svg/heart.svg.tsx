import { memo } from "react";

/**
 * Fonction qui permet d'afficher l'icone du coeur.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const Heart = memo(({ width, height }: { width: number, height: number }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M66.6667 304.57C66.6667 466.667 200.648 553.047 298.724 630.363C333.333 657.647 366.667 683.333 400 683.333C433.333 683.333 466.667 657.647 501.277 630.363C599.353 553.047 733.333 466.667 733.333 304.57C733.333 142.472 549.993 27.5155 400 183.354C250.005 27.5155 66.6667 142.472 66.6667 304.57Z" fill="#1C274C"/>
        </svg>
    )
});
Heart.displayName = 'Heart';

/**
 * Fonction qui permet d'afficher l'icone du coeur brisé.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const BrokenHeart = memo(({ width, height }: { width: number, height: number }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M270.209 608.227C176.606 536.11 66.6667 451.407 66.6667 304.57C66.6667 151.219 230.753 40.0587 375.463 160.458L327.021 273.489C322.393 284.287 325.909 296.851 335.47 303.68L429.91 371.137L347.687 467.067C339.183 476.987 339.753 491.777 348.99 501.013L405.647 557.673L375.313 679.007C350.143 670.563 324.796 650.917 298.724 630.363C289.49 623.083 279.938 615.723 270.209 608.227Z" fill="#1C274C"/>
            <path d="M427.06 678.177C451.45 669.327 476.023 650.27 501.277 630.363C510.51 623.083 520.063 615.723 529.79 608.227C623.393 536.11 733.333 451.407 733.333 304.57C733.333 154.074 575.3 44.2124 432.64 153.973L380.907 274.689L481.197 346.327C486.907 350.403 490.637 356.69 491.483 363.653C492.33 370.617 490.213 377.613 485.647 382.94L400.713 482.03L451.01 532.327C457.22 538.537 459.717 547.547 457.587 556.067L427.06 678.177Z" fill="#1C274C"/>
        </svg>
    )
});
BrokenHeart.displayName = 'BrokenHeart';