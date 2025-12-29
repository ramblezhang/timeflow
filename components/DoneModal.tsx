
import React, { useState } from 'react';
import { Task } from '../types';

interface DoneModalProps {
  task: Task;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

const DoneModal: React.FC<DoneModalProps> = ({ task, onConfirm, onCancel }) => {
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-white/60 backdrop-blur-2xl animate-in fade-in duration-1000">
      <div className="w-full max-w-lg text-center animate-in zoom-in-95 duration-700">
        <div className="mb-12">
            <span className="text-[10px] tracking-[0.5em] uppercase text-zinc-500 block mb-4">Reflection</span>
            <h3 className="text-4xl serif italic text-zinc-900 leading-tight">
                「{task.name}」<br/>
                <span className="text-xl font-extralight text-zinc-500 opacity-80 not-italic">在消失的时光里，你捕获了什么？</span>
            </h3>
        </div>
        
        <div className="relative mb-16">
          <input 
            autoFocus
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="捕捉这一瞬的思绪..."
            className="w-full bg-transparent border-b border-zinc-300 py-6 text-2xl text-center text-zinc-800 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-500 transition-all font-extralight italic serif"
            onKeyDown={(e) => e.key === 'Enter' && onConfirm(note)}
          />
        </div>

        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={() => onConfirm(note)}
            className="px-12 py-4 text-xs tracking-[0.3em] font-bold bg-zinc-900 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-300 uppercase"
          >
            归档至生命河流
          </button>
          <button 
            onClick={onCancel}
            className="text-[10px] tracking-[0.2em] text-zinc-400 hover:text-zinc-800 uppercase transition-colors"
          >
            稍后再说
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoneModal;
