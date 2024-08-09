import { memo } from "react";

/**
 * Fonction qui permet d'afficher l'icone profil-circle.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const ProfilCircle = memo(({ width, height, isHeader }: { width: number, height: number, isHeader:boolean }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M404 426C401.667 425.667 398.667 425.667 396 426C337.333 424 290.666 376 290.666 316.999C290.666 256.666 339.333 207.666 400 207.666C460.333 207.666 509.333 256.666 509.333 316.999C509 376 462.667 424 404 426Z" stroke={`${isHeader?"var(--background-color)":"var(--titre-color)"}`} strokeWidth="50" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M624.667 646.003C565.333 700.337 486.667 733.337 400 733.337C313.334 733.337 234.667 700.337 175.334 646.003C178.667 614.67 198.667 584.003 234.334 560.003C325.667 499.337 475 499.337 565.667 560.003C601.333 584.003 621.333 614.67 624.667 646.003Z" stroke={`${isHeader?"var(--background-color)":"var(--titre-color)"}`} strokeWidth="50" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M400 733.333C584.093 733.333 733.333 584.093 733.333 400C733.333 215.905 584.093 66.6665 400 66.6665C215.905 66.6665 66.6666 215.905 66.6666 400C66.6666 584.093 215.905 733.333 400 733.333Z" stroke={`${isHeader?"var(--background-color)":"var(--titre-color)"}`} strokeWidth="50" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    )
});
ProfilCircle.displayName = 'ProfilCircle';

/**
 * Fonction qui permet d'afficher l'icone profil.
 *
 * @return {React.JSX.Element} Code JSX du svg souhaité.
 */
export const Profil = memo(({ width, height }: { width: number, height: number }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_26_14)">
                <path fillRule="evenodd" clipRule="evenodd" d="M662.502 719.999H137.527C109.271 719.999 88.4061 692.119 99.0632 666.479C148.511 547.919 264.677 479.999 399.994 479.999C535.352 479.999 651.518 547.919 700.966 666.479C711.623 692.119 690.758 719.999 662.502 719.999ZM236.667 239.999C236.667 151.759 309.96 79.9994 399.994 79.9994C490.069 79.9994 563.321 151.759 563.321 239.999C563.321 328.239 490.069 399.999 399.994 399.999C309.96 399.999 236.667 328.239 236.667 239.999ZM798.227 705.439C768.542 571.079 675.691 471.918 553.481 426.918C618.24 375.838 656.01 293.237 642.127 202.797C626.039 97.8772 536.944 13.9191 429.393 1.67907C280.929 -15.2409 155.003 97.9594 155.003 239.999C155.003 315.599 190.772 382.958 246.548 426.918C124.297 471.918 31.4865 571.079 1.76096 705.439C-9.01865 754.279 31.1599 799.999 82.1589 799.999H717.829C768.869 799.999 809.047 754.279 798.227 705.439Z" fill="var(--titre-color)"/>
            </g>
            <defs>
                <clipPath id="clip0_26_14">
                    <rect width="800" height="800" fill="white"/>
                </clipPath>
            </defs>
        </svg>
    )
});
Profil.displayName = 'Profil';