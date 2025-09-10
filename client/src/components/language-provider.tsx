import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, useTranslation } from '@/lib/language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    // Get language from localStorage or default to 'EN'
    const saved = localStorage.getItem('language');
    return saved === 'TH' || saved === 'EN' ? (saved as Language) : 'EN';
  });

  const t = useTranslation(language);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    // Apply language to document
    document.documentElement.lang = language === 'TH' ? 'th' : 'en';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}
