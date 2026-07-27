import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { MapPin } from 'lucide-react';

export default function WhatsAppButton() {
  const { lang } = useLanguage();
  const mapUrl = "https://maps.app.goo.gl/Wwk32kn7dHM1N4h37";

  return (
    <motion.div
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col items-end gap-3.5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      {/* Location Map Floating Button */}
      <div className="flex items-center gap-3 group">
        <div className="hidden md:flex bg-navy-mid border border-white/10 text-text-main text-[10px] tracking-widest uppercase px-3.5 py-2 rounded-full shadow-2xl backdrop-blur-sm items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          {lang === 'ku' ? 'شوێن لە نەخشەدا' : 'Our Location'}
        </div>
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center w-14 h-14 bg-amber text-navy rounded-full shadow-2xl hover:-translate-y-1 transition-all duration-300 group hover:bg-amber-light"
          aria-label="Open Location on Google Maps"
        >
          {/* Subtle pulse ring */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-amber opacity-20 animate-ping" style={{ animationDuration: '3s' }} />
          <MapPin className="w-6 h-6 text-navy relative z-10" />
        </a>
      </div>

      {/* WhatsApp Floating Button */}
      <div className="flex items-center gap-3 group">
        <div className="hidden md:flex bg-navy-mid border border-white/10 text-text-main text-[10px] tracking-widest uppercase px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-sm items-center pointer-events-none">
          {lang === 'ku' ? 'نامەمان بۆ بنێرە' : 'Chat with us'}
        </div>
        
        <a
          href="https://wa.me/9647709700306"
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl hover:-translate-y-1 transition-all duration-300"
          aria-label="Chat on WhatsApp"
        >
          {/* Subtle Ping Animation */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-30 animate-ping" style={{ animationDuration: '2s' }} />
          
          {/* WhatsApp Icon */}
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" className="relative z-10">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </a>
      </div>
    </motion.div>
  );
}
