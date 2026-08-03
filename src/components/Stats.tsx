import { useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import { motion, useInView } from 'motion/react';

function CountUpNumber({ 
  target, 
  suffix = '', 
  startVal = 1,
  duration = 5000, 
  isInView 
}: { 
  target: number; 
  suffix?: string; 
  startVal?: number;
  duration?: number; 
  isInView: boolean; 
}) {
  const [count, setCount] = useState(startVal);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Divide duration equally across all steps (linear progress)
      const steps = target - startVal + 1;
      const current = progress >= 1 ? target : Math.min(target, startVal + Math.floor(steps * progress));

      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, target, startVal, duration]);

  return (
    <span>
      {count}{suffix}
    </span>
  );
}

export default function Stats() {
  const { lang } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });

  const stats = [
    { 
      type: 'countUp',
      target: 10,
      suffix: '+',
      label: lang === 'ku' ? 'ساڵ لە کارکردن' : 'Years in Business' 
    },
    { 
      type: 'countUp',
      target: 6,
      suffix: '',
      label: lang === 'ku' ? 'خزمەتگوزارییە سەرەکییەکان' : 'Core Services' 
    },
    { 
      type: 'static',
      num: '1.8K+', 
      label: lang === 'ku' ? 'کڕیاری ڕازی' : 'Satisfied Clients' 
    },
    { 
      type: 'static',
      num: '24/7', 
      label: lang === 'ku' ? 'پاڵپشتی بەردەست' : 'Support Available' 
    },
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
      ref={containerRef}
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
            {stat.type === 'countUp' ? (
              <CountUpNumber 
                target={stat.target} 
                suffix={stat.suffix} 
                startVal={1} 
                duration={5000} 
                isInView={isInView} 
              />
            ) : (
              stat.num
            )}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/40">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
