
import React from 'react';
import { TimelineTask } from '../types';
import { formatTime, formatDuration } from '../utils/time';

interface TaskCardProps {
  task: TimelineTask;
  onUpdateDuration: (id: string, duration: number) => void;
  onDone: (task: TimelineTask) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdateDuration, onDone, onDelete }) => {
  return (
    <div className="fade-in-standard group relative mx-6 mb-2 landscape:mx-4 px-8 py-3 landscape:py-2.5 rounded-[1.8rem] card-themed overflow-hidden hover:py-5 landscape:hover:py-4 transition-all duration-300 ease-out cursor-grab active:cursor-grabbing touch-manipulation">
      
      {/* Dynamic Accent Strip */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 opacity-80"
        style={{ backgroundColor: task.accent || 'var(--accent)' }}
      />

      <div className="relative flex justify-between items-center z-10">
        <div className="flex-1 min-w-0 pr-4 pointer-events-none">
          <div className="flex items-center gap-2 mb-0.5">
             <span className="mono text-[8px] tracking-[0.2em] uppercase font-bold opacity-40">
               {formatDuration(task.duration)} Session
             </span>
          </div>
          
          <h3 className="text-lg landscape:text-base font-bold tracking-tight serif italic leading-tight mb-1 group-hover:text-xl landscape:group-hover:text-lg transition-all">
            {task.name}
          </h3>
          
          <div className="flex items-center gap-3 text-[9px] mono opacity-40">
            <span className="font-bold">{formatTime(task.startTime)}</span>
            <span className="opacity-20">→</span>
            <span className="font-bold">{formatTime(task.endTime)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
            {/* Drag Handle Icon - Now visible on all screens as visual affordance */}
            <span className="p-2 opacity-10 group-hover:opacity-60 transition-opacity cursor-grab">
                <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M5.5 4.5C5.5 5.05228 5.05228 5.5 4.5 5.5C3.94772 5.5 3.5 5.05228 3.5 4.5M10.5 5.5C11.0523 5.5 11.5 5.05228 11.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path></svg>
            </span>
            <button 
                onClick={(e) => { e.stopPropagation(); onDone(task); }}
                className="h-10 w-10 landscape:h-9 landscape:w-9 flex items-center justify-center rounded-full bg-[var(--text-main)] text-[var(--bg-page)] hover:scale-110 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
                <svg width="18" height="18" viewBox="0 0 15 15" fill="none"><path d="M4 8L7 11L12 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            </button>
        </div>
      </div>

      {/* Control Footer - Reveals on Hover */}
      <div className="max-h-0 group-hover:max-h-20 overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--text-main)]/10">
            <div className="flex gap-4">
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateDuration(task.id, task.duration + (task.duration >= 60 ? 30 : 5)); }} 
                className="text-[9px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity p-2 -ml-2"
              >
                +{task.duration >= 60 ? '30m' : '5m'}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdateDuration(task.id, Math.max(5, task.duration - (task.duration >= 60 ? 30 : 5))); }} 
                className="text-[9px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity p-2"
              >
                -{task.duration >= 60 ? '30m' : '5m'}
              </button>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
                className="text-[9px] font-bold uppercase tracking-widest text-rose-500/60 hover:text-rose-500 transition-colors p-2 -mr-2"
            >
                Remove
            </button>
          </div>
      </div>
    </div>
  );
};

export default TaskCard;
