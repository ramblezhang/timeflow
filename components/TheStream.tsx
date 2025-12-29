
import React, { useRef, useEffect, useState } from 'react';
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

const TheStream: React.FC<TheStreamProps> = ({ tasks, onReorder, onUpdateDuration, onDone, onDelete }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<Sortable | null>(null);
  const [showPoem, setShowPoem] = useState(false);

  useEffect(() => {
    // We only initialize sortable if we have tasks
    if (scrollRef.current && tasks.length > 0) {
      sortableRef.current = new Sortable(scrollRef.current, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'opacity-20',
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

  return (
    <div className="w-full">
      {tasks.length === 0 ? (
        <>
          <div 
            onClick={() => setShowPoem(true)}
            className="flex flex-col items-center justify-center py-20 px-8 text-center cursor-pointer"
          >
            {/* Poetic Teaser - Static, Zero GPU usage */}
            <div className="opacity-40 hover:opacity-60 transition-opacity duration-300">
               <p className="serif italic text-xl landscape:text-lg leading-relaxed text-[var(--text-main)]">
                 “当我们沉浸于一事，<br/>
                 无需被刻度的指针奴役...”
               </p>
               {/* Static decorative line instead of animated dots */}
               <div className="mt-6 w-8 h-[1px] bg-[var(--text-main)] mx-auto opacity-30"></div>
            </div>
          </div>

          {/* Full Poem Overlay */}
          {showPoem && (
            <div 
              className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-[var(--bg-page)]/90 backdrop-blur-xl animate-in fade-in duration-700 cursor-pointer"
              onClick={() => setShowPoem(false)}
            >
              <div className="max-w-lg text-center pointer-events-none select-none">
                <div className="mb-8 opacity-40">
                  {/* Removed animate-spin-slow */}
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

                {/* Removed animate-pulse from text */}
                <div className="mt-16 text-[9px] uppercase tracking-[0.4em] opacity-40">
                  Click anywhere to close
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div ref={scrollRef} className="space-y-4">
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
  );
};

export default TheStream;
