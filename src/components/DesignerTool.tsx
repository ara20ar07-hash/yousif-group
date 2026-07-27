import React, { useState, useRef, MouseEvent, ChangeEvent } from 'react';
import { MousePointer2, Flame, Wrench, CircleDot, RefreshCw, Minus, Upload, X, ClipboardList, Heater, Send, Pencil, Trash2, Plus } from 'lucide-react';
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

type Tool = 'select' | 'boiler' | 'radiator' | 'manifold' | 'valve' | 'pump' | 'pipe';

type ComponentData = { id: string; type: Exclude<Tool, 'select' | 'pipe'>; x: number; y: number };
type PipeData = { id: string; x1: number; y1: number; x2: number; y2: number };

const componentSpecs: Record<Exclude<Tool, 'select' | 'pipe'>, { name: { en: string; ku: string }; icon: React.ReactNode; borderColor: string }> = {
  boiler: { name: { en: 'Boiler / Furnace', ku: 'بۆیلەر / گەرمکەرەوە' }, icon: <Flame className="w-4 h-4 text-red-500" />, borderColor: '#ef4444' },
  radiator: { name: { en: 'Radiator Panel', ku: 'شۆفاژ' }, icon: <Heater className="w-4 h-4 text-neutral-300" />, borderColor: '#d4d4d4' },
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
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [pipeStart, setPipeStart] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingId, setDraggingId] = useState<string | null>(null);

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
      updatedRooms[index].heatingOutputRequiredKw = isHeated ? Number((evaluatedArea * 0.1).toFixed(1)) : 0;
      if (isHeated) {
        updatedRooms[index].loopCount = Math.max(1, Math.ceil(evaluatedArea / 12));
      } else {
        updatedRooms[index].loopCount = 0;
      }
    }

    if (key === 'areaSqm') {
      const isHeated = updatedRooms[index].isHeated !== false;
      updatedRooms[index].heatingOutputRequiredKw = isHeated ? Number((value * 0.1).toFixed(1)) : 0;
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
        updatedRooms[index].heatingOutputRequiredKw = Number((updatedRooms[index].areaSqm * 0.1).toFixed(1));
        updatedRooms[index].loopCount = Math.max(1, Math.ceil(updatedRooms[index].areaSqm / 12));
      }
    }

    const heatedRooms = updatedRooms.filter(r => r.isHeated !== false);
    const sumKw = heatedRooms.reduce((sum, r) => sum + r.heatingOutputRequiredKw, 0);
    const recommendedBoilerKw = Math.max(12, Math.ceil(sumKw * 1.20));
    const recommendedManifoldPorts = updatedRooms.reduce((sum, r) => sum + r.loopCount, 0);
    const totalAreaSqm = Number(heatedRooms.reduce((sum, r) => sum + r.areaSqm, 0).toFixed(1));

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
    const sumKw = heatedRooms.reduce((sum, r) => sum + r.heatingOutputRequiredKw, 0);
    const recommendedBoilerKw = Math.max(12, Math.ceil(sumKw * 1.20));
    const recommendedManifoldPorts = updatedRooms.reduce((sum, r) => sum + r.loopCount, 0);
    const totalAreaSqm = Number(heatedRooms.reduce((sum, r) => sum + r.areaSqm, 0).toFixed(1));

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
      heatingOutputRequiredKw: 1.2,
      loopCount: 1,
      isHeated: true,
      formula: "3.00m x 4.00m = 12.00 sqm"
    };
    const updatedRooms = [...analysisResult.rooms, newRoom];
    
    const heatedRooms = updatedRooms.filter(r => r.isHeated !== false);
    const sumKw = heatedRooms.reduce((sum, r) => sum + r.heatingOutputRequiredKw, 0);
    const recommendedBoilerKw = Math.max(12, Math.ceil(sumKw * 1.20));
    const recommendedManifoldPorts = updatedRooms.reduce((sum, r) => sum + r.loopCount, 0);
    const totalAreaSqm = Number(heatedRooms.reduce((sum, r) => sum + r.areaSqm, 0).toFixed(1));

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

      setAnalysisResult(data);
      setIsPermissionDenied(false);
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

  const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    // Ignore clicks if dragging just ended or clicking a delete button
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
      setComponents(prev => [...prev, {
        id: 'c_' + Math.random().toString(36).substring(2, 9),
        type: tool as Exclude<Tool, 'select' | 'pipe'>,
        x: coords.x,
        y: coords.y
      }]);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;
    setMousePos(coords);

    if (draggingId && tool === 'select') {
      setComponents(prev => prev.map(c => 
        c.id === draggingId ? { ...c, x: coords.x, y: coords.y } : c
      ));
    }
  };

  const handleMouseUp = () => setDraggingId(null);

  const removeComponent = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  const removePipe = (id: string, e: MouseEvent) => {
    if (tool === 'select') {
      e.stopPropagation();
      setPipes(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSendToWhatsApp = () => {
    let text = lang === 'ku' ? '*داواکاری نەخشەی سیستەم*\n\nپێکهاتەکان:\n' : '*System Blueprint Setup*\n\nComponents:\n';
    
    const count: Record<string, number> = {};
    components.forEach(c => {
      count[c.type] = (count[c.type] || 0) + 1;
    });

    Object.entries(count).forEach(([type, c]) => {
      const spec = componentSpecs[type as Exclude<Tool, 'select' | 'pipe'>];
      const name = lang === 'ku' ? spec.name.ku : spec.name.en;
      text += `- ${name}: ${c}\n`;
    });

    text += lang === 'ku' ? `\nژمارەی بۆرییەکان: ${pipes.length}\n` : `\nPipes lines: ${pipes.length}\n`;

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/9647709700306?text=${encodedText}`, '_blank');
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
        <p className="text-lg leading-relaxed font-light text-white/70 max-w-[600px] mb-12">
          {lang === 'ku' 
            ? 'نەخشەی بیناکەت بەرزبکەرەوە بۆ کێشانی بۆرییەکان و دانانی بۆیلەر و ئامێرەکانی تری سیستەمەکە.' 
            : 'Upload your structural blueprint to sketch custom pipelines and position heating arrays, boilers, and manifold nodes directly onto your floor plan layouts.'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr] bg-navy-mid border border-white/5 rounded-[40px] overflow-hidden min-h-[600px]">
        
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

              {/* Components Layer */}
              <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
                 {components.map(comp => {
                    const spec = componentSpecs[comp.type];
                    return (
                     <div 
                       key={comp.id}
                       onMouseDown={() => { if (tool === 'select') setDraggingId(comp.id); }}
                       className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded bg-navy-mid border-2 flex items-center justify-center shadow-lg group pointer-events-auto
                         ${tool === 'select' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
                       style={{ left: comp.x, top: comp.y, borderColor: spec.borderColor }}
                     >
                       {spec.icon}
                       
                       <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-navy/95 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity border-[0.5px] border-border-main whitespace-nowrap pointer-events-none">
                         {lang === 'ku' ? spec.name.ku : spec.name.en}
                       </span>

                       {tool === 'select' && (
                         <button 
                           onClick={(e) => removeComponent(comp.id, e)}
                           className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 shadow-md transition-opacity hover:bg-red-600 cursor-pointer"
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
      </div>

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
              <div className="text-[10px] uppercase tracking-widest text-muted font-mono mb-2">Boiler Capacity</div>
              <div className="text-3xl font-display font-bold text-amber flex items-baseline gap-1">
                {analysisResult.recommendedBoilerKw}
                <span className="text-sm font-light text-muted">kW</span>
              </div>
              <div className="text-[11px] text-muted mt-2">Required power load</div>
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
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-semibold text-text-main font-display">
                  {lang === 'ku' ? 'شەن و کەو کردنی گەرمی ژوورەکان' : 'Estimated Room Heating Details'}
                </h4>
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
