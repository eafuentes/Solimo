import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import { shuffleArray } from '../../lib/gameUtils';
import { useGameFeedback } from '../../hooks/useGameFeedback';

interface NumberOption {
  id: string;
  label: string;
  value: number;
  correct: boolean;
}

interface NumbersGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  onCorrect: () => void;
  onWrong: () => void;
}

/**
 * Numbers Game — teaches counting, number recognition, and basic arithmetic
 *
 * Age 3-4: Count objects (1-5), identify numbers
 * Age 5-6: Count objects (1-10), simple addition (1+1 to 5+5)
 * Age 7-8: Addition, subtraction, number comparison
 *
 * Pedagogical approach:
 * - Object counting with emoji for concrete representation
 * - Large number buttons for easy tapping
 * - Scaffolded difficulty across age bands
 * - Positive reinforcement regardless of answer
 */
export const NumbersGame: React.FC<NumbersGameProps> = ({
  ageBand,
  difficulty,
  onCorrect,
  onWrong,
}) => {
  const insets = useSafeAreaInsets();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { scaleAnim, speakQuestion, handleCorrectAnswer, handleWrongAnswer } = useGameFeedback();

  const questions: Record<
    AgeBand,
    Array<{ text: string; visual?: string; options: NumberOption[] }>
  > = {
    '3-4': [
      {
        text: 'How many apples?',
        visual: '🍎🍎',
        options: [
          { id: '1', label: '1', value: 1, correct: false },
          { id: '2', label: '2', value: 2, correct: true },
          { id: '3', label: '3', value: 3, correct: false },
        ],
      },
      {
        text: 'How many stars?',
        visual: '⭐⭐⭐',
        options: [
          { id: '1', label: '2', value: 2, correct: false },
          { id: '2', label: '3', value: 3, correct: true },
          { id: '3', label: '4', value: 4, correct: false },
        ],
      },
      {
        text: 'How many hearts?',
        visual: '❤️',
        options: [
          { id: '1', label: '1', value: 1, correct: true },
          { id: '2', label: '2', value: 2, correct: false },
          { id: '3', label: '3', value: 3, correct: false },
        ],
      },
      {
        text: 'How many fish?',
        visual: '🐟🐟🐟🐟',
        options: [
          { id: '1', label: '3', value: 3, correct: false },
          { id: '2', label: '5', value: 5, correct: false },
          { id: '3', label: '4', value: 4, correct: true },
        ],
      },
      {
        text: 'How many suns?',
        visual: '☀️☀️☀️☀️☀️',
        options: [
          { id: '1', label: '4', value: 4, correct: false },
          { id: '2', label: '5', value: 5, correct: true },
          { id: '3', label: '6', value: 6, correct: false },
        ],
      },
      {
        text: 'Find number 3',
        options: [
          { id: '1', label: '1', value: 1, correct: false },
          { id: '2', label: '3', value: 3, correct: true },
          { id: '3', label: '5', value: 5, correct: false },
        ],
      },
    ],
    '5-6': [
      {
        text: 'How many bees?',
        visual: '🐝🐝🐝🐝🐝🐝',
        options: [
          { id: '1', label: '5', value: 5, correct: false },
          { id: '2', label: '6', value: 6, correct: true },
          { id: '3', label: '7', value: 7, correct: false },
        ],
      },
      {
        text: 'What is 2 + 3?',
        options: [
          { id: '1', label: '4', value: 4, correct: false },
          { id: '2', label: '5', value: 5, correct: true },
          { id: '3', label: '6', value: 6, correct: false },
        ],
      },
      {
        text: 'What is 4 + 4?',
        options: [
          { id: '1', label: '7', value: 7, correct: false },
          { id: '2', label: '8', value: 8, correct: true },
          { id: '3', label: '9', value: 9, correct: false },
        ],
      },
      {
        text: 'What is 1 + 6?',
        options: [
          { id: '1', label: '6', value: 6, correct: false },
          { id: '2', label: '7', value: 7, correct: true },
          { id: '3', label: '8', value: 8, correct: false },
        ],
      },
      {
        text: 'How many balloons?',
        visual: '🎈🎈🎈🎈🎈🎈🎈🎈',
        options: [
          { id: '1', label: '7', value: 7, correct: false },
          { id: '2', label: '8', value: 8, correct: true },
          { id: '3', label: '9', value: 9, correct: false },
        ],
      },
      {
        text: 'What is 3 + 3?',
        options: [
          { id: '1', label: '5', value: 5, correct: false },
          { id: '2', label: '6', value: 6, correct: true },
          { id: '3', label: '7', value: 7, correct: false },
        ],
      },
    ],
    '7-8': [
      {
        text: 'What is 7 + 5?',
        options: [
          { id: '1', label: '11', value: 11, correct: false },
          { id: '2', label: '12', value: 12, correct: true },
          { id: '3', label: '13', value: 13, correct: false },
        ],
      },
      {
        text: 'What is 9 - 4?',
        options: [
          { id: '1', label: '4', value: 4, correct: false },
          { id: '2', label: '5', value: 5, correct: true },
          { id: '3', label: '6', value: 6, correct: false },
        ],
      },
      {
        text: 'What is 8 + 6?',
        options: [
          { id: '1', label: '13', value: 13, correct: false },
          { id: '2', label: '14', value: 14, correct: true },
          { id: '3', label: '15', value: 15, correct: false },
        ],
      },
      {
        text: 'What is 15 - 7?',
        options: [
          { id: '1', label: '7', value: 7, correct: false },
          { id: '2', label: '8', value: 8, correct: true },
          { id: '3', label: '9', value: 9, correct: false },
        ],
      },
      {
        text: 'Which is BIGGER: 9 or 6?',
        options: [
          { id: '1', label: '6', value: 6, correct: false },
          { id: '2', label: '9', value: 9, correct: true },
          { id: '3', label: '3', value: 3, correct: false },
        ],
      },
      {
        text: 'What is 10 - 3?',
        options: [
          { id: '1', label: '6', value: 6, correct: false },
          { id: '2', label: '7', value: 7, correct: true },
          { id: '3', label: '8', value: 8, correct: false },
        ],
      },
    ],
  };

  const [questionOrder] = useState(() => shuffleArray(questions[ageBand].map((_, i) => i)));
  const q = questions[ageBand][questionOrder[currentQuestion % questionOrder.length]];

  useEffect(() => {
    return speakQuestion(q.text.replace(/[🍎⭐❤️🐟☀️🐝🎈]/g, ''));
  }, [currentQuestion, speakQuestion, q.text]);

  const handleOptionPress = async (option: NumberOption) => {
    if (option.correct) {
      await handleCorrectAnswer(option.label, onCorrect, () => setCurrentQuestion((p) => p + 1));
    } else {
      await handleWrongAnswer(option.label, onWrong);
    }
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
    >
      <View style={styles.headerSection}>
        <Text style={styles.questionText}>{q.text}</Text>
        <VoiceButton text={q.text.replace(/[🍎⭐❤️🐟☀️🐝🎈]/g, '')} style={styles.voiceButton} />
      </View>

      {q.visual && (
        <View style={styles.visualSection}>
          <Text style={styles.visualEmoji}>{q.visual}</Text>
        </View>
      )}

      <View style={styles.optionsContainer}>
        {q.options.map((option) => (
          <Animated.View key={option.id} style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={() => handleOptionPress(option)}
              style={styles.optionButton}
              activeOpacity={0.7}
              accessibilityLabel={`Number ${option.label}`}
            >
              <Text style={styles.optionNumber}>{option.label}</Text>
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
    backgroundColor: '#FFFDE7',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    width: '100%',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    flex: 1,
  },
  voiceButton: { paddingVertical: 12, paddingHorizontal: 12 },
  visualSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    minHeight: 80,
  },
  visualEmoji: {
    fontSize: 48,
    letterSpacing: 8,
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
    width: 90,
    height: 90,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FFD93D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  optionNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#333',
  },
});

export default NumbersGame;
