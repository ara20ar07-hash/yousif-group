import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import heroUnderfloor from '../assets/images/hero_underfloor_gold_1785840550929.jpg';
import heroRadiator from '../assets/images/hero_radiator_gold_1785840568531.jpg';

export default function Hero() {
  const { lang } = useLanguage();
  const isKu = lang === 'ku';

  return (
    <section id="home" className="relative min-h-[100dvh] flex items-center px-4 sm:px-6 md:px-12 xl:px-16 pt-20 sm:pt-24 md:py-24 pb-12 sm:pb-16 overflow-hidden hero-radial-bg">
      {/* Main Hero Container (Text first, images below on mobile; side-by-side on desktop) */}
      <div className={`relative z-20 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 ${
        isKu ? 'lg:flex-row-reverse' : 'lg:flex-row'
      }`}>
        {/* Main Hero Text Content (Top on mobile, Left side on desktop) */}
        <div className="flex-1 w-full max-w-full lg:max-w-[540px] xl:max-w-[600px] order-1">
          {/* Location Badge */}
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber/15 border border-amber/30 text-[9px] min-[380px]:text-[10px] sm:text-[11px] lg:text-[12px] tracking-[0.08em] sm:tracking-[0.2em] uppercase text-amber font-semibold mb-2 sm:mb-3 lg:mb-5 max-w-full"
          >
            <MapPin className="w-3 h-3 text-amber shrink-0" />
            <span className="truncate">
              {lang === 'ku' ? 'سلێمانی و هەموو کوردستان، عێراق · دامەزراوە لە ٢٠٢٠' : 'SULAYMANIYAH AND WHOLE OF KURDISTAN, IRAQ · EST. 2020'}
            </span>
          </motion.span>

          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`font-display text-[34px] min-[380px]:text-[40px] sm:text-[54px] md:text-[72px] lg:text-[90px] xl:text-[104px] ${lang === 'ku' ? 'leading-[1.12]' : 'leading-[0.9]'} tracking-tight text-text-main mb-2 sm:mb-3 lg:mb-6`}
          >
            {lang === 'ku' ? (
              <div className="flex flex-col gap-0.5 sm:gap-2">
                <span 
                  className="text-amber animate-fade-in-up opacity-0"
                  style={{
                    fontFamily: 'Georgia',
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    textAlign: 'right',
                    lineHeight: '1.1',
                    fontSize: 'clamp(32px, 8vw, 96px)'
                  }}
                >
                  یوسف
                </span>
                <span className="animate-fade-in-up opacity-0 [animation-delay:150ms] text-[24px] min-[380px]:text-[28px] sm:text-[44px] lg:text-[72px] text-text-main">گروپ</span>
              </div>
            ) : (
              <>
                <span className="italic text-amber font-serif font-normal">Yousif</span> <br />
                <span className="text-text-main">Group</span>
              </>
            )}
          </motion.h1>

          {/* Slogan */}
          {lang === 'en' && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-arabic text-[10.5px] min-[380px]:text-[12px] sm:text-[13px] md:text-[15px] tracking-wider text-text-main/90 text-start mb-2 sm:mb-3 lg:mb-6" dir="rtl"
            >
              یوسف گروپ — دابین و دانانی سیستەمی گەرمی، ساردی، و غاز
            </motion.p>
          )}

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-[11.5px] min-[380px]:text-[13px] sm:text-[14px] md:text-[16px] lg:text-[18px] leading-[1.5] sm:leading-relaxed font-normal sm:font-light text-text-main/70 max-w-full mb-3 sm:mb-5 lg:mb-10"
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
            className="flex flex-row gap-2 min-[380px]:gap-2.5 sm:gap-3 lg:gap-4 w-full"
          >
            <a href="#services" className="bg-[#FFD23F] text-black font-bold text-[9px] min-[380px]:text-[10px] sm:text-[10px] lg:text-[11px] px-3.5 min-[380px]:px-5 sm:px-6 lg:px-9 py-2.5 min-[380px]:py-3 sm:py-3 lg:py-3.5 rounded-full tracking-[0.08em] sm:tracking-[0.2em] uppercase hover:bg-amber-light hover:-translate-y-px transition-all text-center flex items-center justify-center shadow-[0_4px_15px_rgba(255,210,63,0.35)] whitespace-nowrap">
              {lang === 'ku' ? 'خزمەتگوزارییەکانمان' : 'OUR SERVICES'}
            </a>
            <a href="#contact" className="bg-transparent border border-border-main text-text-main font-medium text-[9px] min-[380px]:text-[10px] sm:text-[10px] lg:text-[11px] px-3.5 min-[380px]:px-5 sm:px-6 lg:px-9 py-2.5 min-[380px]:py-3 sm:py-3 lg:py-3.5 rounded-full tracking-[0.08em] sm:tracking-[0.2em] uppercase hover:bg-white/10 hover:border-amber/40 transition-all text-center flex items-center justify-center whitespace-nowrap">
              {lang === 'ku' ? 'پەیوەندیمان پێوە بکە' : 'CONTACT US'}
            </a>
          </motion.div>
        </div>

        {/* Floating Large Image Cards (Below text on mobile, Right side on desktop) */}
        <div 
          className="w-full lg:w-auto flex-shrink-0 flex flex-col gap-3 sm:gap-4 lg:gap-6 pointer-events-none select-none justify-center items-center order-2"
        >
          {/* Card 1 (Top / First): Underfloor Heating Cross-Section */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className={`relative w-full max-w-[360px] sm:max-w-[460px] lg:w-[330px] xl:w-[400px] aspect-[16/9] mx-auto ${
              isKu 
                ? 'lg:mr-auto lg:-translate-x-[35px] xl:-translate-x-[50px]' 
                : 'lg:ml-auto lg:translate-x-[35px] xl:translate-x-[50px]'
            }`}
          >
            {/* Thick Yellow Outer Border + Soft Yellow Glow */}
            <div className="w-full h-full p-[3px] sm:p-[4px] lg:p-[5px] rounded-[16px] sm:rounded-[22px] lg:rounded-[30px] bg-[#FFD23F] shadow-[0_0_18px_rgba(255,210,63,0.45)]">
              {/* Thick White Inner Border */}
              <div className="w-full h-full p-[3px] sm:p-[4px] lg:p-[5px] rounded-[13px] sm:rounded-[18px] lg:rounded-[25px] bg-white">
                {/* Image */}
                <div className="w-full h-full rounded-[10px] sm:rounded-[14px] lg:rounded-[20px] overflow-hidden bg-[#0A0D14]">
                  <img 
                    src={heroUnderfloor} 
                    alt="Underfloor heating 3D cross-section"
                    className="w-full h-full object-cover object-center filter brightness-[1.04] contrast-[1.08]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2 (Bottom / Second): Modern White Radiator */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative w-full max-w-[360px] sm:max-w-[460px] lg:w-[420px] xl:w-[500px] aspect-[16/9] mx-auto lg:mx-0 lg:translate-x-0"
          >
            {/* Thick Yellow Outer Border + Soft Yellow Glow */}
            <div className="w-full h-full p-[3px] sm:p-[4px] lg:p-[5px] rounded-[16px] sm:rounded-[22px] lg:rounded-[30px] bg-[#FFD23F] shadow-[0_0_22px_rgba(255,210,63,0.5)]">
              {/* Thick White Inner Border */}
              <div className="w-full h-full p-[3px] sm:p-[4px] lg:p-[5px] rounded-[13px] sm:rounded-[18px] lg:rounded-[25px] bg-white">
                {/* Image */}
                <div className="w-full h-full rounded-[10px] sm:rounded-[14px] lg:rounded-[20px] overflow-hidden bg-[#0A0D14]">
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


