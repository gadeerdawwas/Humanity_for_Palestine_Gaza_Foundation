import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, type LanguageCopy } from '@/data/translations';

type Language = 'ar' | 'en';

type LanguageContextValue = {
  language: Language;
  copy: LanguageCopy;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language | null;
    if (stored === 'ar' || stored === 'en') setLanguage(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = translations[language].direction;
  }, [language]);

  const copy = translations[language];

  return (
    <LanguageContext.Provider value={{ language, copy, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
