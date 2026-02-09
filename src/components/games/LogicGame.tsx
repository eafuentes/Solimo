import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import { shuffleArray } from '../../lib/gameUtils';
import { useGameFeedback } from '../../hooks/useGameFeedback';

interface LogicOption {
  id: string;
  label: string;
  emoji: string;
  correct: boolean;
}

interface LogicGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  onCorrect: () => void;
  onWrong: () => void;
}

/**
 * Logic Game — teaches reasoning, cause-effect, and problem solving
 *
 * Age 3-4: Simple associations (what goes together?)
 * Age 5-6: Cause & effect, simple riddles
 * Age 7-8: Analogies, deductive reasoning
 *
 * Pedagogical approach:
 * - Builds higher-order thinking progressively
 * - Real-world scenarios make abstract logic concrete
 * - Questions feel like fun riddles, not tests
 * - Supports pre-readers with voice + emoji cues
 */
export const LogicGame: React.FC<LogicGameProps> = ({
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
    Array<{ text: string; instruction: string; options: LogicOption[] }>
  > = {
    '3-4': [
      {
        text: 'What do you WEAR on your feet?',
        instruction: 'What do you wear on your feet?',
        options: [
          { id: '1', label: 'shoes', emoji: '👟', correct: true },
          { id: '2', label: 'hat', emoji: '🎩', correct: false },
          { id: '3', label: 'gloves', emoji: '🧤', correct: false },
        ],
      },
      {
        text: 'What do you use to EAT soup?',
        instruction: 'What do you use to eat soup?',
        options: [
          { id: '1', label: 'fork', emoji: '🍴', correct: false },
          { id: '2', label: 'spoon', emoji: '🥄', correct: true },
          { id: '3', label: 'knife', emoji: '🔪', correct: false },
        ],
      },
      {
        text: 'What gives us LIGHT at night?',
        instruction: 'What gives us light at night?',
        options: [
          { id: '1', label: 'moon', emoji: '🌙', correct: true },
          { id: '2', label: 'cloud', emoji: '☁️', correct: false },
          { id: '3', label: 'rain', emoji: '🌧️', correct: false },
        ],
      },
      {
        text: 'What goes with PEANUT BUTTER?',
        instruction: 'What goes with peanut butter?',
        options: [
          { id: '1', label: 'jelly', emoji: '🍇', correct: true },
          { id: '2', label: 'pizza', emoji: '🍕', correct: false },
          { id: '3', label: 'soup', emoji: '🍜', correct: false },
        ],
      },
      {
        text: 'Where do FISH live?',
        instruction: 'Where do fish live?',
        options: [
          { id: '1', label: 'tree', emoji: '🌳', correct: false },
          { id: '2', label: 'water', emoji: '🌊', correct: true },
          { id: '3', label: 'sky', emoji: '☁️', correct: false },
        ],
      },
      {
        text: 'What do you SLEEP on?',
        instruction: 'What do you sleep on?',
        options: [
          { id: '1', label: 'bed', emoji: '🛏️', correct: true },
          { id: '2', label: 'table', emoji: '🪑', correct: false },
          { id: '3', label: 'car', emoji: '🚗', correct: false },
        ],
      },
    ],
    '5-6': [
      {
        text: 'If it RAINS, what do you need?',
        instruction: 'If it rains, what do you need?',
        options: [
          { id: '1', label: 'umbrella', emoji: '☂️', correct: true },
          { id: '2', label: 'sunglasses', emoji: '🕶️', correct: false },
          { id: '3', label: 'swimsuit', emoji: '👙', correct: false },
        ],
      },
      {
        text: 'Ice is COLD. Fire is…?',
        instruction: 'Ice is cold. Fire is what?',
        options: [
          { id: '1', label: 'cold', emoji: '🧊', correct: false },
          { id: '2', label: 'hot', emoji: '🔥', correct: true },
          { id: '3', label: 'wet', emoji: '💧', correct: false },
        ],
      },
      {
        text: 'Day is LIGHT. Night is…?',
        instruction: 'Day is light. Night is what?',
        options: [
          { id: '1', label: 'dark', emoji: '🌑', correct: true },
          { id: '2', label: 'bright', emoji: '☀️', correct: false },
          { id: '3', label: 'cold', emoji: '❄️', correct: false },
        ],
      },
      {
        text: 'A bird FLIES. A fish…?',
        instruction: 'A bird flies. A fish does what?',
        options: [
          { id: '1', label: 'runs', emoji: '🏃', correct: false },
          { id: '2', label: 'swims', emoji: '🏊', correct: true },
          { id: '3', label: 'flies', emoji: '🦅', correct: false },
        ],
      },
      {
        text: 'What has WHEELS?',
        instruction: 'Which of these has wheels?',
        options: [
          { id: '1', label: 'bicycle', emoji: '🚲', correct: true },
          { id: '2', label: 'tree', emoji: '🌳', correct: false },
          { id: '3', label: 'book', emoji: '📚', correct: false },
        ],
      },
      {
        text: 'What comes after MONDAY?',
        instruction: 'What day comes after Monday?',
        options: [
          { id: '1', label: 'Sunday', emoji: '☀️', correct: false },
          { id: '2', label: 'Tuesday', emoji: '📅', correct: true },
          { id: '3', label: 'Friday', emoji: '🎉', correct: false },
        ],
      },
    ],
    '7-8': [
      {
        text: 'Finger is to HAND as toe is to…?',
        instruction: 'Finger is to hand as toe is to what?',
        options: [
          { id: '1', label: 'foot', emoji: '🦶', correct: true },
          { id: '2', label: 'arm', emoji: '💪', correct: false },
          { id: '3', label: 'leg', emoji: '🦵', correct: false },
        ],
      },
      {
        text: 'Puppy is to DOG as kitten is to…?',
        instruction: 'Puppy is to dog as kitten is to what?',
        options: [
          { id: '1', label: 'bird', emoji: '🐦', correct: false },
          { id: '2', label: 'cat', emoji: '🐱', correct: true },
          { id: '3', label: 'fish', emoji: '🐟', correct: false },
        ],
      },
      {
        text: 'Which is TRUE?',
        instruction: 'Which of these is true?',
        options: [
          { id: '1', label: 'The sun is a star', emoji: '⭐', correct: true },
          { id: '2', label: 'Fish can fly', emoji: '🐟', correct: false },
          { id: '3', label: 'Ice is hot', emoji: '🧊', correct: false },
        ],
      },
      {
        text: "What has HANDS but can't clap?",
        instruction: 'What has hands but cannot clap?',
        options: [
          { id: '1', label: 'clock', emoji: '⏰', correct: true },
          { id: '2', label: 'person', emoji: '🧑', correct: false },
          { id: '3', label: 'monkey', emoji: '🐒', correct: false },
        ],
      },
      {
        text: 'Book is to READ as food is to…?',
        instruction: 'Book is to read as food is to what?',
        options: [
          { id: '1', label: 'sleep', emoji: '😴', correct: false },
          { id: '2', label: 'eat', emoji: '🍽️', correct: true },
          { id: '3', label: 'play', emoji: '🎮', correct: false },
        ],
      },
      {
        text: 'What month comes after JUNE?',
        instruction: 'What month comes after June?',
        options: [
          { id: '1', label: 'May', emoji: '🌸', correct: false },
          { id: '2', label: 'July', emoji: '🎆', correct: true },
          { id: '3', label: 'August', emoji: '☀️', correct: false },
        ],
      },
    ],
  };

  const [questionOrder] = useState(() => shuffleArray(questions[ageBand].map((_, i) => i)));
  const q = questions[ageBand][questionOrder[currentQuestion % questionOrder.length]];

  useEffect(() => {
    return speakQuestion(q.instruction);
  }, [currentQuestion, speakQuestion, q.instruction]);

  const handleOptionPress = async (option: LogicOption) => {
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
        <VoiceButton text={q.instruction} style={styles.voiceButton} />
      </View>

      <View style={styles.optionsContainer}>
        {q.options.map((option) => (
          <Animated.View key={option.id} style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={() => handleOptionPress(option)}
              style={styles.optionButton}
              activeOpacity={0.7}
              accessibilityLabel={option.label}
            >
              <Text style={styles.optionEmoji}>{option.emoji}</Text>
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
    backgroundColor: '#E3F2FD',
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
    lineHeight: 36,
  },
  voiceButton: { paddingVertical: 12, paddingHorizontal: 12 },
  optionsContainer: { width: '100%', gap: 14 },
  optionButton: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#90CAF9',
    flexDirection: 'row',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  optionEmoji: { fontSize: 40 },
  optionLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textTransform: 'capitalize',
    flex: 1,
  },
});

export default LogicGame;
