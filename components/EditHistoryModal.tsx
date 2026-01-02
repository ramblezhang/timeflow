
import React, { useState } from 'react';
import { HistoryItem } from '../types';

interface EditHistoryModalProps {
  item: HistoryItem;
  onSave: (updatedItem: HistoryItem) => void;
  onClose: () => void;
}

const EditHistoryModal: React.FC<EditHistoryModalProps> = ({ item, onSave, onClose }) => {
  const [startTime, setStartTime] = useState(item.startTime);
  const [endTime, setEndTime] = useState(item.endTime);
  const [note, setNote] = useState(item.note);

  const handleSave = () => {
    // Basic validation implies startTime and endTime are not empty
    if (!startTime || !endTime) return;
    
    onSave({
      ...item,
      startTime,
      endTime,
      note
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="bg-white/95 dark:bg-zinc-950/90 border border-white/20 dark:border-white/10 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative flex flex-col transition-all animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-2 transition-colors z-10"
        >
          <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.1929 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.1929 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
        </button>

        <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-1 text-center serif italic">
          修正回忆
        </h3>
        <p className="text-[10px] text-center text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-8">
          {item.date} · {item.name}
        </p>

        <div className="space-y-6">
            {/* Time Editor */}
            <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold pl-1">开始</label>
                    <input 
                        type="time" 
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-lg font-mono text-center text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                    />
                </div>
                <span className="mt-6 text-zinc-300">→</span>
                <div className="flex-1 space-y-2">
                    <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold pl-1">结束</label>
                    <input 
                        type="time" 
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-lg font-mono text-center text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                    />
                </div>
            </div>

            {/* Note Editor */}
            <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold pl-1">寄语</label>
                <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="那时的想法..."
                    rows={3}
                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors resize-none serif italic leading-relaxed"
                />
            </div>

            <button 
                onClick={handleSave}
                className="w-full py-4 mt-2 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:scale-[1.02] active:scale-95 transition-all"
            >
                保存变更
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditHistoryModal;
