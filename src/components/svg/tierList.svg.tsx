import { memo } from "react";

/**
 * Fonction qui permet d'afficher l'icone de la tier list.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const TierList = memo(({ width, height }: { width: number, height: number }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M675 708.333H125C116.159 708.333 107.681 704.821 101.43 698.57C95.1784 692.319 91.6665 683.84 91.6665 675V125C91.6665 116.159 95.1784 107.681 101.43 101.43C107.681 95.1785 116.159 91.6666 125 91.6666H675C683.84 91.6666 692.319 95.1785 698.57 101.43C704.821 107.681 708.333 116.159 708.333 125V675C708.333 683.84 704.821 692.319 698.57 698.57C692.319 704.821 683.84 708.333 675 708.333Z" stroke="black" stroke-width="16.6667" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M328.667 302.5V469.167" stroke="black" stroke-width="16.6667" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M388 469.167H471.333" stroke="black" stroke-width="16.6667" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M388 302.5H471.333" stroke="black" stroke-width="16.6667" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M388 385.833H442.333" stroke="black" stroke-width="16.6667" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M388 302.5V469.167" stroke="black" stroke-width="16.6667" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M530.833 469.167V302.5H585.333C600.186 302.5 614.429 308.4 624.931 318.902C635.434 329.404 641.333 343.648 641.333 358.5C641.333 373.352 635.434 387.596 624.931 398.098C614.429 408.6 600.186 414.5 585.333 414.5H530.833" stroke="black" stroke-width="16.6667" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M585.333 414.5L640 469.167" stroke="black" stroke-width="16.6667" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M158.833 302.5H269.167" stroke="black" stroke-width="16.6667" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M214 469.167V302.5" stroke="black" stroke-width="16.6667" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    )
});
TierList.displayName = 'TierList';