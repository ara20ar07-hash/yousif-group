import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';
import heroUnderfloor from '../assets/images/hero_underfloor_gold_1785840550929.jpg';
import heroRadiator from '../assets/images/hero_radiator_gold_1785840568531.jpg';

export default function Hero() {
  const { lang } = useLanguage();
  const isKu = lang === 'ku';

  return (
    <section id="home" className="relative min-h-screen flex items-center px-6 md:px-12 xl:px-16 py-20 md:py-24 overflow-hidden bg-black">
      {/* Deep black background with subtle gold radial atmosphere */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 80% 50%, rgba(255,210,63,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 90% 20%, rgba(255,180,0,0.08) 0%, transparent 60%),
            #05070a
          `
        }}
      />

      {/* Right Side Two Floating Image Cards Container */}
      <div 
        className={`absolute top-[calc(50%+45px)] -translate-y-1/2 z-10 hidden lg:flex flex-col gap-5 xl:gap-6 pointer-events-none select-none ${
          isKu 
            ? 'left-6 xl:left-12 2xl:left-16 items-start' 
            : 'right-6 xl:right-12 2xl:right-16 items-end'
        }`}
      >
        {/* Card 1 (Top): Underfloor Heating Cross-Section */}
        <motion.div 
          initial={{ opacity: 0, x: isKu ? -50 : 50, y: 15 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className={`relative w-[280px] lg:w-[330px] xl:w-[400px] aspect-[16/9] ${
            isKu 
              ? 'translate-x-[-35px] xl:translate-x-[-50px]' 
              : 'translate-x-[35px] xl:translate-x-[50px]'
          }`}
        >
          {/* Thick Yellow Outer Border + Soft Yellow Glow */}
          <div className="w-full h-full p-[4px] lg:p-[5px] rounded-[24px] lg:rounded-[30px] bg-[#FFD23F] shadow-[0_0_30px_rgba(255,210,63,0.45)]">
            {/* Thick White Inner Border */}
            <div className="w-full h-full p-[4px] lg:p-[5px] rounded-[20px] lg:rounded-[25px] bg-white">
              {/* Image */}
              <div className="w-full h-full rounded-[16px] lg:rounded-[20px] overflow-hidden bg-[#0A0D14]">
                <img 
                  src={heroUnderfloor} 
                  alt="Underfloor heating 3D cross-section"
                  className="w-full h-full object-cover object-center filter brightness-[1.04] contrast-[1.08]"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 2 (Bottom): Modern White Radiator */}
        <motion.div 
          initial={{ opacity: 0, x: isKu ? -50 : 50, y: 15 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative w-[350px] lg:w-[420px] xl:w-[500px] aspect-[16/9] translate-x-0"
        >
          {/* Thick Yellow Outer Border + Soft Yellow Glow */}
          <div className="w-full h-full p-[4px] lg:p-[5px] rounded-[24px] lg:rounded-[30px] bg-[#FFD23F] shadow-[0_0_35px_rgba(255,210,63,0.5)]">
            {/* Thick White Inner Border */}
            <div className="w-full h-full p-[4px] lg:p-[5px] rounded-[20px] lg:rounded-[25px] bg-white">
              {/* Image */}
              <div className="w-full h-full rounded-[16px] lg:rounded-[20px] overflow-hidden bg-[#0A0D14]">
                <img 
                  src={heroRadiator} 
                  alt="Modern white heating radiator"
                  className="w-full h-full object-cover object-center filter brightness-[1.04] contrast-[1.08]"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Hero Text Content */}
      <div className="relative z-20 max-w-[540px] xl:max-w-[600px]">
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block text-[11px] sm:text-[12px] tracking-[0.35em] uppercase text-amber font-semibold mb-5"
        >
          {lang === 'ku' ? 'سلێمانی و هەموو کوردستان، عێراق · دامەزراوە لە ٢٠٢٠' : 'SULAYMANIYAH AND WHOLE OF KURDISTAN, IRAQ · EST. 2020'}
        </motion.span>

        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`font-display text-[72px] sm:text-[90px] xl:text-[104px] ${lang === 'ku' ? 'leading-[1.25]' : 'leading-[0.85]'} tracking-tight text-white mb-6`}
        >
          {lang === 'ku' ? (
            <div className="flex flex-col gap-2">
              <span 
                className="italic text-amber animate-fade-in-up opacity-0"
                style={{
                  fontFamily: 'Georgia',
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  textAlign: 'right',
                  lineHeight: '115px',
                  fontSize: '96px'
                }}
              >
                یوسف
              </span>
              <span className="animate-fade-in-up opacity-0 [animation-delay:150ms]">گروپ</span>
            </div>
          ) : (
            <>
              <span className="italic text-amber font-serif font-normal">Yousif</span> <br />
              Group
            </>
          )}
        </motion.h1>

        {lang === 'en' && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-arabic text-sm sm:text-base tracking-wider text-white/85 text-start mb-6" dir="rtl"
          >
            یوسف گروپ — دابین و دانانی سیستەمی گەرمی، ساردی، و غاز
          </motion.p>
        )}

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-base sm:text-lg leading-relaxed font-light text-white/70 max-w-[480px] mb-10"
        >
          {lang === 'ku' 
            ? 'تایبەتمەندێکی متمانەپێکراو لە سلێمانی و هەموو کوردستان لە بوارەکانی ساردی و گەرمی، تۆڕی غاز، سیستەمی سۆلار و ئاگرکوژێنەوە – دابینکردنی چارەسەری ئاسوودەیی و سەلامەتی بۆ ماڵ و شوێنە بازرگانییەکان.' 
            : 'An architectural exploration of mechanical systems located in Sulaymaniyah and whole of kurdistan. Designed for reliability, safety, and comfort.'}
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <a href="#services" className="bg-amber text-black font-bold text-[11px] px-9 py-3.5 rounded-full tracking-[0.2em] uppercase hover:bg-amber-light hover:-translate-y-px transition-all w-full sm:w-auto text-center flex items-center justify-center shadow-[0_4px_20px_rgba(255,210,63,0.3)]">
            {lang === 'ku' ? 'خزمەتگوزارییەکانمان' : 'OUR SERVICES'}
          </a>
          <a href="#contact" className="bg-transparent border border-white/20 text-white font-medium text-[11px] px-9 py-3.5 rounded-full tracking-[0.2em] uppercase hover:bg-white/10 hover:border-white/40 transition-all w-full sm:w-auto text-center flex items-center justify-center">
            {lang === 'ku' ? 'پەیوەندیمان پێوە بکە' : 'CONTACT US'}
          </a>
        </motion.div>
      </div>
    </section>
  );
}


