import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Instagram, Navigation, ExternalLink } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { motion } from 'motion/react';

export default function Contact() {
  const { lang } = useLanguage();
  const defaultBtnText = lang === 'ku' ? 'ناردنی نامە ←' : 'Send Message →';
  const sentBtnText = lang === 'ku' ? '✓ نامە نێردرا!' : '✓ Message Sent!';

  const [btnText, setBtnText] = useState(defaultBtnText);
  const [btnStyle, setBtnStyle] = useState<React.CSSProperties>({});
  const [formData, setFormData] = useState({ name: '', phone: '', service: '', message: '' });

  const mapUrl = "https://maps.app.goo.gl/Wwk32kn7dHM1N4h37";

  useEffect(() => {
    if (btnText !== sentBtnText && btnText !== defaultBtnText) {
      setBtnText(defaultBtnText);
    }
  }, [lang, btnText, defaultBtnText, sentBtnText]);

  const handleSubmit = () => {
    if (!formData.name) {
      alert(lang === 'ku' ? 'تکایە ناوەکەت بنووسە' : 'Please enter your name');
      return;
    }

    const targetPhoneNumber = "9647709700306";
    const nl = "%0A";
    let whatsappMessage = `*New Inquiry from Yousif Group Website*${nl}${nl}`;
    whatsappMessage += `*Name:* ${formData.name}${nl}`;
    if (formData.phone) whatsappMessage += `*Phone:* ${formData.phone}${nl}`;
    if (formData.service) whatsappMessage += `*Service:* ${formData.service}${nl}`;
    if (formData.message) whatsappMessage += `*Message:* ${formData.message}${nl}`;
    
    // Open whatsapp URL
    window.open(`https://wa.me/${targetPhoneNumber}?text=${whatsappMessage}`, '_blank');
    
    setBtnText(sentBtnText);
    setBtnStyle({ background: '#3B6D11', color: '#EAF3DE' });
    setTimeout(() => {
      setBtnText(defaultBtnText);
      setBtnStyle({});
      setFormData({ name: '', phone: '', service: '', message: '' });
    }, 3000);
  };

  const infoVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }
    }
  };

  return (
    <section id="contact" className="px-6 md:px-12 py-24 bg-navy overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-16">
        
        {/* Left Side: Info */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          variants={infoVariants}
        >
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
              { icon: <MapPin className="w-5 h-5 text-amber" />, label: lang === 'ku' ? 'ناونیشان (کراوە لە نەخشە)' : 'Location (Tap for Maps)', value: lang === 'ku' ? 'سلێمانی، سەر شەستی خوارەوە، بەرامبەر بەنزینخانەی بامۆک ٣' : 'Sulaymaniyah, Lower 60m Street, Opposite Bamok 3 Fuel Station', link: mapUrl, external: true },
              { icon: <Instagram className="w-5 h-5" />, label: lang === 'ku' ? 'ئینستاگرام' : 'Instagram', value: '@Yousif.group', link: 'https://instagram.com/Yousif.group', external: true }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-6 pb-6 border-b border-border-main last:border-b-0">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center shrink-0 hover:bg-white/5 transition-colors">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="text-[10px] tracking-widest uppercase text-muted mb-1 flex items-center gap-1.5">
                    {item.label}
                    {item.external && <ExternalLink className="w-3 h-3 text-amber opacity-80" />}
                  </div>
                  <div className="text-sm font-medium">
                    {item.link ? (
                      <a 
                        href={item.link} 
                        target={item.external ? "_blank" : undefined} 
                        rel={item.external ? "noreferrer" : undefined} 
                        className="text-text-main hover:text-amber transition-colors inline-flex items-center gap-2 group"
                      >
                        <span className="group-hover:underline underline-offset-4">{item.value}</span>
                        {item.external && <span className="text-xs text-amber font-mono opacity-80 group-hover:translate-x-0.5 transition-transform">↗</span>}
                      </a>
                    ) : (
                      <span className="text-text-main">{item.value}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div 
          className="bg-navy-mid border border-white/5 p-8 md:p-10 rounded-[40px] shadow-2xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          variants={formVariants}
        >
          <div className="font-serif text-3xl tracking-tight text-text-main mb-8">
            {lang === 'ku' ? 'ناردنی پرسیار' : 'Send an Inquiry'}
          </div>
          
          <div className="mb-6">
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
              {lang === 'ku' ? 'ناوی تەواو' : 'Full Name'}
            </label>
            <input 
              type="text" 
              placeholder={lang === 'ku' ? 'ناوەکەت' : 'Your name'} 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-navy border border-white/10 text-text-main px-4 py-3.5 text-sm font-light rounded-2xl outline-none focus:border-amber transition-colors placeholder:text-muted/60" 
            />
          </div>

          <div className="mb-6">
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
              {lang === 'ku' ? 'ژمارەی تەلەفۆن' : 'Phone Number'}
            </label>
            <input 
              type="tel" 
              placeholder="+964 ..." 
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-navy border border-white/10 text-text-main px-4 py-3.5 text-sm font-light rounded-2xl outline-none focus:border-amber transition-colors placeholder:text-muted/60" 
            />
          </div>

          <div className="mb-6">
            <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
              {lang === 'ku' ? 'جۆری خزمەتگوزاری' : 'Service Needed'}
            </label>
            <select 
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full bg-navy border border-white/10 text-text-main px-4 py-3.5 text-sm font-light rounded-2xl outline-none focus:border-amber transition-colors"
            >
              {lang === 'ku' ? (
                <>
                  <option value="">خزمەتگوزارییەک هەڵبژێرە...</option>
                  <option>سیستەمی هیت پەمپ</option>
                  <option>سیستەمی گەرمی ژێرزەوی</option>
                  <option>شۆفاژ</option>
                  <option>تۆڕی غاز</option>
                  <option>سۆلار</option>
                  <option>ئاگرکوژێنەوە</option>
                  <option>چەندین خزمەتگوزاری</option>
                </>
              ) : (
                <>
                  <option value="">Select a service...</option>
                  <option>Heat Pump System</option>
                  <option>Under-floor Heating System</option>
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
            <textarea 
              placeholder={lang === 'ku' ? 'زانیاری لەسەر پڕۆژەکەت بنووسە...' : 'Tell us about your project...'} 
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full min-h-[120px] resize-y bg-navy border border-white/10 text-text-main px-4 py-3.5 text-sm font-light rounded-2xl outline-none focus:border-amber transition-colors placeholder:text-muted/60"
            ></textarea>
          </div>

          <button 
            onClick={handleSubmit}
            style={btnStyle}
            className="w-full bg-white/5 border border-white/10 text-text-main font-semibold text-[11px] tracking-[0.2em] uppercase py-4 rounded-full transition-colors hover:bg-white/10"
          >
            {btnText}
          </button>
        </motion.div>

      </div>

      {/* Interactive Map Card Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="w-full bg-navy-mid border border-white/10 rounded-[32px] overflow-hidden relative shadow-2xl group"
      >
        <a 
          href={mapUrl}
          target="_blank"
          rel="noreferrer"
          className="block relative w-full h-[340px] md:h-[400px]"
        >
          {/* Embedded Google Map iframe with Sulaymaniyah, Ebrahim Ahmad query */}
          <iframe 
            title="Yousif Group Location Map"
            src="https://maps.google.com/maps?q=Ebrahim+Ahmad,+Sulaymaniyah,+Iraq&t=&z=15&ie=UTF8&iwloc=&output=embed" 
            className="w-full h-full border-0 grayscale invert opacity-70 group-hover:opacity-90 group-hover:grayscale-0 transition-all duration-500 pointer-events-none"
            loading="lazy"
          ></iframe>

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent pointer-events-none"></div>

          {/* Floating Location Badge */}
          <div className="absolute bottom-6 left-6 right-6 md:left-8 md:right-auto md:max-w-md bg-navy-mid/90 backdrop-blur-md border border-white/15 p-6 rounded-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-transform group-hover:scale-[1.02] duration-300">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber/10 border border-amber/30 flex items-center justify-center shrink-0 text-amber mt-0.5">
                <Navigation className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber font-semibold mb-0.5">
                  {lang === 'ku' ? 'شوێنی ئێمە لە نەخشەدا' : 'Our Map Location'}
                </div>
                <div className="text-base font-bold text-text-main">
                  {lang === 'ku' ? 'سلێمانی، سەر شەستی خوارەوە، بەرامبەر بەنزینخانەی بامۆک ٣' : 'Sulaymaniyah, Lower 60m Street, Opposite Bamok 3 Fuel Station'}
                </div>
                <div className="text-xs text-muted mt-0.5">
                  {lang === 'ku' ? 'داگرە بۆ کردنەوەی ڕاستەوخۆ لە نەخشە' : 'Tap to open directly in your maps app'}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-2 bg-amber text-navy font-bold text-xs px-4 py-2.5 rounded-full shadow-lg group-hover:bg-amber-light transition-colors whitespace-nowrap">
                <span>{lang === 'ku' ? 'کردنەوە لە نەخشە' : 'Open in Maps'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </a>
      </motion.div>
    </section>
  );
}

