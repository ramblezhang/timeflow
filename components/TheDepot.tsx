
import React, { useRef, useState } from 'react';
import { Preset } from '../types';
import { Icon } from './IconSystem';
import { formatDuration } from '../utils/time';

interface TheDepotProps {
  presets: Preset[];
  onAdd: (preset: Preset) => void;
  onManage: () => void;
}

const TheDepot: React.FC<TheDepotProps> = ({ presets, onAdd, onManage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isDragging = useRef(false);
  
  // Store both the active preset and its screen coordinates
  const [activeTooltip, setActiveTooltip] = useState<{
    preset: Preset;
    rect: DOMRect;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDown.current = true;
    isDragging.current = false;
    setActiveTooltip(null); // Hide tooltip on interaction start
    if (scrollRef.current) {
      startX.current = e.pageX - scrollRef.current.offsetLeft;
      scrollLeft.current = scrollRef.current.scrollLeft;
    }
  };
  
  const handleMouseLeave = () => { 
    isDown.current = false; 
    setActiveTooltip(null);
  };
  
  const handleMouseUp = () => { 
    isDown.current = false; 
    setTimeout(() => { isDragging.current = false; }, 50); 
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current) return;
    e.preventDefault();
    setActiveTooltip(null); // Hide tooltip while dragging
    if (scrollRef.current) {
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX.current) * 2; 
      scrollRef.current.scrollLeft = scrollLeft.current - walk;
      if (Math.abs(walk) > 5) isDragging.current = true;
    }
  };

  const handleButtonEnter = (e: React.MouseEvent, preset: Preset) => {
    if (isDown.current) return; // Don't show while dragging
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveTooltip({ preset, rect });
  };

  // Touch handling to allow "scrubbing" effect with finger
  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const button = element?.closest('button[data-preset-id]');
    
    if (button) {
        const id = button.getAttribute('data-preset-id');
        const preset = presets.find(p => p.id === id);
        if (preset) {
           const rect = button.getBoundingClientRect();
           setActiveTooltip({ preset, rect });
        }
    } else {
        setActiveTooltip(null);
    }
  };

  return (
    <>
      <div className="fixed bottom-10 landscape:bottom-6 left-0 right-0 z-50 flex justify-center px-6 landscape:pl-[35%] pointer-events-none transform-gpu">
        <div className="flex items-center w-full max-w-sm landscape:max-w-md p-1.5 landscape:p-1 bg-[var(--dock-bg)] rounded-[2.2rem] landscape:rounded-[1.5rem] shadow-2xl pointer-events-auto select-none border border-white/10 transition-colors duration-700">
          
          <div 
            ref={scrollRef}
            className="flex-1 min-w-0 overflow-x-auto no-scrollbar relative cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setActiveTooltip(null)}
          >
            <div className="flex items-center gap-2 px-2 py-2">
              {presets.map((p) => {
                const isActive = activeTooltip?.preset.id === p.id;
                
                return (
                  <button
                    key={p.id}
                    data-preset-id={p.id}
                    onClick={() => !isDragging.current && onAdd(p)}
                    onMouseEnter={(e) => handleButtonEnter(e, p)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    onDragStart={(e) => e.preventDefault()}
                    className={`group relative flex items-center justify-center h-12 w-12 landscape:h-10 landscape:w-10 rounded-2xl landscape:rounded-xl transition-all duration-300 flex-shrink-0 border border-transparent ${isActive ? 'bg-white/20 scale-110 border-white/20 shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    <Icon 
                        name={p.icon} 
                        className={`w-5 h-5 landscape:w-4 landscape:h-4 transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-white/40 group-hover:text-white/80'}`} 
                    />
                    
                    {/* Essential Indicator Dot */}
                    {p.isEssential && (
                       <div className={`absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-amber-400/80 shadow-[0_0_4px_rgba(251,191,36,0.5)] transition-opacity duration-300 ${isActive ? 'opacity-0' : 'opacity-100'}`} />
                    )}
                  </button>
                );
              })}
              <div className="w-4 flex-shrink-0" />
            </div>
          </div>

          <div className="w-[1px] h-6 bg-white/10 mx-2 flex-shrink-0" />

          <button 
            onClick={onManage}
            className="h-12 w-12 landscape:h-10 landscape:w-10 flex items-center justify-center rounded-2xl landscape:rounded-xl bg-[var(--accent)] text-black font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all flex-shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 15 15" fill="none"><path d="M7.5 3V12M3 7.5H12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"></path></svg>
          </button>
        </div>
      </div>

      {/* 
         Global Tooltip Layer 
      */}
      {activeTooltip && (
        <div 
            className="fixed z-[100] pointer-events-none flex flex-col items-center gap-0.5 px-3 py-2 bg-zinc-800/90 dark:bg-zinc-100/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 animate-in fade-in zoom-in-95 duration-200"
            style={{
                left: activeTooltip.rect.left + activeTooltip.rect.width / 2,
                top: activeTooltip.rect.top,
                transform: 'translate(-50%, -100%) translateY(-12px)'
            }}
        >
            <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-zinc-100 dark:text-zinc-900 serif italic tracking-wider whitespace-nowrap">
                    {activeTooltip.preset.name}
                </span>
                {activeTooltip.preset.isEssential && (
                    <span className="w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)]"></span>
                )}
            </div>
            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 font-bold tracking-tight">
                {formatDuration(activeTooltip.preset.duration)}
            </span>
            {/* Triangle pointing down */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-zinc-800/90 dark:bg-zinc-100/90 rotate-45 border-r border-b border-white/10 rounded-[1px]"></div>
        </div>
      )}
    </>
  );
};

export default TheDepot;
