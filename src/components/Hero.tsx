import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import heroUnderfloor from '../assets/images/hero_underfloor_gold_1785840550929.jpg';
import heroRadiator from '../assets/images/hero_radiator_gold_1785840568531.jpg';

export default function Hero() {
  const { lang } = useLanguage();
  const isKu = lang === 'ku';

  return (
    <section id="home" className="relative min-h-[100dvh] flex items-center px-3 sm:px-6 md:px-12 xl:px-16 pt-12 min-[380px]:pt-14 sm:pt-20 pb-6 sm:pb-16 md:py-24 overflow-hidden hero-radial-bg">
      {/* Background Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none hero-grid-overlay opacity-30" />

      {/* Main Hero Flex Container (Side-by-side on mobile and desktop) */}
      <div className={`relative z-20 w-full max-w-7xl mx-auto flex items-center justify-between gap-2 min-[380px]:gap-3 sm:gap-6 lg:gap-12 ${
        isKu ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {/* Main Hero Text Content (Left Side) */}
        <div className="flex-1 max-w-[53%] sm:max-w-[54%] lg:max-w-[540px] xl:max-w-[600px]">
          {/* Location Badge */}
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber/15 border border-amber/30 text-[6.5px] min-[380px]:text-[8px] sm:text-[10px] lg:text-[12px] tracking-[0.04em] sm:tracking-[0.2em] uppercase text-amber-dim dark:text-amber font-semibold mb-1 sm:mb-2.5 lg:mb-5 max-w-full"
          >
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber shrink-0" />
            <span className="truncate">
              {lang === 'ku' ? 'سلێمانی و هەموو کوردستان، عێراق · دامەزراوە لە ٢٠٢٠' : 'SULAYMANIYAH AND WHOLE OF KURDISTAN, IRAQ · EST. 2020'}
            </span>
          </motion.span>

          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`font-display text-[24px] min-[380px]:text-[30px] sm:text-[52px] md:text-[72px] lg:text-[90px] xl:text-[104px] ${lang === 'ku' ? 'leading-[1.12]' : 'leading-[0.88]'} tracking-tight text-slate-900 dark:text-white mb-1 sm:mb-3 lg:mb-6`}
          >
            {lang === 'ku' ? (
              <div className="flex flex-col gap-0.5 sm:gap-2">
                <span 
                  className="text-amber-dim dark:text-amber animate-fade-in-up opacity-0"
                  style={{
                    fontFamily: 'Georgia',
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    textAlign: 'right',
                    lineHeight: '1.1',
                    fontSize: 'clamp(24px, 6.2vw, 96px)'
                  }}
                >
                  یوسف
                </span>
                <span className="animate-fade-in-up opacity-0 [animation-delay:150ms] text-[18px] min-[380px]:text-[22px] sm:text-[44px] lg:text-[72px] text-slate-900 dark:text-white">گروپ</span>
              </div>
            ) : (
              <>
                <span className="italic text-amber-dim dark:text-amber font-serif font-normal">Yousif</span> <br />
                <span className="text-slate-900 dark:text-white">Group</span>
              </>
            )}
          </motion.h1>

          {/* Slogan */}
          {lang === 'en' && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-arabic text-[7.5px] min-[380px]:text-[9px] sm:text-[12px] md:text-[15px] tracking-wider text-slate-800 dark:text-white/85 text-start mb-1 sm:mb-2.5 lg:mb-6" dir="rtl"
            >
              یوسف گروپ — دابین و دانانی سیستەمی گەرمی، ساردی، و غاز
            </motion.p>
          )}

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-[8.5px] min-[380px]:text-[10px] sm:text-[13px] md:text-[16px] lg:text-[18px] leading-[1.35] sm:leading-relaxed font-normal sm:font-light text-slate-700 dark:text-white/70 max-w-full mb-2 sm:mb-4 lg:mb-10"
          >
            {lang === 'ku' 
              ? 'تایبەتمەندێکی متمانەپێکراو لە سلێمانی و هەموو کوردستان لە بوارەکانی ساردی و گەرمی، تۆڕی غاز، سیستەمی سۆلار و ئاگرکوژێنەوە – دابینکردنی چارەسەری ئاسوودەیی و سەلامەتی بۆ ماڵ و شوێنە بازرگانییەکان.' 
              : 'An architectural exploration of mechanical systems located in Sulaymaniyah and whole of kurdistan. Designed for reliability, safety, and comfort.'}
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-row gap-1 min-[380px]:gap-1.5 sm:gap-3 lg:gap-4 w-full"
          >
            <a href="#services" className="bg-[#FFD23F] text-black font-bold text-[6.5px] min-[380px]:text-[7.5px] sm:text-[10px] lg:text-[11px] px-2 min-[380px]:px-2.5 sm:px-6 lg:px-9 py-1.5 min-[380px]:py-2 sm:py-3 lg:py-3.5 rounded-full tracking-[0.05em] sm:tracking-[0.2em] uppercase hover:bg-amber-light hover:-translate-y-px transition-all text-center flex items-center justify-center shadow-[0_4px_15px_rgba(255,210,63,0.35)] whitespace-nowrap">
              {lang === 'ku' ? 'خزمەتگوزارییەکانمان' : 'OUR SERVICES'}
            </a>
            <a href="#contact" className="bg-transparent border border-slate-400 dark:border-white/20 text-slate-900 dark:text-white font-medium text-[6.5px] min-[380px]:text-[7.5px] sm:text-[10px] lg:text-[11px] px-2 min-[380px]:px-2.5 sm:px-6 lg:px-9 py-1.5 min-[380px]:py-2 sm:py-3 lg:py-3.5 rounded-full tracking-[0.05em] sm:tracking-[0.2em] uppercase hover:bg-slate-200/50 dark:hover:bg-white/10 hover:border-slate-600 dark:hover:border-white/40 transition-all text-center flex items-center justify-center whitespace-nowrap">
              {lang === 'ku' ? 'پەیوەندیمان پێوە بکە' : 'CONTACT US'}
            </a>
          </motion.div>
        </div>

        {/* Right Side Two Floating Large Image Cards in Vertical Staircase Layout */}
        <div 
          className="w-[47%] min-[380px]:w-[45%] sm:w-[43%] lg:w-auto flex-shrink-0 flex flex-col gap-2 min-[380px]:gap-3 sm:gap-5 lg:gap-6 pointer-events-none select-none justify-center"
        >
          {/* Card 1 (Top): Underfloor Heating Cross-Section - Staircase Top Step */}
          <motion.div 
            initial={{ opacity: 0, x: isKu ? -30 : 30, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className={`relative w-[88%] sm:w-[86%] lg:w-[330px] xl:w-[400px] aspect-[16/9] ${
              isKu 
                ? 'mr-auto -translate-x-1 min-[380px]:-translate-x-1.5 sm:-translate-x-4 lg:-translate-x-[35px] xl:-translate-x-[50px]' 
                : 'ml-auto translate-x-1 min-[380px]:translate-x-1.5 sm:translate-x-4 lg:translate-x-[35px] xl:translate-x-[50px]'
            }`}
          >
            {/* Thick Yellow Outer Border + Soft Yellow Glow */}
            <div className="w-full h-full p-[2.5px] sm:p-[4px] lg:p-[5px] rounded-[14px] sm:rounded-[22px] lg:rounded-[30px] bg-[#FFD23F] shadow-[0_0_18px_rgba(255,210,63,0.45)]">
              {/* Thick White Inner Border */}
              <div className="w-full h-full p-[2.5px] sm:p-[4px] lg:p-[5px] rounded-[11px] sm:rounded-[18px] lg:rounded-[25px] bg-white">
                {/* Image */}
                <div className="w-full h-full rounded-[9px] sm:rounded-[14px] lg:rounded-[20px] overflow-hidden bg-[#0A0D14]">
                  <img 
                    src={heroUnderfloor} 
                    alt="Underfloor heating 3D cross-section"
                    className="w-full h-full object-cover object-center filter brightness-[1.04] contrast-[1.08]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2 (Bottom): Modern White Radiator - Staircase Bottom Step */}
          <motion.div 
            initial={{ opacity: 0, x: isKu ? -30 : 30, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`relative w-[98%] sm:w-[96%] lg:w-[420px] xl:w-[500px] aspect-[16/9] ${
              isKu
                ? 'ml-auto translate-x-1.5 min-[380px]:translate-x-2 sm:translate-x-0 lg:translate-x-0'
                : 'mr-auto -translate-x-1.5 min-[380px]:-translate-x-2 sm:translate-x-0 lg:translate-x-0'
            }`}
          >
            {/* Thick Yellow Outer Border + Soft Yellow Glow */}
            <div className="w-full h-full p-[2.5px] sm:p-[4px] lg:p-[5px] rounded-[14px] sm:rounded-[22px] lg:rounded-[30px] bg-[#FFD23F] shadow-[0_0_22px_rgba(255,210,63,0.5)]">
              {/* Thick White Inner Border */}
              <div className="w-full h-full p-[2.5px] sm:p-[4px] lg:p-[5px] rounded-[11px] sm:rounded-[18px] lg:rounded-[25px] bg-white">
                {/* Image */}
                <div className="w-full h-full rounded-[9px] sm:rounded-[14px] lg:rounded-[20px] overflow-hidden bg-[#0A0D14]">
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
      </div>
    </section>
  );
}


