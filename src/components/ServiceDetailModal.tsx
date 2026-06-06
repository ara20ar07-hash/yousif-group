import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Snowflake, Flame, Heater, Zap, Leaf, FireExtinguisher, 
  Plus, Trash2, Camera, MapPin, Calendar, CheckCircle2, ArrowRight, Upload
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useOwner, defaultPhotos, ProjectPhoto } from './OwnerContext';

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

const serviceDetailsData = [
  {
    id: '01',
    titleEn: 'Cooling Systems',
    titleKu: 'سیستەمی ساردی',
    subEn: 'Central VRF, Ducted Splits, & High-efficiency cooling grids.',
    subKu: 'سیستەمی فێنککەرەوەی ناوەندی، دەکتی سپلیت و یەکەکانی فێنککردنەوە.',
    descEn: 'We deliver comprehensive thermal load engineering. Yousif Company installs state-of-the-art Variable Refrigerant Flow (VRF) and inverter systems customized specifically for the severe Iraqi summer temperatures exceed 50°C.',
    descKu: 'ئێمە لێکۆڵینەوەی تێرماڵی چڕ ئەنجام دەدەین. یوسف کۆمپانی هەڵدەستێت بە بەستنی سیستمە سەرەکی و مۆدێرنەکانی مارکەی جیهانی و تەکنەلۆجیای (VRF) کە گونجاوە بۆ هاوینی گەرمی عێراق و کوردستان کە پلەی گەرمی دەگاتە زیاتر لە ٥٠ پلەی سەدی.',
    steps: [
      {
        titleEn: 'Thermal Load Calculation',
        titleKu: 'حیسابکردنی بڕی گەرمی',
        descEn: 'We measure exact space volume, window directions, insulation efficiency, and roof exposure using professional software.',
        descKu: 'ئەندازە گرتنی ووردی رووبەر، ئاڕاستەی تیشکی خۆر، کاریگەری دەرگا و پەنجەرەکان بۆ دیاریکردنی هێزی مەکینەی فێنککەرەوە.'
      },
      {
        titleEn: 'Continuous Duct Engineering',
        titleKu: 'ڕاکێشان و سازدانی دەکتی هەوا',
        descEn: 'Design of custom insulated galvanized ducts ensures zero moisture leakage and quiet, uniform air dispersion.',
        descKu: 'دیزاین کردنی دەکتی مەتاتی جۆراوجۆر بە دژە تەڕبوون کە فێنکییەکە بە بێدەنگی و یەکسانی بڵاودەکاتەوە.'
      },
      {
        titleEn: 'Intelligent VRF Modulation',
        titleKu: 'بەستن و بەگەڕخستنی سیستەمی VRF',
        descEn: 'Advanced electronic expansion valves modulate cool gas flow in real-time, reducing electrical energy waste up to 45%.',
        descKu: 'کۆنتڕۆڵکردنی ڕێڕەوی غازی فێنککەرەوە بە شێوەی کاتی بە تەکنەلۆجیای نوێ کە تێچووی کارەبا کەم دەکاتەوە زیاتر لە ٤٥٪.'
      }
    ]
  },
  {
    id: '02',
    titleEn: 'Heating Systems',
    titleKu: 'سیستەمی گەرمی',
    subEn: 'In-slab Hydronic Underfloor Heating & complete thermal envelopes.',
    subKu: 'گەرمکەرەوەی ژێرزەوی پێشکەوتوو بە تۆڕی ئاوی و پەیلی و چیمەنتۆ.',
    descEn: 'Underfloor heating provides the ultimate luxury of silent, dust-free radiant comfort. Perfect comfort is distributed from the floor up, leaving no cold spots and saving space on interior design.',
    descKu: 'سیستەمی گەرمکەرەوەی ژێرزەوی تەواو ئاسوودەیی و بێدەنگی دەبەخشێت بە ماڵەکەت بێ دروستکردنی هیچ تۆز و خۆڵێک. گەرمی لە خوارەوە بۆ سەرەوە بڵاودەبێتەوە و سوودی هەیە بۆ دیزاینی ناوەوە.',
    steps: [
      {
        titleEn: 'Polystyrene High-Density Isolation',
        titleKu: 'عەزلکردنی ژێر زەوی بە فۆمی چڕ',
        descEn: 'High-compressive polystyrene boards block heat transfers to structural floors, reflecting all radiant warmth upward.',
        descKu: 'دانانی تەوەرە و فۆمی عەزل لەسەر زەوی کۆنکرێت بۆ رێگریکردن لە ونبوونی گەرمی بۆ بن بێنا.'
      },
      {
        titleEn: 'Continuous Pipe Stitching',
        titleKu: 'ڕاکێشانی بۆری PEX بەردەوام',
        descEn: 'Standard PEX-a barrier pipes are mounted in spiral formats, guaranteeing zero joints in the entire concrete underlay.',
        descKu: 'ڕاکێشان و رێکخستنی بۆری بازنەیی PEX-a بێ بەکارهێنانی جوین لەژێر زەوی بۆ نەهێشتنی ئەگەری تەقین.'
      },
      {
        titleEn: 'Balanced Manifold Calibrations',
        titleKu: 'ڕێکخستنی مانیفۆڵدی ڕێڕەو',
        descEn: 'Every heating loop is individually adjusted at the central manifold, allowing specific temperature zones per room.',
        descKu: 'کۆنتڕۆڵ کردنی بڕی گەرمی سووڕاو لە مانیفۆڵدی ناوەندی، گەرەنتی کردنی کۆنتڕۆڵی پلەی گەرمی هەر ژوورێک بە جیا.'
      }
    ]
  },
  {
    id: '03',
    titleEn: 'Radiator Heating',
    titleKu: 'شۆفاژ',
    subEn: 'Elegant European panel radiators, gas/diesel boiler systems.',
    subKu: 'شۆفاژی مۆدێرنی دیواری، سیستەمەکانی بۆیلەری کارەبایی و غازی متمانەپێکراو.',
    descEn: 'We supply and install modern hydronic panel radiators from top Turkish and Italian manufacturers. Configured with smart boilers to provide immediate and warm convection for residences and corporate projects.',
    descKu: 'ئێمە پانێڵی شۆفاژ لە باشترین جۆر و مارکەی جیهانی دابین دەکەین. گونجاو لەگەڵ بۆیلەرە پێشکەوتووەکان تا گەرمیەکی کتوپڕ و بەردەوام ببەخشێت بە پرۆژە نیشتەجێبوون و بازرگانییەکانتان.',
    steps: [
      {
        titleEn: 'Central Energy Boiler Station',
        titleKu: 'دامەزراندنی بۆیلەر',
        descEn: 'We design complete boiler systems using highly insulated copper manifolds to manage central thermal grids.',
        descKu: 'نەخشەسازی کۆمەڵە بۆیلەری ناوەندی و پەمپەکانی سووڕانەوە بە بۆری مس و دژە هەوا.'
      },
      {
        titleEn: 'Hydronic Pipe Ring Layouts',
        titleKu: 'ڕاکێشانی هێڵی ئاوی سووڕاو',
        descEn: 'Heavy duty pressure-tested pipes are run concealed in masonry to connect the radiator panels safely.',
        descKu: 'ڕاکێشانی بۆریە شاراوەکان لەناو دیوارەکاندا بۆ گەیاندنی ئاوی گەرم بۆ پانێڵ فێنککەرەکان.'
      },
      {
        titleEn: 'Thermostatic Valve Automation',
        titleKu: 'بەستنی قوفڵە حەرارییەکان',
        descEn: 'We fit custom programmable valves directly on the radiators so heating shuts off when a room reaches target comfort.',
        descKu: 'بەستنی قوفڵی هەستیار بۆ کوژانەوەی ئۆتۆماتیکی شۆفاژەکە کاتێک ژوورەکە گەرمی پێویست بەدەستدەهێنێت.'
      }
    ]
  },
  {
    id: '04',
    titleEn: 'Gas Networks',
    titleKu: 'تۆڕی غاز',
    subEn: 'Certified LPG / NG infrastructure, leak detection solenoids.',
    subKu: 'تۆڕی متمانەپێکراوی غاز بە بۆری بێ درز و سیستەمی ئاگادارکەرەوە لە کاتی دزەکردن.',
    descEn: 'Safety is paramount. Yousif Company engineers highly secure Liquefied Petroleum Gas (LPG) pipelines for residential buildings, hotels, and luxury villas using heavy-gauge seamless steel.',
    descKu: 'سەلامەتی پێش هەموو شتێکە. ئەندازیارانی یوسف کۆمپانی هەڵدەستن بە دروستکردنی بۆری و هێڵی پۆڵای تۆڕی غازی شل (LPG) بۆ خانوو، شوقە و چێشتخانەکان بە بەرزترین جۆری سەلامەتی.',
    steps: [
      {
        titleEn: 'Carbon Seamless Welding',
        titleKu: 'جۆشکاری کاربۆنی پتەوی بێ درز',
        descEn: 'All gas pipes are seamlessly welded with certified joint testing, ensuring zero risk of structural pressure drop.',
        descKu: 'جۆشکردنی تەواوی بۆرییەکان بە کۆنتڕۆڵ و تاقی کردنەوەی بەهێز بۆ نەهێشتنی درز و دڵنیابوون لە نەبوونی کێشە.'
      },
      {
        titleEn: 'Automated Leak Interlocking',
        titleKu: 'سیستەمی زنجیرەیی دۆزینەوەی دزەکردن',
        descEn: 'Smart gas sensors trigger central electronic solenoids, immediately locking the main valve if any vapor is detected.',
        descKu: 'هەستیاری پێشکەوتوو غازی لێکچوو دەدۆزێتەوە و خێرا بە شێوەی ئۆتۆماتیکی قوفڵی سەرەکی غازی ناوەند دادەخات.'
      },
      {
        titleEn: 'Pressure Reduction Stations',
        titleKu: 'وێستگەی رێکخستنی پەستان',
        descEn: 'Custom dual-stage brass regulators reduce high pressure down to safe working metrics for kitchens and boilers.',
        descKu: 'دانانی ڕێکخەری برۆنزی دوو قۆناغی بۆ کمکردنەوەی پەستانی بەهێز بۆ سەرانسەر ئامێرەکان بە پارێزراوی.'
      }
    ]
  },
  {
    id: '05',
    titleEn: 'Solar Systems',
    titleKu: 'سۆلار',
    subEn: 'Grid-tied & Hybrid photovoltaic solar arrays with premium battery banks.',
    subKu: 'سیستەمی پانێڵی وزەی خۆر بە پاتری کۆگاکردنی لیسیۆم و ئینڤێرتەری زیرەک.',
    descEn: 'Maximize energy independence. We install professional solar installations featuring Tier-1 monocrystalline panels, hybrid smart inverters, and long-life Lithium Iron Phosphate (LiFePO4) storage banks.',
    descKu: 'سەربەخۆیی وزە بەدەستبهێنە. ئێمە کاردەکەین لەسەر بەستنی باشترین پانێڵی مۆنۆ-کریستاڵی ئەڵمانی و ئینڤێرتەری مۆدێرن لەگەڵ پاتری دژە تەقین و تەمەن درێژی لیثیۆم فۆسفاتی ئاسن بۆ وزەی بەردەوام.',
    steps: [
      {
        titleEn: 'Azimuth & Shade Optimization',
        titleKu: 'ئاراستەکردن بەرامبەر تیشکی خۆر',
        descEn: 'Solar panels are positioned and tilted at optimized angles to maximize yearly kilowatt production, avoiding building shadows.',
        descKu: 'دانانی پانێڵەکان بە گۆشەی گونجاو و دیاریکردن لە ڕووی باشوور بۆ زۆرترین برهەم هێنای وزەی فۆتۆڤۆلتایی.'
      },
      {
        titleEn: 'Hybrid Smart Inverter Sync',
        titleKu: 'ڕێکخستنی ئینڤێرتەری زیرەک',
        descEn: 'We program the inverter to prioritize solar consumption first, bypass to batteries during grid outages, and automatically charge when power is cheapest.',
        descKu: 'پرۆگرام کردنی ئینڤێرتەر کە سەرەتا وزەی خۆر بەکاربهێنێت و لە کاتی نەبوونی کارەبادا خۆکارانە کارەبای پاتریەکان بداتەوە.'
      },
      {
        titleEn: 'Smart Lithium Energy Buffer',
        titleKu: 'بەستنی کۆمەڵە پاتری لیثیۆم',
        descEn: 'LiFePO4 battery storage arrays provide high active currents and complete zero-latency transitions during generator cuts.',
        descKu: 'پاراستنی و بارگاوی کردنی وزە لە پاتریەکان کە بە بێ پچڕان لە کاتی گۆڕینی کارەبای نیشتمانیدا ڕاستەوخۆ دەگوازرێتەوە.'
      }
    ]
  },
  {
    id: '06',
    titleEn: 'Fire Suppression',
    titleKu: 'ئاگرکوژێنەوە',
    subEn: 'NFPA standard addressable detection, wet sprinkler, & fire main stations.',
    subKu: 'سیستەمی ئاگرکوژێنەوەی سەر زەوی و قوفڵی شووشەی هەستیار بەپێی ستانداردەکانی NFPA.',
    descEn: 'Absolute asset protection. Yousif Company layouts fully automated fire detection and suppression machinery designed strictly to certified NFPA code guidelines to safeguard residential and business areas.',
    descKu: 'پاراستنی تەواوی ژیان و سەروەت و سامانەکانتان. کۆمپانیای یوسف نەخشەسازی و دامەزراندنی سیستەمەکانی کوژانەوەی ئاگری پیستر دەکات بەپێی باشترین مەرج و رێنماییە سەلامەتەکانی NFPA بۆ پاراستنی هەمیشەیی.',
    steps: [
      {
        titleEn: 'Thermal Bulb Sprinklers',
        titleKu: 'بەستنی زمانەکانی ئاوپڕژێنی هەستیار',
        descEn: 'Localized glass spray bulbs melt instantly at 68°C, releasing targeted high velocity water jets only where active flame is present.',
        descKu: 'دانانی یەکەی ئاوپڕژێنی سەری شووشەیی کە کاتێک پلەی گەرمی دەگاتە ٦٨ پلە بە شێوەی خۆکارانە تەقین دەکەن و ئاو دەڕێژن.'
      },
      {
        titleEn: 'Dual-Backup Main Pumps',
        titleKu: 'بەستنی پەمپی پاڵنەری گەورە',
        descEn: 'Central electric pumps paired with critical backup diesel pumps fire up instantly if sprinkler line pressure drops.',
        descKu: 'بەستنی پەمپی الەکتریکی یاوەر بە پەمپی مەکینەی دیزڵ بۆ هێشتنەوەی هەمیشەیی پەستانی مەرکەزی ئاوی کوژانەوە.'
      },
      {
        titleEn: 'Addressable Control Syncing',
        titleKu: 'بەستنەوە بە پانێلی مەرکەزی',
        descEn: 'Fire trigger flow indicators instantly report zones to building sirens, turning off main fans to suppress smoke spreading.',
        descKu: 'هاوکات کردنی لەرەلەرەکان بە ڕاپۆرت کردنی ئۆتۆماتیکی شوێنەکە بە سیستەمی کۆنتڕۆڵی دووکەڵی جێگیر.'
      }
    ]
  }
];

