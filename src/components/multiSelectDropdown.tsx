import React, { useState, useEffect, useRef } from 'react';
import { Check } from './svg/check.svg';
import { Down, Up } from './svg/upAndDown.svg';

type MultiSelectDropdownProps = {
  options: string[];
  selectedOptions: string[];
  onSelect: (options: string[]) => void;
  singleSelect?: boolean; 
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ options, selectedOptions, onSelect, singleSelect = false }) => {

  /**
   * Hook pour stocker l'état de l'ouverture du menu déroulant
   */
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Référence pour le conteneur du menu déroulant
   */
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Fonction pour basculer une option sélectionnée
   * @param {string} option - Option à basculer
   */
  const toggleOption = (option: string) => {
    if (singleSelect) {
      onSelect([option]);
      setIsOpen(false); 
    } else {
      if (selectedOptions.includes(option)) {
        onSelect(selectedOptions.filter(opt => opt !== option));
      } else {
        onSelect([...selectedOptions, option]);
      }
    }
  };

  /**
   * Fonction pour gérer le clic en dehors du menu déroulant
   * @param {MouseEvent} event - Événement de clic
   */
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
    : selectedOptions.join(', ') || 'Any';

  return (
    <div ref={dropdownRef} className="dropdown">
      <div className="dropdown-label" onClick={() => setIsOpen(!isOpen)}>
        {displayText}
        <div className="icon">
          {isOpen ? <Up width={20} height={20}/> : <Down width={20} height={20}/>}
        </div>
      </div>
      {isOpen && (
        <div className="dropdown-options">
          {options.map((option) => (
            <div
              key={option}
              className={`dropdown-option ${selectedOptions.includes(option) ? 'selected' : ''}`}
              onClick={() => toggleOption(option)}
            >
              {option}
              {selectedOptions.includes(option) && <Check width={20} height={20} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;