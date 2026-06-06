import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Snowflake, Flame, Heater, Zap, Leaf, FireExtinguisher, 
  Plus, Trash2, Camera, MapPin, Calendar, CheckCircle2, Upload
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useOwner, ProjectPhoto } from './OwnerContext';

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId: string;
}

// Icon mapping helper
const getServiceIcon = (id: string, className: string = "w-6 h-6") => {
  switch (id) {
    case '01': return <Snowflake className={`${className} text-blue-400`} />;
    case '02': return <Flame className={`${className} text-orange-500`} />;
    case '03': return <Heater className={`${className} text-neutral-300`} />;
    case '04': return <Zap className={`${className} text-yellow-500`} />;
    case '05': return <Leaf className={`${className} text-emerald-400`} />;
    case '06': return <FireExtinguisher className={`${className} text-red-500`} />;
    default: return <Snowflake className={className} />;
  }
};

export default function ServiceDetailModal({ isOpen, onClose, initialServiceId }: ServiceDetailModalProps) {
  const { lang } = useLanguage();
  const { 
    isOwnerLoggedIn, 
    customPhotos, 
    addProjectPhoto, 
    deleteProjectPhoto,
    servicesData,
    updateServiceStep,
    updateServiceCore
  } = useOwner();

  const [activeTab, setActiveTab] = useState<string>(initialServiceId);

  // Form states for adding photos
  const [photoUrl, setPhotoUrl] = useState('');
  const [captionEn, setCaptionEn] = useState('');
  const [captionKu, setCaptionKu] = useState('');
  const [cityEn, setCityEn] = useState('');
  const [cityKu, setCityKu] = useState('');
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Steps editing states
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [tempStepTitleEn, setTempStepTitleEn] = useState('');
  const [tempStepTitleKu, setTempStepTitleKu] = useState('');
  const [tempStepDescEn, setTempStepDescEn] = useState('');
  const [tempStepDescKu, setTempStepDescKu] = useState('');

  // Core fields editing states
  const [isEditingCore, setIsEditingCore] = useState(false);
  const [tempCoreTitleEn, setTempCoreTitleEn] = useState('');
  const [tempCoreTitleKu, setTempCoreTitleKu] = useState('');
  const [tempCoreSubEn, setTempCoreSubEn] = useState('');
  const [tempCoreSubKu, setTempCoreSubKu] = useState('');
  const [tempCoreDescEn, setTempCoreDescEn] = useState('');
  const [tempCoreDescKu, setTempCoreDescKu] = useState('');
  const [tempCoreCardDescEn, setTempCoreCardDescEn] = useState('');
  const [tempCoreCardDescKu, setTempCoreCardDescKu] = useState('');

  // Find active service item from dynamic state
  const service = servicesData.find(s => s.id === activeTab) || servicesData[0];

  // Resolve pictures uploaded by the owner as requested:
  // "remove the existing pics and make the owner add its own pictures"
  const mergedPhotos = customPhotos[activeTab] || [];

  // File to base64 converter
  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLocal(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result as string);
      setIsUploadingLocal(false);
    };
    reader.onerror = () => {
      alert(lang === 'ku' ? 'خەتایەک ڕوویدا لە کاتی بارکردنی وێنەکەدا.' : 'Error converting local photo file.');
      setIsUploadingLocal(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) {
      alert(lang === 'ku' ? 'تکایە بەستەری وێنە یان وێنەیەک بەرزبکەرەوە' : 'Please upload or provide an image link first.');
      return;
    }

    addProjectPhoto(activeTab, {
      url: photoUrl,
      caption: captionEn || 'Completed Yousif Company Project installation.',
      captionKu: captionKu || 'پڕۆژەی کۆتایی پێهاتووی کۆمپانیای یوسف.',
      projectCity: cityEn || 'Sulaymaniyah',
      projectCityKu: cityKu || 'سلێمانی'
    });

    // Reset fields
    setPhotoUrl('');
    setCaptionEn('');
    setCaptionKu('');
    setCityEn('');
    setCityKu('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Inline editing actions
  const startEditingStep = (i: number, step: any) => {
    setEditingStepIndex(i);
    setTempStepTitleEn(step.titleEn);
    setTempStepTitleKu(step.titleKu);
    setTempStepDescEn(step.descEn);
    setTempStepDescKu(step.descKu);
  };

  const handleSaveStep = (i: number) => {
    updateServiceStep(activeTab, i, {
      titleEn: tempStepTitleEn,
      titleKu: tempStepTitleKu,
      descEn: tempStepDescEn,
      descKu: tempStepDescKu
    });
    setEditingStepIndex(null);
  };

  const startEditingCore = () => {
    setIsEditingCore(true);
    setTempCoreTitleEn(service.titleEn);
    setTempCoreTitleKu(service.titleKu);
    setTempCoreSubEn(service.subEn);
    setTempCoreSubKu(service.subKu);
    setTempCoreDescEn(service.descEn);
    setTempCoreDescKu(service.descKu);
    setTempCoreCardDescEn(service.cardDescEn || '');
    setTempCoreCardDescKu(service.cardDescKu || '');
  };

  const handleSaveCore = () => {
    updateServiceCore(activeTab, {
      titleEn: tempCoreTitleEn,
      titleKu: tempCoreTitleKu,
      subEn: tempCoreSubEn,
      subKu: tempCoreSubKu,
      descEn: tempCoreDescEn,
      descKu: tempCoreDescKu,
      cardDescEn: tempCoreCardDescEn,
      cardDescKu: tempCoreCardDescKu
    });
    setIsEditingCore(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 overflow-y-auto bg-navy/95 backdrop-blur-lg">
          {/* Backdrop trigger close */}
          <div className="absolute inset-0 cursor-pointer pointer-events-auto" onClick={onClose} />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="relative bg-navy w-full max-w-6xl min-h-screen md:min-h-0 md:rounded-[40px] border-0 md:border border-white/10 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[100vh]"
          >
            {/* Header section status */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-blue-400 via-amber to-red-500" />
            
            {/* Close Button / Custom layout bar */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-navy-mid/60 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-full bg-amber/10 text-amber text-[10px] tracking-widest uppercase font-semibold border border-amber/20">
                  {lang === 'ku' ? 'خزمەتگوزارییە متمانەپێکراوەکان' : 'Core Systems Portfolio'}
                </div>
                {isOwnerLoggedIn && (
                  <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
                    {lang === 'ku' ? 'مۆدی دەستکاریکردن چالاکە' : 'Owner Edit Active'}
                  </span>
                )}
              </div>
              
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-muted hover:text-text-main flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main scrollable body area split into left and right columns */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] h-full">
              
              {/* Left Column: Vertical tab list */}
              <div className="bg-navy-mid border-r border-white/5 p-6 flex flex-col gap-2">
                <div className="text-[10px] font-bold text-white/40 tracking-widest uppercase px-3 mb-3">
                  {lang === 'ku' ? 'بژاردەکانی سیستەم' : 'System Solutions'}
                </div>
                
                {servicesData.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setEditingStepIndex(null);
                        setIsEditingCore(false);
                      }}
                      className={`flex items-center gap-3.5 text-left px-4 py-3.5 rounded-2xl border text-sm transition-all duration-200 w-full font-light
                        ${isActive 
                          ? 'bg-navy-light border-amber/40 text-text-main font-medium shadow-[inset_4px_0_0_#FFD600]' 
                          : 'border-transparent bg-transparent text-muted hover:bg-white/5 hover:text-text-main'}`}
                    >
                      {getServiceIcon(tab.id, "w-5 h-5")}
                      <span className="truncate">{lang === 'ku' ? tab.titleKu : tab.titleEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Information description and photo panels */}
              <div className="p-8 md:p-12 overflow-y-auto flex flex-col gap-12">
                
                {/* Intro details with huge layout title */}
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(service.id, "w-8 h-8")}
                      <span className="font-mono text-amber text-sm font-semibold tracking-wider">SYSTEM 0{service.id}</span>
                    </div>
                    {isOwnerLoggedIn && !isEditingCore && (
                      <button
                        onClick={startEditingCore}
                        className="px-4 py-2 bg-amber/10 border border-amber/20 hover:bg-amber/20 text-amber text-[10px] tracking-widest uppercase font-bold rounded-full transition-all"
                      >
                        {lang === 'ku' ? 'دەستکاری دەقی سەرەکی' : 'Edit Main Texts'}
                      </button>
                    )}
                  </div>

                  {isOwnerLoggedIn && isEditingCore ? (
                    <div className="bg-white/5 p-6 md:p-8 rounded-[32px] border border-white/10 flex flex-col gap-4 mb-6">
                      <div className="text-xs uppercase tracking-wider text-amber font-semibold mb-2">
                        {lang === 'ku' ? 'مۆدی دەستکاری دەقی سەرەکی' : 'Editing Core Information'}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase text-muted tracking-wider mb-1">Title (English)</label>
                          <input 
                            type="text" 
                            className="w-full bg-navy border border-white/10 text-sm text-white px-3 py-2 rounded-lg focus:border-amber outline-none"
                            value={tempCoreTitleEn}
                            onChange={(e) => setTempCoreTitleEn(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-muted tracking-wider mb-1">Title (Kurdish)</label>
                          <input 
                            type="text" 
                            className="w-full bg-navy border border-white/10 text-sm text-white px-3 py-2 rounded-lg focus:border-amber outline-none"
                            value={tempCoreTitleKu}
                            onChange={(e) => setTempCoreTitleKu(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase text-muted tracking-wider mb-1">Subtitle (English)</label>
                          <input 
                            type="text" 
                            className="w-full bg-navy border border-white/10 text-sm text-white px-3 py-2 rounded-lg focus:border-amber outline-none"
                            value={tempCoreSubEn}
                            onChange={(e) => setTempCoreSubEn(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-muted tracking-wider mb-1">Subtitle (Kurdish)</label>
                          <input 
                            type="text" 
                            className="w-full bg-navy border border-white/10 text-sm text-white px-3 py-2 rounded-lg focus:border-amber outline-none"
                            value={tempCoreSubKu}
                            onChange={(e) => setTempCoreSubKu(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase text-muted tracking-wider mb-1">Brief Card Description (English)</label>
                          <textarea 
                            className="w-full bg-navy border border-white/10 text-sm text-white px-3 py-2 rounded-lg focus:border-amber outline-none font-sans"
                            rows={2}
                            value={tempCoreCardDescEn}
                            onChange={(e) => setTempCoreCardDescEn(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-muted tracking-wider mb-1">Brief Card Description (Kurdish)</label>
                          <textarea 
                            className="w-full bg-navy border border-white/10 text-sm text-white px-3 py-2 rounded-lg focus:border-amber outline-none font-sans"
                            rows={2}
                            value={tempCoreCardDescKu}
                            onChange={(e) => setTempCoreCardDescKu(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase text-muted tracking-wider mb-1">Full Detailed Description (English)</label>
                          <textarea 
                            className="w-full bg-navy border border-white/10 text-sm text-white px-3 py-2 rounded-lg focus:border-amber outline-none font-sans"
                            rows={4}
                            value={tempCoreDescEn}
                            onChange={(e) => setTempCoreDescEn(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-muted tracking-wider mb-1">Full Detailed Description (Kurdish)</label>
                          <textarea 
                            className="w-full bg-navy border border-white/10 text-sm text-white px-3 py-2 rounded-lg focus:border-amber outline-none font-sans"
                            rows={4}
                            value={tempCoreDescKu}
                            onChange={(e) => setTempCoreDescKu(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end mt-2">
                        <button 
                          onClick={() => setIsEditingCore(false)}
                          className="px-4 py-2 bg-white/10 text-[10px] tracking-widest uppercase rounded-full text-white hover:bg-white/20 transition-all font-semibold"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={handleSaveCore}
                          className="px-4 py-2 bg-amber text-navy text-[10px] tracking-widest uppercase rounded-full font-bold hover:bg-amber-bright transition-all"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h2 className="font-display text-4xl md:text-5xl tracking-tight text-text-main mb-3">
                        {lang === 'ku' ? service.titleKu : service.titleEn}
                      </h2>
                      <p className="text-sm font-light uppercase tracking-widest text-muted mb-6">
                        {lang === 'ku' ? service.subKu : service.subEn}
                      </p>
                      
                      <p className="text-md leading-relaxed text-white/80 font-light max-w-4xl bg-white/5 p-6 rounded-3xl border border-white/5">
                        {lang === 'ku' ? service.descKu : service.descEn}
                      </p>
                    </>
                  )}
                </div>

                {/* How it Works / Steps List */}
                <div>
                  <h3 className="font-serif text-2xl text-text-main mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber" />
                    <span>{lang === 'ku' ? 'پرۆسەی ئەندازیاری و چۆنیەتی کارکردن' : 'Engineering Process & How it Works'}</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {service.steps.map((st, i) => (
                      <div key={i} className="relative bg-navy-mid border border-white/5 p-6 rounded-3xl flex flex-col justify-between min-h-[220px]">
                        <div>
                          <div className="absolute top-4 right-4 text-3xl font-mono text-white/5 font-extrabold leading-none">
                            0{i+1}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-amber/10 text-amber flex items-center justify-center text-xs font-bold mb-4">
                            {i+1}
                          </div>

                          {isOwnerLoggedIn && editingStepIndex === i ? (
                            <div className="flex flex-col gap-3 mt-2 text-left">
                              <div className="text-xs uppercase tracking-wider text-amber font-semibold mb-1">
                                {lang === 'ku' ? 'دەستکاریکردنی هەنگاو' : 'Modify Step'}
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase text-muted tracking-wider mb-0.5">Title (English)</label>
                                <input 
                                  type="text" 
                                  className="w-full bg-navy border border-white/10 text-xs text-white p-2 rounded-lg focus:border-amber outline-none"
                                  value={tempStepTitleEn}
                                  onChange={(e) => setTempStepTitleEn(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase text-muted tracking-wider mb-0.5">Title (Kurdish)</label>
                                <input 
                                  type="text" 
                                  className="w-full bg-navy border border-white/10 text-xs text-white p-2 rounded-lg focus:border-amber outline-none"
                                  value={tempStepTitleKu}
                                  onChange={(e) => setTempStepTitleKu(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase text-muted tracking-wider mb-0.5">Description (English)</label>
                                <textarea 
                                  className="w-full bg-navy border border-white/10 text-xs text-white p-2 rounded-lg focus:border-amber outline-none"
                                  rows={3}
                                  value={tempStepDescEn}
                                  onChange={(e) => setTempStepDescEn(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase text-muted tracking-wider mb-0.5">Description (Kurdish)</label>
                                <textarea 
                                  className="w-full bg-navy border border-white/10 text-xs text-white p-2 rounded-lg focus:border-amber outline-none"
                                  rows={3}
                                  value={tempStepDescKu}
                                  onChange={(e) => setTempStepDescKu(e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2 justify-end mt-2">
                                <button 
                                  type="button"
                                  onClick={() => setEditingStepIndex(null)}
                                  className="px-2.5 py-1 bg-white/10 text-[9px] tracking-widest uppercase rounded-md text-white hover:bg-white/20 transition-all font-semibold"
                                >
                                  Cancel
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => handleSaveStep(i)}
                                  className="px-2.5 py-1 bg-amber text-navy text-[9px] tracking-widest uppercase rounded-md font-bold hover:bg-amber-bright transition-all"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-serif text-lg text-text-main mb-2">
                                {lang === 'ku' ? st.titleKu : st.titleEn}
                              </h4>
                              <p className="text-xs leading-relaxed text-muted font-light">
                                {lang === 'ku' ? st.descKu : st.descEn}
                              </p>
                            </>
                          )}
                        </div>

                        {isOwnerLoggedIn && editingStepIndex !== i && (
                          <button
                            type="button"
                            onClick={() => startEditingStep(i, st)}
                            className="mt-4 px-3 py-1.5 bg-amber/10 border border-amber/20 hover:bg-amber/20 text-amber text-[9px] tracking-widest uppercase font-bold rounded-lg transition-all self-start"
                          >
                            {lang === 'ku' ? 'دەستکاری هەنگاو' : 'Edit Step'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Photo Examples Placeholders / Project Portfolio */}
                <div>
                  <h3 className="font-serif text-2xl text-text-main mb-6 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-amber" />
                    <span>{lang === 'ku' ? 'وێنەی پڕۆژە ڕاستەقینەکان' : 'Real Projects Installation Gallery'}</span>
                  </h3>

                  {mergedPhotos.length === 0 ? (
                    <div className="bg-navy-mid border border-dashed border-white/10 rounded-3xl p-12 text-center text-muted text-sm">
                      {lang === 'ku' ? 'هیچ وێنەیەکی پڕۆژە نییە بۆ ئەم خزمەتگوزارییە هێشتا. با شتێک زیاد بکەین!' : 'No active portfolio images uploaded for this system category yet.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {mergedPhotos.map((img) => (
                        <div key={img.id} className="group relative bg-navy-mid rounded-3xl overflow-hidden border border-white/5 flex flex-col h-full shadow-lg">
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-navy-light">
                            <img 
                              src={img.url} 
                              alt={lang === 'ku' ? img.captionKu : img.caption}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                // fallback if image is broken or blank
                                e.currentTarget.src = "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=800&q=80";
                              }}
                            />
                            {/* Overlay tag */}
                            <div className="absolute top-4 left-4 bg-navy/80 text-white text-[9px] tracking-widest uppercase px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm border border-white/10">
                              <MapPin className="w-3 h-3 text-amber animate-pulse" />
                              <span>{lang === 'ku' ? img.projectCityKu : img.projectCity}</span>
                            </div>

                            {/* Delete Button (Only shown if Owner is logged in) */}
                            {isOwnerLoggedIn && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(lang === 'ku' ? 'دڵنیایت لە سڕینەوەی ئەم وێنەیە؟' : 'Are you sure you want to delete this project photo?')) {
                                    deleteProjectPhoto(activeTab, img.id);
                                  }
                                }}
                                className="absolute top-4 right-4 w-9 h-9 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center rounded-full shadow-md transition-colors"
                                title="Delete Photo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <p className="text-sm text-text-main leading-relaxed font-light mb-4">
                              {lang === 'ku' ? img.captionKu : img.caption}
                            </p>
                            <div className="flex items-center justify-between font-mono text-[9px] text-white/40 uppercase tracking-widest pt-3 border-t border-white/5">
                              <span>Yousif Company</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{img.date}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Special OWNER upload options zone (Only visible when logged in) */}
                {isOwnerLoggedIn && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-amber/30 bg-amber/5 rounded-[32px] p-8 md:p-10 relative overflow-hidden text-left"
                  >
                    {/* Glowing structural background element */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber/10 blur-3xl pointer-events-none" />
                    
                    <h3 className="font-serif text-2xl text-text-main mb-1 flex items-center gap-2">
                      <Plus className="w-6 h-6 text-amber" />
                      <span>{lang === 'ku' ? 'زیادکردنی وێنەی پڕۆژەی تازە' : 'Owner Panel: Add New Installation Works'}</span>
                    </h3>
                    <p className="text-xs text-muted leading-relaxed uppercase tracking-widest mb-8">
                      {lang === 'ku' ? 'بۆ بڵاوکردنەوەی پڕۆژەی نوێ لەسەر ماڵپەڕەکە' : 'Upload an image or paste a web URL to display active company sites.'}
                    </p>

                    <form onSubmit={handleAddPhotoSubmit} className="flex flex-col gap-6">
                      
                      {/* Image Source Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        
                        {/* File Upload zone */}
                        <div>
                          <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
                            {lang === 'ku' ? 'شێواز یەک: بارکردنی دەستی وێنە' : 'Option A: Choose Local Image File'}
                          </label>
                          <div className="relative border border-dashed border-white/20 hover:border-amber/50 rounded-2xl p-6 text-center transition-colors cursor-pointer bg-navy-mid flex flex-col items-center justify-center min-h-[143px] group">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleLocalFileSelect}
                              ref={fileInputRef}
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                            />
                            {photoUrl && photoUrl.startsWith('data:image') ? (
                              <div className="flex items-center gap-3">
                                <img src={photoUrl} className="w-16 h-12 object-cover rounded-md border border-white/20" alt="uploaded file preview" />
                                <span className="text-xs text-emerald-400 font-semibold uppercase">{lang === 'ku' ? 'وێنەکە ئامادەیە ✓' : 'File Loaded ✓'}</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-white/30 mb-2 group-hover:text-amber transition-colors" />
                                <p className="text-xs font-semibold text-text-main mb-1">{lang === 'ku' ? 'وێنەکەت لێرە دابنێ' : 'Select Image File'}</p>
                                <p className="text-[10px] text-muted">{lang === 'ku' ? 'یان کلیک بکە بۆ گەڕان' : 'Supports JPG, PNG, WebP format'}</p>
                              </>
                            )}
                            {isUploadingLocal && <span className="absolute inset-0 bg-navy/90 text-sm flex items-center justify-center text-amber animate-pulse">Reading file data...</span>}
                          </div>
                        </div>

                        {/* External URL option */}
                        <div>
                          <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">
                            {lang === 'ku' ? 'شێواز دوو: لکاندنی لینکی وێنە' : 'Option B: Paste Web / Unsplash URL'}
                          </label>
                          <input 
                            type="url" 
                            placeholder="https://images.unsplash.com/..." 
                            value={photoUrl.startsWith('data:image') ? '' : photoUrl}
                            onChange={(e) => setPhotoUrl(e.target.value)}
                            disabled={photoUrl.startsWith('data:image')}
                            className="w-full bg-navy border border-white/10 text-text-main px-4 py-3.5 text-sm font-light rounded-2xl outline-none focus:border-amber transition-colors placeholder:text-muted/40 min-h-[113px] disabled:opacity-40" 
                          />
                        </div>
                      </div>

                      {/* Photo details: Caption and City */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">{lang === 'ku' ? 'لێدوانی وێنە بە ئینگلیزی' : 'Caption (English)'}</label>
                          <textarea 
                            placeholder="e.g., Installation of high-output condenser at villa gardens." 
                            value={captionEn}
                            onChange={(e) => setCaptionEn(e.target.value)}
                            className="w-full bg-navy border border-white/10 text-text-main px-4 py-3 text-sm font-light rounded-2xl outline-none focus:border-amber transition-colors placeholder:text-muted/40" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">{lang === 'ku' ? 'لێدوانی وێنە بە کوردی' : 'Caption (Kurdish)'}</label>
                          <textarea 
                            placeholder="بۆ نموونە: دانانی یەکەی دەرەوەی فێنککەرەوە و هێڵەکان." 
                            value={captionKu}
                            onChange={(e) => setCaptionKu(e.target.value)}
                            className="w-full bg-navy border border-white/10 text-text-main px-4 py-3 text-sm font-light rounded-2xl outline-none focus:border-amber transition-colors placeholder:text-muted/40" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">{lang === 'ku' ? 'شارەکە (بە ئینگلیزی)' : 'City (English)'}</label>
                          <input 
                            type="text" 
                            placeholder="e.g., Sulaymaniyah" 
                            value={cityEn}
                            onChange={(e) => setCityEn(e.target.value)}
                            className="w-full bg-navy border border-white/10 text-text-main px-4 py-3 text-sm font-light rounded-2xl outline-none focus:border-amber transition-colors placeholder:text-muted/40" 
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] tracking-widest uppercase text-muted mb-2">{lang === 'ku' ? 'شارەکە (بە کوردی)' : 'City (Kurdish)'}</label>
                          <input 
                            type="text" 
                            placeholder="بۆ نموونە: سلێمانی" 
                            value={cityKu}
                            onChange={(e) => setCityKu(e.target.value)}
                            className="w-full bg-navy border border-white/10 text-text-main px-4 py-3 text-sm font-light rounded-2xl outline-none focus:border-amber transition-colors placeholder:text-muted/40" 
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="self-start px-8 py-4 bg-amber text-navy font-bold text-xs tracking-widest uppercase rounded-full hover:bg-amber-bright transition-all inline-flex items-center gap-2 mt-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{lang === 'ku' ? 'وێنەکە بڵاوبکەرەوە' : 'Publish Project Image'}</span>
                      </button>
                    </form>
                  </motion.div>
                )}

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
