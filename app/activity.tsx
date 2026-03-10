import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityId, AgeBand } from '../src/types';
import {
  getAgeBand,
  getDifficultyLevel,
  setDifficultyLevel,
  markCompletedToday,
  incrementStreak,
  getNextSessionRound,
  getLocalBestResult,
  saveLocalGameResult,
  LocalBestResult,
} from '../src/lib/storage';
import { DifficultyManager } from '../src/lib/difficulty';
import { getActivityName } from '../src/lib/schedule';
import { ProgressStars } from '../src/components/ProgressStars';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { ColorsGame } from '../src/components/games/ColorsGame';
import { ShapesGame } from '../src/components/games/ShapesGame';
import { NumbersGame } from '../src/components/games/NumbersGame';
import { PatternsGame } from '../src/components/games/PatternsGame';
import { MemoryGame } from '../src/components/games/MemoryGame';
import { SortingGame } from '../src/components/games/SortingGame';
import { LogicGame } from '../src/components/games/LogicGame';

/**
 * How many correct answers a game+age-band session requires.
 * Memory boards are finite (one correct per matched pair), so cap
 * the requirement at the number of pairs available.
 * All other games cycle questions via modulo, so 5 is always reachable.
 */
function getRequiredCorrect(activity: string, age: AgeBand): number {
  if (activity === 'memory') {
    const pairCounts: Record<AgeBand, number> = { '3-4': 3, '5-6': 4, '7-8': 5, '9-10': 6 };
    return pairCounts[age];
  }
  return 5;
}

const TIMER_SECONDS_7_8 = 90;
const TIMER_SECONDS_9_10 = 75;

/** Varied celebration messages so every session feels fresh */
const CELEBRATION_MESSAGES = [
  'Wonderful! Great job! You are a star!',
  'Amazing work! You did fantastic today!',
  'Incredible! You are so smart!',
  'Brilliant! You nailed it!',
  'Super job! You are a champion!',
  'Wow! That was awesome!',
  'You rock! What a great session!',
];

const TIMEOUT_MESSAGES = [
  'Time is up! Great effort! Keep practicing!',
  'Time is up! You did really well!',
  'Time is up! That was a great try!',
  'Time is up! Practice makes perfect!',
];

/**
 * Activity screen — the game session wrapper
 *
 * Responsibilities:
 * - Loads user age/difficulty preferences
 * - Shows progress stars (motivational feedback)
 * - Tracks correct/wrong answers with adaptive difficulty
 * - Shows celebration screen on completion
 * - Provides back navigation at all times
 */
