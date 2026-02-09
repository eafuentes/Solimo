import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import { shuffleArray } from '../../lib/gameUtils';
import { useGameFeedback } from '../../hooks/useGameFeedback';

interface SortingItem {
  id: string;
  emoji: string;
  label: string;
}

interface SortingGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  onCorrect: () => void;
  onWrong: () => void;
}

/**
 * Sorting Game — teaches categorization, grouping, and classification
 *
 * Age 3-4: Sort by simple categories (animals vs food)
 * Age 5-6: Sort by properties (big vs small, hot vs cold)
 * Age 7-8: Multi-category sorting, odd-one-out
 *
 * Pedagogical approach:
 * - Classification is a foundational cognitive skill
 * - Clear binary categories for young children
 * - Emoji visuals make abstract concepts concrete
 * - "Which one belongs?" builds logical reasoning
 */
export const SortingGame: React.FC<SortingGameProps> = ({
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
    Array<{
      text: string;
      instruction: string;
      items: Array<SortingItem & { correct: boolean }>;
    }>
  > = {
    '3-4': [
      {
        text: 'Which is a FRUIT?',
        instruction: 'Which is a fruit?',
        items: [
          { id: '1', emoji: '🍎', label: 'apple', correct: true },
          { id: '2', emoji: '🐶', label: 'dog', correct: false },
          { id: '3', emoji: '🚗', label: 'car', correct: false },
        ],
      },
      {
        text: 'Which is an ANIMAL?',
        instruction: 'Which is an animal?',
        items: [
          { id: '1', emoji: '🍌', label: 'banana', correct: false },
          { id: '2', emoji: '🐱', label: 'cat', correct: true },
          { id: '3', emoji: '🌈', label: 'rainbow', correct: false },
        ],
      },
      {
        text: 'Which can you EAT?',
        instruction: 'Which can you eat?',
        items: [
          { id: '1', emoji: '🪨', label: 'rock', correct: false },
          { id: '2', emoji: '🍊', label: 'orange', correct: true },
          { id: '3', emoji: '📚', label: 'book', correct: false },
        ],
      },
      {
        text: 'Which is a TOY?',
        instruction: 'Which is a toy?',
        items: [
          { id: '1', emoji: '🧸', label: 'teddy bear', correct: true },
          { id: '2', emoji: '🌳', label: 'tree', correct: false },
          { id: '3', emoji: '☁️', label: 'cloud', correct: false },
        ],
      },
      {
        text: 'Which FLIES?',
        instruction: 'Which one flies?',
        items: [
          { id: '1', emoji: '🐦', label: 'bird', correct: true },
          { id: '2', emoji: '🐟', label: 'fish', correct: false },
          { id: '3', emoji: '🐢', label: 'turtle', correct: false },
        ],
      },
      {
        text: 'Which SWIMS?',
        instruction: 'Which one swims?',
        items: [
          { id: '1', emoji: '🦁', label: 'lion', correct: false },
          { id: '2', emoji: '🐟', label: 'fish', correct: true },
          { id: '3', emoji: '🐔', label: 'chicken', correct: false },
        ],
      },
    ],
    '5-6': [
      {
        text: 'Which does NOT belong?',
        instruction: 'Which does not belong with the others?',
        items: [
          { id: '1', emoji: '🍎', label: 'apple', correct: false },
          { id: '2', emoji: '🍌', label: 'banana', correct: false },
          { id: '3', emoji: '🚗', label: 'car', correct: true },
        ],
      },
      {
        text: 'Which is HOT?',
        instruction: 'Which one is hot?',
        items: [
          { id: '1', emoji: '☀️', label: 'sun', correct: true },
          { id: '2', emoji: '🧊', label: 'ice', correct: false },
          { id: '3', emoji: '❄️', label: 'snowflake', correct: false },
        ],
      },
      {
        text: 'Which is COLD?',
        instruction: 'Which one is cold?',
        items: [
          { id: '1', emoji: '🔥', label: 'fire', correct: false },
          { id: '2', emoji: '🍦', label: 'ice cream', correct: true },
          { id: '3', emoji: '☀️', label: 'sun', correct: false },
        ],
      },
      {
        text: 'Which does NOT belong?',
        instruction: 'Which does not belong with the others?',
        items: [
          { id: '1', emoji: '🐶', label: 'dog', correct: false },
          { id: '2', emoji: '🐱', label: 'cat', correct: false },
          { id: '3', emoji: '🌺', label: 'flower', correct: true },
        ],
      },
      {
        text: 'Which is BIGGEST?',
        instruction: 'Which is the biggest?',
        items: [
          { id: '1', emoji: '🐘', label: 'elephant', correct: true },
          { id: '2', emoji: '🐱', label: 'cat', correct: false },
          { id: '3', emoji: '🐭', label: 'mouse', correct: false },
        ],
      },
      {
        text: 'Which is SMALLEST?',
        instruction: 'Which is the smallest?',
        items: [
          { id: '1', emoji: '🐘', label: 'elephant', correct: false },
          { id: '2', emoji: '🐻', label: 'bear', correct: false },
          { id: '3', emoji: '🐜', label: 'ant', correct: true },
        ],
      },
    ],
    '7-8': [
      {
        text: 'Which does NOT belong?',
        instruction: 'Which does not belong with the group?',
        items: [
          { id: '1', emoji: '🎸', label: 'guitar', correct: false },
          { id: '2', emoji: '🎹', label: 'piano', correct: false },
          { id: '3', emoji: '🏀', label: 'basketball', correct: true },
          { id: '4', emoji: '🥁', label: 'drums', correct: false },
        ],
      },
      {
        text: 'Which is a VEGETABLE?',
        instruction: 'Which one is a vegetable?',
        items: [
          { id: '1', emoji: '🍎', label: 'apple', correct: false },
          { id: '2', emoji: '🥕', label: 'carrot', correct: true },
          { id: '3', emoji: '🍌', label: 'banana', correct: false },
          { id: '4', emoji: '🍇', label: 'grapes', correct: false },
        ],
      },
      {
        text: 'Which lives in WATER?',
        instruction: 'Which animal lives in water?',
        items: [
          { id: '1', emoji: '🦁', label: 'lion', correct: false },
          { id: '2', emoji: '🐦', label: 'bird', correct: false },
          { id: '3', emoji: '🐙', label: 'octopus', correct: true },
          { id: '4', emoji: '🐻', label: 'bear', correct: false },
        ],
      },
      {
        text: 'Which is NOT a planet?',
        instruction: 'Which is not a planet?',
        items: [
          { id: '1', emoji: '🌍', label: 'Earth', correct: false },
          { id: '2', emoji: '⭐', label: 'Star', correct: true },
          { id: '3', emoji: '🪐', label: 'Saturn', correct: false },
          { id: '4', emoji: '🔴', label: 'Mars', correct: false },
        ],
      },
      {
        text: 'Which does NOT belong?',
        instruction: 'Which does not belong?',
        items: [
          { id: '1', emoji: '✏️', label: 'pencil', correct: false },
          { id: '2', emoji: '📏', label: 'ruler', correct: false },
          { id: '3', emoji: '🍕', label: 'pizza', correct: true },
          { id: '4', emoji: '📚', label: 'books', correct: false },
        ],
      },
      {
        text: 'Which is FASTEST?',
        instruction: 'Which is the fastest?',
        items: [
          { id: '1', emoji: '🐢', label: 'turtle', correct: false },
          { id: '2', emoji: '🐆', label: 'cheetah', correct: true },
          { id: '3', emoji: '🐌', label: 'snail', correct: false },
          { id: '4', emoji: '🐘', label: 'elephant', correct: false },
        ],
      },
    ],
  };

  const [questionOrder] = useState(() => shuffleArray(questions[ageBand].map((_, i) => i)));
  const q = questions[ageBand][questionOrder[currentQuestion % questionOrder.length]];

  useEffect(() => {
    return speakQuestion(q.instruction);
  }, [currentQuestion, speakQuestion, q.instruction]);

  const handleItemPress = async (item: SortingItem & { correct: boolean }) => {
    if (item.correct) {
      await handleCorrectAnswer(item.label, onCorrect, () => setCurrentQuestion((p) => p + 1));
    } else {
      await handleWrongAnswer(item.label, onWrong);
    }
  };

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
    >
      <View style={styles.headerSection}>
        <Text style={styles.questionText}>{q.text}</Text>
        <VoiceButton text={q.instruction} style={styles.voiceButton} />
      </View>

      <View style={styles.itemsContainer}>
        {q.items.map((item) => (
          <Animated.View key={item.id} style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={() => handleItemPress(item)}
              style={styles.itemButton}
              activeOpacity={0.7}
              accessibilityLabel={item.label}
            >
              <Text style={styles.itemEmoji}>{item.emoji}</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
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
    backgroundColor: '#FFF3E0',
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
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    flex: 1,
  },
  voiceButton: { paddingVertical: 12, paddingHorizontal: 12 },
  itemsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
  },
  itemButton: {
    width: 130,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FFCC80',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  itemEmoji: { fontSize: 44, marginBottom: 8 },
  itemLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textTransform: 'capitalize',
  },
});

export default SortingGame;
