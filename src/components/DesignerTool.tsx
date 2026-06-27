import React, { useState, useRef, MouseEvent, ChangeEvent } from 'react';
import { MousePointer2, Flame, Wrench, CircleDot, RefreshCw, Minus, Upload, X, ClipboardList, Heater, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from './LanguageContext';

type Tool = 'select' | 'boiler' | 'radiator' | 'manifold' | 'valve' | 'pump' | 'pipe';

type ComponentData = { id: string; type: Exclude<Tool, 'select' | 'pipe'>; x: number; y: number };
type PipeData = { id: string; x1: number; y1: number; x2: number; y2: number };

const componentSpecs: Record<Exclude<Tool, 'select' | 'pipe'>, { name: { en: string; ku: string }; icon: React.ReactNode; borderColor: string }> = {
  boiler: { name: { en: 'Boiler / Furnace', ku: 'بۆیلەر / گەرمکەرەوە' }, icon: <Flame className="w-5 h-5 text-red-500" />, borderColor: '#ef4444' },
  radiator: { name: { en: 'Radiator Panel', ku: 'شۆفاژ' }, icon: <Heater className="w-5 h-5 text-neutral-300" />, borderColor: '#d4d4d4' },
  manifold: { name: { en: 'Pipe Manifold', ku: 'مانیفۆڵد' }, icon: <Wrench className="w-5 h-5 text-emerald-500" />, borderColor: '#10b981' },
  valve: { name: { en: 'Safety Valve', ku: 'قفڵی سەلامەتی' }, icon: <CircleDot className="w-5 h-5 text-amber-500" />, borderColor: '#f59e0b' },
  pump: { name: { en: 'Circulation Pump', ku: 'پەمپ' }, icon: <RefreshCw className="w-5 h-5 text-purple-500" />, borderColor: '#8b5cf6' }
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
      const response = await fetch('https://yousif-blueprint-api.workers.dev/api/analyze-blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64: blueprint }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.isPermissionDenied) {
          setIsPermissionDenied(true);
        }
        throw new Error(data.error || 'Analysis failed');
      }
      setAnalysisResult(data);
      setIsPermissionDenied(false);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || (
        lang === 'ku'
          ? 'شکست لە خوێندنەوە و پشکنینی نەخشەکە لەلایەن ژیری دەستکردەوە.'
          : 'Failed to analyze blueprint. Please ensure the file is a clear blueprint floorplan.'
      ));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadFallbackScan = () => {
    const fallbackData = {
      rooms: [
        {
          nameEn: "Living Room (Hall - 4.6m x 6.0m = 27.60m²)",
          nameKu: "هۆڵی دانیشتن (٤.٦م x ٦.٠م = ٢٧.٦٠ م²)",
          areaSqm: 27.6,
          heatingOutputRequiredKw: 2.8,
          loopCount: 2,
          isHeated: true,
          formula: "4.6m x 6.0m = 27.60 sqm",
          box: { x: 32, y: 35, width: 32, height: 40 }
        },
        {
          nameEn: "Bedroom (Back Left - 3.2m x 4.2m = 13.44m²)",
          nameKu: "ژووری نووستن (دواوە دەستەچەپ - ٣.٢م x ٤.٢م = ١٣.٤٤ م²)",
          areaSqm: 13.4,
          heatingOutputRequiredKw: 1.3,
          loopCount: 1,
          isHeated: true,
          formula: "3.2m x 4.2m = 13.44 sqm",
          box: { x: 5, y: 5, width: 25, height: 35 }
        },
        {
          nameEn: "Bedroom (Back Right - 4.2m x 3.0m = 12.60m²)",
          nameKu: "ژووری نووستن (دواوە دەستەڕاست - ٤.٢م x ٣.٠م = ١٢.٦٠ م²)",
          areaSqm: 12.6,
          heatingOutputRequiredKw: 1.3,
          loopCount: 1,
          isHeated: true,
          formula: "4.2m x 3.0m = 12.60 sqm",
          box: { x: 70, y: 5, width: 25, height: 35 }
        },
        {
          nameEn: "Bedroom (Middle - 4.2m x 3.0m = 12.60m²)",
          nameKu: "ژووری نووستن (ناوەڕاست - ٤.٢م x ٣.٠م = ١٢.٦٠ م²)",
          areaSqm: 12.6,
          heatingOutputRequiredKw: 1.3,
          loopCount: 1,
          isHeated: true,
          formula: "4.2m x 3.0m = 12.60 sqm",
          box: { x: 32, y: 5, width: 35, height: 25 }
        },
        {
          nameEn: "Main Kitchen (4.6m x 4.6m = 21.16m²)",
          nameKu: "مەتبەخی سەرەکی (٤.٦م x ٤.٦م = ٢١.١٦ م²)",
          areaSqm: 21.2,
          heatingOutputRequiredKw: 2.1,
          loopCount: 2,
          isHeated: true,
          formula: "4.6m x 4.6m = 21.16 sqm",
          box: { x: 5, y: 45, width: 25, height: 40 }
        },
        {
          nameEn: "Auxiliary Kitchen (2.95m x 2.0m = 5.90m²)",
          nameKu: "مساعد مەتبەخ (٢.٩٥م x ٢.٠م = ٥.٩٠ م²)",
          areaSqm: 5.9,
          heatingOutputRequiredKw: 0,
          loopCount: 0,
          isHeated: false,
          formula: "2.95m x 2.0m = 5.90 sqm",
          box: { x: 5, y: 88, width: 25, height: 10 }
        },
        {
          nameEn: "Bathroom & Shower (1.6m x 1.7m = 2.72m²)",
          nameKu: "حەمام (١.٦م x ١.٧م = ٢.٧٢ م²)",
          areaSqm: 2.7,
          heatingOutputRequiredKw: 0,
          loopCount: 0,
          isHeated: false,
          formula: "1.6m x 1.7m = 2.72 sqm",
          box: { x: 70, y: 43, width: 12, height: 16 }
        },
        {
          nameEn: "Toilet (1.3m x 1.7m = 2.21m²)",
          nameKu: "توالیت (١.٣م x ١.٧م = ٢.٢١ م²)",
          areaSqm: 2.2,
          heatingOutputRequiredKw: 0,
          loopCount: 0,
          isHeated: false,
          formula: "1.3m x 1.7m = 2.21 sqm",
          box: { x: 84, y: 43, width: 11, height: 16 }
        },
        {
          nameEn: "Open Shaft (3.55m x 1.2m = 4.26m²)",
          nameKu: "کراوە (٣.٥٥م x ١.٢م = ٤.٢٦ م²)",
          areaSqm: 4.3,
          heatingOutputRequiredKw: 0,
          loopCount: 0,
          isHeated: false,
          formula: "3.55m x 1.2m = 4.26 sqm",
          box: { x: 70, y: 62, width: 25, height: 12 }
        },
        {
          nameEn: "Garage (3.6m x 5.0m = 18.00m²)",
          nameKu: "گەراج (٣.٦م x ٥.٠م = ١٨.٠٠ م²)",
          areaSqm: 18.0,
          heatingOutputRequiredKw: 0,
          loopCount: 0,
          isHeated: false,
          formula: "3.6m x 5.0m = 18.00 sqm",
          box: { x: 70, y: 77, width: 25, height: 21 }
        }
      ],
      totalAreaSqm: 87.4,
      recommendedBoilerKw: 12,
      recommendedManifoldPorts: 7,
      estimatedPipeSpacingCm: 15,
      calculatedSummaryEn: "Complete in-slab Hydronic Underfloor Heating thermal layout calculated for standard regional concrete/cement slab insulation layers. The system recommends a 12 kW boiler connected to a 7-port manifold, maintaining maximum 80m loop lengths at 15cm pipe spacings for optimum protection. Bathrooms, toilets, auxiliary kitchens, open shafts, and garages are completely excluded from underfloor heating layout.",
      calculatedSummaryKu: "سیستەمی گەرمی ژێرزەوی گونجاو بۆ ئەم نەخشەیە دیزاین کراوە. سیستمەکە پێشنیاری بۆیلەرێکی گەرمکەرەوەی سەرەکی دەکات بە قەبارەی ١٢ کیلۆوات لەگەڵ مانیفۆڵدێکی ٧ دەرچەیی پێکەوەبەستراو. هەر ملوولەیەکی بۆری لە ١٥سم نێوانی پێکبەستراوە. حەمام، توالیت، مساعد مەتبەخ، کراوە، و گەراجەکان بە تەواوی دوورخرانەتەوە چونکە گەرمی ژێرزەوییان بۆ دابین ناکرێت."
    };
    setAnalysisResult(fallbackData);
    setAnalysisError(null);
    setIsPermissionDenied(false);
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
    <section id="designer" className="px-6 md:px-12 py-24 bg-navy border-t border-border-main">
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

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] bg-navy-mid border border-white/5 rounded-[40px] overflow-hidden min-h-[650px]">
        
        {/* Sidebar Tools */}
        <div className="bg-navy-mid border-b lg:border-b-0 lg:border-r border-white/5 p-8 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <label className="bg-white/5 border border-white/10 text-text-main font-semibold text-[11px] py-4 px-5 rounded-full text-center uppercase tracking-[0.2em] cursor-pointer hover:bg-white/10 transition-colors">
              <Upload className="w-4 h-4 inline-block me-2 -mt-0.5" /> {lang === 'ku' ? 'نەخشە' : 'Blueprint'}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
            {blueprint && (
              <>
                <button 
                  onClick={handleAIAnalyze}
                  disabled={isAnalyzing}
                  className="bg-amber text-navy font-bold text-[11px] py-4 px-5 rounded-full uppercase tracking-[0.2em] hover:bg-amber-light transition-all w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} /> 
                  {isAnalyzing 
                    ? (lang === 'ku' ? 'شیکردنەوەی AI...' : 'AI Scanning...') 
                    : (lang === 'ku' ? 'پشکنینی نەخشە بە AI' : 'AI Read Blueprint')}
                </button>
                <button 
                  onClick={handleSendToWhatsApp}
                  disabled={isAnalyzing}
                  className="bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-semibold text-[11px] py-3.5 px-5 rounded-full uppercase tracking-[0.2em] hover:bg-[#25D366]/20 transition-colors w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> {lang === 'ku' ? 'ناردن بۆ واتسئاپ' : 'Send via WhatsApp'}
                </button>
                <button 
                  onClick={handleClear}
                  disabled={isAnalyzing}
                  className="bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-[11px] py-3.5 px-5 rounded-full uppercase tracking-[0.2em] hover:bg-red-500/20 transition-colors w-full flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> {lang === 'ku' ? 'پاککردنەوە' : 'Reset'}
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-[10px] tracking-widest uppercase text-muted font-semibold mb-3">
              {lang === 'ku' ? 'ئامرازەکان' : 'Toolsets'}
            </div>
            
            <button 
              onClick={() => { setTool('select'); setIsDrawing(false); }}
              className={`flex items-center gap-4 text-sm font-light px-5 py-3.5 rounded-2xl transition-all border w-full text-start
                ${tool === 'select' ? 'bg-navy-light border-amber text-text-main shadow-[inset_4px_0_0_#FFD600]' : 'bg-transparent border-transparent text-muted hover:bg-white/5'}`}
            >
              <MousePointer2 className="w-[18px] h-[18px]" /> {lang === 'ku' ? 'گواستنەوە' : 'Reposition'}
            </button>
            
            {(Object.keys(componentSpecs) as Exclude<Tool, 'select' | 'pipe'>[]).map(compType => (
               <button 
                key={compType}
                onClick={() => { setTool(compType); setIsDrawing(false); }}
                className={`flex items-center gap-4 text-sm font-light px-5 py-3.5 rounded-2xl transition-all border w-full text-start
                  ${tool === compType ? 'bg-navy-light border-amber text-text-main shadow-[inset_4px_0_0_#FFD600]' : 'bg-transparent border-transparent text-muted hover:bg-white/5'}`}
              >
                {componentSpecs[compType].icon} {lang === 'ku' ? componentSpecs[compType].name.ku : componentSpecs[compType].name.en}
              </button>
            ))}

            <button 
              onClick={() => setTool('pipe')}
              className={`flex items-center gap-4 text-sm font-light px-5 py-3.5 rounded-2xl transition-all border w-full text-start
                ${tool === 'pipe' ? 'bg-navy-light border-amber text-text-main shadow-[inset_4px_0_0_#FFD600]' : 'bg-transparent border-transparent text-muted hover:bg-white/5'}`}
            >
              <Minus strokeWidth={4} className="w-[18px] h-[18px] text-amber" /> {lang === 'ku' ? 'بەستنەوەی بۆری' : 'Connect Pipe'}
            </button>
          </div>

          <div className="bg-navy-light border border-white/5 p-5 rounded-2xl text-xs text-muted leading-relaxed mt-auto font-light">
             <p className="mb-2"><strong className="text-amber font-medium">Place:</strong> Select tool, tap canvas.</p>
             <p className="mb-2"><strong className="text-amber font-medium">Route:</strong> Pipe tool ➔ draw points.</p>
             <p className="mb-0"><strong className="text-amber font-medium">Modify:</strong> Reposition ➔ drag/delete.</p>
          </div>
        </div>

        {/* Workspace Canvas */}
        <div className="p-4 lg:p-8 flex items-center justify-center bg-navy designer-workspace-grid overflow-auto h-[600px] lg:h-auto relative">
          
          {isAnalyzing && (
            <div className="absolute inset-0 bg-navy/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-amber/10"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-amber animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-b-amber-light animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
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
            <div className="absolute inset-x-4 top-4 bg-red-950/95 border border-red-500/30 text-white p-6 rounded-3xl flex flex-col gap-4 z-50 shadow-2xl backdrop-blur-md max-w-[650px] mx-auto text-start">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-100 flex-shrink-0 font-bold font-mono">!</div>
                  <div>
                    <h4 className="font-bold text-sm text-red-400 font-display">
                      {isPermissionDenied 
                        ? (lang === 'ku' ? 'کێشەی دەسەڵاتی سویچی ژیری دەستکرد (403)' : 'AI Key Permission Alert (403)')
                        : (lang === 'ku' ? 'پشکنینی نەخشە' : 'Blueprint Scan Notice')}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {analysisError}
                    </p>
                  </div>
                </div>
                <button onClick={() => setAnalysisError(null)} className="text-white/40 hover:text-white flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <button 
                  onClick={handleLoadFallbackScan}
                  className="bg-amber text-navy hover:bg-amber-light font-bold text-[11px] py-3 px-5 rounded-full uppercase tracking-wider transition-all w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
                  {lang === 'ku' ? 'لێکدانەوەی زیرەکی نەخشەکە باربکە' : 'Load Fallback Calculations'}
                </button>
                <span className="text-[10px] text-slate-400 italic">
                  {lang === 'ku' ? '★ ڕاستەوخۆ حساباتی ئەندازیاری ئەم نەخشەیە باردەکات.' : '★ Instantly structures calculations for the uploaded plan.'}
                </span>
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
                       className={`absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded bg-navy-mid border-2 flex items-center justify-center shadow-lg group pointer-events-auto
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
                           className="absolute -top-2.5 -right-2.5 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 shadow-md transition-opacity hover:bg-red-600"
                         >
                           <X className="w-3 h-3" />
                         </button>
                       )}
                     </div>
                   );
                 })}
              </div>

              {/* Room Highlight Overlays */}
              {analysisResult && (
                <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
                  {analysisResult.rooms.map((room, index) => {
                    if (!room.box) return null;
                    const isHeated = room.isHeated !== false;
                    
                    // Nothing for the none-heated rooms as requested
                    if (!isHeated) return null;

                    return (
                      <div
                        key={index}
                        className="absolute room-border-highlight rounded-xl p-2.5 flex flex-col justify-between transition-all duration-300 pointer-events-auto select-none overflow-hidden"
                        style={{
                          left: `${room.box.x}%`,
                          top: `${room.box.y}%`,
                          width: `${room.box.width}%`,
                          height: `${room.box.height}%`,
                        }}
                      >
                        <div className="flex flex-col h-full justify-between">
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[10px] font-bold text-white bg-navy-mid/95 px-2 py-1 rounded shadow-sm border border-white/10 truncate max-w-[80%]">
                              {lang === 'ku' ? room.nameKu : room.nameEn}
                            </span>
                            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider bg-red-600 text-white">
                              {lang === 'ku' ? 'ئەژمارکراوە' : 'HEATED'}
                            </span>
                          </div>

                          {room.formula && (
                            <div className="text-[9px] font-mono text-white bg-red-800/90 px-1.5 py-0.5 rounded shadow-sm border border-white/10 self-start mt-1 max-w-full truncate font-bold">
                              {room.formula}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
            
            <button 
              onClick={() => {
                let text = lang === 'ku' 
                  ? `*پشکنینی گەرمی ژێرزەوی لەلایەن ژیری دەستکردەوە*\n\n`
                  : `*AI Under-floor Heating Design Sheet*\n\n`;
                
                text += lang === 'ku'
                  ? `ڕووبەری گشتی: ${analysisResult.totalAreaSqm} m²\nبۆیلەری ڕێنماییکراو: ${analysisResult.recommendedBoilerKw} kW\nکۆی دەرچەکانی مانیفۆڵد: ${analysisResult.recommendedManifoldPorts}\nدووری نێوان ملوولەکان: ${analysisResult.estimatedPipeSpacingCm} cm\n\n*لیستی ژوورەکان:*\n`
                  : `Total Area: ${analysisResult.totalAreaSqm} m²\nRecommended Boiler: ${analysisResult.recommendedBoilerKw} kW\nManifold Ports: ${analysisResult.recommendedManifoldPorts}\nPipe Spacing: ${analysisResult.estimatedPipeSpacingCm} cm\n\n*Calculated Rooms:*\n`;

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

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
            <div className="bg-navy p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-amber/20 transition-all">
              <div className="text-[10px] uppercase tracking-widest text-muted font-mono mb-2">Total Heated Area</div>
              <div className="text-3xl font-display font-bold text-text-main flex items-baseline gap-1">
                {analysisResult.totalAreaSqm}
                <span className="text-sm font-light text-muted">m²</span>
              </div>
              <div className="text-[11px] text-muted mt-2">Sum of room areas</div>
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
              <h4 className="text-lg font-semibold text-text-main mb-6 font-display">
                {lang === 'ku' ? 'شەن و کەو کردنی گەرمی ژوورەکان' : 'Estimated Room Heating Details'}
              </h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-light text-white/85">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-mono uppercase text-muted text-start">
                      <th className="py-3 text-start font-medium">{lang === 'ku' ? 'ناو' : 'Room Name'}</th>
                      <th className="py-3 text-center font-medium">{lang === 'ku' ? 'ڕووپەر' : 'Area'}</th>
                      <th className="py-3 text-center font-medium">{lang === 'ku' ? 'بڕی kW پێویست' : 'Required load'}</th>
                      <th className="py-3 text-center font-medium">{lang === 'ku' ? 'هێڵەکان (Loops)' : 'Loops'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResult.rooms.filter(r => r.isHeated !== false).map((r, i) => {
                      const isHeated = r.isHeated !== false;
                      return (
                        <tr key={i} className={`border-b border-white/5 hover:bg-white/5 transition-all text-[13px] ${!isHeated ? 'opacity-65' : ''}`}>
                          <td className="py-4 text-start font-medium text-white">
                            <div className="flex flex-col">
                              <span className="flex items-center gap-2">
                                {lang === 'ku' ? r.nameKu : r.nameEn}
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${isHeated ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/12' : 'bg-red-500/10 text-red-400 border border-red-500/12'}`}>
                                  {isHeated ? (lang === 'ku' ? 'ئەژمارکراوە' : 'Measured') : (lang === 'ku' ? 'دوورخراوەتەوە' : 'Excluded')}
                                </span>
                              </span>
                              {r.formula && (
                                <span className="text-[11px] text-muted mt-1 font-mono">
                                  {lang === 'ku' ? `کات و لێکدانەوە: ${r.formula}` : `Calculation: ${r.formula}`}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-center font-mono font-medium">{r.areaSqm} m²</td>
                          <td className="py-4 text-center font-mono text-amber">
                            {isHeated ? `${r.heatingOutputRequiredKw.toFixed(1)} kW` : '—'}
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
