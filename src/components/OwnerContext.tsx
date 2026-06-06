import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  arrayUnion 
} from 'firebase/firestore';
import { signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

export interface ProjectPhoto {
  id: string;
  url: string;
  caption: string;
  captionKu: string;
  projectCity: string;
  projectCityKu: string;
  date: string;
}

export interface ProjectPhotoItem {
  id: string;
  url: string;
}

export interface ProjectFolder {
  id: string;
  titleEn: string;
  titleKu: string;
  descEn: string;
  descKu: string;
  cityEn: string;
  cityKu: string;
  date: string;
  photos: ProjectPhotoItem[];
}

export interface EngineeringStep {
  titleEn: string;
  titleKu: string;
  descEn: string;
  descKu: string;
}

export interface ServiceDetail {
  id: string;
  titleEn: string;
  titleKu: string;
  titleAr?: string;
  cardDescEn: string;
  cardDescKu: string;
  subEn: string;
  subKu: string;
  descEn: string;
  descKu: string;
  steps: EngineeringStep[];
}

interface OwnerContextType {
  isOwnerLoggedIn: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  authError: string | null;
  customPhotos: Record<string, ProjectPhoto[]>;
  addProjectPhoto: (serviceId: string, photo: Omit<ProjectPhoto, 'id' | 'date'>) => void;
  deleteProjectPhoto: (serviceId: string, photoId: string) => void;
  // Modern project folders methods
  customProjects: Record<string, ProjectFolder[]>;
  addProjectFolder: (serviceId: string, folder: Omit<ProjectFolder, 'id' | 'date'>) => void;
  updateProjectFolder: (serviceId: string, folderId: string, updated: Partial<ProjectFolder>) => void;
  deleteProjectFolder: (serviceId: string, folderId: string) => void;
  addPhotoToFolder: (serviceId: string, folderId: string, photoUrl: string) => void;
  deletePhotoFromFolder: (serviceId: string, folderId: string, photoId: string) => void;
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string | null) => void;
  servicesData: ServiceDetail[];
  updateServiceStep: (serviceId: string, stepIndex: number, updatedStep: EngineeringStep) => void;
  updateServiceCore: (serviceId: string, updatedFields: Partial<Omit<ServiceDetail, 'id' | 'steps'>>) => void;
}

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

