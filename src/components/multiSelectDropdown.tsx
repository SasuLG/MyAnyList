import React, { useState, useEffect, useRef } from 'react';
import { Check, UnCheck } from './svg/check.svg';
import { Down, Up } from './svg/upAndDown.svg';

type MultiSelectDropdownProps = {
  options: string[];
  selectedOptions: string[];
  onSelect: (options: string[]) => void;
  singleSelect?: boolean;
  notSelectedOptions?: string[];
  onSelectNot?: (options: string[]) => void;
};

const MultiSelectDropdown = ({ options, selectedOptions, onSelect, singleSelect = false, notSelectedOptions = [], onSelectNot = () => { } }: MultiSelectDropdownProps) => {

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleOption = (option: string) => {
    if (singleSelect) {
      onSelect([option]);
      setIsOpen(false);
    } else {
      if (selectedOptions.includes(option)) {
        onSelectNot([...notSelectedOptions, option]);
        onSelect(selectedOptions.filter(opt => opt !== option));
      } else if (notSelectedOptions.includes(option)) {
        onSelectNot(notSelectedOptions.filter(opt => opt !== option));
      } else {
        onSelect([...selectedOptions, option]);
      }
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const displayText = selectedOptions.length > 2
    ? `${selectedOptions.slice(0, 2).join(', ')} +${selectedOptions.length - 2}`
    : notSelectedOptions.length > 0
      ? `not ${notSelectedOptions.slice(0, 2).join(', ')}`
      : selectedOptions.join(', ') || 'Any';

  return (
    <div ref={dropdownRef} className="dropdown">
      <div className="dropdown-label" onClick={() => setIsOpen(!isOpen)}>
        {displayText}
        <div className="icon">
          {isOpen ? <Up width={20} height={20} /> : <Down width={20} height={20} />}
        </div>
      </div>
      {isOpen && (
        <div className="dropdown-options">
          {options.map((option) => (
            <div
              key={option}
              className={`dropdown-option ${selectedOptions.includes(option) ? 'selected' : ''} ${notSelectedOptions.includes(option) ? 'not-selected' : ''}`}
              onClick={() => toggleOption(option)}
            >
              {option}
              {selectedOptions.includes(option) && <Check width={20} height={20} />}
              {notSelectedOptions.includes(option) && <UnCheck width={20} height={20} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
