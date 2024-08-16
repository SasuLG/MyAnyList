import React, { useState } from 'react';
import { Range } from '@/tmdb/types/series.type';

type RangeFilterProps = {
  range: Range;
  onChange: (range: Range) => void;
  minLimit: number;  
  maxLimit: number;  
};

const RangeFilter = ({ range, onChange, minLimit, maxLimit }: RangeFilterProps) => {

  const [minValue, setMinValue] = useState(range.min);
  const [maxValue, setMaxValue] = useState(range.max);

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMinValue = Number(event.target.value);
    if (newMinValue < maxValue) {
      setMinValue(newMinValue);
      onChange({ min: newMinValue, max: maxValue, minimalRange: minLimit, maximalRange: maxLimit });
    }
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMaxValue = Number(event.target.value);
    if (newMaxValue > minValue) {
      setMaxValue(newMaxValue);
      onChange({ min: minValue, max: newMaxValue, minimalRange: minLimit, maximalRange: maxLimit });
    }
  };

  const minPercentage = ((minValue - minLimit) / (maxLimit - minLimit)) * 100;
  const maxPercentage = ((maxValue - minLimit) / (maxLimit - minLimit)) * 100;

  return (
    <div className="range-filter-container">
      <div className="slider-container">
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          value={minValue}
          onChange={handleMinChange}
          className="range-slider min-slider"
        />
        <input
          type="range"
          min={minLimit}
          max={maxLimit}
          value={maxValue}
          onChange={handleMaxChange}
          className="range-slider max-slider"
        />
        <div
          className="slider-track"
          style={{ background: `linear-gradient(to right, #0056b3 ${minPercentage}%, #ddd ${minPercentage}%, #ddd ${maxPercentage}%, #0056b3 ${maxPercentage}%)` }}
        />
        <div
          className="slider-range"
          style={{ left: `${minPercentage}%`, width: `${maxPercentage - minPercentage}%`, backgroundColor: '#0056b3' }}
        />
      </div>
      <div className="slider-labels">
        <span>Min: {minValue}</span>
        <span>Max: {maxValue}</span>
      </div>
    </div>
  );
};

export default RangeFilter;
