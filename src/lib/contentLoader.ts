import { ActivityId, Prompt, AgeBand, Difficulty } from '../types';

/**
 * Content loader - loads activity prompts from JSON
 * Falls back to difficulty 1 if specific difficulty level missing
 */

const contentMap: Record<ActivityId, Record<AgeBand, Record<Difficulty, Prompt[]>>> = {
  colors: {
    '3-4': {
      1: [],
      2: [],
      3: [],
    },
    '5-6': {
      1: [],
      2: [],
      3: [],
    },
    '7-8': {
      1: [],
      2: [],
      3: [],
    },
  },
  shapes: {
    '3-4': {
      1: [],
      2: [],
      3: [],
    },
    '5-6': {
      1: [],
      2: [],
      3: [],
    },
    '7-8': {
      1: [],
      2: [],
      3: [],
    },
  },
  numbers: {
    '3-4': {
      1: [],
      2: [],
      3: [],
    },
    '5-6': {
      1: [],
      2: [],
      3: [],
    },
    '7-8': {
      1: [],
      2: [],
      3: [],
    },
  },
  patterns: {
    '3-4': {
      1: [],
      2: [],
      3: [],
    },
    '5-6': {
      1: [],
      2: [],
      3: [],
    },
    '7-8': {
      1: [],
      2: [],
      3: [],
    },
  },
  memory: {
    '3-4': {
      1: [],
      2: [],
      3: [],
    },
    '5-6': {
      1: [],
      2: [],
      3: [],
    },
    '7-8': {
      1: [],
      2: [],
      3: [],
    },
  },
  sorting: {
    '3-4': {
      1: [],
      2: [],
      3: [],
    },
    '5-6': {
      1: [],
      2: [],
      3: [],
    },
    '7-8': {
      1: [],
      2: [],
      3: [],
    },
  },
  logic: {
    '3-4': {
      1: [],
      2: [],
      3: [],
    },
    '5-6': {
      1: [],
      2: [],
      3: [],
    },
    '7-8': {
      1: [],
      2: [],
      3: [],
    },
  },
};

/**
 * Load prompts for an activity
 * Falls back to level 1 if specific level not available
 */
export async function loadActivityPrompts(
  activityId: ActivityId,
  ageBand: AgeBand,
  difficulty: Difficulty
): Promise<Prompt[]> {
  // In a real app, these would be loaded from JSON files
  // For now, return empty array (to be populated with content JSON files)
  const prompts =
    contentMap[activityId]?.[ageBand]?.[difficulty] || contentMap[activityId]?.[ageBand]?.[1] || [];

  return prompts;
}

/**
 * Get a random prompt from the activity
 */
export async function getRandomPrompt(
  activityId: ActivityId,
  ageBand: AgeBand,
  difficulty: Difficulty
): Promise<Prompt | null> {
  const prompts = await loadActivityPrompts(activityId, ageBand, difficulty);
  if (prompts.length === 0) return null;
  return prompts[Math.floor(Math.random() * prompts.length)];
}
