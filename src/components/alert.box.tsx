type AlertBoxProps = {
    message: string;
    color: string;
    onDelay: () => void;
}

/**
 * Fonction qui permet de créer une boîte flottante en haut de l'écran qui affiche un message.
 * 
 * 
 * @param {string} message - Le message à afficher.
 * @param {string} color - La couleur pour la boîte.
 * @param {()} onDelay - Callback qui permet après 5s de faire disparaître la boîte flottante.
 * @returns Le JSX de la boîte flottante.
 */
export default function AlertBox({ message, color, onDelay }: AlertBoxProps): React.JSX.Element {

    /**
     * Fonction qui permet de cacher l'alerte après 5 secondes.
     */
    const hideBox = async () => {
        setTimeout(() => {
            onDelay();
        }, 5000);
    }
    hideBox();

    return (
        <div className="alert-box" style={{ border: `3px solid ${color}` }}>
            <span className="alert-box-message" style={{ color: color }}>{message}</span>
        </div>
    )
}