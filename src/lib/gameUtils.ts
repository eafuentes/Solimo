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
    case '9-10':
      return 8;
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
 * Deterministic per-session question order.
 * Same session round => stable order, next round => different order.
 */
export function getSessionQuestionOrder(total: number, sessionRound = 1): number[] {
  const indices = Array.from({ length: total }, (_, i) => i);
  if (indices.length <= 1) return indices;

  let rng = Math.max(1, sessionRound);
  for (let i = indices.length - 1; i > 0; i--) {
    rng = (rng * 1103515245 + 12345) % 2147483648;
    const j = ((rng / 2147483648) * (i + 1)) | 0;
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices;
}

/**
 * Create deterministic pseudo-random generator from an integer seed.
 */
export function createSeededRng(seed: number): () => number {
  let state = (Math.abs(seed) || 1) % 2147483647;
  return () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

/**
 * Deterministically shuffle an array from seed.
 */
export function seededShuffle<T>(array: T[], seed: number): T[] {
  const rng = createSeededRng(seed);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get deterministic int in [min, max] from seeded rng.
 */
export function seededInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
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
