import React, { useState, useRef, MouseEvent, ChangeEvent } from 'react';
import { MousePointer2, Flame, Wrench, CircleDot, RefreshCw, Minus, Upload, X, ClipboardList, Send, Pencil, Trash2, Plus, Sparkles, CheckCircle2, AlertTriangle, Sliders, Eye, EyeOff, Image as ImageIcon, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';

const evaluateCalculation = (input: string): number => {
  if (!input) return 0;
  // Convert any Kurdish/Arabic digits to Western Arabic digits
  let cleaned = input.replace(/[٠-٩]/g, d => (d.charCodeAt(0) - 1632).toString())
                     .replace(/[۰-۹]/g, d => (d.charCodeAt(0) - 1776).toString());
  
  cleaned = cleaned.toLowerCase().replace(/x|×/g, '*');
  const safeExpression = cleaned.replace(/[^0-9.+\-*/() ]/g, '');
  try {
    if (!safeExpression.trim()) return 0;
    const res = new Function(`return (${safeExpression})`)();
    return typeof res === 'number' && !isNaN(res) ? Number(res.toFixed(2)) : 0;
  } catch {
    return 0;
  }
};

const getEditableFormula = (room: any) => {
  if (!room.formula) return room.areaSqm.toString();
  if (room.formula.includes('=')) {
    return room.formula.split('=')[0].replace(/m|sqm| /g, '').trim();
  }
  return room.formula;
};

// Simple rectangular radiator tool icon matching Lucide toolbar style
const RadiatorIcon = ({ className = "w-4 h-4 text-neutral-300" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="12" rx="1.5" />
    <line x1="7" y1="9" x2="7" y2="15" />
    <line x1="11" y1="9" x2="11" y2="15" />
    <line x1="15" y1="9" x2="15" y2="15" />
    <line x1="19" y1="9" x2="19" y2="15" />
  </svg>
);

export const RADIATOR_SIZES = [80, 100, 120, 140, 160, 180];

export type RadiatorRecommendation = {
  count: 1 | 2;
  sizes: [number, number?];
  totalCm: number;
  coverageArea: number;
  explanationEn: string;
  explanationKu: string;
};

// Helper to determine if a room is a bedroom
export const isBedroomRoom = (nameEn?: string, nameKu?: string): boolean => {
  const text = `${nameEn || ''} ${nameKu || ''}`.toLowerCase();
  return (
    text.includes('bed') ||
    text.includes('sleep') ||
    text.includes('master') ||
    text.includes('نوستن') ||
    text.includes('نووستن') ||
    text.includes('نوم') ||
    text.includes('منام')
  );
};

// Helper to determine if a room is a dressing room / walk-in closet
export const isDressingRoom = (nameEn?: string, nameKu?: string): boolean => {
  const text = `${nameEn || ''} ${nameKu || ''}`.toLowerCase();
  return (
    text.includes('dress') ||
    text.includes('closet') ||
    text.includes('wardrobe') ||
    text.includes('walk-in') ||
    text.includes('cloth') ||
    text.includes('جلگۆڕین') ||
    text.includes('جل گۆڕین') ||
    text.includes('مەلبەس') ||
    text.includes('کنتۆر') ||
    text.includes('دۆڵاب') ||
    text.includes('جل')
  );
};

// Helper to automatically combine dressing rooms into their corresponding adjacent/suite bedrooms
export const combineDressingRoomsWithBedrooms = (rawRooms: any[]): any[] => {
  if (!Array.isArray(rawRooms) || rawRooms.length === 0) return rawRooms;

  const rooms = rawRooms.map(r => ({ ...r }));
  const dressingIndices: number[] = [];
  const bedroomIndices: number[] = [];

  rooms.forEach((r, idx) => {
    if (isDressingRoom(r.nameEn, r.nameKu)) {
      dressingIndices.push(idx);
    } else if (isBedroomRoom(r.nameEn, r.nameKu)) {
      bedroomIndices.push(idx);
    }
  });

  if (dressingIndices.length === 0 || bedroomIndices.length === 0) {
    return rooms;
  }

  const mergedDressingIndices = new Set<number>();

  dressingIndices.forEach(dIdx => {
    const dressing = rooms[dIdx];
    let matchedBedIdx: number = bedroomIndices[0];

    // 1. Try to match by index/number in the name (e.g. "Dressing 1" with "Bedroom 1")
    const dNumMatch = (dressing.nameEn + ' ' + dressing.nameKu).match(/\d+/);
    if (dNumMatch) {
      const dNum = dNumMatch[0];
      const found = bedroomIndices.find(bIdx => {
        const bText = rooms[bIdx].nameEn + ' ' + rooms[bIdx].nameKu;
        return bText.includes(dNum);
      });
      if (found !== undefined) {
        matchedBedIdx = found;
      }
    } else if (bedroomIndices.length > 1) {
      // 2. Try to match by geometric proximity
      if (dressing.box && typeof dressing.box.x === 'number' && typeof dressing.box.y === 'number') {
        const dcx = dressing.box.x + (dressing.box.width || 20) / 2;
        const dcy = dressing.box.y + (dressing.box.height || 20) / 2;
        let minDistance = Infinity;

        bedroomIndices.forEach(bIdx => {
          const bed = rooms[bIdx];
          if (bed.box && typeof bed.box.x === 'number' && typeof bed.box.y === 'number') {
            const bcx = bed.box.x + (bed.box.width || 20) / 2;
            const bcy = bed.box.y + (bed.box.height || 20) / 2;
            const dist = Math.hypot(dcx - bcx, dcy - bcy);
            if (dist < minDistance) {
              minDistance = dist;
              matchedBedIdx = bIdx;
            }
          }
        });
      } else {
        const precedingBed = bedroomIndices.filter(bIdx => bIdx < dIdx).pop();
        if (precedingBed !== undefined) {
          matchedBedIdx = precedingBed;
        }
      }
    }

    if (matchedBedIdx !== undefined && rooms[matchedBedIdx]) {
      const bedroom = rooms[matchedBedIdx];
      const bedArea = Number(bedroom.areaSqm) || 0;
      const dressArea = Number(dressing.areaSqm) || 0;
      const combinedArea = Number((bedArea + dressArea).toFixed(2));

      // Append dressing indicator to name if not already there
      if (!bedroom.nameEn.toLowerCase().includes('dress') && !bedroom.nameEn.toLowerCase().includes('closet')) {
        bedroom.nameEn = `${bedroom.nameEn} + Dressing`;
      }
      if (!bedroom.nameKu.includes('جلگۆڕین') && !bedroom.nameKu.includes('مەلبەس')) {
        bedroom.nameKu = `${bedroom.nameKu} + جلگۆڕین`;
      }

      const bedFormula = bedroom.formula || `${bedArea} m²`;
      const dressFormula = dressing.formula || `${dressArea} m²`;
      bedroom.formula = `${bedFormula} + ${dressFormula} = ${combinedArea} m²`;
      bedroom.areaSqm = combinedArea;
      bedroom.isHeated = true;
      bedroom.heatingOutputRequiredKw = Number((combinedArea * 0.15).toFixed(1));
      bedroom.loopCount = Math.max(1, Math.ceil(combinedArea / 12));

      mergedDressingIndices.add(dIdx);
    }
  });

  return rooms.filter((_, idx) => !mergedDressingIndices.has(idx));
};

// Standard available boiler capacities (kW)
export const STANDARD_BOILER_KW_SIZES = [9, 12, 16, 20, 32, 55];

// Calculate boiler capacity based on 150 Watts per m² (0.15 kW/m²) matching nearest standard size
export const getRecommendedBoilerKw = (heatedAreaSqm: number): number => {
  if (heatedAreaSqm <= 0) return 9;
  const requiredKw = heatedAreaSqm * 0.15; // 150 Watts / m²

  let nearest = STANDARD_BOILER_KW_SIZES[0];
  let minDiff = Math.abs(requiredKw - nearest);

  for (const size of STANDARD_BOILER_KW_SIZES) {
    const diff = Math.abs(requiredKw - size);
    if (diff <= minDiff) {
      minDiff = diff;
      nearest = size;
    }
  }
  return nearest;
};

// Intelligent Radiator Recommendation calculation
// Bedrooms do not need full heating (calibrated for 80% - 100% comfort factor ~0.85)
export const getRadiatorRecommendation = (areaSqm: number, isBedroom: boolean = false): RadiatorRecommendation => {
  const safeArea = Math.max(1, areaSqm);
  const heatFactor = isBedroom ? 0.85 : 1.0;
  const singleTargetCm = safeArea * 10 * heatFactor;

  if (singleTargetCm <= 180) {
    let bestSize = RADIATOR_SIZES[0];
    let minDiff = Infinity;
    for (const s of RADIATOR_SIZES) {
      const diff = s >= singleTargetCm ? (s - singleTargetCm) : (singleTargetCm - s) * 1.5;
      if (diff < minDiff) {
        minDiff = diff;
        bestSize = s;
      }
    }
    return {
      count: 1,
      sizes: [bestSize],
      totalCm: bestSize,
      coverageArea: (bestSize / 10) / heatFactor,
      explanationEn: `1 Radiator (${bestSize} cm)`,
      explanationKu: `١ ڕادێتەر (${bestSize} سـم)`
    };
  } else {
    // When >1 radiators needed, rule changes to 1m (100cm) per 12-14m² (average 13m²)!
    const multiTargetCm = ((safeArea * heatFactor) / 13) * 100;
    let bestPair: [number, number] = [100, 100];
    let minDiff = Infinity;

    for (let i = 0; i < RADIATOR_SIZES.length; i++) {
      for (let j = 0; j <= i; j++) {
        const s1 = RADIATOR_SIZES[i];
        const s2 = RADIATOR_SIZES[j];
        const sum = s1 + s2;
        const diff = sum >= multiTargetCm 
          ? (sum - multiTargetCm) + (s1 - s2) * 0.1 
          : (multiTargetCm - sum) * 1.5 + (s1 - s2) * 0.1;

        if (diff < minDiff) {
          minDiff = diff;
          bestPair = [s1, s2];
        }
      }
    }

    const totalCm = bestPair[0] + bestPair[1];
    return {
      count: 2,
      sizes: bestPair,
      totalCm: totalCm,
      coverageArea: ((totalCm / 100) * 13) / heatFactor,
      explanationEn: `2 Radiators (${bestPair[0]} cm + ${bestPair[1]} cm)`,
      explanationKu: `٢ ڕادێتەر (${bestPair[0]} سـم + ${bestPair[1]} سـم)`
    };
  }
};

// Helper function to detect which room a canvas coordinate belongs to
export const getDetectedRoomIndex = (compX: number, compY: number, rooms: any[] | undefined): number => {
  if (!rooms || rooms.length === 0) return 0;

  // 1. Check if coordinate falls inside room box percentage bounds
  for (let i = 0; i < rooms.length; i++) {
    const r = rooms[i];
    if (r.box && typeof r.box.x === 'number' && typeof r.box.y === 'number') {
      const rx = (r.box.x / 100) * 800;
      const ry = (r.box.y / 100) * 550;
      const rw = ((r.box.width || 20) / 100) * 800;
      const rh = ((r.box.height || 20) / 100) * 550;
      if (compX >= rx && compX <= rx + rw && compY >= ry && compY <= ry + rh) {
        return i;
      }
    }
  }

  // 2. Find room with closest center coordinate
  let closestIdx = 0;
  let minDistance = Infinity;
  let heatedCounter = 0;

  for (let i = 0; i < rooms.length; i++) {
    const r = rooms[i];
    let cx = 160;
    let cy = 160;

    if (r.box && typeof r.box.x === 'number' && typeof r.box.y === 'number') {
      cx = ((r.box.x + (r.box.width || 20) / 2) / 100) * 800;
      cy = ((r.box.y + (r.box.height || 20) / 2) / 100) * 550;
    } else {
      const gridCols = Math.min(3, Math.ceil(Math.sqrt(rooms.filter(rm => rm.isHeated !== false).length || 1)));
      const col = heatedCounter % gridCols;
      const row = Math.floor(heatedCounter / gridCols);
      cx = 160 + col * 240;
      cy = 160 + row * 150;
      if (r.isHeated !== false) heatedCounter++;
    }

    const dist = Math.hypot(compX - cx, compY - cy);
    if (dist < minDistance) {
      minDistance = dist;
      closestIdx = i;
    }
  }

  return closestIdx;
};

// Helper function to automatically place radiators inside each detected room after scan
export const autoGenerateRoomRadiators = (
  rooms: any[] | undefined, 
  existingComps: ComponentData[] = []
): ComponentData[] => {
  if (!rooms || rooms.length === 0) return existingComps;

  // Retain other custom components while removing auto boiler and manifold icons
  const nonRadiators = existingComps.filter(c => c.type !== 'radiator' && c.type !== 'boiler' && c.type !== 'manifold');
  
  const baseComps: ComponentData[] = [...nonRadiators];

  const newRadiators: ComponentData[] = [];
  let heatedIndex = 0;
  const heatedRooms = rooms.filter(r => r.isHeated !== false);
  const totalHeated = heatedRooms.length || 1;

  rooms.forEach((room, rIdx) => {
    if (room.isHeated === false) return;

    const isBed = isBedroomRoom(room.nameEn, room.nameKu);
    const rec = getRadiatorRecommendation(room.areaSqm, isBed);

    // Calculate room center position inside 800x550 blueprint canvas
    let cx = 160;
    let cy = 160;

    if (room.box && typeof room.box.x === 'number' && typeof room.box.y === 'number') {
      const rx = (room.box.x / 100) * 800;
      const ry = (room.box.y / 100) * 550;
      const rw = ((room.box.width || 25) / 100) * 800;
      const rh = ((room.box.height || 25) / 100) * 550;
      cx = rx + rw / 2;
      cy = ry + rh / 2;
    } else {
      // Fallback distributed grid inside the floor plan canvas
      const gridCols = Math.min(3, Math.ceil(Math.sqrt(totalHeated)));
      const col = heatedIndex % gridCols;
      const row = Math.floor(heatedIndex / gridCols);
      cx = 160 + col * 240;
      cy = 160 + row * 150;
    }

    heatedIndex++;

    for (let i = 0; i < rec.count; i++) {
      const size = rec.sizes[i] || rec.sizes[0];
      const radId = `rad_auto_r${rIdx}_${i}_` + Math.random().toString(36).substring(2, 7);

      // Offset horizontally if a room has multiple radiators
      const offsetX = rec.count > 1 ? (i - (rec.count - 1) / 2) * 50 : 0;

      newRadiators.push({
        id: radId,
        type: 'radiator',
        x: Math.min(760, Math.max(40, Math.round(cx + offsetX))),
        y: Math.min(510, Math.max(40, Math.round(cy + 10))),
        sizeCm: size,
        assignedRoomIndex: rIdx,
        isCustomOverride: true
      });
    }
  });

  return [...baseComps, ...newRadiators];
};

// Automatic multi-radiator recalculation across rooms
export const autoRecalculateComponents = (
  comps: ComponentData[], 
  rooms: any[] | undefined
): ComponentData[] => {
  if (!rooms || rooms.length === 0) return comps;

  const roomRadMap: Record<number, ComponentData[]> = {};

  comps.forEach(c => {
    if (c.type === 'radiator') {
      const roomIdx = c.assignedRoomIndex !== undefined ? c.assignedRoomIndex : 0;
      if (roomIdx >= 0 && rooms[roomIdx]) {
        if (!roomRadMap[roomIdx]) roomRadMap[roomIdx] = [];
        roomRadMap[roomIdx].push(c);
      }
    }
  });

  const updatedComps = comps.map(c => ({ ...c }));

  Object.entries(roomRadMap).forEach(([rIdxStr, rads]) => {
    const rIdx = Number(rIdxStr);
    const room = rooms[rIdx];
    if (!room) return;

    const isBed = isBedroomRoom(room.nameEn, room.nameKu);
    const heatFactor = isBed ? 0.85 : 1.0;

    const targetCm = rads.length > 1 
      ? Math.max(80, Math.round(((room.areaSqm * heatFactor) / 13) * 100))
      : Math.max(80, Math.round(room.areaSqm * heatFactor * 10));

    let customSum = 0;
    const autoRads: ComponentData[] = [];

    rads.forEach(r => {
      if (r.isCustomOverride && r.sizeCm) {
        customSum += r.sizeCm;
      } else {
        autoRads.push(r);
      }
    });

    if (autoRads.length === 0) return;

    const remainingTarget = Math.max(0, targetCm - customSum);
    const count = autoRads.length;

    let computedSizes: number[] = [];

    if (count === 1) {
      if (rads.length === 1) {
        let bestS = RADIATOR_SIZES[0];
        let minDiff = Infinity;
        for (const s of RADIATOR_SIZES) {
          const diff = s >= targetCm ? (s - targetCm) : (targetCm - s) * 1.5;
          if (diff < minDiff) {
            minDiff = diff;
            bestS = s;
          }
        }
        computedSizes = [bestS];
      } else {
        let bestS = RADIATOR_SIZES[0];
        let minDiff = Infinity;
        for (const s of RADIATOR_SIZES) {
          const diff = Math.abs(s - remainingTarget);
          if (diff < minDiff) {
            minDiff = diff;
            bestS = s;
          }
        }
        computedSizes = [bestS];
      }
    } else if (count === 2) {
      let bestPair: [number, number] = [100, 100];
      let minDiff = Infinity;

      for (let i = 0; i < RADIATOR_SIZES.length; i++) {
        for (let j = 0; j <= i; j++) {
          const s1 = RADIATOR_SIZES[i];
          const s2 = RADIATOR_SIZES[j];
          const sum = s1 + s2;
          const diff = sum >= remainingTarget 
            ? (sum - remainingTarget) + (s1 - s2) * 0.1 
            : (remainingTarget - sum) * 1.5 + (s1 - s2) * 0.1;
          if (diff < minDiff) {
            minDiff = diff;
            bestPair = [s1, s2];
          }
        }
      }
      computedSizes = bestPair;
    } else {
      const share = remainingTarget / count;
      computedSizes = autoRads.map(() => {
        let bestS = RADIATOR_SIZES[0];
        let minDiff = Infinity;
        for (const s of RADIATOR_SIZES) {
          const diff = Math.abs(s - share);
          if (diff < minDiff) {
            minDiff = diff;
            bestS = s;
          }
        }
        return bestS;
      });
    }

    autoRads.forEach((rad, idx) => {
      const item = updatedComps.find(uc => uc.id === rad.id);
      if (item) {
        item.sizeCm = computedSizes[idx] || RADIATOR_SIZES[0];
        item.assignedRoomIndex = rIdx;
      }
    });
  });

  return updatedComps;
};

type Tool = 'select' | 'boiler' | 'radiator' | 'manifold' | 'valve' | 'pump' | 'pipe';

type ComponentData = { 
  id: string; 
  type: Exclude<Tool, 'select' | 'pipe'>; 
  x: number; 
  y: number;
  sizeCm?: number;
  sizeCm2?: number;
  radiatorCount?: 1 | 2;
  assignedRoomIndex?: number;
  isCustomOverride?: boolean;
};
type PipeData = { id: string; x1: number; y1: number; x2: number; y2: number };

const componentSpecs: Record<Exclude<Tool, 'select' | 'pipe'>, { name: { en: string; ku: string }; icon: React.ReactNode; borderColor: string }> = {
  boiler: { name: { en: 'Boiler / Furnace', ku: 'بۆیلەر / گەرمکەرەوە' }, icon: <Flame className="w-4 h-4 text-red-500" />, borderColor: '#ef4444' },
  radiator: { name: { en: 'Radiator Panel', ku: 'ڕادێتەر' }, icon: <RadiatorIcon className="w-4 h-4 text-neutral-300" />, borderColor: '#d4d4d4' },
  manifold: { name: { en: 'Pipe Manifold', ku: 'مانیفۆڵد' }, icon: <Wrench className="w-4 h-4 text-emerald-500" />, borderColor: '#10b981' },
  valve: { name: { en: 'Safety Valve', ku: 'قفڵی سەلامەتی' }, icon: <CircleDot className="w-4 h-4 text-amber-500" />, borderColor: '#f59e0b' },
  pump: { name: { en: 'Circulation Pump', ku: 'پەمپ' }, icon: <RefreshCw className="w-4 h-4 text-purple-500" />, borderColor: '#8b5cf6' }
};

export default function DesignerTool() {
  const { lang } = useLanguage();

  const [tool, setTool] = useState<Tool>('select');
  const [blueprint, setBlueprint] = useState<string | null>(null);
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [pipes, setPipes] = useState<PipeData[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [pipeStart, setPipeStart] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  // Radiator & Room names visibility control & status (off by default)
  const [showRadiators, setShowRadiators] = useState<boolean>(false);
  const [showRoomNames, setShowRoomNames] = useState<boolean>(false);
  const [hiddenRoomIndices, setHiddenRoomIndices] = useState<number[]>([]);
  const [whatsappStatusMsg, setWhatsappStatusMsg] = useState<string | null>(null);

  // AI Blueprint analysis states
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    rooms: Array<{
      nameEn: string;
      nameKu: string;
      areaSqm: number;
      heatingOutputRequiredKw: number;
      loopCount: number;
      isHeated?: boolean;
      formula?: string;
      box?: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }>;
    totalAreaSqm: number;
    recommendedBoilerKw: number;
    recommendedManifoldPorts: number;
    estimatedPipeSpacingCm: number;
    calculatedSummaryEn: string;
    calculatedSummaryKu: string;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  const totalHeatedArea = analysisResult
    ? Number(
        analysisResult.rooms
          .filter(r => r.isHeated !== false)
          .reduce((sum, r) => sum + r.areaSqm, 0)
          .toFixed(1)
      )
    : 0;

  const updateRoomProperty = (index: number, key: string, value: any) => {
    if (!analysisResult) return;
    const updatedRooms = [...analysisResult.rooms];
    
    updatedRooms[index] = {
      ...updatedRooms[index],
      [key]: value
    };

    if (key === 'formula') {
      const evaluatedArea = evaluateCalculation(value);
      updatedRooms[index].areaSqm = evaluatedArea;
      
      const isHeated = updatedRooms[index].isHeated !== false;
      updatedRooms[index].heatingOutputRequiredKw = isHeated ? Number((evaluatedArea * 0.15).toFixed(1)) : 0;
      if (isHeated) {
        updatedRooms[index].loopCount = Math.max(1, Math.ceil(evaluatedArea / 12));
      } else {
        updatedRooms[index].loopCount = 0;
      }
    }

    if (key === 'areaSqm') {
      const isHeated = updatedRooms[index].isHeated !== false;
      updatedRooms[index].heatingOutputRequiredKw = isHeated ? Number((value * 0.15).toFixed(1)) : 0;
      if (isHeated) {
        updatedRooms[index].loopCount = Math.max(1, Math.ceil(value / 12));
      } else {
        updatedRooms[index].loopCount = 0;
      }
    }

    if (key === 'isHeated') {
      if (value === false) {
        updatedRooms[index].heatingOutputRequiredKw = 0;
        updatedRooms[index].loopCount = 0;
      } else {
        updatedRooms[index].heatingOutputRequiredKw = Number((updatedRooms[index].areaSqm * 0.15).toFixed(1));
        updatedRooms[index].loopCount = Math.max(1, Math.ceil(updatedRooms[index].areaSqm / 12));
      }
    }

    const heatedRooms = updatedRooms.filter(r => r.isHeated !== false);
    const totalAreaSqm = Number(heatedRooms.reduce((sum, r) => sum + r.areaSqm, 0).toFixed(1));
    const recommendedBoilerKw = getRecommendedBoilerKw(totalAreaSqm);
    const recommendedManifoldPorts = updatedRooms.reduce((sum, r) => sum + r.loopCount, 0);

    setAnalysisResult({
      ...analysisResult,
      rooms: updatedRooms,
      totalAreaSqm,
      recommendedBoilerKw,
      recommendedManifoldPorts
    });
  };

  const removeRoom = (index: number) => {
    if (!analysisResult) return;
    const updatedRooms = analysisResult.rooms.filter((_, i) => i !== index);
    
    const heatedRooms = updatedRooms.filter(r => r.isHeated !== false);
    const totalAreaSqm = Number(heatedRooms.reduce((sum, r) => sum + r.areaSqm, 0).toFixed(1));
    const recommendedBoilerKw = getRecommendedBoilerKw(totalAreaSqm);
    const recommendedManifoldPorts = updatedRooms.reduce((sum, r) => sum + r.loopCount, 0);

    setAnalysisResult({
      ...analysisResult,
      rooms: updatedRooms,
      totalAreaSqm,
      recommendedBoilerKw,
      recommendedManifoldPorts
    });
  };

  const addNewRoom = () => {
    if (!analysisResult) return;
    const newRoom = {
      nameEn: "New Room",
      nameKu: "ژووری نوێ",
      areaSqm: 12,
      heatingOutputRequiredKw: 1.8,
      loopCount: 1,
      isHeated: true,
      formula: "3.00m x 4.00m = 12.00 sqm"
    };
    const updatedRooms = [...analysisResult.rooms, newRoom];
    
    const heatedRooms = updatedRooms.filter(r => r.isHeated !== false);
    const totalAreaSqm = Number(heatedRooms.reduce((sum, r) => sum + r.areaSqm, 0).toFixed(1));
    const recommendedBoilerKw = getRecommendedBoilerKw(totalAreaSqm);
    const recommendedManifoldPorts = updatedRooms.reduce((sum, r) => sum + r.loopCount, 0);

    setAnalysisResult({
      ...analysisResult,
      rooms: updatedRooms,
      totalAreaSqm,
      recommendedBoilerKw,
      recommendedManifoldPorts
    });
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBlueprint(event.target?.result as string);
        setAnalysisResult(null);
        setAnalysisError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setComponents([]);
    setPipes([]);
    setIsDrawing(false);
    setPipeStart(null);
    setBlueprint(null);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handleAIAnalyze = async () => {
    if (!blueprint) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setIsPermissionDenied(false);
    try {
      let response = await fetch('/api/analyze-blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: blueprint }),
      });

      if (!response.ok) {
        try {
          const workerRes = await fetch('https://soft-cloud-829dyousif-blueprint-api.ara-account.workers.dev/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageBase64: blueprint }),
          });
          if (workerRes.ok) {
            response = workerRes;
          }
        } catch {
          // ignore fallback worker network error
        }
      }

      const data = await response.json();
      if (!response.ok) {
        if (data.isPermissionDenied) {
          setIsPermissionDenied(true);
        }
        throw new Error(data.error || (lang === 'ku' ? 'شیکردنەوەی نەخشەکە سەرکەوتوو نەبوو.' : 'Blueprint analysis failed.'));
      }

      if (!data || !Array.isArray(data.rooms) || data.rooms.length === 0) {
        throw new Error(lang === 'ku' ? 'هیچ ژوورێک یان قەبارەیەک لەم نەخشەیەدا نەدۆزرایەوە.' : 'No rooms or dimensions could be read from this blueprint.');
      }

      // Automatically combine dressing rooms with bedrooms if attached/present
      const processedRooms = combineDressingRoomsWithBedrooms(data.rooms);
      data.rooms = processedRooms;

      const heatedRooms = data.rooms.filter((r: any) => r.isHeated !== false);
      const calculatedTotalHeatedArea = Number(heatedRooms.reduce((sum: number, r: any) => sum + (Number(r.areaSqm) || 0), 0).toFixed(1));
      data.totalAreaSqm = calculatedTotalHeatedArea;
      data.recommendedBoilerKw = getRecommendedBoilerKw(calculatedTotalHeatedArea);
      data.recommendedManifoldPorts = data.rooms.reduce((sum: number, r: any) => sum + (Number(r.loopCount) || 0), 0);

      setAnalysisResult(data);
      setIsPermissionDenied(false);

      // Auto place radiators for every room automatically when scan is over
      const autoComps = autoGenerateRoomRadiators(data.rooms, components);
      setComponents(autoComps);
    } catch (err: any) {
      console.error('Analysis API failed:', err);
      const errMsg = err.message || (lang === 'ku' ? 'خوێندنەوەی نەخشەکە سەرکەوتوو نەبوو. تکایە وێنەیەکی ڕوونتر دابنێ.' : 'Failed to read blueprint. Please upload a clearer image with visible dimensions.');
      setAnalysisError(errMsg);
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCanvasCoords = (e: MouseEvent<HTMLDivElement | SVGSVGElement>) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const updateComponentProperty = (id: string, updates: Partial<ComponentData>) => {
    setComponents(prev => {
      const nextComps = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      return autoRecalculateComponents(nextComps, analysisResult?.rooms);
    });
  };

  const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    if (draggingId || (e.target as HTMLElement).closest('button')) return;
    
    const coords = getCanvasCoords(e);
    if (!coords) return;

    if (tool === 'pipe') {
      if (!isDrawing) {
        setIsDrawing(true);
        setPipeStart(coords);
      } else if (pipeStart) {
        setPipes(prev => [...prev, {
          id: 'p_' + Math.random().toString(36).substring(2, 9),
          x1: pipeStart.x,
          y1: pipeStart.y,
          x2: coords.x,
          y2: coords.y
        }]);
        setIsDrawing(false);
        setPipeStart(null);
      }
    } else if (tool !== 'select' && tool in componentSpecs) {
      const newId = 'c_' + Math.random().toString(36).substring(2, 9);
      const roomIdx = getDetectedRoomIndex(coords.x, coords.y, analysisResult?.rooms);

      const newComp: ComponentData = {
        id: newId,
        type: tool as Exclude<Tool, 'select' | 'pipe'>,
        x: coords.x,
        y: coords.y,
        sizeCm: 100,
        assignedRoomIndex: roomIdx
      };

      setComponents(prev => autoRecalculateComponents([...prev, newComp], analysisResult?.rooms));
      setSelectedComponentId(newId);
    } else if (tool === 'select') {
      setSelectedComponentId(null);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;
    setMousePos(coords);

    if (draggingId && tool === 'select') {
      setComponents(prev => {
        const updated = prev.map(c => {
          if (c.id === draggingId) {
            const detectedRoom = getDetectedRoomIndex(coords.x, coords.y, analysisResult?.rooms);
            return { 
              ...c, 
              x: coords.x, 
              y: coords.y,
              assignedRoomIndex: detectedRoom
            };
          }
          return c;
        });
        return autoRecalculateComponents(updated, analysisResult?.rooms);
      });
    }
  };

  const handleMouseUp = () => setDraggingId(null);

  const removeComponent = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setComponents(prev => autoRecalculateComponents(prev.filter(c => c.id !== id), analysisResult?.rooms));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };

  const removePipe = (id: string, e: MouseEvent) => {
    if (tool === 'select') {
      e.stopPropagation();
      setPipes(prev => prev.filter(p => p.id !== id));
    }
  };

  const addRadiatorToRoom = (roomIdx: number) => {
    const newId = `rad_manual_r${roomIdx}_` + Math.random().toString(36).substring(2, 7);
    const newRad: ComponentData = {
      id: newId,
      type: 'radiator',
      x: 400,
      y: 275,
      sizeCm: 100,
      assignedRoomIndex: roomIdx,
      isCustomOverride: true
    };
    setComponents(prev => autoRecalculateComponents([...prev, newRad], analysisResult?.rooms));
  };

  const updateRadiatorSizeInRoom = (radId: string, newSize: number) => {
    setComponents(prev => {
      const nextComps = prev.map(c => c.id === radId ? { ...c, sizeCm: newSize, isCustomOverride: true } : c);
      return autoRecalculateComponents(nextComps, analysisResult?.rooms);
    });
  };

  const exportBlueprintImage = async (): Promise<string | null> => {
    if (!blueprint) return null;
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = blueprint;
      img.onload = () => {
        const cvs = document.createElement('canvas');
        cvs.width = 800;
        cvs.height = 550;
        const ctx = cvs.getContext('2d');
        if (!ctx) { resolve(null); return; }

        // Blueprint background
        ctx.fillStyle = '#0B111E';
        ctx.fillRect(0, 0, 800, 550);
        ctx.drawImage(img, 0, 0, 800, 550);

        // Draw Pipes
        pipes.forEach(pipe => {
          ctx.beginPath();
          ctx.moveTo(pipe.x1, pipe.y1);
          ctx.lineTo(pipe.x2, pipe.y2);
          ctx.strokeStyle = '#FFD600';
          ctx.lineWidth = 4;
          ctx.stroke();
        });

        // Draw manual non-radiator components (e.g. boiler/valve) if any placed manually
        components.forEach(c => {
          if (c.type === 'radiator') return; // Radiators are on the side
          const sz = 32;
          ctx.fillStyle = '#1A2338';
          ctx.strokeStyle = componentSpecs[c.type]?.borderColor || '#FFD600';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(c.x - sz / 2, c.y - sz / 2, sz, sz, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 10px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const lbl = c.type.toUpperCase().slice(0, 3);
          ctx.fillText(lbl, c.x, c.y);
        });

        try {
          const dataUrl = cvs.toDataURL('image/png');
          resolve(dataUrl);
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
    });
  };

  const handleSendToWhatsApp = async () => {
    // 1. Export snapshot blueprint image with placed icons
    const dataUrl = await exportBlueprintImage();
    if (dataUrl) {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Blueprint-Heating-Layout-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // 2. Build rich specification text
    let text = lang === 'ku' 
      ? '🔥 *داواکاری سیستەمی گەرمکەرەوە و نەخشەی شۆفاژەکان*\n\n' 
      : '🔥 *Heating System Blueprint & Radiator Layout*\n\n';

    if (analysisResult) {
      text += lang === 'ku'
        ? `📐 *پوختەی ئەندازەیی:*
• کۆی ڕووبەری گەرمکراو: ${analysisResult.totalAreaSqm} m²
• گوژمەی بۆیلەری پێشنیارکراو: ${analysisResult.recommendedBoilerKw} kW
• مانیفۆڵدی پێویست: ${analysisResult.recommendedManifoldPorts} پۆرت (درز)\n\n`
        : `📐 *Technical Specs:*
• Total Heated Area: ${analysisResult.totalAreaSqm} m²
• Recommended Boiler: ${analysisResult.recommendedBoilerKw} kW
• Required Manifold Ports: ${analysisResult.recommendedManifoldPorts} ports\n\n`;
    }

    text += lang === 'ku' ? '📦 *پێکهاتە و ئامێرە دانراوەکان:*\n' : '📦 *Placed Equipment Breakdown:*\n';
    const count: Record<string, number> = {};
    const roomRadSummary: Record<string, number[]> = {};

    components.forEach(c => {
      if (c.type === 'radiator' && !showRadiators) return;
      count[c.type] = (count[c.type] || 0) + 1;
      if (c.type === 'radiator') {
        const roomIdx = c.assignedRoomIndex !== undefined ? c.assignedRoomIndex : getDetectedRoomIndex(c.x, c.y, analysisResult?.rooms);
        const room = roomIdx >= 0 && analysisResult?.rooms ? analysisResult.rooms[roomIdx] : null;
        const roomName = room ? (lang === 'ku' ? room.nameKu : room.nameEn) : (lang === 'ku' ? 'نادیار' : 'Unassigned');
        if (!roomRadSummary[roomName]) roomRadSummary[roomName] = [];
        roomRadSummary[roomName].push(c.sizeCm || 100);
      }
    });

    Object.entries(count).forEach(([type, c]) => {
      const spec = componentSpecs[type as Exclude<Tool, 'select' | 'pipe'>];
      const name = lang === 'ku' ? spec.name.ku : spec.name.en;
      text += ` • ${name}: ${c}\n`;
    });

    if (Object.keys(roomRadSummary).length > 0) {
      text += lang === 'ku' ? `\n🏡 *ڕوونکردنەوەی ڕادێتەرەکان بە گوێرەی ژوور:*\n` : `\n🏡 *Radiator Placement per Room:*\n`;
      Object.entries(roomRadSummary).forEach(([roomName, sizes]) => {
        const total = sizes.reduce((a, b) => a + b, 0);
        const sizesStr = sizes.map(s => `${s}cm`).join(' + ');
        text += `  • ${roomName}: ${sizes.length} ڕادێتەر [${sizesStr} = ${total}cm]\n`;
      });
    }

    text += lang === 'ku' ? `\n🔗 *هێڵەکانی بۆری:* ${pipes.length}\n` : `\n🔗 *Pipe Lines:* ${pipes.length}\n`;
    text += lang === 'ku' 
      ? `\n📷 _وێنەی نەخشەکە بە ڕادێتەرەکانەوە دابەزێنرا بۆ ئامێرەکەت بۆ ئەوەی لەگەڵ ئەم داواکارییەدا بنێردرێت._` 
      : `\n📷 _The blueprint layout image with placed radiator icons has been downloaded to send with this message._`;

    // 3. Status Toast Notification
    setWhatsappStatusMsg(
      lang === 'ku' 
        ? 'وێنەی نەخشەکە و دیاری ڕادێتەرەکان دابەزێنرا! واتسئاپ دەکرێتەوە تا وێنەکەی لەگەڵدا بنێریت.' 
        : 'Blueprint image with placed icons generated & downloaded! Opening WhatsApp...'
    );

    setTimeout(() => {
      const encodedText = encodeURIComponent(text);
      window.open(`https://wa.me/9647709700306?text=${encodedText}`, '_blank');
    }, 400);
  };

  return (
    <section id="designer" className="px-6 md:px-12 py-24 bg-navy border-t border-border-main overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="block text-[11px] tracking-[0.4em] uppercase text-amber font-semibold mb-4">
          {lang === 'ku' ? 'وێستگەی کاری کارلێککار' : 'Interactive Workspace'}
        </span>
        <h2 className="font-display text-[60px] md:text-[80px] leading-[0.85] tracking-tight text-text-main mb-6">
          {lang === 'ku' ? (
            <>نەخشەسازی دانانی <br /><span className="italic text-amber">سیستەم</span></>
          ) : (
            <>Heating Layout <br /><span className="italic text-amber">Planner</span></>
          )}
        </h2>
        <p className="text-lg leading-relaxed font-light text-white/70 max-w-[680px] mb-12">
          {lang === 'ku' 
            ? 'نەخشەی بیناکەت بەرزبکەرەوە بۆ کێشانی بۆرییەکان و دانانی بۆیلەر و ئامێرەکانی تری سیستەمەکە — هەژمێرکردنی خودکارانەی بڕی ڕووبەری ڕادێتەری پێویست بۆ هەژمارکردنی تێچووی سیستەمەکەت.' 
            : 'Upload your structural blueprint to sketch custom pipelines, position heating arrays, and automatically calculate required radiator dimensions to estimate your system costs.'}
        </p>
      </motion.div>

      <div className={`grid grid-cols-1 ${showRoomNames || showRadiators ? 'lg:grid-cols-[220px_1fr_330px]' : 'lg:grid-cols-[220px_1fr]'} bg-navy-mid border border-white/5 rounded-[40px] overflow-hidden min-h-[600px]`}>
        
        {/* Sidebar Tools */}
        <div className="bg-navy-mid border-b lg:border-b-0 lg:border-r border-white/5 p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="bg-white/5 border border-white/10 text-text-main font-semibold text-[10px] py-2.5 px-3 rounded-xl text-center uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors">
              <Upload className="w-3.5 h-3.5 inline-block me-1.5 -mt-0.5" /> {lang === 'ku' ? 'نەخشە' : 'Blueprint'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
            {blueprint && (
              <>
                <button 
                  onClick={handleAIAnalyze}
                  disabled={isAnalyzing}
                  className="bg-amber text-navy font-bold text-[10px] py-2.5 px-3 rounded-xl uppercase tracking-wider hover:bg-amber-light transition-all w-full flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} /> 
                  {isAnalyzing 
                    ? (lang === 'ku' ? 'شیکردنەوەی...' : 'Scanning...') 
                    : (lang === 'ku' ? 'پشکنینی نەخشە' : 'AI Read Plan')}
                </button>
                <button 
                  onClick={handleSendToWhatsApp}
                  disabled={isAnalyzing}
                  className="bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-semibold text-[10px] py-2.5 px-3 rounded-xl uppercase tracking-wider hover:bg-[#25D366]/20 transition-colors w-full flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> {lang === 'ku' ? 'واتسئاپ' : 'WhatsApp'}
                </button>
                <button 
                  onClick={handleClear}
                  disabled={isAnalyzing}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-[10px] py-2.5 px-3 rounded-xl uppercase tracking-wider hover:bg-red-500/20 transition-colors w-full flex items-center justify-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> {lang === 'ku' ? 'سڕینەوە' : 'Reset'}
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="text-[9px] tracking-widest uppercase text-muted font-semibold mb-1">
              {lang === 'ku' ? 'ئامرازەکان' : 'Toolsets'}
            </div>
            
            <button 
              onClick={() => { setTool('select'); setIsDrawing(false); }}
              className={`flex items-center gap-2.5 text-xs font-light px-3.5 py-2 rounded-xl transition-all border w-full text-start
                ${tool === 'select' ? 'bg-navy-light border-amber text-text-main shadow-[inset_3px_0_0_#FFD600]' : 'bg-transparent border-transparent text-muted hover:bg-white/5'}`}
            >
              <MousePointer2 className="w-4 h-4" /> {lang === 'ku' ? 'گواستنەوە' : 'Reposition'}
            </button>
            
            {(Object.keys(componentSpecs) as Exclude<Tool, 'select' | 'pipe'>[]).map(compType => (
               <button 
                key={compType}
                onClick={() => { setTool(compType); setIsDrawing(false); }}
                className={`flex items-center gap-2.5 text-xs font-light px-3.5 py-2 rounded-xl transition-all border w-full text-start
                  ${tool === compType ? 'bg-navy-light border-amber text-text-main shadow-[inset_3px_0_0_#FFD600]' : 'bg-transparent border-transparent text-muted hover:bg-white/5'}`}
              >
                {componentSpecs[compType].icon} {lang === 'ku' ? componentSpecs[compType].name.ku : componentSpecs[compType].name.en}
              </button>
            ))}

            <button 
              onClick={() => setTool('pipe')}
              className={`flex items-center gap-2.5 text-xs font-light px-3.5 py-2 rounded-xl transition-all border w-full text-start
                ${tool === 'pipe' ? 'bg-navy-light border-amber text-text-main shadow-[inset_3px_0_0_#FFD600]' : 'bg-transparent border-transparent text-muted hover:bg-white/5'}`}
            >
              <Minus strokeWidth={4} className="w-4 h-4 text-amber" /> {lang === 'ku' ? 'بەستنەوەی بۆری' : 'Connect Pipe'}
            </button>

            <button 
              type="button"
              onClick={() => {
                setShowRoomNames(prev => {
                  if (!prev) setHiddenRoomIndices([]);
                  return !prev;
                });
              }}
              className={`flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all border w-full text-start mt-2 cursor-pointer
                ${showRoomNames 
                  ? 'bg-amber/15 border-amber/50 text-amber' 
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
            >
              {showRoomNames ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showRoomNames 
                ? (lang === 'ku' ? 'ناوی ژوورەکان: دیارە' : 'Room Names: Visible') 
                : (lang === 'ku' ? 'ناوی ژوورەکان: شاراوەیە' : 'Room Names: Hidden')}
            </button>

            <button 
              type="button"
              onClick={() => setShowRadiators(prev => !prev)}
              className={`flex items-center gap-2.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all border w-full text-start cursor-pointer
                ${showRadiators 
                  ? 'bg-amber/15 border-amber/50 text-amber' 
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'}`}
            >
              {showRadiators ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showRadiators 
                ? (lang === 'ku' ? 'ڕادێتەرەکان: دیارن' : 'Radiators: Visible') 
                : (lang === 'ku' ? 'ڕادێتەرەکان: شاراوەن' : 'Radiators: Hidden')}
            </button>
          </div>

          <div className="bg-navy-light border border-white/5 p-3.5 rounded-xl text-[11px] text-muted leading-relaxed mt-auto font-light">
             <p className="mb-1"><strong className="text-amber font-medium">Place:</strong> Tap canvas.</p>
             <p className="mb-1"><strong className="text-amber font-medium">Route:</strong> Pipe tool.</p>
             <p className="mb-0"><strong className="text-amber font-medium">Modify:</strong> Drag/Delete.</p>
          </div>
        </div>

        {/* Workspace Canvas */}
        <div className="p-4 lg:p-8 flex items-center justify-center bg-navy designer-workspace-grid overflow-auto h-[600px] lg:h-auto relative">
          
          {isAnalyzing && (
            <div className="absolute inset-0 bg-navy/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-amber/10 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-amber animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-text-main mb-2 tracking-wide font-display">
                {lang === 'ku' ? 'ژیری دەستکرد پشکنینی نەخشەکە دەکات...' : 'AI Floorplan Scan in Progress...'}
              </h3>
              <p className="text-sm text-text-muted max-w-[320px] animate-pulse">
                {lang === 'ku' 
                  ? 'ژوور بە ژوور قەبارە و ڕووبەر دەخوێندرێتەوە تا باشترین بڕی گەرمی ژێرزەوی دیاریبکرێت.' 
                  : 'Detecting room dimensions, tracking thermal boundaries, and factoring loop layouts...'}
              </p>
            </div>
          )}

          {analysisError && (
            <div className="absolute inset-x-4 top-4 bg-navy-mid/95 border border-red-500/30 text-white p-4 rounded-xl flex flex-col gap-3 z-50 shadow-2xl backdrop-blur-md max-w-[600px] mx-auto text-start">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0 font-bold font-mono text-xs">!</div>
                  <div>
                    <h4 className="font-bold text-xs text-red-400 font-display">
                      {lang === 'ku' ? 'هەڵە لە خوێندنەوەی نەخشەدا' : 'Blueprint Scan Error'}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      {analysisError}
                    </p>
                  </div>
                </div>
                <button onClick={() => setAnalysisError(null)} className="text-white/40 hover:text-white flex-shrink-0 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {whatsappStatusMsg && (
            <div className="absolute inset-x-4 top-4 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 p-3.5 rounded-xl flex items-center justify-between gap-3 z-50 shadow-2xl backdrop-blur-md max-w-[600px] mx-auto text-xs font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{whatsappStatusMsg}</span>
              </div>
              <button onClick={() => setWhatsappStatusMsg(null)} className="text-emerald-400/60 hover:text-emerald-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {blueprint ? (
            <div 
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative bg-navy border border-white/5 shadow-2xl max-w-full bg-contain bg-no-repeat bg-center ${tool === 'select' ? 'cursor-default' : 'cursor-crosshair'}`}
              style={{ backgroundImage: `url(${blueprint})`, width: '800px', height: '550px' }}
            >
              {/* Top Canvas Controls: Show/Hide Room Names & Show/Hide Radiators toggles */}
              <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRoomNames(prev => {
                      if (!prev) setHiddenRoomIndices([]);
                      return !prev;
                    });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md transition-all cursor-pointer border ${
                    showRoomNames && hiddenRoomIndices.length === 0
                      ? 'bg-amber text-navy border-amber hover:bg-amber-light shadow-amber/20' 
                      : showRoomNames
                      ? 'bg-amber/80 text-navy border-amber hover:bg-amber shadow-amber/20'
                      : 'bg-navy-mid/90 text-white/70 border-white/20 hover:bg-white/10'
                  }`}
                >
                  {showRoomNames ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {showRoomNames 
                    ? (lang === 'ku' ? 'ناوی ژوورەکان: چالاکە' : 'Room Names: ON') 
                    : (lang === 'ku' ? 'ناوی ژوورەکان: نادیارە' : 'Room Names: OFF')}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRadiators(prev => !prev);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md transition-all cursor-pointer border ${
                    showRadiators 
                      ? 'bg-amber text-navy border-amber hover:bg-amber-light shadow-amber/20' 
                      : 'bg-navy-mid/90 text-white/70 border-white/20 hover:bg-white/10'
                  }`}
                >
                  {showRadiators ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {showRadiators 
                    ? (lang === 'ku' ? 'دیاری شۆفاژەکان: چالاکە' : 'Show Radiators: ON') 
                    : (lang === 'ku' ? 'دیاری شۆفاژەکان: نادیارە' : 'Show Radiators: OFF')}
                </button>
              </div>

              {/* Pipes Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {pipes.map(pipe => (
                  <g key={pipe.id} className="group pointer-events-auto cursor-pointer" onClick={(e) => removePipe(pipe.id, e as unknown as MouseEvent)}>
                     <line 
                       x1={pipe.x1} y1={pipe.y1} x2={pipe.x2} y2={pipe.y2} 
                       className="stroke-amber stroke-[4px] stroke-linecap-round group-hover:stroke-red-500 transition-colors" 
                     />
                     <line 
                       x1={pipe.x1} y1={pipe.y1} x2={pipe.x2} y2={pipe.y2} 
                       className="stroke-transparent stroke-[16px]" 
                     />
                  </g>
                ))}
                {isDrawing && pipeStart && (
                  <line 
                    x1={pipeStart.x} y1={pipeStart.y} x2={mousePos.x} y2={mousePos.y} 
                    className="stroke-amber stroke-[4px] opacity-70" strokeDasharray="6,6"
                  />
                )}
              </svg>

              {/* Components Layer (Pipes and manual hydraulic units. Room names and Radiators are displayed cleanly on the side) */}
              <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
                 {components.map(comp => {
                    // Radiators are not placed on the blueprint canvas
                    if (comp.type === 'radiator') return null;
                    if (comp.type === 'boiler' || comp.type === 'manifold') return null;
                    const spec = componentSpecs[comp.type];
                    if (!spec) return null;
                    const isSelected = comp.id === selectedComponentId;
                    const roomIdx = comp.assignedRoomIndex !== undefined && comp.assignedRoomIndex >= 0 ? comp.assignedRoomIndex : 0;
                    const room = (analysisResult?.rooms && analysisResult.rooms[roomIdx]) ? analysisResult.rooms[roomIdx] : null;

                    return (
                     <div 
                       key={comp.id}
                       onMouseDown={(e) => { 
                         if (tool === 'select') { 
                           setDraggingId(comp.id);
                           setSelectedComponentId(comp.id);
                           e.stopPropagation();
                         } 
                       }}
                       className={`absolute -translate-x-1/2 -translate-y-1/2 rounded bg-navy-mid border-2 flex items-center justify-center shadow-lg group pointer-events-auto transition-all w-8 h-8 ${
                         tool === 'select' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
                       } ${
                         isSelected ? 'ring-2 ring-amber border-amber shadow-[0_0_12px_rgba(255,214,0,0.5)] z-20' : ''
                       }`}
                       style={{ left: comp.x, top: comp.y, borderColor: isSelected ? '#FFD600' : spec.borderColor }}
                     >
                       {spec.icon}
                       
                       <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-navy/95 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity border-[0.5px] border-border-main whitespace-nowrap pointer-events-none z-30">
                         {lang === 'ku' ? spec.name.ku : spec.name.en}
                         {room ? ` - ${lang === 'ku' ? room.nameKu : room.nameEn}` : ''}
                       </span>

                       {tool === 'select' && (
                         <button 
                           onClick={(e) => removeComponent(comp.id, e)}
                           className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 shadow-md transition-opacity hover:bg-red-600 cursor-pointer z-30"
                         >
                           <X className="w-2.5 h-2.5" />
                         </button>
                       )}
                     </div>
                    );
                 })}
              </div>

            </div>
          ) : (
            <div className="w-full max-w-[750px] h-[480px] bg-navy-light/40 flex items-center justify-center border border-dashed border-amber/30 rounded">
               <div className="text-center text-muted p-8 max-w-[400px]">
                  <ClipboardList className="w-14 h-14 mx-auto mb-4 text-amber/60" />
                  <p className="text-[0.95rem]">
                    {lang === 'ku' ? 'تکایە نەخشەیەک بەرزبکەرەوە بۆ دەستپێکردنی کارکردن.' : 'Please drop or upload a blueprint floor plan image file in the sidebar to begin mapping infrastructure pipelines.'}
                  </p>
               </div>
            </div>
          )}
        </div>

        {/* Side Panel for Room Names & Radiators Overview (Shown on the side, not on blueprint) */}
        {(showRoomNames || showRadiators) && (
          <div className="bg-navy-mid/95 border-t lg:border-t-0 lg:border-l border-white/5 p-4 lg:p-5 flex flex-col gap-4 max-h-[650px] overflow-y-auto custom-scrollbar text-start">
            {/* Side Panel Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber/15 border border-amber/30 flex items-center justify-center text-amber">
                  {showRadiators ? <RadiatorIcon className="w-4 h-4 text-amber" /> : <ClipboardList className="w-4 h-4 text-amber" />}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-text-main font-display">
                    {showRoomNames && showRadiators 
                      ? (lang === 'ku' ? 'ژوورەکان و ڕادێتەرەکان' : 'Rooms & Radiators')
                      : showRoomNames
                      ? (lang === 'ku' ? 'ناوی ژوورەکان' : 'Detected Room Names')
                      : (lang === 'ku' ? 'تایبەتمەندی ڕادێتەرەکان' : 'Radiator Specifications')}
                  </h4>
                  <p className="text-[10px] text-muted">
                    {lang === 'ku' ? 'زانیارییەکان لە پاڵ نەخشەکە' : 'Displayed on the side'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowRoomNames(false);
                  setShowRadiators(false);
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors cursor-pointer"
                title={lang === 'ku' ? 'داخستنی بەشەکە' : 'Hide Side Panel'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Room List Content */}
            {(!analysisResult?.rooms || analysisResult.rooms.length === 0) ? (
              <div className="bg-navy/60 border border-dashed border-white/10 rounded-2xl p-5 text-center text-muted my-auto">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-amber/40" />
                <p className="text-xs text-text-main font-medium mb-1">
                  {lang === 'ku' ? 'هێشتا نەخشە نەپشکنراوە' : 'No Scanned Rooms Yet'}
                </p>
                <p className="text-[11px] leading-relaxed text-muted">
                  {lang === 'ku' 
                    ? 'نەخشەیەک بەرزبکەرەوە و کرتە لە "پشکنینی نەخشە" بکە بۆ خوێندنەوەی خۆکارانەی ناوی ژوورەکان و بڕی ڕادێتەر لەم بەشەدا.' 
                    : 'Upload your blueprint and click "AI Read Plan" to view room names and calculated radiator sizes on the side.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {analysisResult.rooms.map((room, rIdx) => {
                  const isHeated = room.isHeated !== false;
                  const isHidden = hiddenRoomIndices.includes(rIdx);
                  if (isHidden && !showRadiators) return null;

                  // Find radiators assigned to this room
                  const roomRadiators = components.filter(c => {
                    if (c.type !== 'radiator') return false;
                    const assignedIdx = c.assignedRoomIndex !== undefined ? c.assignedRoomIndex : 0;
                    return assignedIdx === rIdx;
                  });

                  const isBed = isBedroomRoom(room.nameEn, room.nameKu);
                  const heatFactor = isBed ? 0.85 : 1.0;

                  const totalRoomRadCm = roomRadiators.reduce((sum, r) => sum + (r.sizeCm || 100), 0);
                  const targetCm = room.areaSqm 
                    ? (roomRadiators.length > 1 
                        ? Math.max(80, Math.round(((room.areaSqm * heatFactor) / 13) * 100)) 
                        : Math.max(80, Math.round(room.areaSqm * heatFactor * 10))) 
                    : 100;

                  return (
                    <div 
                      key={`side_room_${rIdx}`} 
                      className={`bg-navy/90 border rounded-2xl p-3.5 transition-all ${
                        !isHeated ? 'border-white/5 opacity-60' : 'border-white/10 hover:border-amber/30'
                      }`}
                    >
                      {/* Room Header Info */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="w-2 h-2 rounded-full bg-amber flex-shrink-0" />
                            <h5 className="font-bold text-xs text-text-main font-display">
                              {lang === 'ku' ? room.nameKu : room.nameEn}
                            </h5>
                            <span className="text-[10px] font-mono text-amber bg-amber/10 px-1.5 py-0.2 rounded border border-amber/20">
                              {room.areaSqm} m²
                            </span>
                          </div>
                          {room.formula && (
                            <p className="text-[10px] font-mono text-muted mt-0.5">
                              {room.formula.includes('=') ? room.formula : `${room.formula} = ${room.areaSqm} m²`}
                            </p>
                          )}
                        </div>

                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                          isHeated ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {isHeated ? (lang === 'ku' ? 'گەرمکراو' : 'Heated') : (lang === 'ku' ? 'دوورخراوە' : 'Excluded')}
                        </span>
                      </div>

                      {/* Radiator Section for this room */}
                      {showRadiators && isHeated && (
                        <div className="mt-2.5 pt-2.5 border-t border-white/5 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-muted flex items-center gap-1">
                              <RadiatorIcon className="w-3.5 h-3.5 text-amber" />
                              <strong className="text-text-main font-semibold">
                                {lang === 'ku' ? 'ڕادێتەرەکان:' : 'Radiators:'}
                              </strong>
                            </span>
                            <span className="text-[10px] font-mono text-amber">
                              {targetCm} cm {lang === 'ku' ? 'پێویستە' : 'target'}
                            </span>
                          </div>

                          {roomRadiators.length === 0 ? (
                            <div className="flex items-center justify-between bg-navy-light/60 p-2 rounded-xl border border-dashed border-white/10">
                              <span className="text-[11px] text-muted italic">
                                {lang === 'ku' ? 'هیچ ڕادێتەرێک دانەنراوە' : 'No radiator assigned'}
                              </span>
                              <button
                                type="button"
                                onClick={() => addRadiatorToRoom(rIdx)}
                                className="text-[10px] font-bold text-amber hover:text-amber-light bg-amber/10 hover:bg-amber/20 px-2 py-1 rounded-lg border border-amber/20 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> {lang === 'ku' ? 'دانان' : 'Add'}
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {roomRadiators.map((rad, radIndex) => (
                                <div 
                                  key={rad.id}
                                  className="bg-navy-light/80 border border-white/5 p-2 rounded-xl flex flex-col gap-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-text-main font-mono flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber" />
                                      {lang === 'ku' ? `ڕادێتەری ${radIndex + 1}` : `Radiator ${radIndex + 1}`}:
                                      <strong className="text-amber">{rad.sizeCm || 100} cm</strong>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => removeComponent(rad.id, e as unknown as MouseEvent)}
                                      className="text-red-400 hover:text-red-300 p-0.5 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                                      title={lang === 'ku' ? 'سڕینەوەی ئەم ڕادێتەرە' : 'Remove this radiator'}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Quick Size Pills */}
                                  <div className="flex flex-wrap gap-1">
                                    {RADIATOR_SIZES.map(sz => (
                                      <button
                                        key={sz}
                                        type="button"
                                        onClick={() => updateRadiatorSizeInRoom(rad.id, sz)}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all border cursor-pointer ${
                                          (rad.sizeCm || 100) === sz
                                            ? 'bg-amber text-navy border-amber shadow-xs'
                                            : 'bg-navy border-white/10 text-muted hover:text-text-main hover:border-amber/40'
                                        }`}
                                      >
                                        {sz}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}

                              {/* Add another radiator */}
                              <div className="flex items-center justify-end pt-1 text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => addRadiatorToRoom(rIdx)}
                                  className="text-amber hover:text-amber-light font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" /> {lang === 'ku' ? 'ڕادێتەری تر' : '+ Radiator'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Component Properties Inspector Panel */}
      {selectedComponentId && (() => {
        const selectedComp = components.find(c => c.id === selectedComponentId);
        if (!selectedComp) return null;

        const spec = componentSpecs[selectedComp.type];
        const isRadiator = selectedComp.type === 'radiator';

        const activeRoomIdx = selectedComp.assignedRoomIndex !== undefined ? selectedComp.assignedRoomIndex : 0;
        const currentRoom = (activeRoomIdx >= 0 && analysisResult?.rooms?.[activeRoomIdx]) ? analysisResult.rooms[activeRoomIdx] : null;

        // Find all radiators in this room
        const roomRadiators = components.filter(c => {
          if (c.type !== 'radiator') return false;
          const rIdx = c.assignedRoomIndex !== undefined ? c.assignedRoomIndex : 0;
          return rIdx === activeRoomIdx;
        });

        const roomRadCount = roomRadiators.length;
        const isBed = currentRoom ? isBedroomRoom(currentRoom.nameEn, currentRoom.nameKu) : false;
        const heatFactor = isBed ? 0.85 : 1.0;

        const targetCm = currentRoom 
          ? (roomRadCount > 1 
              ? Math.max(80, Math.round(((currentRoom.areaSqm * heatFactor) / 13) * 100)) 
              : Math.max(80, Math.round(currentRoom.areaSqm * heatFactor * 10))) 
          : 100;
        const totalRoomRadCm = roomRadiators.reduce((sum, r) => sum + (r.sizeCm || 100), 0);
        const targetArea = currentRoom ? currentRoom.areaSqm : 0;
        const providedCoverageArea = roomRadCount > 1 ? (totalRoomRadCm / 100) * 13 : totalRoomRadCm / 10;
        const rawPercent = targetArea > 0 ? (providedCoverageArea / (targetArea * heatFactor)) * 100 : 100;
        // Don't let it pass 100% coverage
        const coveragePercent = Math.min(100, Math.round(rawPercent));

        return (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-navy-mid border border-amber/30 rounded-[30px] p-6 shadow-2xl relative text-start transition-all"
          >
            {/* Panel Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-navy border border-amber/30 flex items-center justify-center">
                  {spec.icon}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-main flex items-center gap-2">
                    {lang === 'ku' ? spec.name.ku : spec.name.en}
                    <span className="text-[10px] font-mono text-amber bg-amber/10 px-2 py-0.5 rounded border border-amber/20">
                      {selectedComp.id}
                    </span>
                  </h4>
                  <p className="text-[11px] text-muted">
                    {lang === 'ku' 
                      ? `شوێن: X: ${Math.round(selectedComp.x)}px, Y: ${Math.round(selectedComp.y)}px`
                      : `Canvas coordinates: X: ${Math.round(selectedComp.x)}px, Y: ${Math.round(selectedComp.y)}px`}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedComponentId(null)} 
                className="text-muted hover:text-white p-1.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isRadiator && (
              <div className="space-y-6">
                {/* Detected Room Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-navy p-4 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted block mb-1">
                      {lang === 'ku' ? 'ژووری دیاریکراو' : 'Detected Room'}
                    </span>
                    <div className="font-bold text-sm text-text-main flex items-center gap-2">
                      {currentRoom ? (
                        <>
                          <span>{lang === 'ku' ? currentRoom.nameKu : currentRoom.nameEn}</span>
                          <span className="text-xs text-amber font-mono font-normal">
                            ({currentRoom.areaSqm} m² → {targetCm} cm {lang === 'ku' ? 'پێویستە' : 'target'})
                          </span>
                        </>
                      ) : (
                        <span className="text-muted italic text-xs">
                          {lang === 'ku' ? 'هیچ ژوورێک نەدۆزرایەوە' : 'No room auto-detected'}
                        </span>
                      )}
                    </div>
                  </div>

                  {analysisResult && analysisResult.rooms.length > 0 && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted whitespace-nowrap">
                        {lang === 'ku' ? 'گۆڕینی ژوور:' : 'Assign Room:'}
                      </label>
                      <select 
                        value={activeRoomIdx !== -1 ? activeRoomIdx : 0}
                        onChange={(e) => {
                          const newIdx = Number(e.target.value);
                          updateComponentProperty(selectedComp.id, {
                            assignedRoomIndex: newIdx,
                            isCustomOverride: false
                          });
                        }}
                        className="bg-navy-mid border border-white/15 rounded-xl px-3 py-1.5 text-xs text-text-main focus:outline-none focus:border-amber cursor-pointer"
                      >
                        {analysisResult.rooms.map((r, idx) => (
                          <option key={idx} value={idx}>
                            {lang === 'ku' ? r.nameKu : r.nameEn} ({r.areaSqm} m²)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* AI Smart Auto-Sizing Banner */}
                {currentRoom && (
                  <div className="bg-gradient-to-r from-amber/15 via-amber/10 to-transparent border border-amber/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber/20 border border-amber/40 flex items-center justify-center text-amber flex-shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-amber font-mono uppercase tracking-wider flex items-center gap-1.5">
                          {lang === 'ku' ? 'پێشنیاری خۆکارانەی ڕادێتەر' : 'Automatic Radiator Auto-Sizing'}
                        </h5>
                        <p className="text-xs text-white/90 font-medium mt-1">
                          {roomRadCount === 1 ? (
                            lang === 'ku'
                              ? `بۆ ژووری (${currentRoom.nameKu} - ${currentRoom.areaSqm} م²): ١ ڕادێتەر بە قەبارەی ${selectedComp.sizeCm || 100} سـم دانراوە.`
                              : `For ${currentRoom.nameEn} (${currentRoom.areaSqm} m²): 1 Radiator auto-sized to ${selectedComp.sizeCm || 100} cm.`
                          ) : (
                            lang === 'ku'
                              ? `ژمارەی ${roomRadCount} ڕادێتەر لە ژووری (${currentRoom.nameKu}) دۆزرایەوە: قەبارەکان بە خۆکارانە یەکسان کراون! (${roomRadiators.map(r => `${r.sizeCm}سـم`).join(' + ')} = ${totalRoomRadCm}سـم).`
                              : `${roomRadCount} Radiators detected in ${currentRoom.nameEn}: Automatically balanced! (${roomRadiators.map(r => `${r.sizeCm}cm`).join(' + ')} = ${totalRoomRadCm}cm total).`
                          )}
                        </p>
                        {targetCm > 180 && roomRadCount === 1 && (
                          <p className="text-[11px] text-amber/80 mt-1 italic">
                            {lang === 'ku'
                              ? 'ئەم ژوورە گەورەیە! ئەگەر ڕادێتەرێکی تر دابنێیت، بە شێوەیەکی خۆکارانە گەرمییەکە بەسەر هەردوو ڕادێتەرەکەدا دابەش دەبێت.'
                              : 'This is a large room. If you drop a 2nd radiator in this room, both radiators will automatically resize to share the heating load!'}
                          </p>
                        )}
                      </div>
                    </div>

                    {selectedComp.isCustomOverride && (
                      <button
                        onClick={() => {
                          updateComponentProperty(selectedComp.id, { isCustomOverride: false });
                        }}
                        className="bg-amber hover:bg-amber-light text-navy font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer self-start sm:self-auto"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {lang === 'ku' ? 'گەڕانەوە بۆ قەبارەی خۆکار' : 'Reset to Auto Size'}
                      </button>
                    )}
                  </div>
                )}

                {/* Radiator Size Selector */}
                <div className="bg-navy p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-muted font-mono uppercase tracking-wider block">
                      {lang === 'ku' ? 'قەبارەی ئەم ڕادێتەرە (سـم)' : 'This Radiator Size (cm)'}
                    </label>
                    {selectedComp.isCustomOverride && (
                      <span className="text-[10px] font-mono text-amber bg-amber/10 px-2 py-0.5 rounded border border-amber/20">
                        {lang === 'ku' ? 'دەستکاریی دەستی' : 'Manual Override'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {RADIATOR_SIZES.map(s => (
                      <button
                        key={s}
                        onClick={() => {
                          updateComponentProperty(selectedComp.id, {
                            sizeCm: s,
                            isCustomOverride: true
                          });
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                          (selectedComp.sizeCm || 100) === s 
                            ? 'bg-amber text-navy border-amber shadow-sm scale-105' 
                            : 'bg-navy-mid border-white/10 text-text-main hover:border-amber/50'
                        }`}
                      >
                        {s} cm
                      </button>
                    ))}
                  </div>
                </div>

                {/* Thermal Output Coverage Bar for Room */}
                <div className="bg-navy/80 p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-muted tracking-wider block">
                      {lang === 'ku' ? 'کۆی گشتی گەرمکردنی ژوورەکە' : 'Room Thermal Output Coverage'}
                    </span>
                    <div className="text-sm font-bold text-text-main flex items-baseline gap-2">
                      <span>{totalRoomRadCm} cm {lang === 'ku' ? 'کۆی ڕادێتەرەکان' : 'Total Radiators in Room'}</span>
                      <span className="text-muted text-xs font-mono font-normal">
                        (≈ {providedCoverageArea.toFixed(1)} m² {lang === 'ku' ? 'داپۆشین' : 'coverage'})
                      </span>
                    </div>
                  </div>

                  {currentRoom && (
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border ${
                        coveragePercent >= 95 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : coveragePercent >= 80 
                          ? 'bg-amber/10 text-amber border-amber/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {coveragePercent >= 95 ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        {coveragePercent}% {lang === 'ku' ? 'داپۆشراوە' : 'Room Coverage'}
                      </div>

                      <div className="text-xs text-muted font-mono">
                        {targetCm} cm {lang === 'ku' ? 'پێویستە' : 'required'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!isRadiator && (
              <div className="text-xs text-muted flex items-center justify-between pt-2">
                <span>{lang === 'ku' ? 'تایبەتمەندی بەستنەوە ئامادەیە.' : 'Standard hydraulic component active.'}</span>
                <button
                  onClick={(e) => removeComponent(selectedComp.id, e as unknown as MouseEvent)}
                  className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {lang === 'ku' ? 'سڕینەوە' : 'Remove'}
                </button>
              </div>
            )}
          </motion.div>
        );
      })()}

      {/* AI Thermal Analysis Dashboard */}
      {analysisResult && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-navy-mid border border-white/5 rounded-[40px] p-8 lg:p-12 text-start"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-white/5 pb-8">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber/10 border border-amber/20 text-amber text-xs font-mono rounded-full uppercase tracking-wider mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse"></span>
                {lang === 'ku' ? 'شیکردنەوەی پێشکەوتووی ژیری دەستکرد' : 'Advanced AI Hydronic Analysis'}
              </span>
              <h3 className="text-3xl font-display font-bold text-text-main">
                {lang === 'ku' ? 'پێشبینی دابەشکاری گەرمی ژێرزەوی' : 'Under-floor Heating Calculations'}
              </h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`font-bold text-xs py-3.5 px-6 rounded-full uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                  isEditing 
                    ? "bg-amber text-navy hover:bg-amber/90" 
                    : "bg-white/10 hover:bg-white/20 text-text-main border border-white/10"
                }`}
              >
                <Pencil className="w-4 h-4" />
                {isEditing 
                  ? (lang === 'ku' ? 'تەواو (پاشەکەوت بەکارە)' : 'Done (Saving)') 
                  : (lang === 'ku' ? 'دەستکاری حسابات' : 'Edit Calculations')
                }
              </button>

              <button 
                onClick={() => {
                  let text = lang === 'ku' 
                    ? `*پشکنینی گەرمی ژێرزەوی لەلایەن ژیری دەستکردەوە*\n\n`
                    : `*AI Under-floor Heating Design Sheet*\n\n`;
                  
                  text += lang === 'ku'
                    ? `ڕووبەری گشتی: ${totalHeatedArea} m²\nبۆیلەری ڕێنماییکراو: ${analysisResult.recommendedBoilerKw} kW\nکۆی دەرچەکانی مانیفۆڵد: ${analysisResult.recommendedManifoldPorts}\nدووری نێوان ملوولەکان: ${analysisResult.estimatedPipeSpacingCm} cm\n\n*لیستی ژوورەکان:*\n`
                    : `Total Area: ${totalHeatedArea} m²\nRecommended Boiler: ${analysisResult.recommendedBoilerKw} kW\nManifold Ports: ${analysisResult.recommendedManifoldPorts}\nPipe Spacing: ${analysisResult.estimatedPipeSpacingCm} cm\n\n*Calculated Rooms:*\n`;

                  analysisResult.rooms.forEach(r => {
                    const roomName = lang === 'ku' ? r.nameKu : r.nameEn;
                    text += `- ${roomName}: ${r.areaSqm} m² | ${r.heatingOutputRequiredKw.toFixed(1)} kW | ${r.loopCount} loops\n`;
                  });

                  text += lang === 'ku'
                    ? `\n*ڕوونکردنەوەی ئەندازیاری:*\n${analysisResult.calculatedSummaryKu}`
                    : `\n*Engineering Notes:*\n${analysisResult.calculatedSummaryEn}`;

                  const encoded = encodeURIComponent(text);
                  window.open(`https://wa.me/9647709700306?text=${encoded}`, '_blank');
                }}
                className="bg-[#25D366] hover:bg-[#25D366]/90 text-navy font-bold text-xs py-3.5 px-6 rounded-full uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Send className="w-4 h-4" /> 
                {lang === 'ku' ? 'پلانەکە بنێرە بۆ ئەندازیار لە واتسئاپ' : 'Submit Floorplan to Engineering'}
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
            <div className="bg-navy p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-amber/20 transition-all">
              <div className="text-[10px] uppercase tracking-widest text-muted font-mono mb-2">
                {lang === 'ku' ? 'ڕووبەری گشتی گەرمکراو' : 'Total Heated Area'}
              </div>
              <div className="text-3xl font-display font-bold text-text-main flex items-baseline gap-1">
                {totalHeatedArea}
                <span className="text-sm font-light text-muted">m²</span>
              </div>
              <div className="text-[11px] text-muted mt-2">
                {lang === 'ku' ? 'کۆی ڕووبەری ژوورە گەرمکراوەکان' : 'Sum of heated room areas'}
              </div>
            </div>

            <div className="bg-navy p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-amber/20 transition-all">
              <div className="text-[10px] uppercase tracking-widest text-muted font-mono mb-2">
                {lang === 'ku' ? 'گوژمەی بۆیلەر' : 'Boiler Capacity'}
              </div>
              <div className="text-3xl font-display font-bold text-amber flex items-baseline gap-1">
                {analysisResult.recommendedBoilerKw}
                <span className="text-sm font-light text-muted">kW</span>
              </div>
              <div className="text-[11px] text-muted mt-2">
                {lang === 'ku' ? 'تەوانای پێویست (١٥٠ وات / م²)' : 'Nearest standard size (150 W/m²)'}
              </div>
            </div>

            <div className="bg-navy p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-amber/20 transition-all">
              <div className="text-[10px] uppercase tracking-widest text-muted font-mono mb-2">Manifold Ports</div>
              <div className="text-3xl font-display font-bold text-text-main flex items-baseline gap-1">
                {analysisResult.recommendedManifoldPorts}
                <span className="text-sm font-light text-muted">ports</span>
              </div>
              <div className="text-[11px] text-muted mt-2">Active pipe loops</div>
            </div>

            <div className="bg-navy p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-amber/20 transition-all">
              <div className="text-[10px] uppercase tracking-widest text-muted font-mono mb-2">Pipe Spacing</div>
              <div className="text-3xl font-display font-bold text-text-main flex items-baseline gap-1">
                {analysisResult.estimatedPipeSpacingCm}
                <span className="text-sm font-light text-muted">cm</span>
              </div>
              <div className="text-[11px] text-muted mt-2">Optimal standard gap</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            {/* Rooms calculation table */}
            <div className="bg-navy border border-white/5 rounded-3xl p-6 lg:p-8 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h4 className="text-lg font-semibold text-text-main font-display">
                  {lang === 'ku' ? 'شەن و کەو کردنی گەرمی ژوورەکان' : 'Estimated Room Heating Details'}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (analysisResult?.rooms) {
                        const autoComps = autoGenerateRoomRadiators(analysisResult.rooms, components);
                        setComponents(autoComps);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber hover:bg-amber-light text-navy font-bold text-xs rounded-lg transition-all shadow cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {lang === 'ku' ? 'داگرتنی شۆفاژ بۆ هەموو ژوورەکان' : 'Auto-Place Radiators'}
                  </button>
                  {isEditing && (
                    <button
                      onClick={addNewRoom}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber/15 hover:bg-amber/25 text-amber text-xs rounded-lg border border-amber/30 transition-all font-mono"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {lang === 'ku' ? 'زیادکردنی ژوور' : 'Add Room'}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-light text-text-main">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-mono uppercase text-muted text-start">
                      <th className="py-3 text-start font-medium">{lang === 'ku' ? 'ناو' : 'Room Name'}</th>
                      <th className="py-3 text-center font-medium">{lang === 'ku' ? 'حسابات / ڕووپەر (m²)' : 'Calculation / Area (sqm)'}</th>
                      <th className="py-3 text-center font-medium">{lang === 'ku' ? 'گەرمکردن؟' : 'Heated?'}</th>
                      <th className="py-3 text-center font-medium">{lang === 'ku' ? 'هێڵەکان (Loops)' : 'Loops'}</th>
                      {isEditing && <th className="py-3 text-center font-medium w-12">{lang === 'ku' ? 'سڕینەوە' : 'Delete'}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResult.rooms
                      .filter(r => isEditing || r.isHeated !== false)
                      .map((r, idx) => {
                        // find original index in raw rooms array
                        const originalIndex = analysisResult.rooms.findIndex(orig => orig === r);
                        const isHeated = r.isHeated !== false;
                        
                        if (isEditing) {
                          return (
                            <tr key={originalIndex} className="border-b border-white/5 hover:bg-white/5 transition-all text-[13px]">
                              {/* Room Names */}
                              <td className="py-3 text-start">
                                <div className="flex flex-col gap-1 max-w-[180px] md:max-w-xs">
                                  <input
                                    type="text"
                                    value={r.nameEn}
                                    onChange={(e) => updateRoomProperty(originalIndex, 'nameEn', e.target.value)}
                                    placeholder="English Name"
                                    className="bg-navy-mid border border-white/10 rounded px-2 py-1 text-xs text-text-main focus:outline-none focus:border-amber/50 w-full"
                                  />
                                  <input
                                    type="text"
                                    value={r.nameKu}
                                    onChange={(e) => updateRoomProperty(originalIndex, 'nameKu', e.target.value)}
                                    placeholder="Kurdish Name"
                                    className="bg-navy-mid border border-white/10 rounded px-2 py-1 text-xs text-text-main focus:outline-none focus:border-amber/50 w-full text-right"
                                  />
                                </div>
                              </td>

                              {/* Area Sqm Input (Calculation Input) */}
                              <td className="py-3 text-center">
                                <div className="inline-flex flex-col items-center gap-1">
                                  <input
                                    type="text"
                                    value={getEditableFormula(r)}
                                    onChange={(e) => updateRoomProperty(originalIndex, 'formula', e.target.value)}
                                    className="bg-navy-mid border border-white/10 rounded px-1.5 py-1 text-xs text-text-main focus:outline-none focus:border-amber/50 w-28 text-center font-mono"
                                    placeholder="e.g. 4.6 * 6.0"
                                  />
                                  <span className="text-[10px] text-muted font-mono whitespace-nowrap">
                                    {lang === 'ku' ? 'ئەنجام: ' : 'Result: '}<strong className="text-text-main font-bold">{r.areaSqm}</strong> m²
                                  </span>
                                </div>
                              </td>

                              {/* isHeated Checkbox */}
                              <td className="py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isHeated}
                                  onChange={(e) => updateRoomProperty(originalIndex, 'isHeated', e.target.checked)}
                                  className="w-4 h-4 rounded border-white/10 text-amber focus:ring-amber focus:ring-opacity-20 cursor-pointer accent-amber"
                                />
                              </td>

                              {/* Loop Count Input */}
                              <td className="py-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  disabled={!isHeated}
                                  value={r.loopCount}
                                  onChange={(e) => updateRoomProperty(originalIndex, 'loopCount', Number(e.target.value))}
                                  className={`bg-navy-mid border border-white/10 rounded px-1.5 py-1 text-xs text-text-main focus:outline-none focus:border-amber/50 w-12 text-center font-mono font-bold ${
                                    isHeated ? 'text-emerald-500' : 'text-muted opacity-50'
                                  }`}
                                />
                              </td>

                              {/* Delete Action */}
                              <td className="py-3 text-center">
                                <button
                                  onClick={() => removeRoom(originalIndex)}
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                                  title="Delete area"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        }

                        // Normal view row
                        return (
                          <tr key={originalIndex} className={`border-b border-white/5 hover:bg-white/5 transition-all text-[13px] ${!isHeated ? 'opacity-65' : ''}`}>
                            <td className="py-4 text-start font-medium text-text-main">
                              <div className="flex flex-col">
                                <span className="flex items-center gap-2">
                                  {lang === 'ku' ? r.nameKu : r.nameEn}
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${isHeated ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/12' : 'bg-red-500/10 text-red-400 border border-red-500/12'}`}>
                                    {isHeated ? (lang === 'ku' ? 'ئەژمارکراوە' : 'Measured') : (lang === 'ku' ? 'دوورخراوەتەوە' : 'Excluded')}
                                  </span>
                                </span>
                                {r.formula && (
                                  <span className="text-[11px] text-muted mt-1 font-mono">
                                    {lang === 'ku' 
                                      ? `کات و لێکدانەوە: ${r.formula.includes('=') ? r.formula : `${r.formula} = ${r.areaSqm} m²`}` 
                                      : `Calculation: ${r.formula.includes('=') ? r.formula : `${r.formula} = ${r.areaSqm} m²`}`
                                    }
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 text-center font-mono font-medium">{r.areaSqm} m²</td>
                            <td className="py-4 text-center">
                              <span className={`inline-block w-2.5 h-2.5 rounded-full ${isHeated ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            </td>
                            <td className="py-4 text-center font-mono font-bold text-emerald-400">
                              {isHeated ? r.loopCount : '—'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Summary Box */}
            <div className="bg-navy border border-white/5 rounded-3xl p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <h4 className="text-xs tracking-widest font-mono text-amber uppercase mb-4 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  {lang === 'ku' ? 'تێبینی و لێکدانەوەی ئەندازیاری' : 'Engineering Specifications Overview'}
                </h4>
                <p className="text-xs font-light leading-relaxed text-white/85 whitespace-pre-wrap">
                  {lang === 'ku' ? analysisResult.calculatedSummaryKu : analysisResult.calculatedSummaryEn}
                </p>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/5 text-[10px] text-muted leading-relaxed">
                {lang === 'ku' 
                  ? 'ئەم حساباتانە لەسەر ڕێنماییە ستانداردەکانی ASHRAE بۆ بەستنی گەرمی پێشکەوتووی ژێرزەوی کراون بۆ بەرگەگرتنی بەهێزترین سەرما.'
                  : 'Calculations modeled with standard under-floor hydronic equations matching ASHRAE performance directives.'}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
