import { useEffect, useState } from "react";
import WeekendCalcul from "./weekends";

/**
 * Fonction qui permet de formatter une date
 *
 * @param {Date} date - La date à formatter
 * @return {*}  {string}
 */
function formatDate(date: Date): string {
    if (date.toString() === 'Invalid Date') { return `non défini`; }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return `${day}/${month}/${year}`;
}

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

/**
 * Fonction qui permet de calculer le nombre de jour d'écart entre deux dates sans compter les week-ends.
 *
 * @param {Date | number} date1 - La première date
 * @param {Date | number} date2 - La deuxième date
 * @return {*}  {number}
 */
function dateDiffOuvres(date1: Date | number, date2: Date | number): number {
    let timeDiff = 0;
    let startDate: Date = new Date();
    let endDate: Date = new Date();
    if (typeof date1 === 'number' && typeof date2 !== 'number') {
        timeDiff = date2.getTime() - date1;
        startDate = new Date(date1);
        endDate = date2;
    } else if (typeof date1 !== 'number' && typeof date2 === 'number') {
        timeDiff = date2 - date1.getTime();
        startDate = date1;
        endDate = new Date(date2);
    } else if (typeof date1 !== 'number' && typeof date2 !== 'number') {
        timeDiff = date2.getTime() - date1.getTime();
        startDate = date1;
        endDate = date2;
    }

    const calculator = new WeekendCalcul(startDate, endDate);
    const weekends = calculator.getWeekends();
    const weeksDuration = weekends.reduce((acc, curr) => acc + curr.duration, 0);
    
    //Le jour de fin et le jour actuel ne sont pas pris en compte dans le calcul d'où l'ajout de deux jours en plus.
    timeDiff = timeDiff - weeksDuration + WeekendCalcul.GET_DAY_MILI()*2;

    const daysDiff = Math.floor(timeDiff / WeekendCalcul.GET_DAY_MILI());
    return daysDiff;
}

/**
 * Fonction qui permet de récupérer le poucentage du nombre de jours déjà passé.
 *
 * @param {number} totalDays - Le total de jour à disposition
 * @param {number} remainingDays - Le nombre de jour restant
 * @return {*}  {number}
 */
function getPassedDaysPercentage(totalDays: number, remainingDays: number): number {
    const daysPassed = totalDays - remainingDays;
    const percentagePassed = (daysPassed / totalDays) * 100;
    return parseFloat(percentagePassed.toFixed(2));
}

export {
    dateDiffOuvres as dateDiff, formatDate,
    formatDateTime,
    getPassedDaysPercentage
};

