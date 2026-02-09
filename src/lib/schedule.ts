import { ActivityId } from '../types';

/**
 * Activity schedule by day of week
 */
const ACTIVITY_SCHEDULE: Record<number, ActivityId> = {
  1: 'colors', // Monday
  2: 'shapes', // Tuesday
  3: 'numbers', // Wednesday
  4: 'patterns', // Thursday
  5: 'memory', // Friday
  6: 'sorting', // Saturday
  0: 'logic', // Sunday
};

/**
 * Get today's activity ID based on day of week
 */
export function getTodaysActivityId(): ActivityId {
  const dayOfWeek = new Date().getDay();
  return ACTIVITY_SCHEDULE[dayOfWeek];
}

/**
 * Get activity ID for a specific date
 */
export function getActivityIdForDate(date: Date): ActivityId {
  const dayOfWeek = date.getDay();
  return ACTIVITY_SCHEDULE[dayOfWeek];
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
  };
  return names[activityId];
}

/**
 * Get day name for a given activity ID
 */
export function getDayNameForActivity(activityId: ActivityId): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = Object.entries(ACTIVITY_SCHEDULE).find(([_, id]) => id === activityId)?.[0];
  return dayOfWeek ? dayNames[parseInt(dayOfWeek)] : 'Unknown';
}
