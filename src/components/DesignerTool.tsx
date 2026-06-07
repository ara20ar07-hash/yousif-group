import React, { useState, useRef, MouseEvent, ChangeEvent } from 'react';
import { MousePointer2, Flame, Wrench, CircleDot, RefreshCw, Minus, Upload, X, ClipboardList, Heater, Send } from 'lucide-react';
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

  const canvasRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setBlueprint(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setComponents([]);
    setPipes([]);
    setIsDrawing(false);
    setPipeStart(null);
    setBlueprint(null);
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
                  onClick={handleSendToWhatsApp}
                  className="bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-semibold text-[11px] py-3.5 px-5 rounded-full uppercase tracking-[0.2em] hover:bg-[#25D366]/20 transition-colors w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> {lang === 'ku' ? 'ناردن بۆ واتسئاپ' : 'Send via WhatsApp'}
                </button>
                <button 
                  onClick={handleClear}
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
        <div className="p-4 lg:p-8 flex items-center justify-center bg-navy designer-workspace-grid overflow-auto h-[600px] lg:h-auto">
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
    </section>
  );
}
