"use client";

import Loader from '@/components/loader';
import SeriesList from '@/components/seriesList';
import { MinimalSerie } from '@/tmdb/types/series.type';
import { useUserContext } from '@/userContext';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function SearchPage() {

    /**
     * Récupérer les paramètres de recherche
     */
    const searchParams = useSearchParams();

    /**
     * Récupérer les informations de l'utilisateur
     */
    const { user, setAlert, setSelectedMenu } = useUserContext();

    /**
     * Gestion des séries
     */
    const [series, setSeries] = useState<MinimalSerie[]>([]);

    /**
     * Gestion des séries filtrées
     */
    const [filteredSeries, setFilteredSeries] = useState<MinimalSerie[]>([]);

    /**
     * Gestion du type de style
     */
    const [styleType, setStyleType] = useState<'grid' | 'list'>('grid');

    /**
     * Gestion de l'état de chargement
     */
    const [fetchDataFinished, setFetchDataFinished] = useState<boolean>(false);

    /**
     * Gestion des séries suivies
     */
    const [seriesIdFollowed, setSeriesIdFollowed] = useState<number[]>([]);

    /**
     * Récupérer les séries
     */
    const fetchData = async () => {
        const response = await fetch(`/api/series/all?limit=${encodeURIComponent(20)}&page=${encodeURIComponent(1)}`);
        const data = await response.json();
        setFetchDataFinished(true);
        
        if(response.ok){
            setSeries(data);
            setFilteredSeries(data);
            console.log(data);
        }else{
            setAlert({ message: 'Erreur lors de la récupération des séries', valid: false });
        }
        if (user !== undefined) {
          const response = await fetch(`/api/${encodeURIComponent(user.web_token)}/series/all/id`);
          if(response.ok){
              const data = await response.json();
              console.log(data);
              setSeriesIdFollowed(data);
          }else{
              setAlert({ message: 'Erreur lors de la récupération des séries suivies', valid: false });
          }
        }
    };

    /**
     * Basculer entre les styles de liste
     */
    const toggleLayout = () => {
        setStyleType((prevStyleType) => (prevStyleType === 'grid' ? 'list' : 'grid'));
      };

    useEffect(() => {
        fetchData();
    }, [user]);

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
        <SeriesList series={filteredSeries} styleType={styleType} followedIds={seriesIdFollowed}/>
      )}
    </div>
  );
}
