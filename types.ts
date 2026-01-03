
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
  accent?: string; // Added for charts
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
  isEssential?: boolean;
}

export interface LLMSettings {
  baseUrl: string;
  modelName: string;
  apiKey: string; // Stored in obfuscated format (Base64)
}

export const DEFAULT_LLM_SETTINGS: LLMSettings = {
  baseUrl: 'https://api-inference.modelscope.cn/v1/',
  modelName: 'Qwen/Qwen3-235B-A22B-Thinking-2507',
  apiKey: ''
};

// Optimized Palette: High Contrast & Vibrant for Area Charts
export const DEFAULT_PRESETS: Preset[] = [
  { id: 'p1', name: '沉浸工作', duration: 60, color: 'text-zinc-600', accent: '#2563eb', icon: 'work' }, // Blue 600
  { id: 'p2', name: '闲适时光', duration: 30, color: 'text-amber-900', accent: '#f59e0b', icon: 'chat' }, // Amber 500
  { id: 'p3', name: '畅快游戏', duration: 90, color: 'text-indigo-900', accent: '#7c3aed', icon: 'game', isEssential: true }, // Violet 600
  { id: 'p4', name: '静心冥想', duration: 20, color: 'text-teal-900', accent: '#059669', icon: 'flow', isEssential: true }, // Emerald 600
  { id: 'p5', name: '自我提升', duration: 45, color: 'text-rose-900', accent: '#e11d48', icon: 'read', isEssential: true }, // Rose 600
  { id: 'p6', name: '燃脂运动', duration: 40, color: 'text-orange-900', accent: '#0891b2', icon: 'gym' }, // Cyan 600
];
