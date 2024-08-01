"use client";

import React from 'react';
import HoverToolBox from '@/components/hover';
import { IMG_SRC } from '@/constants/tmdb.consts';
import { MinimalSerie } from '@/tmdb/types/series.type';
import { BrokenHeart, Heart } from './svg/heart.svg';

type SeriesListProps = {
  series: MinimalSerie[];
  styleType: 'grid' | 'list';
  followedIds: number[];
};

const SeriesList: React.FC<SeriesListProps> = ({ series, styleType, followedIds }) => {
    
  return (
    <ul style={{ listStyle: "none", padding: 0, display: styleType === 'grid' ? 'grid' : 'flex', gridTemplateColumns: styleType === 'grid' ? 'repeat(auto-fit, minmax(250px, 1fr))' : 'none', gap: "1rem", flexDirection: styleType === 'list' ? 'column' : undefined }}>
      {series.map((serie) => (
        <HoverToolBox serie={serie} key={serie.id}>
          <li key={serie.id} style={{ display: "flex", flexDirection: styleType === 'grid' ? 'column' : 'row', alignItems: styleType === 'grid' ? 'center' : 'flex-start', padding: "1rem", backgroundColor: "var(--card-background)", borderRadius: "8px", boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)", transition: "transform 0.3s", cursor: "pointer", position: "relative" }}>
            <div style={{ marginBottom: styleType === 'grid' ? "1rem" : "0", marginRight: styleType === 'list' ? "1rem" : "0" }}>
              {serie.poster_path && (
                <img
                  src={`${IMG_SRC}${serie.poster_path}`}
                  alt={serie.name}
                  style={{ width: styleType === 'grid' ? "100%" : "100px", borderRadius: "4px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", transition: "transform 0.3s" }}
                />
              )}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ color: serie.status === "Released" || serie.status === "Ended" ? "red" : "var(--titre-color)" }}>{serie.name}</h2>
                {styleType === 'list' && (
                  <>
                    <p style={{ color: "var(--main-text-color)" }}>{serie.overview}</p>
                    <h3 style={{ color: "var(--subtitle-color)" }}>{serie.media_type}</h3>
                    <h4 style={{ color: "var(--subtitle-color)" }}>{serie.first_air_date?.substring(0, 4)}</h4>
                  </>
                )}
              </div>
              <div style={{ marginTop: "1rem", textAlign: "center" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: serie.status === 'Ended' ? "var(--status-ended)" : "var(--status-airing)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "18px", position: "absolute", top: "10px", right: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}>
                  {serie.vote_average.toFixed(1)}
                </div>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: serie.status === 'Ended' ? "var(--status-ended)" : "var(--status-airing)", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "18px", position: "absolute", top: "10px", left: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}>
                {/*✔️*/}
                {followedIds.includes(Number(serie.id)) ? <Heart width={20} height={20} /> : <BrokenHeart width={20} height={20}/>}
                </div>
              </div>
            </div>
          </li>
        </HoverToolBox>
      ))}
    </ul>
  );
};

export default SeriesList;
