
import { Task, TimelineTask } from '../types';

/**
 * Formats a Date object into a readable time string HH:mm
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Formats duration into minutes (m) or hours (h)
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = minutes / 60;
  // If it's a whole number, don't show .0
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
};

/**
 * Core Algorithm: The Liquid Timeline
 * Calculates start and end times for each task starting from a base time.
 */
export const calculateTimeline = (tasks: Task[], baseTime: Date): TimelineTask[] => {
  let currentTime = new Date(baseTime);
  
  return tasks.map((task) => {
    const startTime = new Date(currentTime);
    const endTime = new Date(currentTime.getTime() + task.duration * 60000);
    
    // Update pointer for the next task
    currentTime = new Date(endTime);
    
    return {
      ...task,
      startTime,
      endTime
    };
  });
};

export const getRelativeDay = (dateStr: string): string => {
  const today = new Date().toLocaleDateString('zh-CN');
  const d = new Date(dateStr).toLocaleDateString('zh-CN');
  if (today === d) return '今天';
  return dateStr;
};
