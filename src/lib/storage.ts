import AsyncStorage from '@react-native-async-storage/async-storage';
import { AgeBand, Difficulty } from '../types';

const KEYS = {
  AGE_BAND: 'solimo_ageBand',
  SOUND_ENABLED: 'solimo_soundEnabled',
  COMPLETED_DATE: 'solimo_completedDate',
  ACTIVITY_LEVELS: 'solimo_activityLevels',
  STREAK_COUNT: 'solimo_streakCount',
  STREAK_LAST_DATE: 'solimo_streakLastDate',
  ONBOARDING_DONE: 'solimo_onboardingDone',
};

/**
 * Get saved age band (default: '3-4')
 */
export async function getAgeBand(): Promise<AgeBand> {
  const value = await AsyncStorage.getItem(KEYS.AGE_BAND);
  return (value as AgeBand) || '3-4';
}

export async function setAgeBand(ageBand: AgeBand): Promise<void> {
  await AsyncStorage.setItem(KEYS.AGE_BAND, ageBand);
}

/**
 * Get sound enabled state (default: true)
 */
export async function isSoundEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEYS.SOUND_ENABLED);
  return value === null ? true : value === 'true';
}

export async function setSoundEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.SOUND_ENABLED, enabled.toString());
}

/**
 * Get today's completed date (YYYY-MM-DD)
 */
export async function getCompletedDate(): Promise<string | null> {
  return await AsyncStorage.getItem(KEYS.COMPLETED_DATE);
}

export async function setCompletedDate(date: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.COMPLETED_DATE, date);
}

/**
 * Get local date string (YYYY-MM-DD) to avoid UTC day shift
 */
function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if activity was completed today (local date)
 * Auto-clears if completion date is from a past day
 */
export async function isCompletedToday(): Promise<boolean> {
  const completedDate = await getCompletedDate();
  if (!completedDate) return false;

  const today = getLocalDateString();

  // If the stored date is NOT today, clear it and return false
  if (completedDate !== today) {
    await clearTodaysCompletion();
    return false;
  }

  return true;
}

/**
 * Mark activity as completed today (local date)
 */
export async function markCompletedToday(): Promise<void> {
  const today = getLocalDateString();
  await setCompletedDate(today);
}

/**
 * Clear today's completion (for testing or manual reset)
 */
export async function clearTodaysCompletion(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.COMPLETED_DATE);
}

/**
 * Get difficulty level for an activity (default: 1)
 */
export async function getDifficultyLevel(activityId: string): Promise<Difficulty> {
  const data = await AsyncStorage.getItem(KEYS.ACTIVITY_LEVELS);
  const levels = data ? JSON.parse(data) : {};
  return (levels[activityId] || 1) as Difficulty;
}

/**
 * Set difficulty level for an activity
 */
export async function setDifficultyLevel(
  activityId: string,
  difficulty: Difficulty
): Promise<void> {
  const data = await AsyncStorage.getItem(KEYS.ACTIVITY_LEVELS);
  const levels = data ? JSON.parse(data) : {};
  levels[activityId] = difficulty;
  await AsyncStorage.setItem(KEYS.ACTIVITY_LEVELS, JSON.stringify(levels));
}

/**
 * Reset all progress (used in parent corner)
 */
export async function resetProgress(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.COMPLETED_DATE);
  await AsyncStorage.removeItem(KEYS.ACTIVITY_LEVELS);
  await AsyncStorage.removeItem(KEYS.STREAK_COUNT);
  await AsyncStorage.removeItem(KEYS.STREAK_LAST_DATE);
}

/**
 * Get the current daily streak count
 */
export async function getStreak(): Promise<number> {
  const [countStr, lastDate] = await Promise.all([
    AsyncStorage.getItem(KEYS.STREAK_COUNT),
    AsyncStorage.getItem(KEYS.STREAK_LAST_DATE),
  ]);
  if (!countStr || !lastDate) return 0;

  const today = getLocalDateString();
  const yesterday = getLocalDateString(
    new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  // If last streak date is today, streak is still active
  if (lastDate === today) return parseInt(countStr, 10);
  // If last streak date was yesterday, streak is still valid but not yet bumped
  if (lastDate === yesterday) return parseInt(countStr, 10);
  // Streak broken — more than 1 day gap
  return 0;
}

/**
 * Increment (or start) the daily streak.
 * Only increments once per day — safe to call multiple times.
 */
export async function incrementStreak(): Promise<number> {
  const [countStr, lastDate] = await Promise.all([
    AsyncStorage.getItem(KEYS.STREAK_COUNT),
    AsyncStorage.getItem(KEYS.STREAK_LAST_DATE),
  ]);

  const today = getLocalDateString();
  const yesterday = getLocalDateString(
    new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  // Already incremented today — no double counting
  if (lastDate === today) return parseInt(countStr || '1', 10);

  let newCount: number;
  if (lastDate === yesterday) {
    // Consecutive day — extend streak
    newCount = (parseInt(countStr || '0', 10)) + 1;
  } else {
    // Streak broken or first day ever — start fresh
    newCount = 1;
  }

  await Promise.all([
    AsyncStorage.setItem(KEYS.STREAK_COUNT, newCount.toString()),
    AsyncStorage.setItem(KEYS.STREAK_LAST_DATE, today),
  ]);
  return newCount;
}

/**
 * Check if onboarding has been completed
 */
export async function isOnboardingDone(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
  return value === 'true';
}

/**
 * Mark onboarding as completed
 */
export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, 'true');
}
