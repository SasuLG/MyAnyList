import { User } from "@/bdd/model/user";
import { LOGIN_ROUTE } from "@/constants/app.route.const";
import { MinimalSerie } from "@/types/series.type";
import { useUserContext } from "@/userContext";
import { useRouter } from "next/navigation";

export function useSeriesActions(
    user: User | undefined,
    followedIds: number[],
    setFollowedIds: React.Dispatch<React.SetStateAction<number[]>>,
    waitedIds: number[],
    setWaitedIds: React.Dispatch<React.SetStateAction<number[]>>
) {

    const router = useRouter();
    const {setAlert } = useUserContext();
    
    /**
     * Fonction pour suivre ou arrêter de suivre une série
     * @param {MinimalSerie} serie - Série à suivre ou arrêter de suivre
     * @returns 
     */
    const onClickHeart = async (serie: MinimalSerie) => {
        if (user === undefined) return router.push(LOGIN_ROUTE);

        if (followedIds.includes(Number(serie.id))) {
            const confirmUnfollow = confirm("Êtes-vous sûr de vouloir arrêter de suivre cette série ?");
            if (!confirmUnfollow) return;
        }
        const route = `/api/${encodeURIComponent(user.web_token)}/series/${followedIds.includes(Number(serie.id)) ? 'un' : ''}follow`;
        const response = await fetch(route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ serieId: serie.id }),
        });
        const data = await response.json();
        setFollowedIds(data ? (followedIds.includes(Number(serie.id)) ? followedIds.filter((id) => id !== Number(serie.id)) : [...followedIds, Number(serie.id)]) : followedIds);
        if (!followedIds.includes(Number(serie.id)) && waitedIds.includes(Number(serie.id))) {
            const route = `/api/${encodeURIComponent(user.web_token)}/series/${waitedIds.includes(Number(serie.id)) ? 'un' : ''}waited`;
            const response = await fetch(route, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ serieId: serie.id }),
            });
            if(!response.ok) setAlert({ message: 'Erreur lors de la récupération des séries', valid: false });
            
            const data = await response.json();
            setWaitedIds(data ? (waitedIds.includes(Number(serie.id)) ? waitedIds.filter((id) => id !== Number(serie.id)) : [...waitedIds, Number(serie.id)]) : waitedIds);
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
     * @param {MinimalSerie} serie - La série
     */
    const onClickHourGlass = async (serie: MinimalSerie) => {
        if (user === undefined) return router.push(LOGIN_ROUTE);
        
        const route = `/api/${encodeURIComponent(user.web_token)}/series/${waitedIds.includes(Number(serie.id)) ? 'un' : ''}waited`;
            const response = await fetch(route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ serieId: serie.id }),
        });
        if(!response.ok) setAlert({ message: 'Erreur lors de la récupération des séries', valid: false });

        const data = await response.json();
        setWaitedIds(data ? (waitedIds.includes(Number(serie.id)) ? waitedIds.filter((id) => id !== Number(serie.id)) : [...waitedIds, Number(serie.id)]) : waitedIds);

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