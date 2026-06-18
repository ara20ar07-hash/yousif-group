import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';

export default function Hero() {
  const { lang } = useLanguage();

  return (
    <section id="home" className="relative min-h-screen flex items-center px-6 md:px-16 py-28 overflow-hidden">
      {/* Background gradients */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 55% at 70% 50%, rgba(255,214,0,0.1) 0%, transparent 65%),
            radial-gradient(ellipse 40% 60% at 80% 30%, rgba(255,214,0,0.07) 0%, transparent 55%),
            linear-gradient(160deg, #000000 0%, #111111 100%)
          `
        }}
      />
      <div className="absolute inset-0 z-0 hero-grid-overlay pointer-events-none" />

      {/* Decorative Logo Background */}
      <div className={`absolute ${lang === 'ku' ? 'left-[6%]' : 'right-[6%]'} top-1/2 -translate-y-1/2 w-[380px] opacity-75 mix-blend-screen pointer-events-none hidden lg:flex justify-center items-center drop-shadow-[0_0_60px_rgba(255,214,0,0.25)]`}>
         <div className="text-[240px] font-display tracking-tighter text-amber/20 leading-none">YG</div>
      </div>

      <div className="relative z-10 max-w-[680px]">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block text-[11px] tracking-[0.4em] uppercase text-amber font-semibold mb-4"
        >
          {lang === 'ku' ? 'سلێمانی و هەموو کوردستان، عێراق · دامەزراوە لە ٢٠٢٠' : 'Sulaymaniyah and whole of kurdistan, Iraq · Est. 2020'}
        </motion.span>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`font-display text-[80px] sm:text-[100px] ${lang === 'ku' ? 'leading-[1.3]' : 'leading-[0.85]'} tracking-tight text-text-main mb-6`}
        >
          {lang === 'ku' ? (
            <div className="flex flex-col gap-2">
              <span 
                className="italic text-amber animate-fade-in-up opacity-0"
                style={{
                  fontFamily: 'Georgia',
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  marginLeft: '9px',
                  textAlign: 'right',
                  lineHeight: '125px',
                  fontSize: '105px'
                }}
              >
                یوسف
              </span>
              <span className="animate-fade-in-up opacity-0 [animation-delay:150ms]">گروپ</span>
            </div>
          ) : (
            <>
              <span className="italic text-amber">Yousif</span> <br />
              Group
            </>
          )}
        </motion.h1>

        {lang === 'en' && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-arabic text-sm tracking-widest text-white/70 text-start mb-6" dir="rtl"
          >
            یوسف گروپ — دابین و دانانی سیستەمی گەرمی، ساردی، و غاز
          </motion.p>
        )}

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg leading-relaxed font-light text-white/70 max-w-[480px] mb-9"
        >
          {lang === 'ku' 
            ? 'تایبەتمەندێکی متمانەپێکراو لە سلێمانی و هەموو کوردستان لە بوارەکانی ساردی و گەرمی، تۆڕی غاز، سیستەمی سۆلار و ئاگرکوژێنەوە – دابینکردنی چارەسەری ئاسوودەیی و سەلامەتی بۆ ماڵ و شوێنە بازرگانییەکان.' 
            : 'An architectural exploration of mechanical systems located in Sulaymaniyah and whole of kurdistan. Designed for reliability, safety, and comfort.'}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex gap-4 flex-wrap"
        >
          <a href="#services" className="bg-amber text-navy font-semibold text-[11px] px-8 py-3 rounded-full tracking-[0.2em] uppercase hover:bg-amber-light hover:-translate-y-px transition-all">
            {lang === 'ku' ? 'خزمەتگوزارییەکانمان' : 'Our Services'}
          </a>
          <a href="#contact" className="border border-white/20 text-text-main text-[11px] px-8 py-3 rounded-full tracking-[0.2em] uppercase hover:bg-white/10 transition-colors">
            {lang === 'ku' ? 'پەیوەندیمان پێوە بکە' : 'Contact Us'}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
