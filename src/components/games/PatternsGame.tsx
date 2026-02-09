import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import { shuffleArray } from '../../lib/gameUtils';
import { useGameFeedback } from '../../hooks/useGameFeedback';

interface PatternOption {
  id: string;
  label: string;
  correct: boolean;
}

interface PatternsGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  onCorrect: () => void;
  onWrong: () => void;
}

/**
 * Patterns Game — teaches pattern recognition and prediction
 *
 * Age 3-4: Simple AB patterns with colors/emojis
 * Age 5-6: ABB & ABC patterns, what comes next
 * Age 7-8: Number sequences, growing patterns
 *
 * Pedagogical approach:
 * - Visual pattern display with large, clear symbols
 * - "What comes next?" builds prediction skills
 * - Scaffolded from simple alternation to complex sequences
 * - Multi-modal: visual + spoken patterns
 */
export const PatternsGame: React.FC<PatternsGameProps> = ({
  ageBand,
  difficulty,
  onCorrect,
  onWrong,
}) => {
  const insets = useSafeAreaInsets();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { scaleAnim, speakQuestion, handleGenericCorrect, handleGenericWrong } = useGameFeedback();

  const questions: Record<
    AgeBand,
    Array<{ text: string; pattern: string; options: PatternOption[] }>
  > = {
    '3-4': [
      {
        text: 'What comes next?',
        pattern: '🔴 🔵 🔴 🔵 🔴 ❓',
        options: [
          { id: '1', label: '🔵', correct: true },
          { id: '2', label: '🔴', correct: false },
          { id: '3', label: '🟡', correct: false },
        ],
      },
      {
        text: 'What comes next?',
        pattern: '🟡 🟢 🟡 🟢 🟡 ❓',
        options: [
          { id: '1', label: '🟡', correct: false },
          { id: '2', label: '🟢', correct: true },
          { id: '3', label: '🔴', correct: false },
        ],
      },
      {
        text: 'What comes next?',
        pattern: '⭐ 🌙 ⭐ 🌙 ⭐ ❓',
        options: [
          { id: '1', label: '⭐', correct: false },
          { id: '2', label: '🌙', correct: true },
          { id: '3', label: '☀️', correct: false },
        ],
      },
      {
        text: 'What comes next?',
        pattern: '🍎 🍌 🍎 🍌 🍎 ❓',
        options: [
          { id: '1', label: '🍎', correct: false },
          { id: '2', label: '🍌', correct: true },
          { id: '3', label: '🍇', correct: false },
        ],
      },
      {
        text: 'What comes next?',
        pattern: '❤️ 💙 ❤️ 💙 ❤️ ❓',
        options: [
          { id: '1', label: '💙', correct: true },
          { id: '2', label: '❤️', correct: false },
          { id: '3', label: '💚', correct: false },
        ],
      },
      {
        text: 'What comes next?',
        pattern: '🐱 🐶 🐱 🐶 🐱 ❓',
        options: [
          { id: '1', label: '🐱', correct: false },
          { id: '2', label: '🐶', correct: true },
          { id: '3', label: '🐰', correct: false },
        ],
      },
    ],
    '5-6': [
      {
        text: 'What comes next?',
        pattern: '🔴 🔵 🔵 🔴 🔵 🔵 🔴 ❓',
        options: [
          { id: '1', label: '🔵', correct: true },
          { id: '2', label: '🔴', correct: false },
          { id: '3', label: '🟢', correct: false },
        ],
      },
      {
        text: 'What comes next?',
        pattern: '🟡 🟢 🔵 🟡 🟢 🔵 🟡 ❓',
        options: [
          { id: '1', label: '🟡', correct: false },
          { id: '2', label: '🟢', correct: true },
          { id: '3', label: '🔵', correct: false },
        ],
      },
      {
        text: 'What comes next?',
        pattern: '🌟 🌟 🌙 🌟 🌟 🌙 🌟 ❓',
        options: [
          { id: '1', label: '🌟', correct: true },
          { id: '2', label: '🌙', correct: false },
          { id: '3', label: '☀️', correct: false },
        ],
      },
      {
        text: 'What comes next?',
        pattern: '🔺 🔵 🔺 🔵 🔺 ❓',
        options: [
          { id: '1', label: '🔺', correct: false },
          { id: '2', label: '🔵', correct: true },
          { id: '3', label: '🟡', correct: false },
        ],
      },
      {
        text: 'What comes next?',
        pattern: '🍎 🍊 🍋 🍎 🍊 🍋 🍎 ❓',
        options: [
          { id: '1', label: '🍎', correct: false },
          { id: '2', label: '🍊', correct: true },
          { id: '3', label: '🍋', correct: false },
        ],
      },
      {
        text: 'What comes next?',
        pattern: '⬆️ ➡️ ⬇️ ⬆️ ➡️ ⬇️ ⬆️ ❓',
        options: [
          { id: '1', label: '⬆️', correct: false },
          { id: '2', label: '➡️', correct: true },
          { id: '3', label: '⬇️', correct: false },
        ],
      },
    ],
    '7-8': [
      {
        text: 'What number comes next?\n2, 4, 6, 8, ?',
        pattern: '2  4  6  8  ❓',
        options: [
          { id: '1', label: '9', correct: false },
          { id: '2', label: '10', correct: true },
          { id: '3', label: '12', correct: false },
        ],
      },
      {
        text: 'What number comes next?\n5, 10, 15, 20, ?',
        pattern: '5  10  15  20  ❓',
        options: [
          { id: '1', label: '22', correct: false },
          { id: '2', label: '25', correct: true },
          { id: '3', label: '30', correct: false },
        ],
      },
      {
        text: 'What number comes next?\n1, 3, 5, 7, ?',
        pattern: '1  3  5  7  ❓',
        options: [
          { id: '1', label: '8', correct: false },
          { id: '2', label: '9', correct: true },
          { id: '3', label: '10', correct: false },
        ],
      },
      {
        text: 'What number comes next?\n3, 6, 9, 12, ?',
        pattern: '3  6  9  12  ❓',
        options: [
          { id: '1', label: '14', correct: false },
          { id: '2', label: '15', correct: true },
          { id: '3', label: '16', correct: false },
        ],
      },
      {
        text: 'What comes next?',
        pattern: '🔴 🔵 🟢 🔴 🔵 🟢 🔴 🔵 ❓',
        options: [
          { id: '1', label: '🔴', correct: false },
          { id: '2', label: '🟢', correct: true },
          { id: '3', label: '🔵', correct: false },
        ],
      },
      {
        text: 'What number comes next?\n1, 2, 4, 8, ?',
        pattern: '1  2  4  8  ❓',
        options: [
          { id: '1', label: '12', correct: false },
          { id: '2', label: '16', correct: true },
          { id: '3', label: '10', correct: false },
        ],
      },
    ],
  };

  const [questionOrder] = useState(() => shuffleArray(questions[ageBand].map((_, i) => i)));
  const q = questions[ageBand][questionOrder[currentQuestion % questionOrder.length]];

  useEffect(() => {
    return speakQuestion(q.text);
  }, [currentQuestion, speakQuestion, q.text]);

  const handleOptionPress = async (option: PatternOption) => {
    if (option.correct) {
      await handleGenericCorrect(onCorrect, () => setCurrentQuestion((p) => p + 1));
    } else {
      await handleGenericWrong(onWrong);
    }
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
    >
      <View style={styles.headerSection}>
        <Text style={styles.questionText}>{q.text}</Text>
        <VoiceButton text={q.text} style={styles.voiceButton} />
      </View>

      <View style={styles.patternSection}>
        <Text style={styles.patternText}>{q.pattern}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {q.options.map((option) => (
          <Animated.View key={option.id} style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={() => handleOptionPress(option)}
              style={styles.optionButton}
              activeOpacity={0.7}
              accessibilityLabel={`Option ${option.label}`}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    flex: 1,
  },
  voiceButton: { paddingVertical: 12, paddingHorizontal: 12 },
  patternSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  patternText: {
    fontSize: 36,
    letterSpacing: 4,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  optionButton: {
    minWidth: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#CE93D8',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  optionLabel: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
});

export default PatternsGame;
