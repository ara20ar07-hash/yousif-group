import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface ProjectPhoto {
  id: string;
  url: string;
  caption: string;
  captionKu: string;
  projectCity: string;
  projectCityKu: string;
  date: string;
}

interface OwnerContextType {
  isOwnerLoggedIn: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  customPhotos: Record<string, ProjectPhoto[]>;
  addProjectPhoto: (serviceId: string, photo: Omit<ProjectPhoto, 'id' | 'date'>) => void;
  deleteProjectPhoto: (serviceId: string, photoId: string) => void;
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string | null) => void;
}

const OwnerContext = createContext<OwnerContextType | undefined>(undefined);

// Default Pre-seeded high-quality Unsplash image configurations for each service categories
export const defaultPhotos: Record<string, ProjectPhoto[]> = {
  '01': [
    {
      id: 'def-01-1',
      url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      caption: 'VRF Central Air Conditioning compressors installed on restaurant roof block.',
      captionKu: 'کۆمپرێسەری مەرکەزی VRF تازە دامەزراو لەسەر سەقفی پڕۆژەی خواردنگە.',
      projectCity: 'Sulaymaniyah',
      projectCityKu: 'سلێمانی',
      date: 'May 2026'
    },
    {
      id: 'def-01-2',
      url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=800&q=80',
      caption: 'Main indoor air handler maintenance inspection & air balance configuration.',
      captionKu: 'پشکنین و سەرپەرشتیکردنی فلتەرەکان و بڵاوکارە مەرکەزییەکان.',
      projectCity: 'Ranya',
      projectCityKu: 'ڕانیە',
      date: 'April 2026'
    }
  ],
  '02': [
    {
      id: 'def-02-1',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      caption: 'Underfloor radiant PEX-a hydronic loop laying atop thick polyurethane isolation panels.',
      captionKu: 'دانانی هێڵە حەرارییەکانی ژێر زەوی PEX-a لەسەر فۆمی نەهێشتنی بەفیڕۆچوونی گەرمی.',
      projectCity: 'Sulaymaniyah (Sarchinar)',
      projectCityKu: 'سلێمانی (سەرچنار)',
      date: 'February 2026'
    },
    {
      id: 'def-02-2',
      url: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?auto=format&fit=crop&w=800&q=80',
      caption: 'Premium control flow manifolds with computerized balance dials and pressure regulators.',
      captionKu: 'مانیفۆڵدی گواستنەوەی سەرەکی پێکهاتوو لە پێوەر و رێکخەرەکانی پەستان.',
      projectCity: 'Halabja',
      projectCityKu: 'هەڵەبجە',
      date: 'March 2026'
    }
  ],
  '03': [
    {
      id: 'def-03-1',
      url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',
      caption: 'Minimalist aluminum panel radiator mounted inside high-end custom designed villa living room.',
      captionKu: 'پانێڵی سپی کلاسیك بۆ شۆفاژی دیواری لە ناوەوەی ڤێلا.',
      projectCity: 'Erbil',
      projectCityKu: 'هەولێر',
      date: 'December 2025'
    },
    {
      id: 'def-03-2',
      url: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=800&q=80',
      caption: 'Integrated boiler system installation check with fully pressure-certified copper couplings.',
      captionKu: 'پشکنینی بۆرییە مسە کورت و سەرەکییەکانی پەرەپێدانی بۆیلەر.',
      projectCity: 'Sulaymaniyah (Bakrajo)',
      projectCityKu: 'سلێمانی (بەکراین)',
      date: 'January 2026'
    }
  ],
  '04': [
    {
      id: 'def-04-1',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      caption: 'Heavy gas distribution line manifolds equipped with quick trigger shutoff valves.',
      captionKu: 'تۆڕی مانیفۆڵدی دابەشکاری غاز یاوەر بە قوفڵی پارامی لەرەلەر.',
      projectCity: 'Sulaymaniyah Industrial Zone',
      projectCityKu: 'ناوچەی پیشەسازی سلێمانی',
      date: 'April 2026'
    },
    {
      id: 'def-04-2',
      url: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      caption: 'Solenoid automated emergency cutoff tests on welded seamless carbon lines.',
      captionKu: 'پۆڵای بەستراوی بێ درز و تاقیکردنەوەی گرژی دزەکردن.',
      projectCity: 'Kalar',
      projectCityKu: 'کەلار',
      date: 'March 2026'
    }
  ],
  '05': [
    {
      id: 'def-05-1',
      url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
      caption: 'Curvaceous high-efficiency solar panel modules aligned on south-facing structural angles.',
      captionKu: 'پانێڵی پێشکەوتووی وزەی خۆر لەسەر سەقفی خانوو بۆ بەرهەمهێنانی کارەبا.',
      projectCity: 'Sulaymaniyah (Qaiwan City)',
      projectCityKu: 'سلێمانی (شارۆچکەی قەیوان)',
      date: 'May 2026'
    },
    {
      id: 'def-05-2',
      url: 'https://images.unsplash.com/photo-1516216628859-9bccecad13fa?auto=format&fit=crop&w=800&q=80',
      caption: 'Deep cell lithium storage cabinet installation configured with smart digital inverter control screen.',
      captionKu: 'کابینەی پێشکەوتووی پاترییەکان و ئینڤێرتەر بۆ کارەبای هەمیشەیی.',
      projectCity: 'Koya',
      projectCityKu: 'کۆیە',
      date: 'June 2026'
    }
  ],
  '06': [
    {
      id: 'def-06-1',
      url: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=800&q=80',
      caption: 'Wet carbon fire suppression distribution line installation under concrete base ceilings.',
      captionKu: 'بۆری مەرکەزی ئاگری ئۆتۆماتیکی و جێگیرکردنی زمانەی هەستیار بۆ گەرمی.',
      projectCity: 'Sulaymaniyah Mall',
      projectCityKu: 'سلێمانی مۆڵ',
      date: 'January 2026'
    }
  ]
};

