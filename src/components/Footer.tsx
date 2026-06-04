export default function Footer() {
  return (
    <footer className="bg-navy border-t border-border-main px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] uppercase tracking-widest text-white/40">
      <div className="flex items-center space-x-12">
        <span>© 2026 Yousif Group</span>
        <span className="hidden md:inline">Sulaymaniyah</span>
      </div>
      
      <div className="flex space-x-10">
        <a href="#services" className="hover:text-amber transition-opacity">Services</a>
        <a href="#about" className="hover:text-amber transition-opacity">Studio</a>
        <a href="https://facebook.com/YousifCompanyGas" target="_blank" rel="noreferrer" className="hover:text-amber transition-opacity">Facebook</a>
      </div>
    </footer>
  );
}
