/**
 * Classe qui permet de gérer les week-ends
 *
 * @export
 * @class WeekendCalcul
 */
export default class WeekendCalcul{
    private startDate: Date;
    private endDate: Date;

    /**
     * Creates an instance of WeekendCalcul.
     * @param {Date} startDate  La date de début (Sprint/Itération)
     * @param {Date} endDate    La date de fin (Sprint/Itération)
     * @memberof WeekendCalcul
     */
    constructor(startDate: Date, endDate: Date) {
        this.startDate = startDate;
        this.endDate = endDate;
    }

    /**
     * Fonction pour vérifier si une date est un week-end
     *
     * @param {Date} date Vérification si ce jour est un week-end
     * @memberof WeekendCalcul
     */
    isWeekend = (date : Date) : boolean => {
        const day = date.getDay();
        return day === 0 || day === 6; // 0 pour dimanche, 6 pour samedi
    };

    /**
     * Fonction pour calculer la durée d'un week-end
     *
     * @param {Date} start Début du week-end
     * @param {Date} end Fin du week-end
     * @memberof WeekendCalcul
     */
    calculateWeekendDuration = (start : Date, end : Date): number => {
        return Math.abs(end.getTime() - start.getTime());
    };

    /**
     * Récupérer les week-ends pour une période donnée
     *
     * @memberof WeekendCalcul
     */
    getWeekends = () => {
        const weekendsArray : {duration: number}  [] = [];
        let currentDate = this.startDate;
        while (currentDate.getTime() <= this.endDate.getTime()) {
            if (this.isWeekend(currentDate)) {
                const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
                const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);
                weekendsArray.push({
                    duration: WeekendCalcul.GET_DAY_MILI()
                });
            }
            currentDate.setDate(currentDate.getDate() + 1); // Passer au jour suivant
        }
        return weekendsArray;
    };

    // (1 jour = 24 heures * 60 minutes * 60 secondes * 1000 millisecondes)
    static GET_DAY_MILI = () => 1000 * 60 * 60 * 24;
}

