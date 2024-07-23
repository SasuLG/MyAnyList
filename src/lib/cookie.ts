/**
 * Fonction qui permet de récupérer la valeur d'un cookie.
 * Pour ce faire, cette méthode doit être appelée côté client.
 *
 * @param {string} name - Le nom du cookie
 * @return {*}  {(string | undefined)}
 */
function getCookie(name: string): string | undefined {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(`${name}=`)) {
            return cookie.substring(name.length + 1);
        }
    }
    return undefined;
}

export {
    getCookie
};

