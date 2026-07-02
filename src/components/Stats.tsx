import { useLanguage } from './LanguageContext';
import { motion } from 'motion/react';

export default function Stats() {
  const { lang } = useLanguage();

  const stats = [
    { num: '6+', label: lang === 'ku' ? 'ساڵ لە کارکردن' : 'Years in Business' },
    { num: '6', label: lang === 'ku' ? 'خزمەتگوزارییە سەرەکییەکان' : 'Core Services' },
    { num: '1.8K+', label: lang === 'ku' ? 'کڕیاری ڕازی' : 'Satisfied Clients' },
    { num: '24/7', label: lang === 'ku' ? 'پاڵپشتی بەردەست' : 'Support Available' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <motion.div 
      className="flex flex-wrap lg:flex-nowrap justify-center bg-navy border-b border-border-main"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
    >
      {stats.map((stat, i) => (
        <motion.div 
          key={i} 
          variants={itemVariants}
          className={`flex-1 min-w-[50%] lg:min-w-0 max-w-[260px] p-8 lg:px-14 text-center border-b lg:border-b-0 border-border-main ${
            i !== stats.length - 1 ? 'lg:border-r' : ''
          } ${i % 2 === 0 ? 'border-r lg:border-r' : ''}`}
        >
          <div className="font-serif text-[40px] text-text-main tracking-tight leading-none mb-3">
            {stat.num}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/40">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
