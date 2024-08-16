"use client";
import React, { useState, useEffect } from 'react';

type LoaderProps = {
  width?: number;  // Largeur totale de la télévision (en pixels)
  height?: number; // Hauteur totale de la télévision (en pixels)
};

const Loader = ({ width = 140, height = 100 }: LoaderProps) => {
  const [isOn, setIsOn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setIsOn(prev => !prev), 2000);
    return () => clearInterval(interval);
  }, []);

  const tvWidth = width;
  const tvHeight = height;
  const screenWidth = tvWidth * (120 / 140);
  const screenHeight = tvHeight * (80 / 100);
  const logoSize = tvWidth * (35 / 140);
  const signalWidth = tvWidth * (110 / 140);
  const signalHeight = tvHeight * (12 / 100);

  return (
    <div className="loaderContainer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      <div className="tv" style={{ width: tvWidth, height: tvHeight, background: '#555', position: 'relative', overflow: 'hidden', borderRadius: tvWidth * (12 / 140), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="screen" style={{ width: screenWidth, height: screenHeight, background: isOn ? '#aaa' : '#333', top: tvHeight * (10 / 100), left: tvWidth * (11 / 140), borderRadius: screenWidth * (5 / 120), position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loadingLogo" style={{ width: logoSize, height: logoSize, border: `5px solid #3498db`, borderTop: `5px solid transparent`, borderRadius: logoSize / 2, visibility: isOn ? 'visible' : 'hidden', animation: 'spin 1s linear infinite', display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
        </div>
        <div className="signal" style={{ width: signalWidth, height: signalHeight, background: 'rgba(52, 152, 219, 0.5)', position: 'absolute', bottom: 0, left: tvWidth * (15 / 140), borderRadius: signalHeight / 2, animation: 'signalPulse 1.5s infinite ease-in-out' }} />
      </div>
    </div>
  );
};

export default Loader;
