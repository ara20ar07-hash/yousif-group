import { useState } from 'react';
import { Thermometer, Flame, Heater, Zap, Leaf, FireExtinguisher, ArrowUpRight } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useOwner } from './OwnerContext';
import ServiceDetailModal from './ServiceDetailModal';
import { motion } from 'motion/react';

export default function Services() {
  const { lang } = useLanguage();
  const { servicesData } = useOwner();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const getServiceIcon = (id: string) => {
    switch (id) {
      case '01': return <Thermometer className="w-8 h-8 mb-4 text-amber-500" />;
      case '02': return <Flame className="w-8 h-8 mb-4 text-orange-500" />;
      case '03': return <Heater className="w-8 h-8 mb-4 text-neutral-300" />;
      case '04': return <Zap className="w-8 h-8 mb-4 text-yellow-400" />;
      case '05': return <Leaf className="w-8 h-8 mb-4 text-emerald-400" />;
      case '06': return <FireExtinguisher className="w-8 h-8 mb-4 text-red-500" />;
      default: return <Thermometer className="w-8 h-8 mb-4 text-amber-500" />;
    }
  };

  const services = servicesData.map(svc => ({
    num: svc.id,
    icon: getServiceIcon(svc.id),
    titleAr: svc.titleAr || svc.titleKu,
    title: lang === 'ku' ? svc.titleKu : svc.titleEn,
    desc: lang === 'ku' ? svc.cardDescKu : svc.cardDescEn,
  }));

  const headerVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="services" className="px-6 md:px-12 py-24 bg-navy overflow-hidden">
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end mb-14"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={headerVariants}
      >
        <div>
          <span className="block text-[11px] tracking-[0.4em] uppercase text-amber font-bold mb-4">
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
        <p className="text-lg leading-relaxed font-normal text-text-main/80 max-w-[480px]">
          {lang === 'ku' 
            ? 'لە نەخشەسازییەوە تا دانان و چاککردنەوە، هەموو قۆناغەکان ئەنجام دەدەین — دابینکردنی سیستەمێکی متمانەپێکراو کە گونجاوە لەگەڵ کەشوهەوا و پێوەرەکانی بیناسازی لە عێراق.' 
            : "From design to installation and maintenance, we handle every stage — delivering reliable systems built for Iraq's climate and construction standards."}
        </p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-120px" }}
        variants={containerVariants}
      >
        {services.map((svc) => (
          <motion.div 
            key={svc.num} 
            onClick={() => {
              setSelectedId(svc.num);
              setIsOpen(true);
            }}
            variants={cardVariants}
            className="group relative bg-navy-mid rounded-[32px] p-8 border border-white/10 flex flex-col justify-between overflow-hidden hover:bg-navy-light hover:border-amber/30 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl"
          >
            <span className="absolute top-6 end-7 font-serif text-5xl text-text-main/10 group-hover:text-amber/15 leading-none transition-colors duration-300 pointer-events-none font-bold">
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
                <span className="block font-arabic text-xs uppercase tracking-widest text-amber-700 dark:text-[#E0D8D0]/60 font-semibold mb-1.5" dir="rtl">
                  {svc.titleAr}
                </span>
              )}
              <h3 className="font-serif text-2xl tracking-tight text-text-main mb-3 flex items-center gap-2 group-hover:text-amber transition-colors duration-250 font-medium">
                {svc.title}
              </h3>
              <p className="text-sm md:text-[15px] font-normal text-text-main/85 leading-[1.75] mb-6">
                {svc.desc}
              </p>
              
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber select-none">
                <span>{lang === 'ku' ? 'بینینی پڕۆژە و زانیاری زیاتر' : 'Explore System Details'}</span>
                <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

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
