import { useEffect, useState } from 'react';
import { Sun , Moon} from './svg/colors.mode.svg';

const ThemeSwitcher = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Vérifier le cookie lors du chargement du composant
    const darkMode = document.cookie.includes('darkMode=true');
    setIsDarkMode(darkMode);
    document.documentElement.classList.toggle('dark-mode', darkMode);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newIsDarkMode = event.target.checked;
    setIsDarkMode(newIsDarkMode);

    // Ajouter ou supprimer la classe dark-mode
    document.documentElement.classList.toggle('dark-mode', newIsDarkMode);

    // Enregistrer la préférence dans un cookie
    document.cookie = `darkMode=${newIsDarkMode}; path=/; max-age=${7 * 24 * 60 * 60}`;
  };

  return (
    <div>
        <input type="checkbox" id="toggleLightDark" className="toggleMode" checked={isDarkMode} onChange={handleChange}/>
        <label htmlFor="toggleLightDark" className="toggleMode-label">
            <Sun />
            <Moon  />
        </label>
    </div>
  );
};

export default ThemeSwitcher;
