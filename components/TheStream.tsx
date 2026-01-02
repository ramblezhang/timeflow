
import React, { useRef, useEffect, useState, useMemo } from 'react';
import Sortable from 'sortablejs';
import { TimelineTask } from '../types';
import TaskCard from './TaskCard';

interface TheStreamProps {
  tasks: TimelineTask[];
  onReorder: (newOrder: any[]) => void;
  onUpdateDuration: (id: string, duration: number) => void;
  onDone: (task: any) => void;
  onDelete: (id: string) => void;
}

// --- Unsplash Curated Collections (Verified 2.0) ---
// Switched to "Editorial" grade images which are most stable on Unsplash CDN.
const UNSPLASH_COLLECTIONS: Record<string, string[]> = {
    // Work: Minimalist, Architecture, Focus
    'work': [
        '1497215728101-856f4ea42174', // Overhead workspace
        '1497366216548-37526070297c', // Minimal desk
        '1486406146926-c627a92ad1ab', // White architecture
        '1604328698692-f76ea9498e76', // Concrete minimalist
        '1519389950476-29a5e4b199c2', // Laptop typing
    ],
    // Flow/Zen: Nature, Stones, Water
    'flow': [
        '1506126613408-eca07ce68773', // Zen stones
        '1518531933037-91b2f5f229cc', // Foggy forest
        '1499346030926-9a72daac6c63', // Sand ripples
        '1472214103451-9374bd1c798e', // Mountain view
    ],
    // Game: Neon, Cyberpunk
    'game': [
        '1542751371-adc38448a05e', // Gaming setup
        '1552820728-8f852c97bc71', // Neon keyboard
        '1550745165-9bc0b252726f', // Retro neon
        '1511512578047-929542ee6aeb', // Arcade
    ],
    // Read: Books, Library (Updated with verified high-res assets)
    'read': [
        '1524995943678-591dde6966b3', // Open book overhead
        '1506880018605-43255a6d9003', // Library shelves
        '1457369804613-52c61a468e7d', // Dark mood book
        '1512820172498-7c40f01334fc', // Cozy reading with coffee
    ],
    // Gym: Dark, Energy
    'gym': [
        '1517836357463-c25dfe21529b', // Dark gym mood
        '1534438327276-14e5300c3a48', // Dumbbells
        '1552674605-46d50b9f6554', // Weight plate
    ],
    // Code: Screens, Tech
    'code': [
        '1555066931-4365d14bab8c', // Code screen
        '1542831371-29b0f74f9713', // Matrix text
        '1461749280684-dccba630e2f6', // Coding monitor
    ],
    // Music: Vinyl, Audio
    'music': [
        '1511379938547-71f540023604', // Piano
        '1507838153419-f4d17f86d25d', // Vinyl
        '1484876065684-f63356505719', // Microphone
    ],
    // Sleep: Night, Calm
    'sleep': [
        '1531306728370-e2ebd9d7bb99', // Starry night
        '1532051680953-27dd87c10d3f', // Moon
        '1507525428034-b723cf961d3e', // Sea at night
    ],
    // Coffee: Cafe, Relax (Updated)
    'coffee': [
        '1497935586351-b67a49e012bf', // Latte art overhead
        '1442512595331-e89e7385a861', // Pour over
        '1511920170033-f8396924c348', // Coffee on table
    ],
    // Idea: Light, Abstract (Updated)
    'idea': [
        '1470092306007-055b6797ca72', // Lightbulb
        '1516934024742-b461fba47600', // Sparkler
        '1618005182384-a83a8bd57fbe', // Purple fluid abstract
    ],
    // Chat: Social, Leisure, Talk (Updated - Leisure Time usually maps here)
    'chat': [
        '1529156069890-c1f081c9f1ac', // Friends laughing
        '1543269865-cbf427effbad', // Group conversation
        '1515169022036-60418bc872f3', // Cafe conversation
        '1577563908411-92169b525c90', // Abstract connection bubbles
    ],
    // Misc Fallback: Geometric, Abstract
    'misc': [
        '1550684848-fac1c5b4e853', // Liquid paint
        '1500462918059-b1a0cb512f1d', // Red abstract
        '1451187580459-43490279c0fa', // Geometric shapes
        '1494438639946-1ebd1d20bf85', // Abstract gold
    ]
};

