import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useOwner } from './OwnerContext';
import { Lock, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  onOpenOwnerModal: () => void;
}

export default function Navbar({ onOpenOwnerModal }: NavbarProps) {
  const { lang, toggleLanguage } = useLanguage();
  const { isOwnerLoggedIn } = useOwner();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navItems = [
    { en: 'Services', ku: 'خزمەتگوزارییەکان', id: 'services' },
    { en: 'About', ku: 'دەربارە', id: 'about' },
    { en: 'Design Tool', ku: 'ئامرازی نەخشەسازی', id: 'designer' },
    { en: 'Contact', ku: 'پەیوەندی', id: 'contact' }
  ];

  return (
    <nav 
      style={{ fontSize: '16px' }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 sm:py-6 bg-navy/90 backdrop-blur-md border-b border-border-main"
    >
      <a href="#" className="flex items-center no-underline group">
        <span className="font-display text-lg sm:text-2xl tracking-tight italic text-text-main leading-none">
          Yousif<span className="text-amber">.</span>Group
        </span>
      </a>

      <ul className="hidden lg:flex gap-9 list-none">
        {navItems.map((item) => (
          <li key={item.en}>
            <a
              href={`#${item.id}`}
              className="text-muted text-[11px] tracking-[0.2em] font-medium uppercase hover:text-text-main transition-colors duration-250"
            >
              {lang === 'ku' ? item.ku : item.en}
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-1.5 sm:gap-3.5">
        <button
          onClick={onOpenOwnerModal}
          className={`flex items-center gap-1.5 sm:gap-2 border rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] uppercase tracking-widest transition-all duration-200
            ${isOwnerLoggedIn 
              ? 'border-amber/80 text-amber bg-amber/10 shadow-[0_0_15px_rgba(255,214,0,0.15)] hover:bg-amber/20' 
              : 'border-white/10 text-[#E0D8D0] hover:text-amber hover:border-amber/40 bg-transparent'}`}
          title={isOwnerLoggedIn ? "Owner Dashboard Active" : "Owner Login"}
        >
          {isOwnerLoggedIn ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber animate-ping" />
              <span className="hidden sm:inline">{lang === 'ku' ? 'خاوەن کار' : 'Owner: ON'}</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3 text-muted/80 group-hover:text-amber" />
              <span className="hidden sm:inline">{lang === 'ku' ? 'خاوەن کار' : 'Owner'}</span>
            </>
          )}
        </button>

        <button
          onClick={toggleTheme}
          className="flex items-center justify-center border border-white/10 rounded-full w-8 h-8 sm:w-10 sm:h-10 text-[#E0D8D0] hover:text-amber hover:border-amber/50 transition-all duration-200 cursor-pointer shrink-0"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 sm:gap-2 border border-white/10 rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] uppercase tracking-widest text-[#E0D8D0] hover:text-amber hover:border-amber/50 transition-all duration-200"
        >
          {lang === 'en' ? (
            <>
              <svg width="16" height="12" viewBox="0 0 3 2" className="rounded-[2px] shrink-0">
                <rect width="3" height="2" fill="#278e43"/>
                <rect width="3" height="1.333" fill="#fff"/>
                <rect width="3" height="0.666" fill="#ed2024"/>
                <circle cx="1.5" cy="1" r="0.3" fill="#f9af1b"/>
              </svg>
              <span className="hidden sm:inline">کوردی</span>
            </>
          ) : (
            <>
              <svg width="16" height="12" viewBox="0 0 60 40" className="rounded-[2px] shrink-0 overflow-hidden">
                <rect width="60" height="40" fill="#fff"/>
                <rect width="60" height="3.07" fill="#be0a26"/>
                <rect width="60" height="3.07" y="6.15" fill="#be0a26"/>
                <rect width="60" height="3.07" y="12.3" fill="#be0a26"/>
                <rect width="60" height="3.07" y="18.46" fill="#be0a26"/>
                <rect width="60" height="3.07" y="24.6" fill="#be0a26"/>
                <rect width="60" height="3.07" y="30.76" fill="#be0a26"/>
                <rect width="60" height="3.07" y="36.9" fill="#be0a26"/>
                <rect width="24" height="21.5" fill="#002868"/>
                <circle cx="4" cy="4" r="1" fill="#fff"/>
                <circle cx="12" cy="4" r="1" fill="#fff"/>
                <circle cx="20" cy="4" r="1" fill="#fff"/>
                <circle cx="8" cy="8" r="1" fill="#fff"/>
                <circle cx="16" cy="8" r="1" fill="#fff"/>
                <circle cx="4" cy="12" r="1" fill="#fff"/>
                <circle cx="12" cy="12" r="1" fill="#fff"/>
                <circle cx="20" cy="12" r="1" fill="#fff"/>
                <circle cx="8" cy="16" r="1" fill="#fff"/>
                <circle cx="16" cy="16" r="1" fill="#fff"/>
              </svg>
              <span className="hidden sm:inline">English</span>
            </>
          )}
        </button>  
        <a
          href="#contact"
          className="border border-border-main rounded-full px-2.5 py-1.5 sm:px-6 sm:py-2 text-[11px] uppercase tracking-widest text-text-main hover:bg-text-main hover:text-navy transition-all duration-200"
        >
          <span className="sm:hidden">{lang === 'ku' ? 'نرخ' : 'Quote'}</span>
          <span className="hidden sm:inline">{lang === 'ku' ? 'داواکردنی نرخ' : 'Get a Quote'}</span>
        </a>
      </div>
    </nav>
  );
}