export function OwnerProvider({ children }: { children: ReactNode }) {
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('yousif_company_owner_auth') === 'true';
  });

  const [customPhotos, setCustomPhotos] = useState<Record<string, ProjectPhoto[]>>(() => {
    const saved = localStorage.getItem('yousif_company_custom_photos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing custom photos', e);
      }
    }
    return {};
  });

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const login = (password: string): boolean => {
    if (password === '12345') {
      setIsOwnerLoggedIn(true);
      localStorage.setItem('yousif_company_owner_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsOwnerLoggedIn(false);
    localStorage.removeItem('yousif_company_owner_auth');
  };

  const addProjectPhoto = (serviceId: string, photo: Omit<ProjectPhoto, 'id' | 'date'>) => {
    const newPhoto: ProjectPhoto = {
      ...photo,
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    setCustomPhotos((prev) => {
      const updatedList = prev[serviceId] ? [...prev[serviceId], newPhoto] : [newPhoto];
      const nextCustom = { ...prev, [serviceId]: updatedList };
      localStorage.setItem('yousif_company_custom_photos', JSON.stringify(nextCustom));
      return nextCustom;
    });
  };

  const deleteProjectPhoto = (serviceId: string, photoId: string) => {
    setCustomPhotos((prev) => {
      const currentList = prev[serviceId] || [];
      const updatedList = currentList.filter(photo => photo.id !== photoId);
      const nextCustom = { ...prev, [serviceId]: updatedList };
      localStorage.setItem('yousif_company_custom_photos', JSON.stringify(nextCustom));
      return nextCustom;
    });
  };

  return (
    <OwnerContext.Provider
      value={{
        isOwnerLoggedIn,
        login,
        logout,
        customPhotos,
        addProjectPhoto,
        deleteProjectPhoto,
        selectedServiceId,
        setSelectedServiceId
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
