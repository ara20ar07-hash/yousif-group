import { ProjectFolder } from '../components/OwnerContext';

// Import local high-resolution assets
import underfloorGold from '../assets/images/hero_underfloor_gold_1785840550929.jpg';
import underfloor3D from '../assets/images/underfloor_3d_crisp_1785840343999.jpg';
import underfloorCutaway from '../assets/images/hero_underfloor_cutaway_1785828923290.jpg';
import underfloorDetail from '../assets/images/underfloor_heating_3d_cutaway_1785827090723.jpg';

import radiatorGold from '../assets/images/hero_radiator_gold_1785840568531.jpg';
import radiatorCrisp from '../assets/images/radiator_luxury_crisp_1785840365674.jpg';
import radiatorLuxury from '../assets/images/hero_radiator_luxury_1785830054080.jpg';

import solarSunset from '../assets/images/hero_solar_sunset_1785840582170.jpg';
import solarCrisp from '../assets/images/solar_panels_crisp_1785840381344.jpg';
import solarLuxury from '../assets/images/hero_solar_luxury_1785830072640.jpg';

export const initialProjectsData: Record<string, ProjectFolder[]> = {
  // 01: Heat Pump Systems
  '01': [
    {
      id: 'hp-folder-01',
      titleEn: 'Air-to-Water Heat Pump & Buffer Station',
      titleKu: 'پڕۆژەی هیت پەمپی گەرمی هەوا-بۆ-ئاو و تانکی بافەر',
      descEn: 'Supply and certified installation of high-efficiency DC inverter heat pumps integrated with thermal buffer storage tanks and hydronic underfloor heating loops.',
      descKu: 'دابینکردن و بەستنی سیستەمی پەمپی گەرمی ئینڤێرتەر بە تانکی عەمباری بافەر بۆ گەرمکردنی ئاوی تۆڕی ژێرزەوی بە بەرزترین لێهاتوویی وزە.',
      cityEn: 'Sulaymaniyah (Dukan Villa)',
      cityKu: 'سلێمانی (ڤێلای دووکان)',
      date: 'Recent Project',
      photos: [
        {
          id: 'hp-p1',
          url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: 'hp-p2',
          url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: 'hp-p3',
          url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: 'hp-p4',
          url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1000&q=80'
        }
      ]
    }
  ],

  // 02: Under-floor Heating System
  '02': [
    {
      id: 'uf-folder-01',
      titleEn: 'Hydronic Underfloor Heating & Manifold Network',
      titleKu: 'تۆڕی گەرمی ژێرزەوی و مانیفۆڵدی ناوەندی',
      descEn: 'High-density polystyrene insulation boards, continuous seamless PEX-a spiral pipe layout, and multi-zone balanced brass manifold distribution.',
      descKu: 'عەزلکردنی چڕ بە فۆم، ڕاکێشانی بۆری PEX-a بەردەوام بە شێوەی بازنەیی و مانیفۆڵدی پێشکەوتووی دابەشکردنی گەرمی.',
      cityEn: 'Sulaymaniyah (Sarchinar & Bakrajo)',
      cityKu: 'سلێمانی (سەرچنار و بەکرەجۆ)',
      date: 'Recent Project',
      photos: [
        { id: 'uf-p1', url: underfloorGold },
        { id: 'uf-p2', url: underfloor3D },
        { id: 'uf-p3', url: underfloorCutaway },
        { id: 'uf-p4', url: underfloorDetail },
        {
          id: 'uf-p5',
          url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1000&q=80'
        }
      ]
    }
  ],

  // 03: Radiator Heating (شۆفاژ)
  '03': [
    {
      id: 'rad-folder-01',
      titleEn: 'Central Boiler Room & European Panel Radiator System',
      titleKu: 'ژووری بۆیلەری ناوەندی و پانێڵی شۆفاژ',
      descEn: 'Installation of premium European panel radiators, insulated copper boiler manifolds, and thermostatic precision regulation valves.',
      descKu: 'بەستنی شۆفاژی پانێڵی ئەوروپی لەگەڵ ژووری بۆیلەری ناوەندی بە بۆری مس و قوفڵی حەراری زیرەک.',
      cityEn: 'Sulaymaniyah & Kurdistan',
      cityKu: 'سلێمانی و سەرانسەری کوردستان',
      date: 'Recent Project',
      photos: [
        { id: 'rad-p1', url: radiatorGold },
        { id: 'rad-p2', url: radiatorCrisp },
        { id: 'rad-p3', url: radiatorLuxury },
        {
          id: 'rad-p4',
          url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1000&q=80'
        }
      ]
    }
  ],

  // 04: Gas Networks (تۆڕی غاز)
  '04': [
    {
      id: 'gas-folder-01',
      titleEn: 'LPG Central Gas Pipeline & Leak Safety Network',
      titleKu: 'تۆڕی مەرکەزی غازی LPG و هەستیاری سەلامەتی',
      descEn: 'Seamless carbon steel welded distribution pipelines, dual-stage pressure reduction station, and smart automatic shut-off gas detectors.',
      descKu: 'ڕاکێشانی بۆری پۆڵای بێ درز، وێستگەی ڕێکخستنی پەستان و قوفڵی ئۆتۆماتیکی دژە دزەکردن بۆ ماڵ و باڵەخانە بازرگانییەکان.',
      cityEn: 'Sulaymaniyah & Erbil',
      cityKu: 'سلێمانی و هەولێر',
      date: 'Recent Project',
      photos: [
        {
          id: 'gas-p1',
          url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: 'gas-p2',
          url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: 'gas-p3',
          url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: 'gas-p4',
          url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1000&q=80'
        }
      ]
    }
  ],

  // 05: Solar Systems (سۆلار)
  '05': [
    {
      id: 'solar-folder-01',
      titleEn: 'Tier-1 Monocrystalline Solar & Lithium Storage Project',
      titleKu: 'پرۆژەی وزەی خۆر بە پاتری لیسیۆم و پانێڵی مۆنۆ',
      descEn: 'Rooftop monocrystalline photovoltaic array with hybrid inverter synchronization and high-cycle LiFePO4 battery bank.',
      descKu: 'بەستنی پانێڵی مۆنۆ کریستاڵ بە گۆشەی ڕێکخراو لەگەڵ ئینڤێرتەری هایبرید و پاتری لیثیۆم فۆسفاتی ئاسن.',
      cityEn: 'Sulaymaniyah (Qalachwal & Dukan)',
      cityKu: 'سلێمانی (قەڵاچواڵان و دووکان)',
      date: 'Recent Project',
      photos: [
        { id: 'solar-p1', url: solarSunset },
        { id: 'solar-p2', url: solarCrisp },
        { id: 'solar-p3', url: solarLuxury },
        {
          id: 'solar-p4',
          url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80'
        }
      ]
    }
  ],

  // 06: Fire Suppression (ئاگرکوژێنەوە)
  '06': [
    {
      id: 'fire-folder-01',
      titleEn: 'NFPA Automatic Sprinkler & Fire Pump Station',
      titleKu: 'تۆڕی ئاگرکوژێنەوە بە ئاوپڕژێن و پەمپخانەی ستاندارد',
      descEn: 'Certified wet sprinkler network with quick-response thermal glass bulbs, dual electric & diesel backup fire booster pumps, and alarm control panels.',
      descKu: 'سیستەمی ئاگرکوژێنەوەی تەواو بە ستانداردی NFPA، زمانەی هەستیاری حەراری و پەمپی دیزڵ و کارەبایی پشتیوان.',
      cityEn: 'Sulaymaniyah Commercial Center',
      cityKu: 'سلێمانی',
      date: 'Recent Project',
      photos: [
        {
          id: 'fire-p1',
          url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: 'fire-p2',
          url: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: 'fire-p3',
          url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80'
        },
        {
          id: 'fire-p4',
          url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&w=1000&q=80'
        }
      ]
    }
  ]
};
