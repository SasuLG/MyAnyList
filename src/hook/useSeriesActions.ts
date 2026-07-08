import { User } from "@/bdd/model/user";
import { LOGIN_ROUTE } from "@/constants/app.route.const";
import { CatalogItem } from "@/types/catalog-item.type";
import { useUserContext } from "@/userContext";
import { useRouter } from "next/navigation";

export function useSeriesActions(
    user: User | undefined,
    followedIds: string[],
    setFollowedIds: React.Dispatch<React.SetStateAction<string[]>>,
    waitedIds: string[],
    setWaitedIds: React.Dispatch<React.SetStateAction<string[]>>,
    mode: "mangas" | "series"
) {

    const router = useRouter();
    const {setAlert } = useUserContext();
    
    /**
     * Fonction pour suivre ou arrêter de suivre une série
     * @param {CatalogItem} serie - Item à suivre ou arrêter de suivre
     * @returns 
     */
    const onClickHeart = async (serie: CatalogItem) => {
        if (user === undefined) return router.push(LOGIN_ROUTE);

        if (followedIds.includes(serie.id)) {
            const confirmUnfollow = confirm("Êtes-vous sûr de vouloir arrêter de suivre cette série ?");
            if (!confirmUnfollow) return;
        }
        const route = `/api/${encodeURIComponent(user.web_token)}/${mode}/${followedIds.includes(serie.id) ? 'un' : ''}follow`;
        const response = await fetch(route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ [mode === "mangas" ? 'mangaId' : 'serieId']: serie.id }),
        });
        const data = await response.json();
        setFollowedIds(data ? (followedIds.includes(serie.id) ? followedIds.filter((id) => id !== serie.id) : [...followedIds, serie.id]) : followedIds);
        if (!followedIds.includes(serie.id) && waitedIds.includes(serie.id)) {
            const route = `/api/${encodeURIComponent(user.web_token)}/${mode}/${waitedIds.includes(serie.id) ? 'un' : ''}waited`;
            const response = await fetch(route, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [mode === "mangas" ? 'mangaId' : 'serieId']: serie.id }),
            });
            if(!response.ok) setAlert({ message: 'Erreur lors de la récupération des séries', valid: false });
            
            const data = await response.json();
            setWaitedIds(data ? (waitedIds.includes(serie.id) ? waitedIds.filter((id) => id !== serie.id) : [...waitedIds, serie.id]) : waitedIds);
        }
        await fetch('/api/user/activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login: user.login }),
        });
    };

    /**
     * Fonction pour gérer le clic sur le sablier, qui permet de toggle la série en waitlist
     * @param {CatalogItem} serie - L'item
     */
    const onClickHourGlass = async (serie: CatalogItem) => {
        if (user === undefined) return router.push(LOGIN_ROUTE);
        
        const route = `/api/${encodeURIComponent(user.web_token)}/${mode}/${waitedIds.includes(serie.id) ? 'un' : ''}waited`;
            const response = await fetch(route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ [mode === "mangas" ? 'mangaId' : 'serieId']: serie.id }),
        });
        if(!response.ok) setAlert({ message: 'Erreur lors de la récupération des séries', valid: false });

        const data = await response.json();
        setWaitedIds(data ? (waitedIds.includes(serie.id) ? waitedIds.filter((id) => id !== serie.id) : [...waitedIds, serie.id]) : waitedIds);

        await fetch('/api/user/activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login: user.login }),
        });
    }

    return {onClickHeart, onClickHourGlass};
}