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
  onClickHeart: (serie: MinimalSerie) => void;
  limit?: number;
  size?: 'normal' | 'small' | 'very-small' | 'extra-small'; 
};

const sizeStyles = {
  'normal': {
    imgWidth: '100%', 
    padding: '1rem',
    fontSize: '24px',
    imgBoxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    cardBoxShadow: '0 6px 15px rgba(0, 0, 0, 0.3)',
    heartSize: '20px', 
    badgeSize: '40px', 
    badgeFontSize: '18px' 
  },
  'small': {
    imgWidth: '100px',
    padding: '0.75rem',
    fontSize: '16px',
    imgBoxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
    cardBoxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
    heartSize: '16px', 
    badgeSize: '30px', 
    badgeFontSize: '16px' 
  },
  'very-small': {
    imgWidth: '80px', 
    padding: '0.5rem',
    fontSize: '14px',
    imgBoxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
    cardBoxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)',
    heartSize: '12px',
    badgeSize: '25px', 
    badgeFontSize: '14px' 
  },
  'extra-small': {
    imgWidth: '60px', 
    padding: '0.25rem',
    fontSize: '12px',
    imgBoxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    cardBoxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
    heartSize: '10px', 
    badgeSize: '20px', 
    badgeFontSize: '12px' 
  }
};

const SeriesList: React.FC<SeriesListProps> = ({ series, styleType, followedIds, onClickHeart, limit, size = 'normal' }) => {
  
  let adjustedSize = size;
  if (styleType === 'list') {
    if (size === 'normal') adjustedSize = 'small';
    else if (size === 'small') adjustedSize = 'very-small';
    else if (size === 'very-small') adjustedSize = 'extra-small';
  }

  const limitedSeries = limit ? series.slice(0, limit) : series; 
  const { imgWidth, padding, fontSize, imgBoxShadow, cardBoxShadow, badgeSize, badgeFontSize } = sizeStyles[adjustedSize];
  const heartSize = parseInt(sizeStyles[adjustedSize].heartSize);

  return (
    <ul style={{ listStyle: "none", padding: 0, display: styleType === 'grid' ? 'grid' : 'flex', gridTemplateColumns: styleType === 'grid' ? 'repeat(auto-fit, minmax(250px, 1fr))' : 'none', gap: "1rem", flexDirection: styleType === 'list' ? 'column' : undefined }}>
      {limitedSeries.map((serie) => (
        <HoverToolBox serie={serie} key={serie.id}>
          <li style={{ display: "flex", flexDirection: styleType === 'grid' ? 'column' : 'row', alignItems: styleType === 'grid' ? 'center' : 'flex-start', padding, backgroundColor: "var(--card-background)", borderRadius: "8px", boxShadow: cardBoxShadow, transition: "transform 0.3s", cursor: "pointer", position: "relative" }}>
            <div style={{ marginBottom: styleType === 'grid' ? "1rem" : "0", marginRight: styleType === 'list' ? "1rem" : "0", position: "relative" }}>
              {serie.poster_path && (
                <img
                  src={`${IMG_SRC}${serie.poster_path}`}
                  alt={serie.name}
                  style={{ width: imgWidth, borderRadius: "4px", boxShadow: imgBoxShadow, transition: "transform 0.3s" }}
                />
              )}
              <div style={{ width: badgeSize, height: badgeSize, borderRadius: "50%", backgroundColor: serie.status === 'Ended' ? "var(--status-ended)" : "var(--status-airing)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: badgeFontSize, position: "absolute", top: "0", right: "0", transform: "translate(20%, -20%)", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}>
                {serie.vote_average.toFixed(1)}
              </div>
              <div onClick={(e) => { e.stopPropagation(); onClickHeart(serie); }} style={{ width: badgeSize, height: badgeSize, borderRadius: "50%", backgroundColor: serie.status === 'Ended' ? "var(--status-ended)" : "var(--status-airing)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: badgeFontSize, position: "absolute", top: "0", left: "0", transform: "translate(-20%, -20%)", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)" }}>
                {followedIds.includes(Number(serie.id)) ? <Heart width={heartSize} height={heartSize} /> : <BrokenHeart width={heartSize} height={heartSize} />}
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ color: serie.status === "Released" || serie.status === "Ended" ? "red" : "var(--titre-color)", fontSize }}>{serie.name}</h2>
                {styleType === 'list' && (
                  <>
                    <p style={{ color: "var(--main-text-color)", fontSize }}>{serie.overview}</p>
                    <h3 style={{ color: "var(--subtitle-color)", fontSize }}>{serie.media_type}</h3>
                    <h4 style={{ color: "var(--subtitle-color)", fontSize }}>{serie.first_air_date?.substring(0, 4)}</h4>
                  </>
                )}
              </div>
            </div>
          </li>
        </HoverToolBox>
      ))}
    </ul>
  );
};

export default SeriesList;