// Core initial system solutions and steps
const initialServicesData: ServiceDetail[] = [
  {
    id: '01',
    titleEn: 'Cooling Systems',
    titleKu: 'سیستەمی ساردی',
    titleAr: 'سیستەمی ساردی',
    cardDescEn: 'Supply and installation of central air conditioning, split units, and ducted cooling systems optimised for the harsh summer heat.',
    cardDescKu: 'دابینکردن و دانانی سپلیت و سیستەمی ساردی مەرکەزی بۆ بەرگەگرتنی گەرمای هاوین.',
    subEn: 'Central VRF, Ducted Splits, & High-efficiency cooling grids.',
    subKu: 'سیستەمی فێنککەرەوەی ناوەندی، دەکتی سپلیت و یەکەکانی فێنککردنەوە.',
    descEn: 'We deliver comprehensive thermal load engineering. Yousif Company installs state-of-the-art Variable Refrigerant Flow (VRF) and inverter systems customized specifically for the Iraqi summer temperatures exceed 50°C.',
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
    titleAr: 'سیستەمی گەرمی',
    cardDescEn: 'Expert design and fitting of underfloor, radiator, and central heating solutions keeping homes warm through cold winters.',
    cardDescKu: 'نەخشەسازی و دانانی سیستەمی گەرمکەرەوە بۆ هێشتنەوەی ماڵەکان بە گەرمی لە زستاندا.',
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
        descKu: 'کۆنتڕۆڵ کردنی بڕی گەرمی سووڕاو لە مانیفۆڵدی ناوەندی, گەرەنتی کردنی کۆنتڕۆڵی پلەی گەرمی هەر ژوورێک بە جیا.'
      }
    ]
  },
  {
    id: '03',
    titleEn: 'Radiator Heating',
    titleKu: 'شۆفاژ',
    titleAr: 'شۆفاژ',
    cardDescEn: 'Supply and installation of modern radiator systems, including full boiler setup and hydronic heating networks.',
    cardDescKu: 'دابینکردن و دانانی سیستەمی شۆفاژ و بۆیلەر.',
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
    titleAr: 'تۆڕی غاز',
    cardDescEn: 'Full-scale gas pipeline engineering, distribution networks, and connection services for residential and commercial properties.',
    cardDescKu: 'نەخشەسازی و ڕاکێشانی بۆری غاز بۆ ماڵ و شوێنە بازرگانییەکان.',
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
    titleAr: 'سۆلار',
    cardDescEn: 'Clean-energy solar panel installation for homes and businesses — reducing electricity bills with sustainable, renewable power.',
    cardDescKu: 'دانانی پانێڵی وزەی خۆر بۆ کەمکردنەوەی تێچووی کارەبا.',
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
    titleAr: 'ئاگرکوژێنەوە',
    cardDescEn: 'Design and installation of fire detection and suppression systems to keep your property and people protected.',
    cardDescKu: 'نەخشەسازی و دانانی سیستەمی ئاگرکوژێنەوە بۆ پاراستنی سەلامەتی.',
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

export function OwnerProvider({ children }: { children: ReactNode }) {
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('yousif_company_owner_auth') === 'true';
  });

  const [customPhotos, setCustomPhotos] = useState<Record<string, ProjectPhoto[]>>({});
  const [customProjects, setCustomProjects] = useState<Record<string, ProjectFolder[]>>({});
  const [servicesData, setServicesData] = useState<ServiceDetail[]>(initialServicesData);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Auto-signin anonymously to Firebase Auth if owner is authenticated locally on any mount
  useEffect(() => {
    if (isOwnerLoggedIn && !auth.currentUser) {
      signInAnonymously(auth)
        .then(() => {
          console.log('Successfully authenticated owner session on Firebase');
          setAuthError(null);
        })
        .catch((err) => {
          const errMsg = err instanceof Error ? err.message : String(err);
          setAuthError(errMsg);
          console.info('Firebase Auth anonymous sign-in skipped or pending activation in Console:', errMsg);
        });
    }
  }, [isOwnerLoggedIn]);

  // Real-time listener for Services
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'services'), (snapshot) => {
      if (snapshot.empty) {
        // Seed initial services data if clean database and user is owner
        if (isOwnerLoggedIn) {
          initialServicesData.forEach(async (svc) => {
            try {
              await setDoc(doc(db, 'services', svc.id), svc);
            } catch (err) {
              console.info("Could not seed database services list:", err);
            }
          });
        }
        return;
      }
      const servicesList: ServiceDetail[] = [];
      snapshot.forEach((snapshotDoc) => {
        servicesList.push(snapshotDoc.data() as ServiceDetail);
      });
      // Sort alphabetically/numerically by id to prevent sequence jumps
      servicesList.sort((a, b) => a.id.localeCompare(b.id));
      setServicesData(servicesList);
    }, (error) => {
      console.warn('Firestore Services snapshot listener: database clean/listening offline:', error.message);
    });

    return () => unsub();
  }, [isOwnerLoggedIn]);

  // Real-time listener for Project Folders
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const records: Record<string, ProjectFolder[]> = {};
      snapshot.forEach((snapshotDoc) => {
        const data = snapshotDoc.data();
        const serviceId = data.serviceId;
        if (serviceId) {
          if (!records[serviceId]) {
            records[serviceId] = [];
          }
          records[serviceId].push(data as ProjectFolder);
        }
      });
      setCustomProjects(records);
    }, (error) => {
      console.warn('Firestore Projects snapshot listener: database clean/listening offline:', error.message);
    });

    return () => unsub();
  }, []);

  // Real-time listener for Legacy Flat Photos
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'legacy_photos'), (snapshot) => {
      const records: Record<string, ProjectPhoto[]> = {};
      snapshot.forEach((snapshotDoc) => {
        const data = snapshotDoc.data();
        const serviceId = data.serviceId;
        if (serviceId) {
          if (!records[serviceId]) {
            records[serviceId] = [];
          }
          records[serviceId].push(data as ProjectPhoto);
        }
      });
      setCustomPhotos(records);
    }, (error) => {
      console.warn('Firestore Legacy Photos snapshot listener: database clean/listening offline:', error.message);
    });

    return () => unsub();
  }, []);

  const login = (password: string): boolean => {
    if (password === '12345') {
      setIsOwnerLoggedIn(true);
      localStorage.setItem('yousif_company_owner_auth', 'true');
      signInAnonymously(auth)
        .then(() => {
          console.log('Successfully logged in anonymously to Firebase');
          setAuthError(null);
        })
        .catch((err) => {
          const errMsg = err instanceof Error ? err.message : String(err);
          setAuthError(errMsg);
          console.info('Firebase login sign-in status:', errMsg);
        });
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsOwnerLoggedIn(false);
    localStorage.removeItem('yousif_company_owner_auth');
    setAuthError(null);
    signOut(auth).catch((err) => console.log('Sign out info:', err));
  };

  const addProjectPhoto = async (serviceId: string, photo: Omit<ProjectPhoto, 'id' | 'date'>) => {
    const photoId = `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newPhoto: ProjectPhoto = {
      ...photo,
      id: photoId,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    try {
      await setDoc(doc(db, 'legacy_photos', photoId), {
        serviceId,
        ...newPhoto
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `legacy_photos/${photoId}`);
    }
  };

  const deleteProjectPhoto = async (serviceId: string, photoId: string) => {
    try {
      await deleteDoc(doc(db, 'legacy_photos', photoId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `legacy_photos/${photoId}`);
    }
  };

  const addProjectFolder = async (serviceId: string, folderData: Omit<ProjectFolder, 'id' | 'date'>) => {
    const folderId = `folder-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newFolder: ProjectFolder = {
      ...folderData,
      id: folderId,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      photos: []
    };

    try {
      await setDoc(doc(db, 'projects', folderId), {
        serviceId,
        ...newFolder
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `projects/${folderId}`);
    }
  };

  const updateProjectFolder = async (serviceId: string, folderId: string, updated: Partial<ProjectFolder>) => {
    try {
      await setDoc(doc(db, 'projects', folderId), updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${folderId}`);
    }
  };

  const deleteProjectFolder = async (serviceId: string, folderId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', folderId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${folderId}`);
    }
  };

  const addPhotoToFolder = async (serviceId: string, folderId: string, photoUrl: string) => {
    const newPhoto = {
      id: `photo-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      url: photoUrl
    };

    try {
      await updateDoc(doc(db, 'projects', folderId), {
        photos: arrayUnion(newPhoto)
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${folderId}`);
    }
  };

  const deletePhotoFromFolder = async (serviceId: string, folderId: string, photoId: string) => {
    const folder = (customProjects[serviceId] || []).find((f) => f.id === folderId);
    if (!folder) return;

    const remainingPhotos = folder.photos.filter((p) => p.id !== photoId);

    try {
      await updateDoc(doc(db, 'projects', folderId), {
        photos: remainingPhotos
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${folderId}`);
    }
  };

  const updateServiceStep = async (serviceId: string, stepIndex: number, updatedStep: EngineeringStep) => {
    const svc = servicesData.find((s) => s.id === serviceId);
    if (!svc) return;

    const nextSteps = [...svc.steps];
    nextSteps[stepIndex] = updatedStep;

    try {
      await setDoc(doc(db, 'services', serviceId), { steps: nextSteps }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `services/${serviceId}`);
    }
  };

  const updateServiceCore = async (serviceId: string, updatedFields: Partial<Omit<ServiceDetail, 'id' | 'steps'>>) => {
    try {
      await setDoc(doc(db, 'services', serviceId), updatedFields, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `services/${serviceId}`);
    }
  };

  return (
    <OwnerContext.Provider
      value={{
        isOwnerLoggedIn,
        login,
        logout,
        authError,
        customPhotos,
        addProjectPhoto,
        deleteProjectPhoto,
        customProjects,
        addProjectFolder,
        updateProjectFolder,
        deleteProjectFolder,
        addPhotoToFolder,
        deletePhotoFromFolder,
        selectedServiceId,
        setSelectedServiceId,
        servicesData,
        updateServiceStep,
        updateServiceCore
      }}
    >
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwner() {
  const context = useContext(OwnerContext);
  if (!context) {
    throw new Error('useOwner must be used within an OwnerProvider');
  }
  return context;
}
