import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import { shuffleArray } from '../../lib/gameUtils';
import { useGameFeedback } from '../../hooks/useGameFeedback';

interface ColorOption {
  id: string;
  name: string;
  emoji: string;
  color: string;
  correct: boolean;
}

interface ColorsGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  onCorrect: () => void;
  onWrong: () => void;
}

/**
 * Colors Game — teaches color recognition, naming, and mixing
 *
 * Age 3-4: Simple color identification with large, bright targets
 * Age 5-6: More colors including secondary colors
 * Age 7-8: Color mixing concepts (red + blue = purple)
 *
 * Pedagogical approach:
 * - Visual-first: big colored blocks + emoji reinforcement
 * - Audio naming: speaks color names for pre-readers
 * - Positive reinforcement: celebrates correct answers
 * - No punishment: wrong answers get gentle encouragement
 */
export const ColorsGame: React.FC<ColorsGameProps> = ({
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
    Array<{ text: string; target: string; options: ColorOption[] }>
  > = {
    '3-4': [
      {
        text: 'Find the RED color',
        target: 'red',
        options: [
          { id: '1', name: 'red', emoji: '🔴', color: '#FF0000', correct: true },
          { id: '2', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
          { id: '3', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
        ],
      },
      {
        text: 'Find the BLUE color',
        target: 'blue',
        options: [
          { id: '1', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
          { id: '2', name: 'blue', emoji: '🔵', color: '#0000FF', correct: true },
          { id: '3', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
        ],
      },
      {
        text: 'Find the YELLOW color',
        target: 'yellow',
        options: [
          { id: '1', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: true },
          { id: '2', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
          { id: '3', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
        ],
      },
      {
        text: 'Find the GREEN color',
        target: 'green',
        options: [
          { id: '1', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
          { id: '2', name: 'green', emoji: '🟢', color: '#00AA00', correct: true },
          { id: '3', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
        ],
      },
      {
        text: 'Find the ORANGE color',
        target: 'orange',
        options: [
          { id: '1', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
          { id: '2', name: 'orange', emoji: '🟠', color: '#FF8800', correct: true },
          { id: '3', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
        ],
      },
      {
        text: 'Find the PURPLE color',
        target: 'purple',
        options: [
          { id: '1', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: true },
          { id: '2', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
          { id: '3', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
        ],
      },
    ],
    '5-6': [
      {
        text: 'Find the PURPLE color',
        target: 'purple',
        options: [
          { id: '1', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
          { id: '2', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: true },
          { id: '3', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
        ],
      },
      {
        text: 'Find the ORANGE color',
        target: 'orange',
        options: [
          { id: '1', name: 'orange', emoji: '🟠', color: '#FF8800', correct: true },
          { id: '2', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
          { id: '3', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
        ],
      },
      {
        text: 'Find the PINK color',
        target: 'pink',
        options: [
          { id: '1', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
          { id: '2', name: 'pink', emoji: '🩷', color: '#FF69B4', correct: true },
          { id: '3', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
        ],
      },
      {
        text: 'Find the GREEN color',
        target: 'green',
        options: [
          { id: '1', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
          { id: '2', name: 'green', emoji: '🟢', color: '#00AA00', correct: true },
          { id: '3', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
        ],
      },
      {
        text: 'Which color is like the SKY?',
        target: 'blue',
        options: [
          { id: '1', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
          { id: '2', name: 'blue', emoji: '🔵', color: '#4D96FF', correct: true },
          { id: '3', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
        ],
      },
      {
        text: 'Which color is like a BANANA?',
        target: 'yellow',
        options: [
          { id: '1', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: true },
          { id: '2', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
          { id: '3', name: 'orange', emoji: '🟠', color: '#FF8800', correct: false },
        ],
      },
    ],
    '7-8': [
      {
        text: 'Mix RED + BLUE = ?',
        target: 'purple',
        options: [
          { id: '1', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
          { id: '2', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: true },
          { id: '3', name: 'orange', emoji: '🟠', color: '#FF8800', correct: false },
        ],
      },
      {
        text: 'Mix RED + YELLOW = ?',
        target: 'orange',
        options: [
          { id: '1', name: 'orange', emoji: '🟠', color: '#FF8800', correct: true },
          { id: '2', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
          { id: '3', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
        ],
      },
      {
        text: 'Mix BLUE + YELLOW = ?',
        target: 'green',
        options: [
          { id: '1', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
          { id: '2', name: 'orange', emoji: '🟠', color: '#FF8800', correct: false },
          { id: '3', name: 'green', emoji: '🟢', color: '#00AA00', correct: true },
        ],
      },
      {
        text: 'Mix RED + WHITE = ?',
        target: 'pink',
        options: [
          { id: '1', name: 'pink', emoji: '🩷', color: '#FF69B4', correct: true },
          { id: '2', name: 'orange', emoji: '🟠', color: '#FF8800', correct: false },
          { id: '3', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
        ],
      },
      {
        text: 'Which is a WARM color?',
        target: 'red',
        options: [
          { id: '1', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
          { id: '2', name: 'red', emoji: '🔴', color: '#FF0000', correct: true },
          { id: '3', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
        ],
      },
      {
        text: 'Which is a COOL color?',
        target: 'blue',
        options: [
          { id: '1', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
          { id: '2', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
          { id: '3', name: 'blue', emoji: '🔵', color: '#0000FF', correct: true },
        ],
      },
    ],
  };

  const [questionOrder] = useState(() => shuffleArray(questions[ageBand].map((_, i) => i)));
  const q = questions[ageBand][questionOrder[currentQuestion % questionOrder.length]];

  // Auto-speak question
  useEffect(() => {
    return speakQuestion(q.text);
  }, [currentQuestion, speakQuestion, q.text]);

  const handleOptionPress = async (option: ColorOption) => {
    if (option.correct) {
      await handleCorrectAnswer(option.name, onCorrect, () => setCurrentQuestion((p) => p + 1));
    } else {
      await handleWrongAnswer(option.name, onWrong);
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
      <View style={styles.optionsContainer}>
        {q.options.map((option) => (
          <Animated.View key={option.id} style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={() => handleOptionPress(option)}
              style={[styles.optionButton, { backgroundColor: option.color }]}
              activeOpacity={0.7}
              accessibilityLabel={option.name}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
              <Text style={styles.optionLabel}>{option.name}</Text>
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
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
    width: '100%',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    flex: 1,
  },
  voiceButton: { paddingVertical: 12, paddingHorizontal: 12 },
  optionsContainer: { width: '100%', gap: 16 },
  optionButton: {
    paddingVertical: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  optionEmoji: { fontSize: 48, marginBottom: 8 },
  optionLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default ColorsGame;
