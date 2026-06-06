import { useState } from 'react';
import { Snowflake, Flame, Heater, Zap, Leaf, FireExtinguisher, ArrowUpRight } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useOwner } from './OwnerContext';
import ServiceDetailModal from './ServiceDetailModal';

export default function Services() {
  const { lang } = useLanguage();
  const { servicesData } = useOwner();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const getServiceIcon = (id: string) => {
    switch (id) {
      case '01': return <Snowflake className="w-8 h-8 mb-4 text-blue-400" />;
      case '02': return <Flame className="w-8 h-8 mb-4 text-orange-500" />;
      case '03': return <Heater className="w-8 h-8 mb-4 text-neutral-300" />;
      case '04': return <Zap className="w-8 h-8 mb-4 text-yellow-400" />;
      case '05': return <Leaf className="w-8 h-8 mb-4 text-emerald-400" />;
      case '06': return <FireExtinguisher className="w-8 h-8 mb-4 text-red-500" />;
      default: return <Snowflake className="w-8 h-8 mb-4 text-blue-400" />;
    }
  };

  const services = servicesData.map(svc => ({
    num: svc.id,
    icon: getServiceIcon(svc.id),
    titleAr: svc.titleAr || svc.titleKu,
    title: lang === 'ku' ? svc.titleKu : svc.titleEn,
    desc: lang === 'ku' ? svc.cardDescKu : svc.cardDescEn,
  }));

  return (
    <section id="services" className="px-6 md:px-12 py-24 bg-navy">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end mb-14">
        <div>
          <span className="block text-[11px] tracking-[0.4em] uppercase text-amber font-semibold mb-4">
            {lang === 'ku' ? 'خستنەڕووی تایبەتمەندی' : 'Feature Presentation'}
          </span>
          <h2 className="font-display text-[60px] md:text-[80px] leading-[0.85] tracking-tight text-text-main">
            {lang === 'ku' ? (
              <>چارەسەرەکانی <br /> <span className="italic text-amber">سیستەم</span></>
            ) : (
              <>System <br /> <span className="italic text-amber">Solutions</span></>
            )}
          </h2>
        </div>
        <p className="text-lg leading-relaxed font-light text-white/70 max-w-[480px]">
          {lang === 'ku' 
            ? 'لە نەخشەسازییەوە تا دانان و چاککردنەوە، هەموو قۆناغەکان ئەنجام دەدەین — دابینکردنی سیستەمێکی متمانەپێکراو کە گونجاوە لەگەڵ کەشوهەوا و پێوەرەکانی بیناسازی لە عێراق.' 
            : "From design to installation and maintenance, we handle every stage — delivering reliable systems built for Iraq's climate and construction standards."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc) => (
          <div 
            key={svc.num} 
            onClick={() => {
              setSelectedId(svc.num);
              setIsOpen(true);
            }}
            className="group relative bg-navy-mid rounded-[32px] p-8 border border-white/5 flex flex-col justify-between overflow-hidden hover:bg-navy-light hover:border-amber/20 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl"
          >
            <span className="absolute top-6 right-7 font-serif text-5xl text-white/5 group-hover:text-amber/5 leading-none transition-colors duration-300 pointer-events-none">
              {svc.num}
            </span>
            
            <div className="flex justify-between items-start">
              {svc.icon}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8 rounded-full bg-amber/10 text-amber flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            
            <div className="mt-8">
              {lang === 'en' && (
                <span className="block font-arabic text-[10px] uppercase tracking-widest text-[#E0D8D0]/40 mb-1.5" dir="rtl">
                  {svc.titleAr}
                </span>
              )}
              <h3 className="font-serif text-2xl tracking-tight text-text-main mb-2.5 flex items-center gap-2 group-hover:text-amber transition-colors duration-250">
                {svc.title}
              </h3>
              <p className="text-sm font-light text-muted leading-[1.7] mb-6">
                {svc.desc}
              </p>
              
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber select-none">
                <span>{lang === 'ku' ? 'بینینی پڕۆژە و زانیاری زیاتر' : 'Explore System Details'}</span>
                <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedId && (
        <ServiceDetailModal
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setSelectedId(null);
          }}
          initialServiceId={selectedId}
        />
      )}
    </section>
  );
}
