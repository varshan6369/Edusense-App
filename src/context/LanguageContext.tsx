import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'es' | 'fr';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    students: 'Students Directory',
    copilot: 'AI Copilot',
    whatif: 'What-If Simulator',
    planner: 'Study Planner',
    notes: 'Smart Notes',
    reports: 'Report Generator',
    gamification: 'Gamification',
    settings: 'Settings',
    terminal: 'Terminal',
    language: 'Language',
    contact: 'Contact',
    searchPlaceholder: 'Search anything...',
    logout: 'Logout',
    signIn: 'Sign In',
  },
  es: {
    dashboard: 'Panel Principal',
    students: 'Directorio de Estudiantes',
    copilot: 'Co-piloto IA',
    whatif: 'Simulador Qué-Pasaría-Si',
    planner: 'Planificador de Estudio',
    notes: 'Notas Inteligentes',
    reports: 'Generador de Informes',
    gamification: 'Gamificación',
    settings: 'Configuración',
    terminal: 'Terminal',
    language: 'Idioma',
    contact: 'Contacto',
    searchPlaceholder: 'Buscar algo...',
    logout: 'Cerrar Sesión',
    signIn: 'Iniciar Sesión',
  },
  fr: {
    dashboard: 'Tableau de Bord',
    students: 'Répertoire des Élèves',
    copilot: 'Co-pilote IA',
    whatif: 'Simulateur Et Si',
    planner: 'Planificateur d\'Études',
    notes: 'Notes Intelligentes',
    reports: 'Générateur de Rapports',
    gamification: 'Gamification',
    settings: 'Paramètres',
    terminal: 'Terminal',
    language: 'Langue',
    contact: 'Contact',
    searchPlaceholder: 'Rechercher tout...',
    logout: 'Déconnexion',
    signIn: 'Se Connecter',
  },
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  currentLanguageOption: LanguageOption;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('edusense_lang');
    if (saved === 'en' || saved === 'es' || saved === 'fr') return saved;
    return 'en';
  });

  const setLanguage = (code: LanguageCode) => {
    setLanguageState(code);
    localStorage.setItem('edusense_lang', code);
  };

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentLanguageOption, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