export default function ActivityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const [ageBand, setAgeBand] = useState<AgeBand>('3-4');
  const [difficulty, setDifficulty] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [difficultyManager, setDifficultyManager] = useState<DifficultyManager | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [sessionRound, setSessionRound] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const [bestResult, setBestResult] = useState<LocalBestResult | null>(null);

  // Celebration animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function load() {
      if (!activityId) return;
      const userAgeBand = await getAgeBand();
      setAgeBand(userAgeBand);
      const [userDifficulty, nextRound, storedBest] = await Promise.all([
        getDifficultyLevel(activityId),
        getNextSessionRound(activityId, userAgeBand),
        getLocalBestResult(activityId, userAgeBand),
      ]);
      setDifficulty(userDifficulty);
      setDifficultyManager(new DifficultyManager(userDifficulty));
      setSessionRound(nextRound);
      setBestResult(storedBest);
      setElapsedSeconds(0);
      setTimedOut(false);
      setIsLoading(false);
    }
    load();
  }, [activityId]);

  const isTimedMode = ageBand === '7-8' || ageBand === '9-10';
  const timerSeconds = ageBand === '9-10' ? TIMER_SECONDS_9_10 : TIMER_SECONDS_7_8;
  const requiredCorrect = getRequiredCorrect(activityId ?? '', ageBand);

  const difficultyManagerRef = useRef<DifficultyManager | null>(null);
  difficultyManagerRef.current = difficultyManager;

  // Ref mirrors correctCount so handleCorrect never reads a stale closure value
  const correctCountRef = useRef(0);
  correctCountRef.current = correctCount;

  const handleCorrect = useCallback(async () => {
    if (timedOut) return;
    const newCount = correctCountRef.current + 1;
    correctCountRef.current = newCount;
    setCorrectCount(newCount);
    setTotalAttempts((prev) => prev + 1);

    const dm = difficultyManagerRef.current;
    if (!dm) return;
    dm.recordCorrect();
    const newLevel = dm.getDifficultyAdjustment();
    if (newLevel) {
      setDifficulty(newLevel);
      if (activityId) void setDifficultyLevel(activityId, newLevel);
    }

    if (newCount >= requiredCorrect) {
      Speech.stop();
      await markCompletedToday();
      await incrementStreak();
      setSessionComplete(true);
    }
  }, [timedOut, activityId, requiredCorrect]);

  const handleWrong = useCallback(() => {
    if (timedOut) return;
    setTotalAttempts((prev) => prev + 1);
    const dm = difficultyManagerRef.current;
    if (!dm) return;
    dm.recordWrong();
    const newLevel = dm.getDifficultyAdjustment();
    if (newLevel) {
      setDifficulty(newLevel);
      if (activityId) void setDifficultyLevel(activityId, newLevel);
    }
  }, [timedOut, activityId]);

  // Stop speech when leaving
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  // Timer mode for older kids (age 7-8, 9-10)
  useEffect(() => {
    if (isLoading || sessionComplete || !isTimedMode) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;

        // Haptic pulse at 10-second warning
        if (next === timerSeconds - 10 && Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        if (next >= timerSeconds) {
          clearInterval(interval);
          setTimedOut(true);
          setSessionComplete(true);
          Speech.stop();
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          return timerSeconds;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, sessionComplete, isTimedMode, timerSeconds]);

  // Persist local best result on session completion
  useEffect(() => {
    if (!sessionComplete || !activityId) return;

    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 100;
    const elapsed = isTimedMode ? Math.min(elapsedSeconds, timerSeconds) : null;

    void saveLocalGameResult(activityId, ageBand, accuracy, elapsed)
      .then((updated) => setBestResult(updated))
      .catch((error) => console.warn('Save local result error:', error));
  }, [
    sessionComplete,
    activityId,
    ageBand,
    correctCount,
    totalAttempts,
    elapsedSeconds,
    isTimedMode,
  ]);

  // Celebration animations + speech
  useEffect(() => {
    if (!sessionComplete) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(confettiAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      const message = timedOut
        ? TIMEOUT_MESSAGES[Math.floor(Math.random() * TIMEOUT_MESSAGES.length)]
        : CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
      Speech.speak(message, {
        language: 'en',
        pitch: 1.65,
        rate: 0.95,
      });
    }, 500);
  }, [sessionComplete, timedOut]);

  const activityName = activityId ? getActivityName(activityId as ActivityId) : '';

  // ── Loading state ──

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🎮</Text>
        <ActivityIndicator size="large" color="#FFD93D" />
        <Text style={styles.loadingText}>Loading {activityName || 'activity'}...</Text>
      </View>
    );
  }

  // ── Celebration screen ──

  if (sessionComplete) {
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 100;
    const starRating = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
    const remaining = Math.max(0, timerSeconds - elapsedSeconds);

    return (
      <Animated.View
        style={[
          styles.completionContainer,
          { paddingTop: insets.top + 32 },
          { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
        ]}
      >
        {/* Confetti emojis */}
        <Animated.View
          style={[
            styles.confettiRow,
            {
              opacity: confettiAnim,
              transform: [
                {
                  translateY: confettiAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.confettiEmoji}>🎉</Text>
          <Text style={styles.confettiEmoji}>⭐</Text>
          <Text style={styles.confettiEmoji}>🎊</Text>
        </Animated.View>

        <Text style={styles.completionEmoji}>🏆</Text>
        <Text style={styles.completionTitle}>Wonderful!</Text>

        {/* Star rating */}
        <View style={styles.starRatingRow}>
          {[1, 2, 3].map((i) => (
            <Text key={i} style={styles.ratingStar}>
              {i <= starRating ? '⭐' : '☆'}
            </Text>
          ))}
        </View>

        <Text style={styles.completionText}>
          {timedOut
            ? `Time's up! You got ${correctCount} out of ${totalAttempts} correct!`
            : `You got ${correctCount} out of ${totalAttempts} correct!`}
        </Text>
        {isTimedMode && <Text style={styles.completionSubtext}>⏱️ Time left: {remaining}s</Text>}
        {bestResult && (
          <Text style={styles.completionSubtext}>
            🏅 Best: {bestResult.bestAccuracy}%
            {bestResult.fastestTimeSec !== null ? ` • Fastest: ${bestResult.fastestTimeSec}s` : ''}
            {'\n'}Plays: {bestResult.plays}
          </Text>
        )}
        <Text style={styles.completionSubtext}>
          {accuracy >= 90
            ? '🌟 Perfect! You are amazing!'
            : accuracy >= 70
              ? '👏 Great work! Keep it up!'
              : '💪 Good try! Practice makes perfect!'}
        </Text>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.homeButton}
          activeOpacity={0.8}
        >
          <Text style={styles.homeButtonText}>🏠 Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            Speech.stop();
            setSessionComplete(false);
            correctCountRef.current = 0;
            setCorrectCount(0);
            setTotalAttempts(0);
            setElapsedSeconds(0);
            setTimedOut(false);
            scaleAnim.setValue(0);
            fadeAnim.setValue(0);
            confettiAnim.setValue(0);
            const nextRound = await getNextSessionRound(activityId, ageBand);
            setSessionRound(nextRound);
          }}
          style={styles.playAgainButton}
          activeOpacity={0.8}
        >
          <Text style={styles.playAgainButtonText}>🔄 Play Again</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── Active game ──

  const gameProps = {
    ageBand,
    difficulty: difficulty as 1 | 2 | 3,
    sessionRound,
    onCorrect: handleCorrect,
    onWrong: handleWrong,
  };

  const timeRemaining = Math.max(0, timerSeconds - elapsedSeconds);

  const GameComponent = {
    colors: ColorsGame,
    shapes: ShapesGame,
    numbers: NumbersGame,
    patterns: PatternsGame,
    memory: MemoryGame,
    sorting: SortingGame,
    logic: LogicGame,
  }[activityId as string];

  if (!GameComponent) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <Text style={{ fontSize: 48 }}>🚧</Text>
        <Text style={styles.loadingText}>Game coming soon!</Text>
      </View>
    );
  }

  return (
    <View style={[styles.gameContainer, { paddingTop: insets.top }]}>
      {/* Top bar: back + progress */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.6}
          accessibilityLabel="Go back"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.centerStatus}>
          <ProgressStars current={correctCount} total={requiredCorrect} />
          {isTimedMode && (
            <View
              style={[
                styles.timerBadge,
                timeRemaining <= 10
                  ? styles.timerUrgent
                  : timeRemaining <= 30
                    ? styles.timerWarning
                    : styles.timerNormal,
              ]}
            >
              <Text
                style={[
                  styles.timerText,
                  timeRemaining <= 10 && styles.timerTextUrgent,
                ]}
              >
                ⏱️ {timeRemaining}s
              </Text>
            </View>
          )}
        </View>
        <View style={styles.backButton} />
      </View>
      <GameComponent {...gameProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
    marginTop: 12,
  },
  gameContainer: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  centerStatus: {
    alignItems: 'center',
    gap: 6,
  },
  timerBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  timerNormal: {
    backgroundColor: '#DCFCE7',
  },
  timerWarning: {
    backgroundColor: '#FFF3CD',
  },
  timerUrgent: {
    backgroundColor: '#FEE2E2',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7A4E00',
  },
  timerTextUrgent: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '900',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  completionContainer: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  confettiRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  confettiEmoji: {
    fontSize: 40,
  },
  completionEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  completionTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  starRatingRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  ratingStar: {
    fontSize: 40,
  },
  completionText: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    marginBottom: 8,
  },
  completionSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  homeButton: {
    backgroundColor: '#FFD93D',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  homeButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  playAgainButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  playAgainButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    textAlign: 'center',
  },
});
