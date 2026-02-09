import * as Speech from 'expo-speech';

/**
 * Shared voice settings for consistent audio across all games
 */
export const VOICE_SETTINGS = {
  question: {
    pitch: 1.5,
    rate: 0.95,
  },
  success: {
    pitch: 1.65,
    rate: 0.95,
  },
  error: {
    pitch: 1.45,
    rate: 0.9,
  },
} as const;

/**
 * Reusable success message templates
 */
export const SUCCESS_MESSAGES = [
  (label: string) => `${label}! Yay!`,
  (label: string) => `${label}! Yes!`,
  (label: string) => `${label}! Nice!`,
  (label: string) => `${label}! Awesome!`,
  (label: string) => `${label}! Cool!`,
  (label: string) => `${label}! Wow!`,
];

/**
 * Reusable error message templates
 */
export const ERROR_MESSAGES = [
  (label: string) => `That's ${label}. Try again!`,
  (label: string) => `Nope! That's ${label}. Go!`,
  (label: string) => `That's ${label}. Keep trying!`,
  (label: string) => `Oops! That's ${label}. Once more!`,
  (label: string) => `That is ${label}. You can do it!`,
];

/**
 * Get random message from array
 */
export function getRandomMessage(
  messages: Array<(label: string) => string>,
  label: string
): string {
  const messageTemplate = messages[Math.floor(Math.random() * messages.length)];
  return messageTemplate(label);
}

/**
 * Speak a message with given voice settings
 */
export function speakMessage(
  text: string,
  settings:
    | typeof VOICE_SETTINGS.question
    | typeof VOICE_SETTINGS.success
    | typeof VOICE_SETTINGS.error
): void {
  try {
    Speech.speak(text, {
      language: 'en',
      pitch: settings.pitch,
      rate: settings.rate,
    });
  } catch (error) {
    console.warn('Speech error:', error);
  }
}

/**
 * Stop all speech
 */
export function stopSpeech(): void {
  try {
    Speech.stop();
  } catch (error) {
    console.warn('Stop speech error:', error);
  }
}

/**
 * Get difficulty-based count for memory-like games
 */
export function getDifficultyCount(ageBand: string): number {
  switch (ageBand) {
    case '3-4':
      return 3;
    case '5-6':
      return 4;
    case '7-8':
      return 6;
    default:
      return 3;
  }
}

/**
 * Fisher-Yates shuffle algorithm for randomizing array order
 * Ensures variety when games are replayed
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Seeded shuffle based on week number for consistent variety
 * Same child gets different questions each week, but same across day
 */
export function getWeeklyQuestionsShuffle<T>(array: T[], seed?: number): T[] {
  const week = seed ?? getWeekNumber();
  const shuffled = [...array];
  let rng = week;

  // Seeded random number generator (simple LCG)
  for (let i = shuffled.length - 1; i > 0; i--) {
    rng = (rng * 1103515245 + 12345) % 2147483648;
    const j = ((rng / 2147483648) * (i + 1)) | 0;
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get current week number of the year for seeded randomization
 */
function getWeekNumber(): number {
  const d = new Date();
  const dayNum = d.getDay();
  const v = new Date(d.getFullYear(), 0, 1);
  v.setDate(v.getDate() + 4 - dayNum);
  const ms = v.getTime();
  v.setMonth(0);
  v.setDate(1);
  const week = Math.round((ms - v.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  return week;
}
