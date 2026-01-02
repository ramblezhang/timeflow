
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
  const [isEssential, setIsEssential] = useState(false);
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
    setIsEssential(!!p.isEssential);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDuration(30);
    setSelectedIcon('work');
    setIsEssential(false);
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
      icon: selectedIcon,
      isEssential
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
      <div className="bg-white/95 dark:bg-zinc-950/90 border border-white/20 dark:border-white/10 w-full max-w-sm landscape:max-w-3xl rounded-[2rem] p-6 shadow-2xl relative max-h-[85vh] overflow-hidden flex flex-col transition-all">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-2 transition-colors z-10"
        >
          <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.1929 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.1929 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
        </button>

        <h3 className="text-xl landscape:text-2xl font-light text-zinc-900 dark:text-white mb-6 text-center serif italic flex-shrink-0">
          心流编排
        </h3>

        <div className="flex-1 overflow-y-auto no-scrollbar landscape:flex landscape:gap-10 landscape:items-start p-1">
          {/* Presets List */}
          <div className="mb-10 landscape:mb-0 landscape:w-1/2 flex-shrink-0">
              <h4 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 font-bold mb-4 px-1">常用预设</h4>
              {/* Removed nested scrolling (max-h) to let the main container scroll */}
              <div 
                ref={sortableContainerRef}
                className="grid grid-cols-2 gap-2.5 pr-1"
              >
                  {presets.map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => handleSelectPreset(p)}
                        className={`flex items-center gap-2 pl-3 pr-2 py-3 rounded-2xl border cursor-pointer transition-all ${editingId === p.id ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 shadow-xl scale-[1.02]' : 'bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/10'}`}
                      >
                          <span className={`${editingId === p.id ? 'text-white dark:text-zinc-900' : 'text-zinc-400 dark:text-zinc-500'} pointer-events-none`}>
                            <Icon name={p.icon} className="w-4 h-4" />
                          </span>
                          <span className={`text-xs font-bold pointer-events-none flex-1 truncate ${editingId === p.id ? 'text-white dark:text-zinc-900' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            {p.name}
                          </span>
                          {p.isEssential && (
                             <span className={`w-1.5 h-1.5 rounded-full bg-amber-400 mr-2 flex-shrink-0 ${editingId === p.id ? 'shadow-sm' : ''}`}></span>
                          )}
                          <button 
                              onClick={(e) => { e.stopPropagation(); onDelete(p.id); if(editingId === p.id) resetForm(); }}
                              className={`no-drag p-1 rounded-full transition-colors ${editingId === p.id ? 'text-white/40 hover:text-white dark:text-zinc-900/40 dark:hover:text-zinc-900' : 'text-zinc-300 dark:text-zinc-600 hover:text-red-500'}`}
                          >
                              <svg width="10" height="10" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 4.5L10.5 10.5M10.5 4.5L4.5 10.5" strokeLinecap="round"></path></svg>
                          </button>
                      </div>
                  ))}
              </div>
          </div>

          {/* Form Editor */}
          <div className="landscape:w-1/2 flex-shrink-0">
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
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${selectedIcon === key ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg scale-110' : 'bg-zinc-50 dark:bg-white/5 text-zinc-300 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-white/10'}`}
                        >
                            <Icon name={key} className="w-4 h-4" />
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    <input 
                        type="text" 
                        placeholder="命名" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        maxLength={6}
                        className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 focus:bg-white dark:focus:bg-white/10 transition-all font-medium"
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

                    {/* Essential Toggle */}
                    <div 
                        onClick={() => setIsEssential(!isEssential)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${isEssential ? 'bg-amber-50/50 border-amber-900/10 dark:bg-amber-900/10 dark:border-amber-500/10' : 'bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/5'}`}
                    >
                        <div className="flex flex-col gap-0.5">
                            <span className={`text-xs font-bold ${isEssential ? 'text-amber-900 dark:text-amber-100' : 'text-zinc-600 dark:text-zinc-400'}`}>每日必备</span>
                            <span className="text-[9px] text-zinc-400 dark:text-zinc-500">标记为每天鼓励完成的项目</span>
                        </div>
                        <div className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${isEssential ? 'bg-amber-400' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${isEssential ? 'left-5' : 'left-1'}`}></div>
                        </div>
                    </div>
                </div>

                <button 
                    type="submit"
                    className={`w-full py-3.5 landscape:py-4 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl ${editingId ? 'bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'}`}
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
