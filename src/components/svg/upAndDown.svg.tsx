import { memo } from "react";

/**
 * Fonction qui permet d'afficher l'icone up.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const Up = memo(({ width, height }: { width: number, height: number }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M400 233.333C408.84 233.333 417.32 236.845 423.57 243.096L656.903 476.43C669.92 489.447 669.92 510.553 656.903 523.57C643.887 536.587 622.78 536.587 609.763 523.57L400 313.807L190.237 523.57C177.219 536.587 156.114 536.587 143.096 523.57C130.079 510.553 130.079 489.447 143.096 476.43L376.43 243.096C382.68 236.845 391.16 233.333 400 233.333Z" fill="black"/>
        </svg>
    )
});
Up.displayName = 'Up';

/**
 * Fonction qui permet d'afficher l'icone down.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const Down = memo(({ width, height }: { width: number, height: number }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M400 566.667C391.16 566.667 382.68 563.155 376.43 556.904L143.097 323.57C130.08 310.553 130.08 289.447 143.097 276.43C156.113 263.413 177.22 263.413 190.237 276.43L400 486.193L609.763 276.43C622.781 263.413 643.886 263.413 656.904 276.43C669.921 289.447 669.921 310.553 656.904 323.57L423.57 556.904C417.32 563.155 408.84 566.667 400 566.667Z" fill="black"/>
        </svg>
    )
});
Down.displayName = 'Down';