export default function ServiceDetailModal({ isOpen, onClose, initialServiceId }: ServiceDetailModalProps) {
  const { lang } = useLanguage();
  const { isOwnerLoggedIn, customPhotos, addProjectPhoto, deleteProjectPhoto } = useOwner();

  const [activeTab, setActiveTab] = useState<string>(initialServiceId);

  // Form states for adding photos
  const [photoUrl, setPhotoUrl] = useState('');
  const [captionEn, setCaptionEn] = useState('');
  const [captionKu, setCaptionKu] = useState('');
  const [cityEn, setCityEn] = useState('');
  const [cityKu, setCityKu] = useState('');
  const [isUploadingLocal, setIsUploadingLocal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find active service item
  const service = serviceDetailsData.find(s => s.id === activeTab) || serviceDetailsData[0];

  // Resolve merged photos (Default Pre-seeded + Owner custom additions)
  const defaultList = defaultPhotos[activeTab] || [];
  const customList = customPhotos[activeTab] || [];
  const mergedPhotos = [...defaultList, ...customList];

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
                
                {serviceDetailsData.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
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
                  <div className="flex items-center gap-3 mb-4">
                    {getServiceIcon(service.id, "w-8 h-8")}
                    <span className="font-mono text-amber text-sm font-semibold tracking-wider">SYSTEM 0{service.id}</span>
                  </div>
                  
                  <h2 className="font-display text-4xl md:text-5xl tracking-tight text-text-main mb-3">
                    {lang === 'ku' ? service.titleKu : service.titleEn}
                  </h2>
                  <p className="text-sm font-light uppercase tracking-widest text-muted mb-6">
                    {lang === 'ku' ? service.subKu : service.subEn}
                  </p>
                  
                  <p className="text-md leading-relaxed text-white/80 font-light max-w-4xl bg-white/5 p-6 rounded-3xl border border-white/5">
                    {lang === 'ku' ? service.descKu : service.descEn}
                  </p>
                </div>

                {/* How it Works / Steps List */}
                <div>
                  <h3 className="font-serif text-2xl text-text-main mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-amber" />
                    <span>{lang === 'ku' ? 'پرۆسەی ئەندازیاری و چۆنیەتی کارکردن' : 'Engineering Process & How it Works'}</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {service.steps.map((st, i) => (
                      <div key={i} className="relative bg-navy-mid border border-white/5 p-6 rounded-3xl">
                        <div className="absolute top-4 right-4 text-3xl font-mono text-white/5 font-extrabold leading-none">
                          0{i+1}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-amber/10 text-amber flex items-center justify-center text-xs font-bold mb-4">
                          {i+1}
                        </div>
                        <h4 className="font-serif text-lg text-text-main mb-2">
                          {lang === 'ku' ? st.titleKu : st.titleEn}
                        </h4>
                        <p className="text-xs leading-relaxed text-muted font-light">
                          {lang === 'ku' ? st.descKu : st.descEn}
                        </p>
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
                      {lang === 'ku' ? 'هیچ وێنەیەکی پڕۆژە نییە بۆ ئەم خزمەتگوزارییە هێشتا.' : 'No active portfolio images uploaded for this system category.'}
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
                                // fallback if image is broken
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
                    className="border border-amber/30 bg-amber/5 rounded-[32px] p-8 md:p-10 relative overflow-hidden"
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
