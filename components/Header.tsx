
import React, { useState, useEffect } from 'react';
import { ViewMode } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenSettings: () => void;
  essentialProgress: { total: number; current: number };
}

const Header: React.FC<HeaderProps> = ({ viewMode, setViewMode, onOpenSettings, essentialProgress }) => {
  const [time, setTime] = useState(new Date());
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => setIsLandscape(window.innerWidth > window.innerHeight);
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(prev => (prev.getMinutes() === now.getMinutes() ? prev : now));
    };
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;
    let intervalId: any;
    const timeoutId = setTimeout(() => {
      update();
      intervalId = setInterval(update, 1000);
    }, msToNextMinute);
    return () => { clearTimeout(timeoutId); if (intervalId) clearInterval(intervalId); };
  }, []);

  const progressPercentage = essentialProgress.total > 0 
    ? Math.min(100, (essentialProgress.current / essentialProgress.total) * 100) 
    : 0;
  
  const isGoalMet = essentialProgress.total > 0 && essentialProgress.current >= essentialProgress.total;
  
  // SVG Config
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] pt-10 pb-6 landscape:pt-6 landscape:right-auto landscape:bottom-0 landscape:w-[35%] transition-all duration-700">
      <div className="absolute inset-0 h-[360px] landscape:h-full pointer-events-auto transition-all duration-700" 
           style={{ 
             backgroundColor: 'transparent',
             backdropFilter: 'blur(16px) saturate(180%)',
             WebkitBackdropFilter: 'blur(16px) saturate(180%)',
             maskImage: isLandscape ? 'linear-gradient(to right, black 85%, transparent 100%)' : 'linear-gradient(to bottom, black 85%, transparent 100%)',
             WebkitMaskImage: isLandscape ? 'linear-gradient(to right, black 85%, transparent 100%)' : 'linear-gradient(to bottom, black 85%, transparent 100%)'
           }} />

      <div className="relative h-full max-w-md mx-auto px-8 landscape:px-6 flex flex-col items-center landscape:justify-center">
        {/* Top Bar */}
        <div className="w-full flex justify-between items-center mb-6 landscape:absolute landscape:top-6 landscape:left-0 landscape:px-6 landscape:mb-0">
          <button onClick={onOpenSettings} className="group p-2 -ml-2 z-10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--text-main)] opacity-40 group-hover:opacity-100 transition-opacity">
               <path d="M4 6H20M4 12H14M4 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="flex items-center gap-4 z-10">
             {/* Daily Goal Indicator */}
             {essentialProgress.total > 0 && (
                <div 
                  className={`relative w-9 h-9 flex items-center justify-center transition-all duration-500`}
                  title={`今日必备: ${essentialProgress.current}/${essentialProgress.total}`}
                >
                    {isGoalMet ? (
                         /* 
                            STATE: COMPLETE (圆满 - 优雅星芒)
                            Visual: A clean ring enclosing a curved, concave 4-point star (Sparkle/Astroid).
                            Colors: Uses var(--accent) which is now Soft Lilac in Nebula mode.
                            Effect: Minimal, Graceful, Static.
                         */
                         <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in duration-500">
                             {/* Very Subtle ambient glow */}
                             <div className="absolute inset-2 rounded-full bg-[var(--accent)] opacity-15 blur-[2px]"></div>
                             
                             <svg className="w-full h-full p-0.5" viewBox="0 0 24 24">
                                {/* The Perfect Ring */}
                                <circle 
                                    cx="12" cy="12" r={radius} 
                                    fill="none" 
                                    stroke="var(--accent)" 
                                    strokeWidth="1.2"
                                />
                                {/* 
                                    The Graceful Sparkle 
                                    Using Cubic Bezier (C) to create concave curves for a "liquid light" feel.
                                    Top: (12, 6) Right: (18, 12) Bottom: (12, 18) Left: (6, 12)
                                    Control points pull towards the center (12, 12)
                                */}
                                <path 
                                    d="M12 6 C12 9 15 12 18 12 C15 12 12 15 12 18 C12 15 9 12 6 12 C9 12 12 9 12 6 Z" 
                                    fill="var(--accent)"
                                />
                             </svg>
                         </div>
                    ) : (
                        /* 
                            STATE: INCOMPLETE (缺憾 - 虚线)
                            Visual: Dashed track representing "missing pieces".
                            Colors: Low opacity text color (neutral).
                        */
                        <>
                            <svg className="absolute inset-0 w-full h-full rotate-[-90deg]" viewBox="0 0 24 24">
                                {/* Track: Dashed to emphasize 'missing parts' */}
                                <circle 
                                    cx="12" cy="12" r={radius} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="1.5" 
                                    strokeDasharray="2 3" 
                                    className="text-[var(--text-main)] opacity-30"
                                />
                                {/* Progress: Solid line tracing over the dashes */}
                                <circle 
                                    cx="12" cy="12" r={radius} 
                                    fill="none" 
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeDashoffset}
                                    className="text-[var(--text-main)] transition-all duration-500 ease-out"
                                />
                            </svg>
                            {/* Fraction Counter */}
                            <div className="text-[9px] font-mono opacity-80 text-[var(--text-main)] font-bold tracking-tight">
                                {essentialProgress.current}/{essentialProgress.total}
                            </div>
                        </>
                    )}
                </div>
             )}

             <div className="flex items-center bg-[var(--text-main)]/[0.1] backdrop-blur-xl p-1 rounded-full border border-[var(--text-main)]/[0.05]">
                <button 
                onClick={() => setViewMode(ViewMode.STREAM)}
                className={`text-[10px] tracking-[0.15em] font-medium py-2 px-5 rounded-full transition-all ${viewMode === ViewMode.STREAM ? 'bg-[var(--text-main)] text-[var(--bg-page)] shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                >
                心流
                </button>
                <button 
                onClick={() => setViewMode(ViewMode.HISTORY)}
                className={`text-[10px] tracking-[0.15em] font-medium py-2 px-5 rounded-full transition-all ${viewMode === ViewMode.HISTORY ? 'bg-[var(--text-main)] text-[var(--bg-page)] shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                >
                回响
                </button>
            </div>
          </div>
        </div>

        {/* Big Time Display */}
        <div className="flex flex-col items-center select-none landscape:mt-8">
          <div className="flex items-center gap-2 leading-none">
            <span className="text-9xl landscape:text-7xl font-medium serif text-[var(--text-main)] tracking-tight">
              {time.getHours().toString().padStart(2, '0')}
            </span>
            <span className="text-6xl landscape:text-4xl serif italic opacity-30 mt-4 landscape:mt-2">:</span>
            <span className="text-9xl landscape:text-7xl font-medium serif text-[var(--text-main)] tracking-tight">
              {time.getMinutes().toString().padStart(2, '0')}
            </span>
          </div>
          
          <h2 className="mt-4 landscape:mt-2 serif italic text-xl landscape:text-lg opacity-60 font-light text-center">
            Time is a river, not a clock.
          </h2>

          <div className="mt-6 landscape:mt-4 w-[1px] h-12 landscape:h-8 bg-gradient-to-b from-[var(--text-main)]/30 to-transparent relative">
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[var(--text-main)]/20"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
