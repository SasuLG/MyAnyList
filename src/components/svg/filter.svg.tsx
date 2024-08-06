import { memo } from "react";

/**
 * Fonction qui permet d'afficher l'icone order.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const Order = memo(({ width, height, orderAsc }: { width: number, height: number, orderAsc: boolean }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_22_2)">
                <path d="M399.579 668.673L190.397 459.491L216.655 433.232L399.689 616.267L583.496 432.46L609.643 458.608L399.579 668.673Z" fill={`${orderAsc ? "black":"var(--main-text-color)"}`}/>
                <path d="M400.422 131.327L609.604 340.509L583.346 366.767L400.312 183.733L216.505 367.539L190.357 341.391L400.422 131.327Z" fill={`${!orderAsc ? "black":"var(--main-text-color)"}`}/>
            </g>
            <defs>
                <clipPath id="clip0_22_2">
                    <rect width="800" height="800" fill="white"/>
                </clipPath>
            </defs>
        </svg>
    )
});
Order.displayName = 'Order';

/**
 * Fonction qui permet d'afficher l'icone view all filter.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const MoreFilter = memo(({ width, height, isOpen }: { width: number, height: number, isOpen:boolean }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M400 633.333H133.333" stroke={`${isOpen ? "var(--button-color)" : "var(--titre-color)"}`} stroke-width="33.3333" stroke-linecap="round"/>
            <path d="M666.667 166.667H566.667" stroke={`${isOpen ? "var(--button-color)" : "var(--titre-color)"}`} stroke-width="33.3333" stroke-linecap="round"/>
            <path d="M666.667 633.333H533.333" stroke={`${isOpen ? "var(--button-color)" : "var(--titre-color)"}`} stroke-width="33.3333" stroke-linecap="round"/>
            <path d="M433.333 166.667L133.333 166.667" stroke={`${isOpen ? "var(--button-color)" : "var(--titre-color)"}`} stroke-width="33.3333" stroke-linecap="round"/>
            <path d="M233.333 400H133.333" stroke={`${isOpen ? "var(--button-color)" : "var(--titre-color)"}`} stroke-width="33.3333" stroke-linecap="round"/>
            <path d="M666.667 400H366.667" stroke={`${isOpen ? "var(--button-color)" : "var(--titre-color)"}`} stroke-width="33.3333" stroke-linecap="round"/>
            <path d="M533.333 633.333C533.333 596.514 503.486 566.667 466.667 566.667C429.848 566.667 400 596.514 400 633.333C400 670.152 429.848 700 466.667 700C503.486 700 533.333 670.152 533.333 633.333Z" stroke={`${isOpen ? "var(--button-color)" : "var(--titre-color)"}`} stroke-width="33.3333" stroke-linecap="round"/>
            <path d="M366.667 400C366.667 363.181 336.819 333.333 300 333.333C263.181 333.333 233.333 363.181 233.333 400C233.333 436.819 263.181 466.667 300 466.667C336.819 466.667 366.667 436.819 366.667 400Z" stroke={`${isOpen ? "var(--button-color)" : "var(--titre-color)"}`} stroke-width="33.3333" stroke-linecap="round"/>
            <path d="M566.667 166.667C566.667 129.848 536.819 99.9999 500 99.9999C463.181 99.9999 433.333 129.848 433.333 166.667C433.333 203.486 463.181 233.333 500 233.333C536.819 233.333 566.667 203.486 566.667 166.667Z" stroke={`${isOpen ? "var(--button-color)" : "var(--titre-color)"}`} stroke-width="33.3333" stroke-linecap="round"/>
        </svg>

    )
});
MoreFilter.displayName = 'MoreFilter';

/**
 * Fonction qui permet d'afficher l'icone filter.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const Filter = memo(({ width, height }: { width: number, height: number }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_25_2)">
                <path d="M0 29.3477L162.5 208.098V300.652L237.5 370.652V208.098L400 29.3477H0ZM54.2657 53.3477H345.742L213.5 198.816V315.406L187.646 291.27L187.807 199.344L54.2657 53.3477Z" fill="black"/>
            </g>
            <defs>
                <clipPath id="clip0_25_2">
                    <rect width="400" height="400" fill="white"/>
                </clipPath>
            </defs>
        </svg>
    )
});
Filter.displayName = 'Filter';