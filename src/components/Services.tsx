import { Snowflake, Flame, Heater, Zap, Leaf, FireExtinguisher } from 'lucide-react';

export default function Services() {
  const services = [
    {
      num: '01',
      icon: <Snowflake className="w-8 h-8 mb-4 text-blue-400" />,
      titleAr: 'سیستەمی ساردی',
      title: 'Cooling Systems',
      desc: 'Supply and installation of central air conditioning, split units, and ducted cooling systems optimised for the harsh summer heat.',
    },
    {
      num: '02',
      icon: <Flame className="w-8 h-8 mb-4 text-orange-500" />,
      titleAr: 'سیستەمی گەرمی',
      title: 'Heating Systems',
      desc: 'Expert design and fitting of underfloor, radiator, and central heating solutions keeping homes warm through cold winters.',
    },
    {
      num: '03',
      icon: <Heater className="w-8 h-8 mb-4 text-neutral-300" />,
      titleAr: 'شۆفاژ',
      title: 'Radiator Heating',
      desc: 'Supply and installation of modern radiator systems, including full boiler setup and hydronic heating networks.',
    },
    {
      num: '04',
      icon: <Zap className="w-8 h-8 mb-4 text-yellow-400" />,
      titleAr: 'تۆڕی غاز',
      title: 'Gas Networks',
      desc: 'Full-scale gas pipeline engineering, distribution networks, and connection services for residential and commercial properties.',
    },
    {
      num: '05',
      icon: <Leaf className="w-8 h-8 mb-4 text-emerald-400" />,
      titleAr: 'سۆلار',
      title: 'Solar Systems',
      desc: 'Clean-energy solar panel installation for homes and businesses — reducing electricity bills with sustainable, renewable power.',
    },
    {
      num: '06',
      icon: <FireExtinguisher className="w-8 h-8 mb-4 text-red-500" />,
      titleAr: 'ئاگرکوژێنەوە',
      title: 'Fire Suppression',
      desc: 'Design and installation of fire detection and suppression systems to keep your property and people protected.',
    },
  ];

  return (
    <section id="services" className="px-6 md:px-12 py-24 bg-navy">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end mb-14">
        <div>
          <span className="block text-[11px] tracking-[0.4em] uppercase text-amber font-semibold mb-4">
            Feature Presentation
          </span>
          <h2 className="font-display text-[60px] md:text-[80px] leading-[0.85] tracking-tight text-text-main">
            System <br /> <span className="italic text-amber">Solutions</span>
          </h2>
        </div>
        <p className="text-lg leading-relaxed font-light text-white/70 max-w-[480px]">
          From design to installation and maintenance, we handle every stage — delivering reliable systems built for Iraq's climate and construction standards.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc) => (
          <div 
            key={svc.num} 
            className="group relative bg-navy-mid rounded-3xl p-8 border border-white/5 flex flex-col justify-between overflow-hidden hover:bg-navy-light transition-colors duration-300"
          >
            <span className="absolute top-6 right-7 font-serif text-5xl text-white/5 leading-none pointer-events-none">
              {svc.num}
            </span>
            
            {svc.icon}
            
            <div className="mt-8">
              <span className="block font-arabic text-[10px] uppercase tracking-widest text-white/40 mb-1.5" dir="rtl">
                {svc.titleAr}
              </span>
              <h3 className="font-serif text-2xl tracking-tight text-text-main mb-2.5">
                {svc.title}
              </h3>
              <p className="text-sm font-light text-muted leading-[1.7]">
                {svc.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
