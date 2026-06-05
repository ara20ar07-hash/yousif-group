import { Check } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function About() {
  const { lang } = useLanguage();

  const points = lang === 'ku' ? [
    'دانانی بڕوانامەداری سیستەمی غاز و ساردی و گەرمی',
    'پڕۆژەکان لە سلێمانی و هەرێمی کوردستان',
    'پاڵپشتی و چاککردنەوەی تەواو دوای فرۆشتن',
    'متمانەپێکراو لەلایەن خاوەن ماڵ، بەڵێندەر و بازرگانەکان',
    'چارەسەری سەردەمیانەی سۆلار و وزەی نوێبوەوە',
  ] : [
    'Certified installation of gas and HVAC systems',
    'Projects across Sulaymaniyah and the Kurdistan Region',
    'Full after-sales maintenance and support',
    'Trusted by homeowners, contractors, and businesses',
    'Modern solar and sustainable energy solutions',
  ];

  return (
    <section id="about" className="px-6 md:px-12 py-24 bg-navy-mid border-y border-border-main">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        <div>
          <span className="block text-[11px] tracking-[0.4em] uppercase text-amber font-semibold mb-4">
            {lang === 'ku' ? 'دەربارەی کۆمپانیا' : 'About The Company'}
          </span>
          <h2 className="font-display text-[60px] md:text-[80px] leading-[0.85] tracking-tight text-text-main mb-6">
            {lang === 'ku' ? (
              <>بنیاتنراو لەسەر <br /><span className="italic text-amber">متمانە</span></>
            ) : (
              <>Built on <br /><span className="italic text-amber">Trust</span></>
            )}
          </h2>
          <p className="text-lg leading-relaxed font-light text-white/70 max-w-[520px]">
            {lang === 'ku' 
              ? 'یوسف گروپ بەڵێندەرێکی پسپۆڕە لە سلێمانی بۆ دابینکردنی چارەسەری میکانیکی و وزە. ئێمە کار لە پڕۆژە نیشتەجێبوون، بازرگانی و پیشەسازییەکاندا دەکەین بە پابەندبوون بە کوالێتی و متمانەی درێژخایەن.' 
              : 'Yousif Group (یوسف گروپ) is a Sulaymaniyah-based specialist contractor delivering end-to-end mechanical and energy solutions. We work across residential, commercial, and industrial projects with a commitment to quality and long-term reliability.'}
          </p>
          
          <ul className="mt-8 flex flex-col gap-4">
            {points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-4 text-sm font-light text-muted">
                <span className="text-amber mt-0.5 shrink-0 text-xs">✦</span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="relative bg-navy-mid border border-white/5 p-10 rounded-3xl overflow-hidden">
            <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-amber to-amber/10" />
            
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-text-main text-[10px] tracking-widest uppercase px-4 py-2 rounded-full mb-8">
              <span className="text-amber">✦</span> {lang === 'ku' ? 'بەڵێنی ئێمە' : 'Our Promise'}
            </div>
            
            <p className="font-serif text-2xl md:text-3xl tracking-tight text-text-main leading-snug mb-6">
              {lang === 'ku' ? (
                <>ئەندازیاری ئاسوودەیی، <span className="italic text-amber">سەلامەتی و کارایی</span> لە هەر کارێکدا.</>
              ) : (
                <>Engineering comfort, <span className="italic text-amber">safety, and efficiency</span> in every installation.</>
              )}
            </p>
            
            <p className="text-sm font-light text-muted leading-relaxed">
              {lang === 'ku' 
                ? 'هەر پڕۆژەیەک بە هەڵسەنگاندنێکی ووردی شوێنەکە دەست پێدەکات و بە سیستەمێک کۆتایی دێت کە بۆ چەندین ساڵ کاردەکات. ئێمە شانازی بە کارەکانمانەوە دەکەین.' 
                : 'Every project begins with a careful site assessment, a transparent proposal, and ends with a system that performs reliably for years. We take pride in our craftsmanship and stand behind every installation we deliver.'}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
