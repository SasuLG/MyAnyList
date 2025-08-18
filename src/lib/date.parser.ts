/**
 * Fonction qui permet de formatter une date avec l'heure
 *
 * @param {Date} date - La date à formatter
 * @return {*}  {string}
 */
function formatDateTime(date: Date): string {
    if (date.toString() === 'Invalid Date') { return `non défini`; }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} à ${hours}h${minutes}`;
}

export {
    formatDateTime
};

