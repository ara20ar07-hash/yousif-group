import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Instagram } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export default function Contact() {
  const { lang } = useLanguage();
  const defaultBtnText = lang === 'ku' ? 'ناردنی نامە ←' : 'Send Message →';
  const sentBtnText = lang === 'ku' ? '✓ نامە نێردرا!' : '✓ Message Sent!';

  const [btnText, setBtnText] = useState(defaultBtnText);
  const [btnStyle, setBtnStyle] = useState({});

  useEffect(() => {
    if (btnText !== sentBtnText && btnText !== defaultBtnText) {
      setBtnText(defaultBtnText);
    }
  }, [lang, btnText, defaultBtnText, sentBtnText]);

  const handleSubmit = () => {
    setBtnText(sentBtnText);
    setBtnStyle({ background: '#3B6D11', color: '#EAF3DE' });
    setTimeout(() => {
      setBtnText(defaultBtnText);
      setBtnStyle({});
    }, 3000);
  };

  return (
    <section id="contact" className="px-6 md:px-12 py-24 bg-navy">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Left Side: Info */}
        <div>
          <span className="block text-[11px] tracking-[0.4em] uppercase text-amber font-semibold mb-4">
            {lang === 'ku' ? 'پەیوەندیمان پێوە بکە' : 'Get in Touch'}
          </span>
          <h2 className="font-display text-[60px] md:text-[80px] leading-[0.85] tracking-tight text-text-main mb-6">
            {lang === 'ku' ? (
              <>دەستپێکردنی <br /><span className="italic text-amber">پڕۆژە</span></>
            ) : (
              <>Start a <br /><span className="italic text-amber">Project</span></>
            )}
          </h2>
          <p className="text-lg leading-relaxed font-light text-white/70 mb-10">
            {lang === 'ku' 
              ? 'پەیوەندی بە تیمەکەمانەوە بکە بۆ ڕاوێژی بێبەرامبەر و وەرگرتنی نرخ.' 
              : 'Contact our team for a free consultation and quote on any of our services.'}
          </p>

          <div className="flex flex-col gap-6">
            {[
              { icon: <Phone className="w-5 h-5" />, label: lang === 'ku' ? 'تەلەفۆن' : 'Phone', value: '+964 770 970 0306', link: 'tel:+9647709700306' },
              { icon: <Mail className="w-5 h-5" />, label: lang === 'ku' ? 'ئیمەیڵ' : 'Email', value: 'Yusf.hawramy27@gmail.com', link: 'mailto:Yusf.hawramy27@gmail.com' },
              { icon: <MapPin className="w-5 h-5" />, label: lang === 'ku' ? 'ناونیشان' : 'Location', value: lang === 'ku' ? 'سلێمانی، هەرێمی کوردستان، عێراق' : 'Sulaymaniyah, Kurdistan Region, Iraq', link: null },
              { icon: <Instagram className="w-5 h-5" />, label: lang === 'ku' ? 'ئینستاگرام' : 'Instagram', value: '@Yousif.group', link: 'https://instagram.com/Yousif.group' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-6 pb-6 border-b border-border-main last:border-b-0">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center shrink-0 hover:bg-white/5 transition-colors">
                  {item.icon}
                </div>
                <div>
                  <div className="text-[10px] tracking-widest uppercase text-muted mb-1">{item.label}</div>
                  <div className="text-sm font-medium">
                    {item.link ? (
                      <a href={item.link} target={item.label === 'Instagram' || item.label === 'ئینستاگرام' ? "_blank" : undefined} rel="noreferrer" className="text-text-main hover:text-amber transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <span className="text-text-main">{item.value}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="bg-navy-mid border border-white/5 p-8 md:p-10 rounded-[40px]">
          <div className="font-serif text-3xl tracking-tight text-text-main mb-8">
            {lang === 'ku' ? 'ناردنی پرسیار' : 'Send an Inquiry'}
          </div>
          
          <div className="mb-6">
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
              {lang === 'ku' ? 'ناوی تەواو' : 'Full Name'}
            </label>
            <input type="text" placeholder={lang === 'ku' ? 'ناوەکەت' : 'Your name'} className="w-full bg-navy border border-white/10 text-text-main px-4 py-3.5 text-sm font-light rounded-2xl outline-none focus:border-amber transition-colors placeholder:text-muted/60" />
          </div>

          <div className="mb-6">
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
              {lang === 'ku' ? 'ژمارەی تەلەفۆن' : 'Phone Number'}
            </label>
            <input type="tel" placeholder="+964 ..." className="w-full bg-navy border border-white/10 text-text-main px-4 py-3.5 text-sm font-light rounded-2xl outline-none focus:border-amber transition-colors placeholder:text-muted/60" />
          </div>

          <div className="mb-6">
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
              {lang === 'ku' ? 'جۆری خزمەتگوزاری' : 'Service Needed'}
            </label>
            <select className="w-full bg-navy border border-white/10 text-text-main px-4 py-3.5 text-sm font-light rounded-2xl outline-none focus:border-amber transition-colors">
              {lang === 'ku' ? (
                <>
                  <option value="">خزمەتگوزارییەک هەڵبژێرە...</option>
                  <option>سیستەمی ساردی</option>
                  <option>سیستەمی گەرمی</option>
                  <option>شۆفاژ</option>
                  <option>تۆڕی غاز</option>
                  <option>سۆلار</option>
                  <option>ئاگرکوژێنەوە</option>
                  <option>چەندین خزمەتگوزاری</option>
                </>
              ) : (
                <>
                  <option value="">Select a service...</option>
                  <option>Cooling System</option>
                  <option>Heating System</option>
                  <option>Radiator Heating</option>
                  <option>Gas Network</option>
                  <option>Solar System</option>
                  <option>Fire Suppression</option>
                  <option>Multiple Services</option>
                </>
              )}
            </select>
          </div>

          <div className="mb-8">
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
              {lang === 'ku' ? 'نامە' : 'Message'}
            </label>
            <textarea placeholder={lang === 'ku' ? 'زانیاری لەسەر پڕۆژەکەت بنووسە...' : 'Tell us about your project...'} className="w-full min-h-[120px] resize-y bg-navy border border-white/10 text-text-main px-4 py-3.5 text-sm font-light rounded-2xl outline-none focus:border-amber transition-colors placeholder:text-muted/60"></textarea>
          </div>

          <button 
            onClick={handleSubmit}
            style={btnStyle}
            className="w-full bg-white/5 border border-white/10 text-text-main font-semibold text-[11px] tracking-[0.2em] uppercase py-4 rounded-full transition-colors hover:bg-white/10"
          >
            {btnText}
          </button>
        </div>

      </div>
    </section>
  );
}