const getUnsplashUrl = (icon: string | undefined, seedId: string): string => {
    // 1. Safety Check: If icon is undefined, string, or not in list, fallback to 'misc'
    const validIcon = icon && UNSPLASH_COLLECTIONS[icon] ? icon : 'misc';
    const collection = UNSPLASH_COLLECTIONS[validIcon];

    // 2. Simple hash from string to number
    const seed = seedId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // 3. Pick index safely
    const index = seed % collection.length;
    const imageId = collection[index];

    // 4. Construct URL
    // fit=crop&w=1920 ensures we get a wallpaper-sized crop, limiting bandwidth but ensuring quality
    return `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&q=80&w=1920`;
};

const TheStream: React.FC<TheStreamProps> = ({ tasks, onReorder, onUpdateDuration, onDone, onDelete }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<Sortable | null>(null);
  const [showPoem, setShowPoem] = useState(false);

  useEffect(() => {
    if (scrollRef.current && tasks.length > 0) {
      sortableRef.current = new Sortable(scrollRef.current, {
        animation: 300,
        delay: 100,
        delayOnTouchOnly: true, 
        filter: 'button',
        preventOnFilter: false,
        ghostClass: 'opacity-20',
        chosenClass: 'scale-[1.02]',
        onEnd: (evt) => {
          if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
            const newOrder = [...tasks];
            const [movedItem] = newOrder.splice(evt.oldIndex, 1);
            newOrder.splice(evt.newIndex, 0, movedItem);
            onReorder(newOrder);
          }
        },
      });
    }

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, [tasks, onReorder]);

  // Logic: Return NULL if there are no tasks
  const activeBackground = useMemo(() => {
    if (tasks.length === 0) return null;
    
    // The background is determined by the FIRST task in the list (the active one)
    const currentTask = tasks[0];
    return getUnsplashUrl(currentTask.icon, currentTask.id);
  }, [tasks]);

  return (
    <div className="w-full">
      {/* Immersive Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Image Layer with transitions */}
        <div 
            className={`absolute inset-0 bg-cover bg-center transition-all duration-[1500ms] ease-in-out blur-[2px] scale-105 ${activeBackground ? 'opacity-30 dark:opacity-25' : 'opacity-0'}`}
            style={{ 
                backgroundImage: activeBackground ? `url(${activeBackground})` : 'none',
            }}
        />
        
        {/* Gradient Mask - Always visible to maintain theme consistency */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-page)]/80 via-[var(--bg-page)]/90 to-[var(--bg-page)]" />
      </div>

      <div className="relative z-10">
        {tasks.length === 0 ? (
            <>
            <div 
                onClick={() => setShowPoem(true)}
                className="flex flex-col items-center justify-center py-20 px-8 text-center cursor-pointer"
            >
                <div className="opacity-40 hover:opacity-60 transition-opacity duration-300">
                <p className="serif italic text-xl landscape:text-lg leading-relaxed text-[var(--text-main)]">
                    “当我们沉浸于一事，<br/>
                    无需被刻度的指针奴役...”
                </p>
                <div className="mt-6 w-8 h-[1px] bg-[var(--text-main)] mx-auto opacity-30"></div>
                </div>
            </div>

            {/* Poem Overlay */}
            {showPoem && (
                <div 
                className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-[var(--bg-page)]/90 backdrop-blur-xl animate-in fade-in duration-700 cursor-pointer"
                onClick={() => setShowPoem(false)}
                >
                <div className="max-w-lg text-center pointer-events-none select-none">
                    <div className="mb-8 opacity-40">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto">
                        <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                    </div>
                    
                    <h3 className="serif italic text-2xl md:text-3xl leading-loose text-[var(--text-main)] opacity-90 space-y-6">
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-100">
                        无需被刻度的指针奴役
                    </div>
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300">
                        顺应心流的起伏
                    </div>
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-500">
                        在当下的专注中寻找永恒
                    </div>
                    <div className="h-4"></div>
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-700 font-bold opacity-100">
                        在此刻
                    </div>
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-1000 text-lg opacity-70 not-italic mono mt-4">
                        只有你，和正在流淌的时间
                    </div>
                    </h3>

                    <div className="mt-16 text-[9px] uppercase tracking-[0.4em] opacity-40">
                    Click anywhere to close
                    </div>
                </div>
                </div>
            )}
            </>
        ) : (
            <div ref={scrollRef} className="space-y-4 pb-32">
            {tasks.map((task) => (
                <TaskCard 
                key={task.id} 
                task={task} 
                onUpdateDuration={onUpdateDuration}
                onDone={onDone}
                onDelete={onDelete}
                />
            ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default TheStream;
