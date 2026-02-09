import { useRef, useEffect, useCallback } from 'react';
import { Animated, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { playCorrectSfx, playWrongSfx } from '../lib/sfx';

/**
 * Voice settings tuned for children's engagement
 * - question: Friendly and clear, slower pace for comprehension
 * - success: High energy celebration voice
 * - encouragement: Warm, supportive tone for wrong answers
 */
export const VOICE_PRESETS = {
  question: { pitch: 1.2, rate: 0.92 },
  success: { pitch: 1.28, rate: 0.98 },
  encouragement: { pitch: 1.18, rate: 0.92 },
} as const;

/** Positive reinforcement messages - varied to keep kids engaged */
const SUCCESS_MESSAGES = [
  (label: string) => `${label}! Yay!`,
  (label: string) => `${label}! Yes!`,
  (label: string) => `${label}! Nice!`,
  (label: string) => `${label}! Awesome!`,
  (label: string) => `${label}! Cool!`,
  (label: string) => `${label}! Wow!`,
  (label: string) => `${label}! Amazing!`,
  (label: string) => `${label}! You did it!`,
  (label: string) => `${label}! Super!`,
  (label: string) => `${label}! Fantastic!`,
];

/** Gentle encouragement messages - never negative, always supportive */
const ENCOURAGEMENT_MESSAGES = [
  (label: string) => `${label}. Nice try!`,
  (label: string) => `${label}. You're so close!`,
  (label: string) => `${label}. Great effort!`,
  (label: string) => `${label}. Keep going!`,
  (label: string) => `${label}. You can do it!`,
  (label: string) => `${label}. Almost there!`,
  (label: string) => `${label}. Let's try again!`,
  (label: string) => `${label}. You're doing great!`,
  (label: string) => `${label}. Keep it up!`,
  (label: string) => `${label}. Try once more!`,
];

/** Pattern-style encouragement (no label context needed) */
const GENERIC_ENCOURAGEMENT = [
  'Nice try! You can do it!',
  'So close! Keep going!',
  'Great effort! Try again!',
  "You've got this!",
  'Almost there! Give it another go!',
  'Boop! Let’s try again!',
  'Ooh, close! Try once more!',
  'Keep going! You’re doing great!',
  'Let’s give it another go!',
  'Nice effort! Try again!',
];

const GENERIC_SUCCESS = [
  'Yes! Correct!',
  'Nice! You got it!',
  'Yay! Perfect!',
  'Awesome job!',
  'Cool! You did it!',
  'Wow! Great job!',
  'Amazing! Nailed it!',
  'Fantastic! Keep going!',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatLabel(label: string): string {
  if (!label) return label;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Reusable game feedback hook
 * Handles speech, animations, and answer processing for all game types.
 * Designed with child psychology principles:
 * - Immediate positive feedback on correct answers
 * - Gentle encouragement (never shame) on wrong answers
 * - Auto-speak questions for pre-readers
 * - Consistent animation patterns across games
 */
export function useGameFeedback() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Stop speech on unmount to prevent orphaned audio
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  /** Speak text with a preset voice configuration, waits for completion */
  const speak = useCallback(
    (text: string, preset: keyof typeof VOICE_PRESETS = 'question'): Promise<void> => {
      const settings = VOICE_PRESETS[preset];
      return new Promise((resolve) => {
        try {
          Speech.speak(text, {
            language: 'en',
            pitch: settings.pitch,
            rate: settings.rate,
            onDone: () => resolve(),
            onError: () => resolve(),
            onStopped: () => resolve(),
          });
        } catch (e) {
          console.warn('Speech error:', e);
          resolve();
        }
      });
    },
    []
  );

  /** Speak text but never block the game flow if callbacks don't fire */
  const speakWithTimeout = useCallback(
    async (text: string, preset: keyof typeof VOICE_PRESETS, timeoutMs = 2000) => {
      await Promise.race([
        speak(text, preset),
        new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
      ]);
    },
    [speak]
  );

  /** Auto-speak a question with a small delay for component settling */
  const speakQuestion = useCallback(
    (text: string, delay = 500) => {
      const timeout = setTimeout(() => {
        speak(text, 'question');
      }, delay);
      return () => clearTimeout(timeout);
    },
    [speak]
  );

  /** Play a bouncy success animation */
  const playSuccessAnimation = useCallback(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.15,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  /** Play a gentle shake animation for wrong answers */
  const playErrorAnimation = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  }, [scaleAnim]);

  /**
   * Handle a correct answer with celebration
   * @param label - The label to include in the success message
   * @param onCorrect - Callback after feedback completes
   * @param onAdvance - Callback to advance to next question
   */
  const handleCorrectAnswer = useCallback(
    async (label: string, onCorrect: () => void, onAdvance?: () => void) => {
      const message = formatLabel(label);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await speakWithTimeout(message, 'success');
      void playCorrectSfx();
      playSuccessAnimation();
      setTimeout(() => {
        onCorrect();
        onAdvance?.();
      }, 450);
    },
    [speakWithTimeout, playSuccessAnimation]
  );

  /**
   * Handle a wrong answer with gentle encouragement
   * @param label - The label to include in the encouragement
   * @param onWrong - Callback after feedback completes
   */
  const handleWrongAnswer = useCallback(
    async (label: string, onWrong: () => void) => {
      const message = `${formatLabel(label)}. Try again!`;
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await speakWithTimeout(message, 'encouragement');
      void playWrongSfx();
      playErrorAnimation();
      setTimeout(() => {
        onWrong();
      }, 350);
    },
    [speakWithTimeout, playErrorAnimation]
  );

  /** Handle correct with generic (no label) message */
  const handleGenericCorrect = useCallback(
    async (onCorrect: () => void, onAdvance?: () => void) => {
      const message = pickRandom(GENERIC_SUCCESS);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await speakWithTimeout(message, 'success');
      void playCorrectSfx();
      playSuccessAnimation();
      setTimeout(() => {
        onCorrect();
        onAdvance?.();
      }, 450);
    },
    [speakWithTimeout, playSuccessAnimation]
  );

  /** Handle wrong with generic (no label) message */
  const handleGenericWrong = useCallback(
    async (onWrong: () => void) => {
      const message = pickRandom(GENERIC_ENCOURAGEMENT);
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await speakWithTimeout(message, 'encouragement');
      void playWrongSfx();
      playErrorAnimation();
      setTimeout(() => {
        onWrong();
      }, 350);
    },
    [speakWithTimeout, playErrorAnimation]
  );

  return {
    scaleAnim,
    speak,
    speakQuestion,
    playSuccessAnimation,
    playErrorAnimation,
    handleCorrectAnswer,
    handleWrongAnswer,
    handleGenericCorrect,
    handleGenericWrong,
  };
}
