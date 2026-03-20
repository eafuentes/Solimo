import { ActivityId } from '../types';

/**
 * Activity schedule by day of week
 */
/**
 * 14-day rotation: alternate weeks include Writing.
 * Week A (even): Mon-Sun = colors, shapes, numbers, patterns, memory, sorting, logic
 * Week B (odd):  Mon-Sun = writing, colors, shapes, numbers, patterns, memory, sorting
 */
const WEEK_A_SCHEDULE: Record<number, ActivityId> = {
  1: 'colors', // Monday
  2: 'shapes', // Tuesday
  3: 'numbers', // Wednesday
  4: 'patterns', // Thursday
  5: 'memory', // Friday
  6: 'sorting', // Saturday
  0: 'logic', // Sunday
};

const WEEK_B_SCHEDULE: Record<number, ActivityId> = {
  1: 'writing', // Monday
  2: 'colors', // Tuesday
  3: 'shapes', // Wednesday
  4: 'numbers', // Thursday
  5: 'patterns', // Friday
  6: 'memory', // Saturday
  0: 'sorting', // Sunday
};

function getWeekParity(date: Date): 'A' | 'B' {
  const start = new Date(date.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  return weekNum % 2 === 0 ? 'A' : 'B';
}

function getScheduleForDate(date: Date): Record<number, ActivityId> {
  return getWeekParity(date) === 'A' ? WEEK_A_SCHEDULE : WEEK_B_SCHEDULE;
}

/**
 * Get today's activity ID based on day of week
 */
export function getTodaysActivityId(): ActivityId {
  const today = new Date();
  const schedule = getScheduleForDate(today);
  return schedule[today.getDay()];
}

/**
 * Get activity ID for a specific date
 */
export function getActivityIdForDate(date: Date): ActivityId {
  const schedule = getScheduleForDate(date);
  return schedule[date.getDay()];
}

/**
 * Get human-readable activity name
 */
export function getActivityName(activityId: ActivityId): string {
  const names: Record<ActivityId, string> = {
    colors: 'Colors',
    shapes: 'Shapes',
    numbers: 'Numbers',
    patterns: 'Patterns',
    memory: 'Memory',
    sorting: 'Sorting',
    logic: 'Logic',
    writing: 'Writing',
  };
  return names[activityId];
}

/**
 * Get day name for a given activity ID
 */
export function getDayNameForActivity(activityId: ActivityId): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // Check both schedules
  const entryA = Object.entries(WEEK_A_SCHEDULE).find(([_, id]) => id === activityId);
  const entryB = Object.entries(WEEK_B_SCHEDULE).find(([_, id]) => id === activityId);
  const dayOfWeek = (entryA ?? entryB)?.[0];
  return dayOfWeek ? dayNames[parseInt(dayOfWeek)] : 'Varies';
}
