
export interface Task {
  id: string;
  name: string;
  duration: number; // in minutes
  color: string;
  accent?: string;
  icon?: string;
  createdAt: number; // Unix timestamp for the actual start point of this task
}

export interface TimelineTask extends Task {
  startTime: Date;
  endTime: Date;
}

export interface HistoryItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  name: string;
  note: string;
  color: string;
}

export enum ViewMode {
  STREAM = 'STREAM',
  HISTORY = 'HISTORY'
}

export interface Preset {
  id: string;
  name: string;
  duration: number;
  color: string;
  accent: string;
  icon: string;
}

// Optimized Palette: Balanced for both themes
export const DEFAULT_PRESETS: Preset[] = [
  { id: 'p1', name: '深度办公', duration: 60, color: 'text-zinc-600', accent: '#3f3f46', icon: 'work' },
  { id: 'p2', name: '屏幕消遣', duration: 30, color: 'text-amber-900', accent: '#d97706', icon: 'chat' },
  { id: 'p3', name: '畅快游戏', duration: 90, color: 'text-indigo-900', accent: '#4f46e5', icon: 'game' },
  { id: 'p4', name: '静心冥想', duration: 20, color: 'text-teal-900', accent: '#0d9488', icon: 'flow' },
  { id: 'p5', name: '研读充电', duration: 45, color: 'text-rose-900', accent: '#e11d48', icon: 'read' },
  { id: 'p6', name: '燃脂运动', duration: 40, color: 'text-orange-900', accent: '#ea580c', icon: 'gym' },
];
