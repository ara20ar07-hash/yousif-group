export default function Stats() {
  const stats = [
    { num: '5+', label: 'Years in Business' },
    { num: '6', label: 'Core Services' },
    { num: '1.8K+', label: 'Satisfied Clients' },
    { num: '24/7', label: 'Support Available' },
  ];

  return (
    <div className="flex flex-wrap lg:flex-nowrap justify-center bg-navy border-b border-border-main">
      {stats.map((stat, i) => (
        <div 
          key={i} 
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
        </div>
      ))}
    </div>
  );
}
