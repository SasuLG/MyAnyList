import React, { useState } from 'react';
import { Range } from '@/types/series.type';

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
    let val = Number(event.target.value);
    val = Math.max(minLimit, Math.min(val, maxValue));

    setMinValue(val);
    onChange({ min: val, max: maxValue, minimalRange: minLimit, maximalRange: maxLimit });
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let val = Number(event.target.value);
    val = Math.min(maxLimit, Math.max(val, minValue));

    setMaxValue(val);
    onChange({ min: minValue, max: val, minimalRange: minLimit, maximalRange: maxLimit });
  };

  const minPercentage = ((minValue - minLimit) / (maxLimit - minLimit)) * 100;
  const maxPercentage = ((maxValue - minLimit) / (maxLimit - minLimit)) * 100;

  const editableTextStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'inherit',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    width: '45px',
    padding: 0,
    margin: 0,
    textAlign: 'center',
    cursor: 'pointer'
  };

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
          style={{ background: `linear-gradient(to right, var(--range-filter-color) ${minPercentage}%, #ddd ${minPercentage}%, #ddd ${maxPercentage}%, var(--range-filter-color) ${maxPercentage}%)` }}
        />
        <div
          className="slider-range"
          style={{ left: `${minPercentage}%`, width: `${maxPercentage - minPercentage}%`, backgroundColor: 'var(--range-filter-color)' }}
        />
      </div>
      <div className="slider-labels">
        <span>
          Min:
          <input type="number" value={minValue} className="no-spin" onChange={handleMinChange} style={editableTextStyle} />
        </span>
        <span>
          Max:
          <input type="number" value={maxValue} className="no-spin" onChange={handleMaxChange} style={editableTextStyle} />
        </span>
      </div>
    </div>
  );
};

export default RangeFilter;
