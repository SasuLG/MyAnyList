"use client"

import { ImportSeries } from "@/tmdb/types/series.type";
import { useState } from "react";

export default function Import() {
    const [series, setSeries] = useState<ImportSeries[]>([]);

    const searchSeries = async () => {
        const response = await fetch("/api/series/import");
        const data = await response.json() as ImportSeries[];
        console.log(data);
        setSeries(data);
    };

    const detailsSeries = async () => {
        const response = await fetch("/api/series/import/details");
        const data = await response.json();
        console.log(data);
    };

    const detailsSeason = async () => {
        const response = await fetch("/api/series/import/details/details");
        const data = await response.json();
        console.log(data);
    };

    return (
        <div>
            <h1>Import page</h1>
            <button onClick={searchSeries}>Search series</button>
            <button onClick={detailsSeries}>details series</button>
            <button onClick={detailsSeason}>details season</button>
            {series.length > 0 && (
                <ul>
                    {series.map((serie) => (
                        <li key={serie.id}>
                            {serie.name}
                            {serie.poster_path && <img src={`https://image.tmdb.org/t/p/w500${serie.poster_path}`} alt={serie.name} />}
                            {serie.overview}
                            </li>
                    ))
                    }
                </ul>
            )}
        </div>
    );
}