import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Thermometer, Flame, Heater, Zap, Leaf, FireExtinguisher, 
  Plus, Trash2, Camera, MapPin, Calendar, CheckCircle2, Upload,
  FolderClosed, FolderOpen, Pencil, ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useOwner, ProjectFolder, ProjectPhotoItem } from './OwnerContext';

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId: string;
}

// Icon mapping helper
const getServiceIcon = (id: string, className: string = "w-6 h-6") => {
  switch (id) {
    case '01': return <Thermometer className={`${className} text-amber-500`} />;
    case '02': return <Flame className={`${className} text-orange-500`} />;
    case '03': return <Heater className={`${className} text-neutral-300`} />;
    case '04': return <Zap className={`${className} text-yellow-500`} />;
    case '05': return <Leaf className={`${className} text-emerald-400`} />;
    case '06': return <FireExtinguisher className={`${className} text-red-500`} />;
    default: return <Thermometer className={className} />;
  }
};

export default function ServiceDetailModal({ isOpen, onClose, initialServiceId }: ServiceDetailModalProps) {
  const { lang } = useLanguage();
  const { 
    isOwnerLoggedIn, 
    authError,
    customProjects,
    addProjectFolder,
    updateProjectFolder,
    deleteProjectFolder,
    addPhotoToFolder,
    deletePhotoFromFolder,
    servicesData,
    updateServiceStep,
    updateServiceCore
  } = useOwner();

  const [activeTab, setActiveTab] = useState<string>(initialServiceId);

  // Project Folder Creation states:
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projTitleEn, setProjTitleEn] = useState('');
  const [projTitleKu, setProjTitleKu] = useState('');
  const [projDescEn, setProjDescEn] = useState('');
  const [projDescKu, setProjDescKu] = useState('');
  const [projCityEn, setProjCityEn] = useState('');
  const [projCityKu, setProjCityKu] = useState('');
  const [projPhotos, setProjPhotos] = useState<ProjectPhotoItem[]>([]);

  // Project Folder Editing states:
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editTitleKu, setEditTitleKu] = useState('');
  const [editDescEn, setEditDescEn] = useState('');
  const [editDescKu, setEditDescKu] = useState('');
  const [editCityEn, setEditCityEn] = useState('');
  const [editCityKu, setEditCityKu] = useState('');

  const [isUploadingLocal, setIsUploadingLocal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  const folderPhotosInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Mobile Collapsible solutions menu
  const [isMobileSolutionsOpen, setIsMobileSolutionsOpen] = useState(false);

  // Lightbox viewer states
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'folder' | 'photo';
    folderId: string;
    photoId?: string;
  } | null>(null);

  const [lightboxPhotos, setLightboxPhotos] = useState<ProjectPhotoItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (photos: ProjectPhotoItem[], index: number) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextPhoto = () => {
    setLightboxIndex((curr) => (curr !== null && lightboxPhotos.length ? (curr + 1) % lightboxPhotos.length : curr));
  };

  const prevPhoto = () => {
    setLightboxIndex((curr) => (curr !== null && lightboxPhotos.length ? (curr - 1 + lightboxPhotos.length) % lightboxPhotos.length : curr));
  };

  React.useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setLightboxIndex((curr) => (curr !== null && lightboxPhotos.length ? (curr + 1) % lightboxPhotos.length : curr));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((curr) => (curr !== null && lightboxPhotos.length ? (curr - 1 + lightboxPhotos.length) % lightboxPhotos.length : curr));
      } else if (e.key === 'Escape') {
        setLightboxIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, lightboxPhotos.length]);

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

  // Resolve projects uploaded by the owner grouped in project folders
  const activeProjects = customProjects[activeTab] || [];

  // File to base64 converter with canvas compression to prevent localStorage quota exhaustion
  const compressFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const img = new Image();
        img.src = base64String;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 800; // Optimal resolution

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
            resolve(compressedBase64);
          } else {
            resolve(base64String);
          }
        };
        img.onerror = () => {
          resolve(base64String);
        };
      };
      reader.onerror = () => {
        reject(new Error('File reading error'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProjectPhotosSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingLocal(true);
    const converted: ProjectPhotoItem[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressFileToBase64(files[i]);
        converted.push({
          id: `initial-photo-${Date.now()}-${Math.floor(Math.random() * 1000)}-${i}`,
          url: compressed
        });
      } catch (err) {
        console.error("Error converting file:", err);
      }
    }

    setProjPhotos((prev) => [...prev, ...converted]);
    setIsUploadingLocal(false);
    if (e.target.value) e.target.value = '';
  };

  const handleAddPhotosToExistingFolder = async (e: React.ChangeEvent<HTMLInputElement>, folderId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingLocal(true);
    for (let i = 3; i < files.length + 3; i++) {
      // iterate normally
    }
    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressFileToBase64(files[i]);
        addPhotoToFolder(activeTab, folderId, compressed);
      } catch (err) {
        console.error("Error appending photo to folder:", err);
      }
    }
    setIsUploadingLocal(false);
    if (e.target.value) e.target.value = '';
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitleEn.trim() && !projTitleKu.trim()) {
      alert(lang === 'ku' ? 'تکایە ناونیشانی پڕۆژەکە بنووسە' : 'Please provide a Project Name or Title.');
      return;
    }

    addProjectFolder(activeTab, {
      titleEn: projTitleEn || 'New Installation Project',
      titleKu: projTitleKu || 'پڕۆژەی نوێ',
      descEn: projDescEn || 'Completed installation project details.',
      descKu: projDescKu || 'وردەکاری پڕۆژەی ئەندازیاری نوێ.',
      cityEn: projCityEn || 'Kurdish Region',
      cityKu: projCityKu || 'هەرێمی کوردستان',
      photos: projPhotos
    });

    // Reset fields
    setProjTitleEn('');
    setProjTitleKu('');
    setProjDescEn('');
    setProjDescKu('');
    setProjCityEn('');
    setProjCityKu('');
    setProjPhotos([]);
    setIsCreatingProject(false);
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
    <>
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
            <div className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-[280px_1fr] h-full min-h-0">
              
              {/* Left Column: Vertical tab list */}
              <div className="bg-navy-mid border-b lg:border-b-0 lg:border-r border-white/5 p-4 lg:p-6 flex flex-col gap-2 lg:overflow-y-auto">
                {/* Mobile Selector Header Bar */}
                <button
                  type="button"
                  onClick={() => setIsMobileSolutionsOpen(!isMobileSolutionsOpen)}
                  className="flex lg:hidden items-center justify-between w-full bg-navy/60 border border-white/10 px-5 py-4 rounded-2xl text-sm font-semibold text-text-main transition-all active:scale-[0.99] select-none"
                >
                  <span className="flex items-center gap-2.5">
                    {getServiceIcon(activeTab, "w-5 h-5")}
                    <span className="text-text-main font-medium">
                      {lang === 'ku' 
                        ? (servicesData.find(s => s.id === activeTab)?.titleKu || 'سیستەمەکان') 
                        : (servicesData.find(s => s.id === activeTab)?.titleEn || 'System Solutions')}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-amber/10 text-amber border border-amber/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                      {lang === 'ku' ? 'بگۆڕە' : 'Change'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-300 ${isMobileSolutionsOpen ? 'rotate-180 text-amber' : ''}`} />
                  </div>
                </button>

                {/* Desktop and Mobile expanded states */}
                <div className={`flex flex-col gap-2 mt-2 lg:mt-0 ${isMobileSolutionsOpen ? 'flex' : 'hidden lg:flex'}`}>
                  <div className="text-[10px] font-bold text-text-main/50 tracking-widest uppercase px-3 mb-2 hidden lg:block">
                    {lang === 'ku' ? 'بژاردەکانی سیستەم' : 'System Solutions'}
                  </div>
                  
                  {servicesData.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id);
                          setEditingStepIndex(null);
                          setIsEditingCore(false);
                          setIsMobileSolutionsOpen(false); // Auto close on select
                        }}
                        className={`flex items-center gap-3.5 text-start px-4 py-3.5 rounded-2xl border text-sm transition-all duration-200 w-full
                          ${isActive 
                            ? 'bg-navy-light border-amber/40 text-text-main font-semibold shadow-[inset_4px_0_0_#FFD600]' 
                            : 'border-transparent bg-transparent text-text-main/70 hover:bg-white/5 hover:text-text-main font-normal'}`}
                      >
                        {getServiceIcon(tab.id, "w-5 h-5")}
                        <span className="truncate">{lang === 'ku' ? tab.titleKu : tab.titleEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Information description and photo panels */}
              <div className="p-8 md:p-12 overflow-y-auto lg:h-full flex flex-col gap-12">
                
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

                  {isOwnerLoggedIn && authError && (authError.includes('admin-restricted-operation') || authError.includes('restricted-operation')) && (
                    <div className="mb-6 p-5 bg-amber/5 border border-amber/20 rounded-[24px] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-start">
                      <div className="text-text-main/85 leading-relaxed">
                        <strong className="text-amber font-semibold uppercase tracking-wide block mb-1">
                          ⚠️ {lang === 'ku' ? 'پاکسازی فایەربەیس پێویستە' : 'Firebase Setup Action Required'}
                        </strong>
                        {lang === 'ku'
                          ? 'بۆ پاشەکەوتکردنی دوورمەودای پڕۆژە خزمەتگوزارییەکان، پێویستە سیستەمی "Anonymous Auth" چالاک بکەیت لە فایەربەیس.'
                          : 'To persist gallery additions and text modifications to the cloud database, please authorize Anonymous sign-in in your Firebase project Authentication tab.'}
                      </div>
                      <a 
                        href="https://console.firebase.google.com/project/gen-lang-client-0516062385/authentication/providers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-amber hover:bg-amber-bright text-navy font-bold text-[10px] uppercase tracking-wider py-2.5 px-4 rounded-full transition-colors whitespace-nowrap self-start sm:self-center"
                      >
                        {lang === 'ku' ? 'کۆنسۆڵی فایەربەیس' : 'Enable Anonymous Sign-In'}
                      </a>
                    </div>
                  )}

                  {isOwnerLoggedIn && isEditingCore ? (
                    <div className="bg-navy-mid p-6 md:p-8 rounded-[32px] border border-white/15 flex flex-col gap-4 mb-6 shadow-lg">
                      <div className="text-xs uppercase tracking-wider text-amber font-semibold mb-2">
                        {lang === 'ku' ? 'مۆدی دەستکاری دەقی سەرەکی' : 'Editing Core Information'}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase text-text-main/60 tracking-wider mb-1">Title (English)</label>
                          <input 
                            type="text" 
                            className="w-full bg-navy border border-white/15 text-sm text-text-main px-3 py-2 rounded-lg focus:border-amber outline-none"
                            value={tempCoreTitleEn}
                            onChange={(e) => setTempCoreTitleEn(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-text-main/60 tracking-wider mb-1">Title (Kurdish)</label>
                          <input 
                            type="text" 
                            className="w-full bg-navy border border-white/15 text-sm text-text-main px-3 py-2 rounded-lg focus:border-amber outline-none"
                            value={tempCoreTitleKu}
                            onChange={(e) => setTempCoreTitleKu(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase text-text-main/60 tracking-wider mb-1">Subtitle (English)</label>
                          <input 
                            type="text" 
                            className="w-full bg-navy border border-white/15 text-sm text-text-main px-3 py-2 rounded-lg focus:border-amber outline-none"
                            value={tempCoreSubEn}
                            onChange={(e) => setTempCoreSubEn(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-text-main/60 tracking-wider mb-1">Subtitle (Kurdish)</label>
                          <input 
                            type="text" 
                            className="w-full bg-navy border border-white/15 text-sm text-text-main px-3 py-2 rounded-lg focus:border-amber outline-none"
                            value={tempCoreSubKu}
                            onChange={(e) => setTempCoreSubKu(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase text-text-main/60 tracking-wider mb-1">Brief Card Description (English)</label>
                          <textarea 
                            className="w-full bg-navy border border-white/15 text-sm text-text-main px-3 py-2 rounded-lg focus:border-amber outline-none"
                            rows={2}
                            value={tempCoreCardDescEn}
                            onChange={(e) => setTempCoreCardDescEn(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-text-main/60 tracking-wider mb-1">Brief Card Description (Kurdish)</label>
                          <textarea 
                            className="w-full bg-navy border border-white/15 text-sm text-text-main px-3 py-2 rounded-lg focus:border-amber outline-none"
                            rows={2}
                            value={tempCoreCardDescKu}
                            onChange={(e) => setTempCoreCardDescKu(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase text-text-main/60 tracking-wider mb-1">Full Detailed Description (English)</label>
                          <textarea 
                            className="w-full bg-navy border border-white/15 text-sm text-text-main px-3 py-2 rounded-lg focus:border-amber outline-none"
                            rows={4}
                            value={tempCoreDescEn}
                            onChange={(e) => setTempCoreDescEn(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-text-main/60 tracking-wider mb-1">Full Detailed Description (Kurdish)</label>
                          <textarea 
                            className="w-full bg-navy border border-white/15 text-sm text-text-main px-3 py-2 rounded-lg focus:border-amber outline-none"
                            rows={4}
                            value={tempCoreDescKu}
                            onChange={(e) => setTempCoreDescKu(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end mt-2">
                        <button 
                          onClick={() => setIsEditingCore(false)}
                          className="px-4 py-2 bg-white/10 text-[10px] tracking-widest uppercase rounded-full text-text-main hover:bg-white/20 transition-all font-semibold"
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
                      <h2 className="font-display text-4xl md:text-5xl tracking-tight text-text-main mb-3 font-semibold">
                        {lang === 'ku' ? service.titleKu : service.titleEn}
                      </h2>
                      <p className="text-sm font-semibold uppercase tracking-widest text-amber mb-6">
                        {lang === 'ku' ? service.subKu : service.subEn}
                      </p>
                      
                      {/* Main System Description Card */}
                      <div className="text-base md:text-lg leading-relaxed text-text-main font-normal max-w-4xl bg-navy-mid p-6 md:p-8 rounded-3xl border border-white/10 shadow-lg">
                        <p className="text-text-main leading-relaxed font-normal">
                          {lang === 'ku' ? service.descKu : service.descEn}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* How it Works / Steps List */}
                <div>
                  <h3 className="font-serif text-2xl text-text-main mb-6 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-amber" />
                    <span>{lang === 'ku' ? 'پرۆسەی ئەندازیاری و چۆنیەتی کارکردن' : 'Engineering Process & How it Works'}</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {service.steps.map((st, i) => (
                      <div key={i} className="relative bg-navy-mid border border-white/10 p-6 md:p-7 rounded-3xl flex flex-col justify-between min-h-[220px] shadow-md">
                        <div>
                          <div className="absolute top-4 end-4 text-3xl font-mono text-text-main/10 font-extrabold leading-none pointer-events-none">
                            0{i+1}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-amber/15 text-amber flex items-center justify-center text-xs font-bold mb-4">
                            {i+1}
                          </div>

                          {isOwnerLoggedIn && editingStepIndex === i ? (
                            <div className="flex flex-col gap-3 mt-2 text-start">
                              <div className="text-xs uppercase tracking-wider text-amber font-semibold mb-1">
                                {lang === 'ku' ? 'دەستکاریکردنی هەنگاو' : 'Modify Step'}
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase text-text-main/60 tracking-wider mb-0.5">Title (English)</label>
                                <input 
                                  type="text" 
                                  className="w-full bg-navy border border-white/15 text-xs text-text-main p-2 rounded-lg focus:border-amber outline-none"
                                  value={tempStepTitleEn}
                                  onChange={(e) => setTempStepTitleEn(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase text-text-main/60 tracking-wider mb-0.5">Title (Kurdish)</label>
                                <input 
                                  type="text" 
                                  className="w-full bg-navy border border-white/15 text-xs text-text-main p-2 rounded-lg focus:border-amber outline-none"
                                  value={tempStepTitleKu}
                                  onChange={(e) => setTempStepTitleKu(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase text-text-main/60 tracking-wider mb-0.5">Description (English)</label>
                                <textarea 
                                  className="w-full bg-navy border border-white/15 text-xs text-text-main p-2 rounded-lg focus:border-amber outline-none"
                                  rows={3}
                                  value={tempStepDescEn}
                                  onChange={(e) => setTempStepDescEn(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase text-text-main/60 tracking-wider mb-0.5">Description (Kurdish)</label>
                                <textarea 
                                  className="w-full bg-navy border border-white/15 text-xs text-text-main p-2 rounded-lg focus:border-amber outline-none"
                                  rows={3}
                                  value={tempStepDescKu}
                                  onChange={(e) => setTempStepDescKu(e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2 justify-end mt-2">
                                <button 
                                  type="button"
                                  onClick={() => setEditingStepIndex(null)}
                                  className="px-2.5 py-1 bg-white/10 text-[9px] tracking-widest uppercase rounded-md text-text-main hover:bg-white/20 transition-all font-semibold"
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
                              <h4 className="font-serif text-xl text-text-main mb-2 font-medium">
                                {lang === 'ku' ? st.titleKu : st.titleEn}
                              </h4>
                              <p className="text-sm leading-relaxed text-text-main/80 font-normal">
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
                  <h3 className="font-serif text-2xl text-text-main mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-amber" />
                      <span>{lang === 'ku' ? 'وێنەی پڕۆژە ڕاستەقینەکان' : 'Real Projects Installation Gallery'}</span>
                    </div>
                    {isUploadingLocal && (
                      <span className="text-[10px] text-amber tracking-widest uppercase font-mono animate-pulse bg-amber/10 border border-amber/20 px-3 py-1 rounded-full">
                        {lang === 'ku' ? 'بەرکارخستنی وێنەکان...' : 'Processing Photos...'}
                      </span>
                    )}
                  </h3>

                  {/* Creation of new Project Panel (Only visible when logged in as Owner) */}
                  {isOwnerLoggedIn && (
                    <div className="mb-10 text-start">
                      {!isCreatingProject ? (
                        <div 
                          onClick={() => setIsCreatingProject(true)}
                          className="border border-dashed border-amber/30 hover:border-amber bg-amber/5 hover:bg-amber/10 rounded-[32px] p-8 md:p-10 relative overflow-hidden text-center cursor-pointer transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,214,0,0.12)] active:scale-[0.99] group select-none animate-fade-in"
                        >
                          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber/10 blur-3xl pointer-events-none" />
                          <div className="flex flex-col items-center justify-center gap-4 py-2">
                            <div className="w-14 h-14 rounded-full bg-amber/10 text-amber flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <FolderClosed className="w-8 h-8 animate-pulse" />
                            </div>
                            <div>
                              <h3 className="font-serif text-xl md:text-2xl text-text-main group-hover:text-amber transition-colors duration-200">
                                {lang === 'ku' ? 'دروستکردنی فۆڵدەری پڕۆژەی تازە' : 'Owner Panel: Create New Project Folder'}
                              </h3>
                              <p className="text-xs text-muted max-w-lg mx-auto leading-relaxed mt-2 uppercase tracking-widest font-light">
                                {lang === 'ku' ? 'کلیک بکە بۆ دروستکردن، نووسینی لێدوان و زیادکردنی چەندین وێنەی پڕۆژە بەیەکەوە' : 'Click to create a named project folder with custom descriptions, city location, and multiple images at once'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-navy-mid border border-amber/35 p-8 md:p-10 rounded-[40px] text-start relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
                            <h3 className="font-serif text-2xl text-text-main flex items-center gap-2">
                              <FolderClosed className="w-6 h-6 text-amber" />
                              <span>{lang === 'ku' ? 'دروستکردنی فۆڵدەری پڕۆژەی تازە' : 'Create New Project Folder'}</span>
                            </h3>
                            <button
                              type="button"
                              onClick={() => {
                                setIsCreatingProject(false);
                                setProjPhotos([]);
                              }}
                              className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-muted hover:text-white rounded-full text-[10px] uppercase font-bold tracking-widest transition-all"
                            >
                              {lang === 'ku' ? 'داخستنی فۆڕم' : 'Cancel'}
                            </button>
                          </div>

                          <form onSubmit={handleCreateProjectSubmit} className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-[10px] uppercase text-muted tracking-widest mb-1.5 font-mono">Project Name / Title (English)</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Al-Sulaymaniah Central Hospital System"
                                  className="w-full bg-navy border border-white/10 text-sm text-white px-4 py-3 rounded-2xl focus:border-amber outline-none"
                                  value={projTitleEn}
                                  onChange={(e) => setProjTitleEn(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase text-muted tracking-widest mb-1.5 font-mono">Project Name / Title (Kurdish)</label>
                                <input
                                  type="text"
                                  placeholder="بۆ نموونە: سیستەمی مەرکەزی نەخۆشخانەی سلێمانی و هەموو کوردستان"
                                  className="w-full bg-navy border border-white/10 text-sm text-white px-4 py-3 rounded-2xl focus:border-amber outline-none text-end"
                                  value={projTitleKu}
                                  onChange={(e) => setProjTitleKu(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-[10px] uppercase text-muted tracking-widest mb-1.5 font-mono">City (English)</label>
                                <input
                                  type="text"
                                  placeholder="e.g., Sulaymaniyah and whole of kurdistan"
                                  className="w-full bg-navy border border-white/10 text-sm text-white px-4 py-3 rounded-2xl focus:border-amber outline-none"
                                  value={projCityEn}
                                  onChange={(e) => setProjCityEn(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase text-muted tracking-widest mb-1.5 font-mono">City (Kurdish)</label>
                                <input
                                  type="text"
                                  placeholder="بۆ نموونە: سلێمانی و هەموو کوردستان"
                                  className="w-full bg-navy border border-white/10 text-sm text-white px-4 py-3 rounded-2xl focus:border-amber outline-none text-end"
                                  value={projCityKu}
                                  onChange={(e) => setProjCityKu(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-[10px] uppercase text-muted tracking-widest mb-1.5 font-mono">Detailed Description (English)</label>
                                <textarea
                                  placeholder="Describe what was installed, system design, capacity, heating/cooling load, piping, materials etc."
                                  className="w-full bg-navy border border-white/10 text-sm text-white px-4 py-3 rounded-2xl focus:border-amber outline-none"
                                  rows={3}
                                  value={projDescEn}
                                  onChange={(e) => setProjDescEn(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase text-muted tracking-widest mb-1.5 font-mono">Detailed Description (Kurdish)</label>
                                <textarea
                                  placeholder="سیستەمەکە و هێڵەکان چۆن دانراون..."
                                  className="w-full bg-navy border border-white/10 text-sm text-white px-4 py-3 rounded-2xl focus:border-amber outline-none text-end"
                                  rows={3}
                                  value={projDescKu}
                                  onChange={(e) => setProjDescKu(e.target.value)}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase text-muted tracking-widest mb-2 font-mono">Upload Photos (Supports Multiple / JPG, PNG, WebP)</label>
                              <div className="relative border border-dashed border-white/20 hover:border-amber/50 rounded-2xl p-8 text-center transition-colors cursor-pointer bg-navy-mid flex flex-col items-center justify-center min-h-[150px] group">
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={handleProjectPhotosSelect}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <Upload className="w-8 h-8 text-white/30 mb-2 group-hover:text-amber transition-colors" />
                                <p className="text-xs font-semibold text-text-main mb-1">
                                  {lang === 'ku' ? 'وێنەکانی پڕۆژەکەت لێرە زیاد بکە' : 'Select Project Image Files'}
                                </p>
                                <p className="text-[10px] text-muted">
                                  {lang === 'ku' ? 'دەتوانیت چەندین وێنە دیاری بکەیت بە یەکجار' : 'You can select multiple photos from device storage'}
                                </p>
                              </div>

                              {/* Preview loaded images in creation form */}
                              {projPhotos.length > 0 && (
                                <div className="mt-4 bg-navy p-4 rounded-2xl border border-white/5">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-muted">{lang === 'ku' ? 'وێنە بارکراوەکانی پڕۆژە' : 'Loaded Photos Preview'}</span>
                                    <button 
                                      type="button" 
                                      onClick={() => setProjPhotos([])}
                                      className="text-[10px] text-red-400 hover:underline cursor-pointer"
                                    >
                                      {lang === 'ku' ? 'سڕینەوەی هەموو' : 'Clear All'}
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                    {projPhotos.map((p, idx) => (
                                      <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/15 group">
                                        <img src={p.url} className="w-full h-full object-cover" alt="preview" />
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setProjPhotos((prev) => prev.filter((_, i) => i !== idx));
                                          }}
                                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              type="submit"
                              className="self-start px-8 py-4 bg-amber text-navy font-bold text-xs tracking-widest uppercase rounded-full hover:bg-amber-bright transition-all inline-flex items-center gap-2 mt-2 cursor-pointer shadow-lg"
                            >
                              <Plus className="w-4 h-4" />
                              <span>{lang === 'ku' ? 'بڵاوکردنەوەی فۆڵدەری پڕۆژە ✓' : 'Publish Project Folder ✓'}</span>
                            </button>
                          </form>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {activeProjects.length === 0 ? (
                    <div className="bg-navy-mid border border-dashed border-white/10 rounded-3xl p-12 text-center text-muted text-sm">
                      {lang === 'ku' ? 'هیچ پڕۆژەیەکی جێبەجێکراو نییە بۆ ئەم خزمەتگوزارییە هێشتا.' : 'No active projects uploaded in this system category yet.'}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-10">
                      {activeProjects.map((folder) => {
                        const isEditingThisFolder = editingFolderId === folder.id;

                        return (
                          <div 
                            key={folder.id} 
                            className="bg-navy-mid border border-white/5 rounded-[40px] p-6 md:p-8 relative overflow-hidden shadow-2xl transition-all duration-300 hover:border-white/10"
                          >
                            {/* Decorative background folder glow */}
                            <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-amber/5 blur-3xl pointer-events-none" />

                            {/* Folder Header */}
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/5 pb-6 mb-6">
                              <div className="flex-1">
                                {isEditingThisFolder ? (
                                  <div className="flex flex-col gap-4 text-start">
                                    <div>
                                      <label className="block text-[9px] uppercase tracking-wider text-amber mb-1 font-mono">Project Title (English)</label>
                                      <input
                                        type="text"
                                        className="w-full bg-navy border border-white/10 text-sm p-3 rounded-xl focus:border-amber outline-none"
                                        value={editTitleEn}
                                        onChange={(e) => setEditTitleEn(e.target.value)}
                                        placeholder="Project Title"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[9px] uppercase tracking-wider text-amber mb-1 font-mono">Project Title (Kurdish)</label>
                                      <input
                                        type="text"
                                        className="w-full bg-navy border border-white/10 text-sm p-3 rounded-xl focus:border-amber outline-none text-end"
                                        value={editTitleKu}
                                        onChange={(e) => setEditTitleKu(e.target.value)}
                                        placeholder="ناونیشانی پڕۆژە"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[9px] uppercase tracking-wider text-amber mb-1 font-mono">City (English)</label>
                                        <input
                                          type="text"
                                          className="w-full bg-navy border border-white/10 text-xs p-2.5 rounded-xl focus:border-amber outline-none"
                                          value={editCityEn}
                                          onChange={(e) => setEditCityEn(e.target.value)}
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[9px] uppercase tracking-wider text-amber mb-1 font-mono">City (Kurdish)</label>
                                        <input
                                          type="text"
                                          className="w-full bg-navy border border-white/10 text-xs p-2.5 rounded-xl focus:border-amber outline-none text-end"
                                          value={editCityKu}
                                          onChange={(e) => setEditCityKu(e.target.value)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start gap-3 text-start">
                                    <div className="w-12 h-12 rounded-2xl bg-amber/15 text-amber flex items-center justify-center shrink-0 mt-1">
                                      <FolderOpen className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <h4 className="font-serif text-2xl md:text-3xl text-text-main flex items-center gap-2 flex-wrap font-semibold">
                                        <span>{lang === 'ku' ? folder.titleKu : folder.titleEn}</span>
                                      </h4>
                                      <div className="flex items-center gap-3 mt-2 text-xs text-text-main/70 font-normal uppercase tracking-widest flex-wrap">
                                        <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-text-main/90 font-medium">
                                          <MapPin className="w-3.5 h-3.5 text-amber" />
                                          <span>{lang === 'ku' ? folder.cityKu : folder.cityEn}</span>
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full font-mono text-text-main/80">
                                          <Calendar className="w-3.5 h-3.5 text-amber" />
                                          <span>{folder.date}</span>
                                        </span>
                                      </div>

                                      {/* Project Folder Description */}
                                      {(folder.descKu || folder.descEn) && (
                                        <p className="mt-3.5 text-sm md:text-base leading-relaxed text-text-main/85 font-normal bg-white/5 p-4 rounded-2xl border border-white/5">
                                          {lang === 'ku' ? (folder.descKu || folder.descEn) : (folder.descEn || folder.descKu)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Owner Actions for Folder */}
                              {isOwnerLoggedIn && (
                                <div className="flex items-center gap-2 self-start mt-2">
                                  {isEditingThisFolder ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateProjectFolder(activeTab, folder.id, {
                                            titleEn: editTitleEn,
                                            titleKu: editTitleKu,
                                            descEn: editDescEn,
                                            descKu: editDescKu,
                                            cityEn: editCityEn,
                                            cityKu: editCityKu,
                                          });
                                          setEditingFolderId(null);
                                        }}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[10px] uppercase font-bold tracking-widest transition-colors shadow-md"
                                      >
                                        {lang === 'ku' ? 'پاراستن ✓' : 'Save ✓'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingFolderId(null)}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-[10px] uppercase font-bold tracking-widest transition-colors border border-white/10"
                                      >
                                        {lang === 'ku' ? 'ڕەتکردنەوە' : 'Cancel'}
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {/* Edit Folder Info Button */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingFolderId(folder.id);
                                          setEditTitleEn(folder.titleEn);
                                          setEditTitleKu(folder.titleKu);
                                          setEditDescEn(folder.descEn);
                                          setEditDescKu(folder.descKu);
                                          setEditCityEn(folder.cityEn);
                                          setEditCityKu(folder.cityKu);
                                        }}
                                        className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 text-amber flex items-center justify-center rounded-full transition-all"
                                        title="Edit Folder Info"
                                      >
                                        <Pencil className="w-4 h-4" />
                                      </button>

                                      {/* Add Photos to this specific Folder */}
                                      <button
                                        type="button"
                                        onClick={() => folderPhotosInputRefs.current[folder.id]?.click()}
                                        className="px-4 py-2 bg-amber/10 border border-amber/20 hover:bg-amber/20 text-amber flex items-center gap-1.5 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all"
                                        title="Upload more images directly to this project folder"
                                      >
                                        <Upload className="w-3.5 h-3.5 animate-bounce" />
                                        <span>{lang === 'ku' ? 'زیادکردنی وێنە' : 'Add Photos'}</span>
                                      </button>

                                      <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        ref={(el) => { folderPhotosInputRefs.current[folder.id] = el; }}
                                        onChange={(e) => handleAddPhotosToExistingFolder(e, folder.id)}
                                      />

                                      {/* Delete entire project folder */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setConfirmDelete({
                                            type: 'folder',
                                            folderId: folder.id
                                          });
                                        }}
                                        className="w-10 h-10 bg-red-600/10 border border-red-500/20 hover:bg-red-600 hover:text-white text-red-400 flex items-center justify-center rounded-full transition-all"
                                        title="Delete Entire Project Folder"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>



                            {/* Photos Grid inside folder */}
                            {folder.photos.length === 0 ? (
                              <div className="bg-navy/50 border border-dashed border-white/5 rounded-2xl p-8 text-center text-xs text-muted">
                                {lang === 'ku' ? 'هیچ وێنەیەک لەم پڕۆژەیەدا نییە هێشتا. هاندانت بۆ بارکردنی وێنە.' : 'No photos added to this project folder yet.'}
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {folder.photos.map((pic, idx) => (
                                  <div 
                                    key={pic.id} 
                                    onClick={() => openLightbox(folder.photos, idx)}
                                    className="group/item relative bg-navy overflow-hidden aspect-[4/3] rounded-2xl border border-white/5 shadow-md hover:border-amber/40 transition-all duration-300 cursor-pointer"
                                  >
                                    <img 
                                      src={pic.url} 
                                      alt="installation detail" 
                                      className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=800&q=80";
                                      }}
                                    />
                                    
                                    {/* Trash Icon overlay for a single picture in folder */}
                                    {isOwnerLoggedIn && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setConfirmDelete({
                                            type: 'photo',
                                            folderId: folder.id,
                                            photoId: pic.id
                                          });
                                        }}
                                        className="absolute top-2 right-2 w-8 h-8 bg-black/70 hover:bg-red-600 text-white flex items-center justify-center rounded-full shadow-md sm:opacity-0 group-hover/item:opacity-100 transition-all duration-200 hover:scale-105 z-10"
                                        title="Delete Photo"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      {/* Dynamic Image Lightbox Overlay */}
      <AnimatePresence>
        {lightboxIndex !== null && lightboxPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8"
            onClick={closeLightbox}
          >
            {/* Top Bar with counter and close action */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
              <span className="text-white/60 font-mono text-xs uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-1.5 rounded-full select-none backdrop-blur-sm pointer-events-auto">
                {lightboxIndex + 1} / {lightboxPhotos.length}
              </span>
              <button
                type="button"
                onClick={closeLightbox}
                className="w-11 h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full flex items-center justify-center transition-all cursor-pointer pointer-events-auto backdrop-blur-sm hover:scale-105 active:scale-95 shadow-lg"
                title={lang === 'ku' ? 'داخستن' : 'Close Image'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Central Slide/Image container */}
            <div className="relative max-w-5xl max-h-[80vh] w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              
              {/* Previous button */}
              {lightboxPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={prevPhoto}
                  className="absolute left-2 md:-left-16 w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 hover:bg-amber hover:text-navy hover:border-amber text-white rounded-full flex items-center justify-center transition-all cursor-pointer z-50 backdrop-blur-sm shadow-xl hover:scale-105 active:scale-95"
                  title="Previous Photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Main Photo Display */}
              <motion.img
                key={lightboxIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                src={lightboxPhotos[lightboxIndex].url}
                alt="Enlarged installation step"
                className="max-w-[90vw] md:max-w-full max-h-[75vh] object-contain rounded-3xl border border-white/10 bg-navy-dark shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto cursor-zoom-out select-none"
                onClick={closeLightbox}
                referrerPolicy="no-referrer"
              />

              {/* Next button */}
              {lightboxPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={nextPhoto}
                  className="absolute right-2 md:-right-16 w-12 h-12 md:w-14 md:h-14 bg-white/5 border border-white/10 hover:bg-amber hover:text-navy hover:border-amber text-white rounded-full flex items-center justify-center transition-all cursor-pointer z-50 backdrop-blur-sm shadow-xl hover:scale-105 active:scale-95"
                  title="Next Photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Hint overlay */}
            <div className="absolute bottom-4 text-[10px] text-white/30 uppercase tracking-widest font-mono text-center max-w-xs md:max-w-md bg-white/[0.02] border border-white/5 px-4 py-2 rounded-2xl select-none">
              {lang === 'ku' 
                ? 'مۆبایل یان کیبۆرد: لای ڕاست و چەپ بکاربهێنە بۆ بینینی سەرجەم وێنەکان' 
                : 'Navigation: Use side buttons or keyboard arrows to browse all photos'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Elegance Delete Confirmation Dialog (Iframe proof) */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-navy border border-red-500/35 rounded-3xl p-6 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
              dir={lang === 'ku' ? 'rtl' : 'ltr'}
            >
              {/* Background amber/red glow */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col gap-4 text-center">
                <div className="w-12 h-12 bg-red-600/15 border border-red-500/30 rounded-full flex items-center justify-center self-center text-red-500 mb-2 animate-pulse">
                  <Trash2 className="w-5 h-5" />
                </div>

                <h3 className="text-base font-semibold text-white tracking-wide">
                  {lang === 'ku' ? 'پاکتاوکردن و سڕینەوە' : 'Confirm Action'}
                </h3>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-light">
                  {confirmDelete.type === 'folder'
                    ? (lang === 'ku' 
                        ? 'دڵنیایت لە سڕینەوەی ئەم پڕۆژەیە بە سەرجەم وێنەکانیەوە؟ ئەم بڕیارە ناگەڕێتەوە.' 
                        : 'Are you sure you want to delete this installation project folder and all its photos? This action cannot be undone.')
                    : (lang === 'ku' 
                        ? 'دڵنیایت لە سڕینەوەی ئەم وێنەیە؟ ئەم بڕیارە ناگەڕێتەوە.' 
                        : 'Are you sure you want to delete this photo from the project folder? This action cannot be undone.')
                  }
                </p>

                <div className="flex items-center justify-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirmDelete.type === 'folder') {
                        deleteProjectFolder(activeTab, confirmDelete.folderId);
                      } else if (confirmDelete.type === 'photo' && confirmDelete.photoId) {
                        deletePhotoFromFolder(activeTab, confirmDelete.folderId, confirmDelete.photoId);
                      }
                      setConfirmDelete(null);
                    }}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-medium text-xs tracking-wider uppercase rounded-2xl transition-all cursor-pointer shadow-lg shadow-red-900/20"
                  >
                    {lang === 'ku' ? 'بەڵێ، بسڕەوە' : 'Yes, Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(null)}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 text-slate-300 hover:text-white font-medium text-xs tracking-wider uppercase rounded-2xl transition-all cursor-pointer"
                  >
                    {lang === 'ku' ? 'ڕەتکردنەوە' : 'Cancel'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
