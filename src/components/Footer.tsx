import { useLanguage } from './LanguageContext';

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="bg-navy border-t border-border-main px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] uppercase tracking-widest text-white/40">
      <div className="flex items-center space-x-12">
        <span>© 2026 {lang === 'ku' ? 'یوسف گروپ' : 'Yousif Group'}</span>
        <span className="hidden md:inline">{lang === 'ku' ? 'سلێمانی' : 'Sulaymaniyah'}</span>
      </div>
      
      <div className="flex space-x-10">
        <a href="#services" className="hover:text-amber transition-opacity">{lang === 'ku' ? 'خزمەتگوزارییەکان' : 'Services'}</a>
        <a href="#about" className="hover:text-amber transition-opacity">{lang === 'ku' ? 'دەربارە' : 'Studio'}</a>
        <a href="https://facebook.com/YousifCompanyGas" target="_blank" rel="noreferrer" className="hover:text-amber transition-opacity">{lang === 'ku' ? 'فەیسبووک' : 'Facebook'}</a>
      </div>
    </footer>
  );
}
