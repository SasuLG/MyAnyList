"use client";

import HoverToolBox from '@/components/hover';
import Loader from '@/components/loader';
import SeriesList from '@/components/seriesList';
import { IMG_SRC } from '@/constants/tmdb.consts';
import { MinimalSerie } from '@/tmdb/types/series.type';
import { useUserContext } from '@/userContext';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const { user, setAlert, setSelectedMenu } = useUserContext();
    const [series, setSeries] = useState<MinimalSerie[]>([]);
    const [filteredSeries, setFilteredSeries] = useState<MinimalSerie[]>([]);
    const [styleType, setStyleType] = useState<'grid' | 'list'>('grid');
    const [fetchDataFinished, setFetchDataFinished] = useState<boolean>(false);

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/series/all?limit=${encodeURIComponent(20)}&page=${encodeURIComponent(1)}`);
            const data = await response.json();
            setSeries(data);
            setFilteredSeries(data);
            setFetchDataFinished(true);
            console.log(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des séries:', error);
            setFetchDataFinished(true);
        }
        if (user !== undefined) {
            // Récupérer les séries suivies par l'utilisateur
        }
    };

    const toggleLayout = () => {
        setStyleType((prevStyleType) => (prevStyleType === 'grid' ? 'list' : 'grid'));
      };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => setSelectedMenu("search"), [setSelectedMenu]);

   
  return (
    <div style={{ height: "100%", padding: "2rem 4rem", backgroundColor: "var(--background-color)" }}>
      <h1 style={{ color: "var(--titre-color)", textAlign: "center", marginBottom: "2rem" }}>Search Page</h1>

      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
        <button style={{ padding: "0.9rem", border: "none", backgroundColor: "var(--button-background)", color: "var(--button-text)", borderRadius: "4px", cursor: "pointer" }} onClick={toggleLayout}>
          Toggle Layout
        </button>
      </div>

      {fetchDataFinished === false ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <Loader />
        </div>
      ) : (
        <SeriesList series={filteredSeries} styleType={styleType} />
      )}
    </div>
  );
}
