import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HoverToolBox from '@/components/hover';
import { IMG_SRC } from '@/constants/tmdb.consts';
import { MinimalSerie } from '@/tmdb/types/series.type';
import { BrokenHeart, Heart } from './svg/heart.svg';
import { BASE_DETAILS_SERIE_ROUTE } from '@/constants/app.route.const';

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQueryList.matches);
    
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

type SeriesListProps = {
  series: MinimalSerie[];
  styleType: 'grid' | 'list';
  followedIds: number[];
  onClickHeart: (serie: MinimalSerie) => void;
  limit?: number;
  size?: 'normal' | 'small' | 'very-small' | 'extra-small' | 'large';
  isMylist?: boolean;
  isList?: boolean; 
};

const sizeStyles = {
  normal: {
    imgWidth: 100, 
    padding: 16, 
    fontSize: 20, 
    heartSize: 20, 
    badgeSize: 40, 
    badgeFontSize: 16, 
    maxwidth: 250, 
    gap: 16, 
  },
  small: {
    imgWidth: 150, 
    padding: 12, 
    fontSize: 18, 
    heartSize: 20, 
    badgeSize: 40, 
    badgeFontSize: 16, 
    maxwidth: 200, 
    gap: 16, 
  },
  'very-small': {
    imgWidth: 120, 
    padding: 8, 
    fontSize: 16, 
    heartSize: 18, 
    badgeSize: 35, 
    badgeFontSize: 14, 
    maxwidth: 150, 
    gap: 12, 
  },
  'extra-small': {
    imgWidth: 100, 
    padding: 4, 
    fontSize: 14, 
    heartSize: 16, 
    badgeSize: 30, 
    badgeFontSize: 12, 
    maxwidth: 100, 
    gap: 8, 
  },
  large: {
    imgWidth: 150, 
    padding: 24, 
    fontSize: 26, 
    heartSize: 24, 
    badgeSize: 50, 
    badgeFontSize: 20, 
    maxwidth: 300, 
    gap: 16, 
  },
};


const adjustSizes = (baseStyles: typeof sizeStyles[keyof typeof sizeStyles], isSmallScreen: boolean) => {
  if (!isSmallScreen) return baseStyles;

  const scale = 0.6;
  return {
    imgWidth: baseStyles.imgWidth * scale,
    padding: baseStyles.padding * scale,
    fontSize: baseStyles.fontSize * scale,
    heartSize: baseStyles.heartSize * scale,
    badgeSize: baseStyles.badgeSize * scale,
    badgeFontSize: baseStyles.badgeFontSize * scale,
    maxwidth: baseStyles.maxwidth * scale,
    gap: baseStyles.gap * scale,
  };
};

