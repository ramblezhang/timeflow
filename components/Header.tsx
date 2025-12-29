
import React, { useState, useEffect } from 'react';
import { ViewMode } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ viewMode, setViewMode, onOpenSettings }) => {
  const [time, setTime] = useState(new Date());
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    // Efficiently track orientation for mask styling without render-loop thrashing
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

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] pt-10 pb-6 landscape:pt-6 landscape:right-auto landscape:bottom-0 landscape:w-[35%] transition-all duration-700">
      {/* 
          Glass Interaction Shield:
          Optimized: Removed inline logic that forces layout recalc. 
      */}
      <div className="absolute inset-0 h-[420px] landscape:h-full pointer-events-auto transition-all duration-700" 
           style={{ 
             backgroundColor: 'transparent',
             backdropFilter: 'blur(16px) saturate(180%)',
             WebkitBackdropFilter: 'blur(16px) saturate(180%)',
             maskImage: isLandscape ? 'linear-gradient(to right, black 85%, transparent 100%)' : 'linear-gradient(to bottom, black 85%, transparent 100%)',
             WebkitMaskImage: isLandscape ? 'linear-gradient(to right, black 85%, transparent 100%)' : 'linear-gradient(to bottom, black 85%, transparent 100%)'
           }} />

      <div className="relative h-full max-w-md mx-auto px-8 landscape:px-6 flex flex-col items-center landscape:justify-center">
        {/* Top Bar */}
        <div className="w-full flex justify-between items-center mb-12 landscape:absolute landscape:top-6 landscape:left-0 landscape:px-6 landscape:mb-0">
          <button onClick={onOpenSettings} className="group p-2 -ml-2 z-10">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[var(--text-main)] opacity-40 group-hover:opacity-100 transition-opacity">
               <path d="M4 6H20M4 12H14M4 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="flex items-center bg-[var(--text-main)]/[0.1] backdrop-blur-xl p-1 rounded-full border border-[var(--text-main)]/[0.05] z-10">
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
          
          <h2 className="mt-8 landscape:mt-4 serif italic text-xl landscape:text-lg opacity-60 font-light text-center">
            Time is a river, not a clock.
          </h2>

          {/* Timeline Indicator Line */}
          <div className="mt-12 landscape:mt-6 w-[1px] h-20 landscape:h-12 bg-gradient-to-b from-[var(--text-main)]/30 to-transparent relative">
             {/* Optimized: Removed blur-[1px] filter which is GPU heavy. Using standard opacity instead. */}
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[var(--text-main)]/20"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
