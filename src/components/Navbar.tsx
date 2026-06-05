import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';

export default function Navbar() {
  const { lang, toggleLanguage } = useLanguage();

  const navItems = [
    { en: 'Services', ku: 'خزمەتگوزارییەکان', id: 'services' },
    { en: 'About', ku: 'دەربارە', id: 'about' },
    { en: 'Design Tool', ku: 'ئامرازی نەخشەسازی', id: 'designer' },
    { en: 'Contact', ku: 'پەیوەندی', id: 'contact' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-navy/90 backdrop-blur-md border-b border-border-main">
      <a href="#" className="flex items-center gap-2.5 no-underline">
        <div className="w-12 h-12 bg-amber/10 rounded-full border border-amber/30 flex items-center justify-center font-display text-amber text-xl tracking-wider">
          YG
        </div>
        <span className="font-display text-2xl tracking-tight italic text-text-main leading-none">
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

      <div className="flex items-center gap-4">
        <button
          onClick={toggleLanguage}
          className="border border-white/10 rounded-full px-4 py-2 text-[11px] uppercase tracking-widest text-[#E0D8D0] hover:text-amber hover:border-amber/50 transition-all duration-200"
        >
          {lang === 'en' ? 'کوردی' : 'English'}
        </button>  
        <a
          href="#contact"
          className="border border-border-main rounded-full px-6 py-2 text-[11px] uppercase tracking-widest text-text-main hover:bg-text-main hover:text-navy transition-all duration-200"
        >
          {lang === 'ku' ? 'داواکردنی نرخ' : 'Get a Quote'}
        </a>
      </div>
    </nav>
  );
}
