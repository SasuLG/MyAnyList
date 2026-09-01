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
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: string) => {
    if (singleSelect) {
      onSelect([option]);
      setIsOpen(false);
      setSearchTerm('');
    } else {
      if (selectedOptions.includes(option)) {
        onSelectNot([...notSelectedOptions, option]);
        onSelect(selectedOptions.filter(opt => opt !== option));
      } else if (notSelectedOptions.includes(option)) {
        onSelectNot(notSelectedOptions.filter(opt => opt !== option));
      } else {
        onSelect([...selectedOptions, option]);
      }
      inputRef.current?.focus();
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const displayText = selectedOptions.length > 2
    ? `${selectedOptions.slice(0, 2).join(', ')} +${selectedOptions.length - 2}`
    : notSelectedOptions.length > 0
      ? `not ${notSelectedOptions.slice(0, 2).join(', ')}`
      : selectedOptions.join(', ') || 'Any';

  return (
    <div ref={dropdownRef} className="dropdown">
      <div className="dropdown-label" onClick={() => setIsOpen(!isOpen)} >
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          {(!isOpen || (isOpen && searchTerm === '')) && (
            <span style={{ color: isOpen ? '#aaa' : 'inherit', position: 'absolute', pointerEvents: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
              {displayText}
            </span>
          )}
          {isOpen && (
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', padding: 0, margin: 0, fontSize: 'inherit', fontFamily: 'inherit', color: 'inherit', zIndex: 1 }}
            />
          )}
          <div className="icon" onClick={(e) => { if (isOpen) { e.stopPropagation(); setIsOpen(false) } }}>{isOpen ? <Up width={20} height={20} /> : <Down width={20} height={20} />}</div>
        </div>

      </div>
      {isOpen && (
        <div className="dropdown-options">
          {filteredOptions.length === 0 && (
            <div className="dropdown-option" style={{ cursor: 'default' }}>No options found</div>
          )}
          {filteredOptions.map((option) => (
            <div
              key={option}
              className={`dropdown-option ${selectedOptions.includes(option) ? 'selected' : ''} ${notSelectedOptions.includes(option) ? 'not-selected' : ''}`}
              onClick={() => toggleOption(option)}
              style={{ cursor: 'pointer' }}
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
