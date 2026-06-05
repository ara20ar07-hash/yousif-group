import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'en' | 'ku';

interface LanguageContextType {
  lang: Language;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ku' : 'en'));
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ku' ? 'rtl' : 'ltr';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage }}>
      <div className={lang === 'ku' ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
