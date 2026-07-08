import { memo } from "react";

/**
 * Fonction qui permet d'afficher l'icone de switch série.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const SwitchManga = memo(({ width, height }: { width: number, height: number }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M189.35 635.817L412.984 608.183V695.017L674.784 573.65L708.334 355.6H628.417L648.15 104.983L142.967 182.933L186.384 345.733H91.667L189.35 635.817Z" stroke="var(--titre-color)" strokeWidth="16.6667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M192.005 417.79H274.073" stroke="var(--titre-color)" strokeWidth="16.6667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M233.04 541.667V417.79" stroke="var(--titre-color)" strokeWidth="16.6667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M525.934 541.667V417.783L608 541.667V417.783" stroke="var(--titre-color)" strokeWidth="16.6667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M293.391 500.633C293.461 511.471 297.814 521.841 305.502 529.48C313.19 537.119 323.588 541.407 334.426 541.407C345.263 541.407 355.661 537.119 363.349 529.48C371.037 521.841 375.391 511.471 375.46 500.633V458.833C375.494 453.422 374.458 448.058 372.412 443.05C370.365 438.041 367.348 433.486 363.534 429.648C359.72 425.81 355.185 422.764 350.189 420.685C345.194 418.607 339.836 417.537 334.426 417.537C329.015 417.537 323.657 418.607 318.662 420.685C313.666 422.764 309.131 425.81 305.317 429.648C301.503 433.486 298.486 438.041 296.44 443.05C294.393 448.058 293.357 453.422 293.391 458.833V500.633Z" stroke="var(--titre-color)" strokeWidth="16.6667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M409.667 500.633C409.667 511.516 413.99 521.953 421.685 529.648C429.381 537.343 439.818 541.666 450.7 541.666C461.583 541.666 472.02 537.343 479.715 529.648C487.411 521.953 491.734 511.516 491.734 500.633V458.833C491.734 447.95 487.411 437.513 479.715 429.818C472.02 422.123 461.583 417.8 450.7 417.8C439.818 417.8 429.381 422.123 421.685 429.818C413.99 437.513 409.667 447.95 409.667 458.833V500.633Z" stroke="var(--titre-color)" strokeWidth="16.6667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M390.354 382.21H452.292" stroke="var(--titre-color)" strokeWidth="16.6667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M390.354 258.333H452.292" stroke="var(--titre-color)" strokeWidth="16.6667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M390.354 320.271H430.737" stroke="var(--titre-color)" strokeWidth="16.6667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M390.354 258.333V382.21" stroke="var(--titre-color)" strokeWidth="16.6667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M357.433 258.333L326.466 382.217L295.483 258.333L264.516 382.217L233.55 258.333" stroke="var(--titre-color)" strokeWidth="16.6667" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M535.48 320.272C543.654 320.332 551.473 323.621 557.232 329.422C562.991 335.224 566.223 343.067 566.223 351.241C566.223 359.415 562.991 367.258 557.232 373.06C551.473 378.861 543.654 382.15 535.48 382.21H484.38V258.333H535.48C543.654 258.393 551.473 261.683 557.232 267.484C562.991 273.285 566.223 281.128 566.223 289.303C566.223 297.477 562.991 305.32 557.232 311.121C551.473 316.923 543.654 320.212 535.48 320.272Z" stroke="var(--titre-color)" strokeWidth="14.4367" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M535.48 320.271H484.38" stroke="var(--titre-color)" strokeWidth="14.4367" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

    )
});
SwitchManga.displayName = 'SwitchManga';

/**
 * Fonction qui permet d'afficher l'icone de switch série.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const SwitchSerie = memo(({ width, height }: { width: number, height: number }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M399.999 741.519C586.494 741.519 741.519 586.83 741.519 400C741.519 213.504 586.16 58.4814 399.664 58.4814C212.833 58.4814 58.4814 213.504 58.4814 400C58.4814 586.83 213.169 741.519 399.999 741.519ZM338.727 529.241C323.324 538.616 305.914 531.25 305.914 515.179V284.821C305.914 269.42 324.329 262.723 338.727 271.094L526.896 382.589C540.623 390.624 540.959 409.71 526.896 418.08L338.727 529.241Z" fill="var(--titre-color)" />
        </svg>

    )
});
SwitchSerie.displayName = 'SwitchSerie';