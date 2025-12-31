
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Header from './components/Header';
import TheStream from './components/TheStream';
import TheDepot from './components/TheDepot';
import HistoryView from './components/HistoryView';
import DoneModal from './components/DoneModal';
import PresetModal from './components/PresetModal';
import SettingsModal from './components/SettingsModal';
import { Task, HistoryItem, ViewMode, Preset, DEFAULT_PRESETS } from './types';
import { calculateTimeline, formatTime } from './utils/time';

type Theme = 'warm' | 'nebula';

const App: React.FC = () => {
  // --- Persistent State Initialization ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tf_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('tf_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [presets, setPresets] = useState<Preset[]>(() => {
    const saved = localStorage.getItem('tf_presets');
    return saved ? JSON.parse(saved) : DEFAULT_PRESETS;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('tf_theme') as Theme) || 'warm';
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('tf_viewMode') as ViewMode) || ViewMode.STREAM;
  });

  // Track current date to ensure daily goals reset at midnight automatically
  const [currentDateStr, setCurrentDateStr] = useState(new Date().toLocaleDateString('zh-CN'));

  // --- UI State ---
  const [doneModalTask, setDoneModalTask] = useState<Task | null>(null);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null);
  const [isAutoSyncActive, setIsAutoSyncActive] = useState(false);

  // --- Effects ---
  useEffect(() => {
    document.body.className = `theme-${theme} ${theme === 'nebula' ? 'dark' : ''}`;
    localStorage.setItem('tf_theme', theme);
    
    // Update PWA Theme Color Meta Tag
    const metaThemeColor = document.getElementById('theme-color-meta');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'warm' ? '#fff9f2' : '#6a82fb');
    }
  }, [theme]);

  // Check for date change every minute to reset daily progress
  useEffect(() => {
    const timer = setInterval(() => {
      const nowStr = new Date().toLocaleDateString('zh-CN');
      if (nowStr !== currentDateStr) {
        setCurrentDateStr(nowStr);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [currentDateStr]);

  const persistData = useCallback(async (
    currentTasks: Task[], 
    currentHistory: HistoryItem[], 
    currentPresets: Preset[], 
    currentTheme: Theme,
    currentViewMode: ViewMode
  ) => {
    localStorage.setItem('tf_tasks', JSON.stringify(currentTasks));
    localStorage.setItem('tf_history', JSON.stringify(currentHistory));
    localStorage.setItem('tf_presets', JSON.stringify(currentPresets));
    localStorage.setItem('tf_theme', currentTheme);
    localStorage.setItem('tf_viewMode', currentViewMode);

    if (fileHandleRef.current) {
      try {
        const data = { 
          tasks: currentTasks, 
          history: currentHistory, 
          presets: currentPresets, 
          theme: currentTheme, 
          viewMode: currentViewMode,
          lastSync: new Date().toISOString() 
        };
        const writable = await fileHandleRef.current.createWritable();
        await writable.write(JSON.stringify(data, null, 2));
        await writable.close();
      } catch (err) {
        if (err instanceof Error && err.name === 'NotAllowedError') {
           setIsAutoSyncActive(false);
           fileHandleRef.current = null;
        }
      }
    }
  }, []);

  useEffect(() => {
    persistData(tasks, history, presets, theme, viewMode);
  }, [tasks, history, presets, theme, viewMode, persistData]);

  // Derived timeline
  const timelineTasks = useMemo(() => calculateTimeline(tasks), [tasks]);

  // Calculate Daily Essential Progress
  // Now depends on currentDateStr, so it recalculates automatically when date changes
  const essentialProgress = useMemo(() => {
    const essentials = presets.filter(p => p.isEssential);
    if (essentials.length === 0) return { total: 0, current: 0 };

    // Use the tracked state date string instead of creating a new one inside useMemo
    // This ensures consistency if the app is left open overnight
    const doneTodayNames = new Set(history.filter(h => h.date === currentDateStr).map(h => h.name));
    
    // Count how many distinct essential presets have been completed at least once today
    const current = essentials.filter(p => doneTodayNames.has(p.name)).length;
    
    return { total: essentials.length, current };
  }, [presets, history, currentDateStr]);

  // --- Handlers ---
  const addTask = useCallback((preset: Preset) => {
    const now = Date.now();
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      name: preset.name,
      duration: preset.duration,
      color: preset.color,
      accent: preset.accent,
      icon: preset.icon,
      createdAt: tasks.length === 0 ? now : now 
    };
    setTasks(prev => [...prev, newTask]);
  }, [tasks.length]);

  const handleReorderTasks = useCallback((newOrder: Task[]) => {
    if (newOrder.length > 0 && tasks.length > 0 && newOrder[0].id !== tasks[0].id) {
       newOrder[0] = { ...newOrder[0], createdAt: Date.now() };
    }
    setTasks(newOrder);
  }, [tasks]);

  const archiveTask = useCallback((task: Task, note: string) => {
    const now = new Date();
    const startTimeStr = formatTime(new Date(task.createdAt));
    const endTimeStr = formatTime(now);
    
    const historyItem: HistoryItem = {
      id: task.id,
      date: now.toLocaleDateString('zh-CN'),
      startTime: startTimeStr,
      endTime: endTimeStr,
      name: task.name,
      note,
      color: task.color
    };
    
    setHistory(prev => [historyItem, ...prev]);
    // Also update current date if needed (edge case around midnight)
    setCurrentDateStr(now.toLocaleDateString('zh-CN'));

    setTasks(prev => {
       const remaining = prev.filter(t => t.id !== task.id);
       if (remaining.length > 0) {
          remaining[0] = { ...remaining[0], createdAt: Date.now() };
       }
       return remaining;
    });
    setDoneModalTask(null);
  }, []);

  const handleExportData = useCallback(() => {
    const data = { tasks, history, presets, theme, viewMode };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timeflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [tasks, history, presets, theme, viewMode]);

  const handleImportData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.tasks) setTasks(data.tasks);
        if (data.history) setHistory(data.history);
        
        // Intelligent Migration for Presets
        // Handle legacy backups where 'isEssential' might be missing
        if (data.presets) {
           const defaultEssentialIds = new Set(
              DEFAULT_PRESETS.filter(p => p.isEssential).map(p => p.id)
           );

           const migratedPresets = data.presets.map((p: any) => ({
               ...p,
               // If isEssential is missing (legacy), inherit from default config based on ID
               isEssential: p.isEssential ?? defaultEssentialIds.has(p.id)
           }));
           setPresets(migratedPresets);
        }

        if (data.theme) setTheme(data.theme);
        if (data.viewMode) setViewMode(data.viewMode);
      } catch (err) {
        console.error("Failed to parse import file", err);
        alert("导入失败：文件格式可能已损坏");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleResetData = useCallback(() => {
    if (window.confirm('确定要重置所有数据吗？此操作无法撤销。')) {
      setTasks([]);
      setHistory([]);
      setPresets(DEFAULT_PRESETS);
      setTheme('warm');
      setViewMode(ViewMode.STREAM);
      localStorage.clear();
    }
  }, []);

  const toggleAutoSync = useCallback(async () => {
    if (isAutoSyncActive) {
      fileHandleRef.current = null;
      setIsAutoSyncActive(false);
    } else {
      try {
        // @ts-ignore
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          }],
          multiple: false
        });
        fileHandleRef.current = handle;
        setIsAutoSyncActive(true);
        persistData(tasks, history, presets, theme, viewMode);
      } catch (err) {
        console.warn("Auto-sync file selection cancelled or failed.");
      }
    }
  }, [isAutoSyncActive, tasks, history, presets, theme, viewMode, persistData]);

  return (
    <div className="h-full relative overflow-hidden flex flex-col landscape:flex-row">
      <Header 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        essentialProgress={essentialProgress}
      />
      
      <main className="flex-1 overflow-y-auto pt-[440px] pb-48 landscape:pt-10 landscape:pl-[35%] landscape:pb-32 no-scrollbar scroll-smooth">
        <div className="max-w-md mx-auto landscape:max-w-xl">
          {viewMode === ViewMode.STREAM ? (
            <TheStream 
              tasks={timelineTasks} 
              onReorder={handleReorderTasks}
              onUpdateDuration={(id, dur) => setTasks(prev => prev.map(t => t.id === id ? { ...t, duration: Math.max(1, dur) } : t))}
              onDone={setDoneModalTask}
              onDelete={(id) => setTasks(prev => prev.filter(t => t.id !== id))}
            />
          ) : (
            <HistoryView history={history} />
          )}
        </div>
      </main>

      {viewMode === ViewMode.STREAM && (
        <TheDepot 
          presets={presets} 
          onAdd={addTask} 
          onManage={() => setIsPresetModalOpen(true)}
        />
      )}

      {doneModalTask && (
        <DoneModal 
          task={doneModalTask} 
          onConfirm={(note) => archiveTask(doneModalTask, note)} 
          onCancel={() => setDoneModalTask(null)} 
        />
      )}

      {isPresetModalOpen && (
        <PresetModal
          presets={presets}
          onAdd={(p) => setPresets(prev => [...prev, p])}
          onUpdate={(up) => setPresets(prev => prev.map(p => p.id === up.id ? up : p))}
          onReorder={setPresets}
          onDelete={(id) => setPresets(prev => prev.filter(p => p.id !== id))}
          onClose={() => setIsPresetModalOpen(false)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          currentTheme={theme}
          onThemeChange={setTheme}
          onExport={handleExportData}
          onImport={handleImportData}
          onReset={handleResetData}
          onClose={() => setIsSettingsModalOpen(false)}
          isAutoSyncActive={isAutoSyncActive}
          onToggleAutoSync={toggleAutoSync}
        />
      )}
    </div>
  );
};

export default App;