const SeriesList = ({ series, styleType, followedIds, onClickHeart, limit, size = 'normal', isMylist = true, isList = true }: SeriesListProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isSmallScreen = useMediaQuery('(max-width: 500px)');

  let adjustedSize: keyof typeof sizeStyles = size;
  if (styleType === 'list') {
    if (size === 'normal') adjustedSize = 'small';
    else if (size === 'small') adjustedSize = 'very-small';
    else if (size === 'very-small') adjustedSize = 'extra-small';
  }

  const limitedSeries = limit ? series.slice(0, limit) : series;
  const baseStyles = sizeStyles[adjustedSize];

  const styles = isList ? adjustSizes(baseStyles, isSmallScreen) : baseStyles;

  const { imgWidth, padding, fontSize, badgeSize, badgeFontSize, maxwidth, gap } = styles;
  const heartSize = Math.round(baseStyles.heartSize * (isSmallScreen ? 0.6 : 1));

  const imgWidthStyle = styleType === 'list' && size === 'large' ? imgWidth : styleType === 'list' ? `calc(${imgWidth}px - 60px)` : `${imgWidth}px`;

  return (
    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: `${gap}px`, flexDirection: styleType === 'list' ? 'column' : undefined }}>
      {limitedSeries.map((serie, index) => {
        const content = (
          <li
            style={{ display: 'flex', flexDirection: styleType === 'grid' ? 'column' : 'row', alignItems: styleType === 'grid' ? 'center' : 'flex-start', padding: `${padding}px`, cursor: 'pointer', transition: 'transform 0.3s, border-color 0.3s', position: 'relative', borderRadius: '8px', border: '1px solid transparent', boxShadow: styleType === 'grid' ? '' : 'rgba(0, 0, 0, 0.3) 0px 4px 10px', maxWidth: styleType === 'grid' ? `${maxwidth}px` : undefined }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Link href={`${BASE_DETAILS_SERIE_ROUTE}/${serie.id}`} style={{ display: 'flex', flexDirection: styleType === 'grid' ? 'column' : 'row', textDecoration: 'none', color: 'inherit', flex: 1, transition: 'transform 0.3s' }}>
              <div style={{ marginBottom: styleType === 'grid' ? '1rem' : '0', marginRight: styleType === 'list' ? '1rem' : '0', position: 'relative', width: styleType === 'list' ? imgWidthStyle : undefined }}>
                {serie.poster_path && (
                  <img
                    src={`${IMG_SRC}${serie.poster_path}`}
                    alt={serie.name}
                    style={{ width: '100%', borderRadius: '4px', objectFit: 'cover', transition: 'transform 0.3s', boxShadow: styleType === 'grid' ? 'rgba(0, 0, 0, 0.3) 8px 15px 10px' : 'rgba(0, 0, 0, 0.3) 4px 5px 10px', transform: styleType === 'grid' && hoveredIndex === index ? 'scale(1.02)' : 'scale(1)' }}
                  />
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch' }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <h2 style={{ color: serie.status === 'Released' || serie.status === 'Ended' ? 'red' : 'var(--titre-color)', fontSize: `${fontSize}px`, margin: '0 0 0.5rem 0', fontWeight: '600', transition: 'color 0.3s', textShadow: 'rgba(0, 0, 0, 0.2) 1px 1px 1px', textAlign: styleType === 'grid' ? 'center' : 'left' }}>
                      {serie.name.length > 35 ? serie.name.substring(0, 30).concat('...') : serie.name}
                    </h2>
                    {styleType === 'list' && (
                      <>
                        <p style={{ color: 'var(--main-text-color)', fontSize: `${fontSize}px`, margin: '0 0 0.5rem 0' }}>
                          {serie.overview.length > 200 ? serie.overview.substring(0, 200).concat('...') : serie.overview}
                        </p>
                        <h4 style={{ color: 'var(--subtitle-color)', fontSize: '14px', margin: '0' }}>
                          {serie.media_type} - {serie.first_air_date?.substring(0, 4)}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '14px', color: 'var(--main-text-color)', margin: '0.5rem 0' }}>
                          <span><strong>Genres:</strong> {serie.genres.map(genre => genre.name).join(', ')}</span>
                        </div>
                      </>
                    )}
                  </div>
                  {styleType === 'list' && (
                    <div style={{ marginTop: "1rem", marginLeft: '1rem', alignSelf: 'stretch', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '14px', color: 'var(--main-text-color)', textAlign: 'right' }}>
                      <span><strong>Vote Average:</strong> {serie.vote_average}</span>
                      <span><strong>Episodes:</strong> {serie.number_of_episodes}</span>
                      <span><strong>Status:</strong> {serie.status}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
            <div
              onClick={(e) => { e.stopPropagation(); onClickHeart(serie); }}
              style={{ width: `${badgeSize}px`, height: `${badgeSize}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: styleType === 'grid' ? '10px' : "0", right: styleType === 'grid' ? '10px' : "0", left: styleType === 'list' ? '0' : "", borderRadius: '50%', zIndex: 1, transition: 'transform 0.3s', fontSize: `${badgeFontSize}px`, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}
            >
              {followedIds.includes(Number(serie.id)) ? <Heart width={heartSize} height={heartSize} /> : <BrokenHeart width={heartSize} height={heartSize} />}
            </div>
          </li>
        );

        return styleType === 'grid' ? (
          <HoverToolBox serie={serie} key={serie.id}>
            {content}
          </HoverToolBox>
        ) : (
          <React.Fragment key={serie.id}>
            {content}
          </React.Fragment>
        );
      })}
    </ul>
  );
};

export default SeriesList;
