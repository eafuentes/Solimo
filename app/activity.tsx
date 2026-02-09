import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityId, AgeBand } from '../src/types';
import { getAgeBand, getDifficultyLevel, markCompletedToday, incrementStreak } from '../src/lib/storage';
import { DifficultyManager } from '../src/lib/difficulty';
import { getActivityName } from '../src/lib/schedule';
import { ProgressStars } from '../src/components/ProgressStars';
import * as Speech from 'expo-speech';
import { ColorsGame } from '../src/components/games/ColorsGame';
import { ShapesGame } from '../src/components/games/ShapesGame';
import { NumbersGame } from '../src/components/games/NumbersGame';
import { PatternsGame } from '../src/components/games/PatternsGame';
import { MemoryGame } from '../src/components/games/MemoryGame';
import { SortingGame } from '../src/components/games/SortingGame';
import { LogicGame } from '../src/components/games/LogicGame';

/** How many correct answers needed to complete a session */
const REQUIRED_CORRECT = 5;

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

  // Celebration animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function load() {
      if (!activityId) return;
      const userAgeBand = await getAgeBand();
      setAgeBand(userAgeBand);
      const userDifficulty = await getDifficultyLevel(activityId);
      setDifficulty(userDifficulty);
      setDifficultyManager(new DifficultyManager(userDifficulty));
      setIsLoading(false);
    }
    load();
  }, [activityId]);

  const handleCorrect = async () => {
    const newCount = correctCount + 1;
    setCorrectCount(newCount);
    setTotalAttempts((prev) => prev + 1);

    if (!difficultyManager) return;
    difficultyManager.recordCorrect();
    const newLevel = difficultyManager.getDifficultyAdjustment();
    if (newLevel) setDifficulty(newLevel);

    if (newCount >= REQUIRED_CORRECT) {
      Speech.stop();
      await markCompletedToday();
      await incrementStreak();
      setSessionComplete(true);
    }
  };

  const handleWrong = () => {
    setTotalAttempts((prev) => prev + 1);
    if (!difficultyManager) return;
    difficultyManager.recordWrong();
    const newLevel = difficultyManager.getDifficultyAdjustment();
    if (newLevel) setDifficulty(newLevel);
  };

  // Stop speech when leaving
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

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
      Speech.speak('Wonderful! Great job! You are a star! See you tomorrow!', {
        language: 'en',
        pitch: 1.65,
        rate: 0.95,
      });
    }, 500);
  }, [sessionComplete]);

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
          You got {correctCount} out of {totalAttempts} correct!
        </Text>
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
      </Animated.View>
    );
  }

  // ── Active game ──

  const gameProps = {
    ageBand,
    difficulty: difficulty as 1 | 2 | 3,
    onCorrect: handleCorrect,
    onWrong: handleWrong,
  };

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
        <ProgressStars current={correctCount} total={REQUIRED_CORRECT} />
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
  },
  homeButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
  },
});
