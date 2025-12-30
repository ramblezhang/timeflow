
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
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
};

/**
 * Core Algorithm: The Liquid Timeline
 * Calculates start and end times for each task in the sequence.
 * The first task starts at its 'createdAt' timestamp, and others follow.
 */
export const calculateTimeline = (tasks: Task[]): TimelineTask[] => {
  if (tasks.length === 0) return [];

  // Anchor the entire timeline to the first task's creation/activation time
  // This ensures the timeline doesn't "drift" as the wall clock moves.
  let cursor = new Date(tasks[0].createdAt);
  
  return tasks.map((task) => {
    const startTime = new Date(cursor);
    const endTime = new Date(cursor.getTime() + task.duration * 60000);
    
    // Update pointer for the next task
    cursor = new Date(endTime);
    
    return {
      ...task,
      startTime,
      endTime
    };
  });
};

export const getRelativeDay = (dateStr: string): string => {
  try {
    const today = new Date().toLocaleDateString('zh-CN');
    const d = new Date(dateStr).toLocaleDateString('zh-CN');
    if (today === d) return '今天';
  } catch (e) {
    return dateStr;
  }
  return dateStr;
};
