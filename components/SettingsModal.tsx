
import React, { useRef, useState } from 'react';

interface SettingsModalProps {
  currentTheme: 'warm' | 'nebula';
  onThemeChange: (theme: 'warm' | 'nebula') => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onClose: () => void;
  isAutoSyncActive: boolean;
  onToggleAutoSync: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  currentTheme, onThemeChange, onExport, onImport, onReset, onClose, isAutoSyncActive, onToggleAutoSync 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        onImport(file);
        setImportStatus('导入成功');
        setTimeout(() => onClose(), 800);
      } catch (err) {
        setImportStatus('读取失败');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 dark:bg-black/40 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white/90 dark:bg-zinc-950/85 border border-white/40 dark:border-white/5 w-full max-w-[340px] landscape:max-w-[640px] rounded-[2rem] p-8 landscape:p-10 shadow-2xl relative max-h-[95vh] overflow-y-auto no-scrollbar transition-all backdrop-blur-md">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-zinc-400/60 hover:text-zinc-800 dark:hover:text-zinc-200 p-2 transition-colors z-10"
        >
          <svg width="20" height="20" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.1929 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.1929 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fillRule="evenodd" clipRule="evenodd"></path></svg>
        </button>

        <h3 className="text-2xl landscape:text-3xl font-normal text-zinc-800 dark:text-zinc-100 mb-10 landscape:mb-12 text-center serif italic tracking-wide opacity-90">
          设置与归档
        </h3>

        <div className="space-y-8 landscape:space-y-0 landscape:grid landscape:grid-cols-2 landscape:gap-x-12 landscape:gap-y-8">
            
            {/* Theme Section */}
            <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 font-medium px-1 opacity-70 serif">界面美学</h4>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => onThemeChange('warm')}
                        className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${currentTheme === 'warm' ? 'border-amber-900/10 bg-amber-50/50 text-amber-900' : 'border-zinc-100 dark:border-white/5 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5'}`}
                    >
                        <div className="w-full h-10 rounded-xl bg-[#fff9f2] border border-amber-900/5 shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-400/80 blur-[1px]"></div>
                        </div>
                        <span className="text-[11px] font-medium serif tracking-widest opacity-80">暖阳</span>
                    </button>
                    <button 
                        onClick={() => onThemeChange('nebula')}
                        className={`group flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${currentTheme === 'nebula' ? 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-100' : 'border-zinc-100 dark:border-white/5 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5'}`}
                    >
                        <div className="w-full h-10 rounded-xl bg-[#1a1a2e] border border-blue-900/10 shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400/80 blur-[1px]"></div>
                        </div>
                        <span className="text-[11px] font-medium serif tracking-widest opacity-80">星云</span>
                    </button>
                </div>
            </div>

            {/* Auto-Sync Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h4 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 font-medium opacity-70 serif">自动同步</h4>
                    {isAutoSyncActive && (
                        <span className="text-[9px] serif italic text-emerald-600 dark:text-emerald-400 animate-pulse">Running</span>
                    )}
                </div>
                
                <button 
                    onClick={onToggleAutoSync}
                    className={`group w-full flex items-center justify-between px-5 py-5 rounded-2xl border transition-all duration-300 ${isAutoSyncActive ? 'bg-zinc-900/95 dark:bg-zinc-100/95 text-white dark:text-zinc-900 border-transparent shadow-lg' : 'bg-zinc-50/50 dark:bg-white/5 border-zinc-100 dark:border-white/5 hover:border-zinc-200 dark:hover:border-white/10'}`}
                >
                    <div className="flex items-center gap-4">
                        <span className={`text-lg transition-transform duration-500 ${isAutoSyncActive ? 'scale-110' : 'opacity-50'}`}>{isAutoSyncActive ? '🛡️' : '☁️'}</span>
                        <div className="text-left space-y-0.5">
                            <div className={`text-sm font-serif font-medium tracking-wide ${isAutoSyncActive ? 'text-white dark:text-zinc-900' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                {isAutoSyncActive ? '档案已关联' : '关联本地档案'}
                            </div>
                            <div className={`text-[10px] tracking-wide ${isAutoSyncActive ? 'text-white/60 dark:text-zinc-900/60' : 'text-zinc-400 dark:text-zinc-500'}`}>
                                {isAutoSyncActive ? '变更实时静默保存' : '选择 JSON 文件进行同步'}
                            </div>
                        </div>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${isAutoSyncActive ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${isAutoSyncActive ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                </button>
            </div>

            {/* Backup Section */}
            <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500 font-medium px-1 opacity-70 serif">数据归档</h4>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={onExport}
                        className="group flex flex-col items-center gap-2 p-4 bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl transition-all hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-zinc-200"
                    >
                        <span className="text-lg opacity-60 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all">📤</span>
                        <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300 uppercase tracking-widest serif opacity-80">导出数据</span>
                    </button>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="group flex flex-col items-center gap-2 p-4 bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl transition-all hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-zinc-200"
                    >
                        <span className="text-lg opacity-60 group-hover:opacity-100 group-hover:-translate-y-0.5 transition-all">📥</span>
                        <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300 uppercase tracking-widest serif opacity-80">导入数据</span>
                    </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
            </div>

            <div className="landscape:flex landscape:items-end">
              <button 
                  onClick={onReset}
                  className="w-full py-5 landscape:py-6 text-[10px] tracking-[0.25em] uppercase rounded-2xl transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30 text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 font-medium serif"
              >
                  清除所有记录
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
