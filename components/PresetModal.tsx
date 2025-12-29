
import React, { useState, useEffect, useRef } from 'react';
import Sortable from 'sortablejs';
import { Preset } from '../types';
import { Icon, ICON_KEYS } from './IconSystem';
import { formatDuration } from '../utils/time';

interface PresetModalProps {
  presets: Preset[];
  onAdd: (preset: Preset) => void;
  onUpdate: (preset: Preset) => void;
  onReorder: (newOrder: Preset[]) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const PresetModal: React.FC<PresetModalProps> = ({ presets, onAdd, onUpdate, onReorder, onDelete, onClose }) => {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(30);
  const [selectedIcon, setSelectedIcon] = useState('work');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const sortableContainerRef = useRef<HTMLDivElement>(null);
  const sortableInstance = useRef<Sortable | null>(null);

  useEffect(() => {
    if (sortableContainerRef.current) {
      sortableInstance.current = new Sortable(sortableContainerRef.current, {
        animation: 150,
        ghostClass: 'opacity-30',
        filter: '.no-drag',
        onEnd: (evt) => {
          if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
            const newOrder = [...presets];
            const [movedItem] = newOrder.splice(evt.oldIndex, 1);
            newOrder.splice(evt.newIndex, 0, movedItem);
            onReorder(newOrder);
          }
        },
      });
    }
    return () => {
      if (sortableInstance.current) {
        sortableInstance.current.destroy();
        sortableInstance.current = null;
      }
    };
  }, [presets, onReorder]);

  const handleSelectPreset = (p: Preset) => {
    setEditingId(p.id);
    setName(p.name);
    setDuration(p.duration);
    setSelectedIcon(p.icon);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDuration(30);
    setSelectedIcon('work');
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);
    if (val > 60) {
        val = Math.round(val / 30) * 30;
    } else {
        val = Math.round(val / 5) * 5;
    }
    val = Math.max(5, Math.min(300, val));
    setDuration(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const presetData: Preset = {
      id: editingId || Date.now().toString(),
      name,
      duration: duration,
      color: presets.find(p => p.id === editingId)?.color || 'text-zinc-600', 
      accent: presets.find(p => p.id === editingId)?.accent || '#71717a', 
      icon: selectedIcon
    };

    if (editingId) {
      onUpdate(presetData);
    } else {
      onAdd(presetData);
    }
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-lg animate-in fade-in">
      <div className="bg-white/95 dark:bg-zinc-950/90 border border-white/20 dark:border-white/10 w-full max-w-sm landscape:max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col transition-all">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-2 transition-colors z-10"
        >
          <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.1929 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.1929 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
        </button>

        <h3 className="text-2xl font-light text-zinc-900 dark:text-white mb-6 landscape:mb-10 text-center serif italic">
          心流编排
        </h3>

        <div className="flex-1 overflow-y-auto no-scrollbar landscape:flex landscape:gap-12 landscape:items-start">
          {/* Presets List */}
          <div className="mb-10 landscape:mb-0 landscape:w-1/2">
              <h4 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 font-bold mb-4 px-1">常用预设</h4>
              <div 
                ref={sortableContainerRef}
                className="flex flex-wrap gap-2.5 max-h-48 landscape:max-h-[300px] overflow-y-auto pr-2 no-scrollbar"
              >
                  {presets.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => handleSelectPreset(p)}
                        className={`flex items-center gap-3 pl-4 pr-2.5 py-2.5 rounded-2xl border cursor-pointer transition-all ${editingId === p.id ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 shadow-xl scale-[1.03]' : 'bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/10'}`}
                      >
                          <span className={`${editingId === p.id ? 'text-white dark:text-zinc-900' : 'text-zinc-400 dark:text-zinc-500'} pointer-events-none`}>
                            <Icon name={p.icon} className="w-4 h-4" />
                          </span>
                          <span className={`text-xs font-bold pointer-events-none ${editingId === p.id ? 'text-white dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            {p.name}
                          </span>
                          <button 
                              onClick={(e) => { e.stopPropagation(); onDelete(p.id); if(editingId === p.id) resetForm(); }}
                              className={`no-drag ml-2 p-1 rounded-full transition-colors ${editingId === p.id ? 'text-white/40 hover:text-white dark:text-zinc-900/40 dark:hover:text-zinc-900' : 'text-zinc-300 dark:text-zinc-600 hover:text-red-500'}`}
                          >
                              <svg width="12" height="12" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 4.5L10.5 10.5M10.5 4.5L4.5 10.5" strokeLinecap="round"></path></svg>
                          </button>
                      </div>
                  ))}
              </div>
          </div>

          {/* Form Editor */}
          <div className="landscape:w-1/2">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-end px-1">
                    <h4 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 font-bold">
                        {editingId ? '编辑模块' : '新建模块'}
                    </h4>
                    {editingId && (
                        <button 
                            type="button" 
                            onClick={resetForm}
                            className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors underline underline-offset-4"
                        >
                            取消编辑
                        </button>
                    )}
                </div>
                
                <div className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar">
                    {ICON_KEYS.map(key => (
                        <button 
                            type="button"
                            key={key}
                            onClick={() => setSelectedIcon(key)}
                            className={`w-11 h-11 landscape:w-10 landscape:h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${selectedIcon === key ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg scale-110' : 'bg-zinc-50 dark:bg-white/5 text-zinc-300 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-white/10'}`}
                        >
                            <Icon name={key} className="w-5 h-5 landscape:w-4 landscape:h-4" />
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="命名 (例如：深度阅读)" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        maxLength={6}
                        className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 focus:bg-white dark:focus:bg-white/10 transition-all font-medium"
                    />
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-bold">专注时长</span>
                            <span className="text-sm mono font-black text-zinc-900 dark:text-white">{formatDuration(duration)}</span>
                        </div>
                        <input 
                            type="range" 
                            min="5" 
                            max="300" 
                            step="5"
                            value={duration}
                            onChange={handleSliderChange}
                            className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    className={`w-full py-4 landscape:py-5 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl ${editingId ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'}`}
                >
                    {editingId ? '保存修改' : '添加时间块'}
                </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresetModal;
