import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import { getSessionQuestionOrder, seededShuffle } from '../../lib/gameUtils';
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
  sessionRound?: number;
  onCorrect: () => void;
  onWrong: () => void;
}

/** Static question bank — defined at module scope to avoid re-creation on every render */
const QUESTIONS: Record<
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
      {
        text: 'Find the BROWN color',
        target: 'brown',
        options: [
          { id: '1', name: 'brown', emoji: '🟤', color: '#8B4513', correct: true },
          { id: '2', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
          { id: '3', name: 'orange', emoji: '🟠', color: '#FF8800', correct: false },
        ],
      },
      {
        text: 'Which color is like GRASS?',
        target: 'green',
        options: [
          { id: '1', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
          { id: '2', name: 'green', emoji: '🟢', color: '#00AA00', correct: true },
          { id: '3', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
        ],
      },
      {
        text: 'Which color is like the SUN?',
        target: 'yellow',
        options: [
          { id: '1', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
          { id: '2', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: true },
          { id: '3', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
        ],
      },
      {
        text: 'Which color is like a FIRETRUCK?',
        target: 'red',
        options: [
          { id: '1', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
          { id: '2', name: 'orange', emoji: '🟠', color: '#FF8800', correct: false },
          { id: '3', name: 'red', emoji: '🔴', color: '#FF0000', correct: true },
        ],
      },
      {
        text: 'Find the WHITE color',
        target: 'white',
        options: [
          { id: '1', name: 'white', emoji: '⚪', color: '#F5F5F5', correct: true },
          { id: '2', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
          { id: '3', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
        ],
      },
      {
        text: 'Find the BLACK color',
        target: 'black',
        options: [
          { id: '1', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
          { id: '2', name: 'black', emoji: '⚫', color: '#1a1a1a', correct: true },
          { id: '3', name: 'brown', emoji: '🟤', color: '#8B4513', correct: false },
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
      {
        text: 'Which color is like a STRAWBERRY?',
        target: 'red',
        options: [
          { id: '1', name: 'red', emoji: '🔴', color: '#FF0000', correct: true },
          { id: '2', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
          { id: '3', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
        ],
      },
      {
        text: 'Find the BROWN color',
        target: 'brown',
        options: [
          { id: '1', name: 'orange', emoji: '🟠', color: '#FF8800', correct: false },
          { id: '2', name: 'brown', emoji: '🟤', color: '#8B4513', correct: true },
          { id: '3', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
        ],
      },
      {
        text: 'Which color is like CHOCOLATE?',
        target: 'brown',
        options: [
          { id: '1', name: 'brown', emoji: '🟤', color: '#8B4513', correct: true },
          { id: '2', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
          { id: '3', name: 'orange', emoji: '🟠', color: '#FF8800', correct: false },
        ],
      },
      {
        text: 'Which color is like the OCEAN?',
        target: 'blue',
        options: [
          { id: '1', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
          { id: '2', name: 'blue', emoji: '🔵', color: '#4D96FF', correct: true },
          { id: '3', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
        ],
      },
      {
        text: 'Find the WHITE color',
        target: 'white',
        options: [
          { id: '1', name: 'white', emoji: '⚪', color: '#F5F5F5', correct: true },
          { id: '2', name: 'pink', emoji: '🩷', color: '#FF69B4', correct: false },
          { id: '3', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
        ],
      },
      {
        text: 'Which color is like GRAPES?',
        target: 'purple',
        options: [
          { id: '1', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
          { id: '2', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: true },
          { id: '3', name: 'pink', emoji: '🩷', color: '#FF69B4', correct: false },
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
      {
        text: 'Mix BLUE + WHITE = ?',
        target: 'light blue',
        options: [
          { id: '1', name: 'light blue', emoji: '🔵', color: '#87CEEB', correct: true },
          { id: '2', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
          { id: '3', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
        ],
      },
      {
        text: 'Which is NOT a PRIMARY color?',
        target: 'green',
        options: [
          { id: '1', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
          { id: '2', name: 'green', emoji: '🟢', color: '#00AA00', correct: true },
          { id: '3', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
        ],
      },
      {
        text: 'Which is a SECONDARY color?',
        target: 'orange',
        options: [
          { id: '1', name: 'orange', emoji: '🟠', color: '#FF8800', correct: true },
          { id: '2', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
          { id: '3', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
        ],
      },
      {
        text: 'Mix YELLOW + WHITE = ?',
        target: 'cream',
        options: [
          { id: '1', name: 'cream', emoji: '🟡', color: '#FFFDD0', correct: true },
          { id: '2', name: 'brown', emoji: '🟤', color: '#8B4513', correct: false },
          { id: '3', name: 'orange', emoji: '🟠', color: '#FF8800', correct: false },
        ],
      },
      {
        text: 'Mix BLACK + WHITE = ?',
        target: 'gray',
        options: [
          { id: '1', name: 'gray', emoji: '⚪', color: '#808080', correct: true },
          { id: '2', name: 'brown', emoji: '🟤', color: '#8B4513', correct: false },
          { id: '3', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
        ],
      },
      {
        text: 'Which is a WARM color?',
        target: 'orange',
        options: [
          { id: '1', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
          { id: '2', name: 'orange', emoji: '🟠', color: '#FF8800', correct: true },
          { id: '3', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
        ],
      },
    ],
    '9-10': [
      {
        text: 'What is the COMPLEMENTARY color of RED?',
        target: 'green',
        options: [
          { id: '1', name: 'green', emoji: '🟢', color: '#00AA00', correct: true },
          { id: '2', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
          { id: '3', name: 'orange', emoji: '🟠', color: '#FF8800', correct: false },
        ],
      },
      {
        text: 'What is the COMPLEMENTARY color of BLUE?',
        target: 'orange',
        options: [
          { id: '1', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
          { id: '2', name: 'orange', emoji: '🟠', color: '#FF8800', correct: true },
          { id: '3', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
        ],
      },
      {
        text: 'Mix RED + ORANGE = ?',
        target: 'red-orange',
        options: [
          { id: '1', name: 'red-orange', emoji: '🔴', color: '#FF4500', correct: true },
          { id: '2', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
          { id: '3', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
        ],
      },
      {
        text: 'Adding WHITE to a color makes a…?',
        target: 'tint',
        options: [
          { id: '1', name: 'tint', emoji: '🩷', color: '#FFB6C1', correct: true },
          { id: '2', name: 'shade', emoji: '🟤', color: '#8B4513', correct: false },
          { id: '3', name: 'tone', emoji: '🟠', color: '#FF8800', correct: false },
        ],
      },
      {
        text: 'Adding BLACK to a color makes a…?',
        target: 'shade',
        options: [
          { id: '1', name: 'tint', emoji: '🩷', color: '#FFB6C1', correct: false },
          { id: '2', name: 'shade', emoji: '🟤', color: '#8B4513', correct: true },
          { id: '3', name: 'tone', emoji: '🔵', color: '#0000FF', correct: false },
        ],
      },
      {
        text: 'Which are ANALOGOUS colors?',
        target: 'red, orange, yellow',
        options: [
          { id: '1', name: 'red, orange, yellow', emoji: '🔴', color: '#FF4500', correct: true },
          { id: '2', name: 'red, green, blue', emoji: '🟢', color: '#00AA00', correct: false },
          { id: '3', name: 'red, blue, yellow', emoji: '🔵', color: '#0000FF', correct: false },
        ],
      },
      {
        text: 'Which PRIMARY colors make all others?',
        target: 'red, blue, yellow',
        options: [
          { id: '1', name: 'red, blue, yellow', emoji: '🎨', color: '#FFD700', correct: true },
          { id: '2', name: 'green, orange, purple', emoji: '🟢', color: '#00AA00', correct: false },
          { id: '3', name: 'pink, brown, white', emoji: '🩷', color: '#FFB6C1', correct: false },
        ],
      },
      {
        text: 'What is the COMPLEMENTARY color of YELLOW?',
        target: 'purple',
        options: [
          { id: '1', name: 'orange', emoji: '🟠', color: '#FF8800', correct: false },
          { id: '2', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: true },
          { id: '3', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
        ],
      },
      {
        text: 'Which color has the LONGEST wavelength?',
        target: 'red',
        options: [
          { id: '1', name: 'red', emoji: '🔴', color: '#FF0000', correct: true },
          { id: '2', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
          { id: '3', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
        ],
      },
      {
        text: 'What are the THREE secondary colors?',
        target: 'green, orange, purple',
        options: [
          { id: '1', name: 'green, orange, purple', emoji: '🎨', color: '#00AA00', correct: true },
          { id: '2', name: 'red, blue, yellow', emoji: '🖌️', color: '#FF0000', correct: false },
          { id: '3', name: 'pink, brown, white', emoji: '🩷', color: '#FFB6C1', correct: false },
        ],
      },
      {
        text: 'Mix BLUE + GREEN = ?',
        target: 'teal',
        options: [
          { id: '1', name: 'teal', emoji: '🔵', color: '#008080', correct: true },
          { id: '2', name: 'purple', emoji: '🟣', color: '#AA00AA', correct: false },
          { id: '3', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
        ],
      },
      {
        text: 'Mix YELLOW + GREEN = ?',
        target: 'chartreuse',
        options: [
          { id: '1', name: 'chartreuse', emoji: '🟢', color: '#7FFF00', correct: true },
          { id: '2', name: 'orange', emoji: '🟠', color: '#FF8800', correct: false },
          { id: '3', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
        ],
      },
      {
        text: 'What is a MONOCHROMATIC palette?',
        target: 'shades of one color',
        options: [
          { id: '1', name: 'shades of one color', emoji: '🔵', color: '#4D96FF', correct: true },
          { id: '2', name: 'opposite colors', emoji: '🔴', color: '#FF0000', correct: false },
          { id: '3', name: 'all rainbow colors', emoji: '🌈', color: '#FF8800', correct: false },
        ],
      },
      {
        text: 'Which color has the SHORTEST wavelength?',
        target: 'violet',
        options: [
          { id: '1', name: 'violet', emoji: '🟣', color: '#8B00FF', correct: true },
          { id: '2', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
          { id: '3', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
        ],
      },
      {
        text: 'What is the COMPLEMENTARY color of GREEN?',
        target: 'red',
        options: [
          { id: '1', name: 'red', emoji: '🔴', color: '#FF0000', correct: true },
          { id: '2', name: 'blue', emoji: '🔵', color: '#0000FF', correct: false },
          { id: '3', name: 'yellow', emoji: '🟡', color: '#FFD700', correct: false },
        ],
      },
      {
        text: 'What is the COMPLEMENTARY color of ORANGE?',
        target: 'blue',
        options: [
          { id: '1', name: 'blue', emoji: '🔵', color: '#0000FF', correct: true },
          { id: '2', name: 'green', emoji: '🟢', color: '#00AA00', correct: false },
          { id: '3', name: 'red', emoji: '🔴', color: '#FF0000', correct: false },
        ],
      },
    ],
  };

/**
 * Colors Game — teaches color recognition, naming, and mixing
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
  sessionRound = 1,
  onCorrect,
  onWrong,
}) => {
  const insets = useSafeAreaInsets();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { scaleAnim, contentOpacity, speakQuestion, handleCorrectAnswer, handleWrongAnswer, fadeToNextQuestion } = useGameFeedback();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | null>(null);

  const questionOrder = useMemo(
    () => getSessionQuestionOrder(QUESTIONS[ageBand].length, sessionRound),
    [ageBand, sessionRound]
  );
  const qBase = QUESTIONS[ageBand][questionOrder[currentQuestion % questionOrder.length]];
  const q = useMemo(() => {
    const promptStyles = [
      qBase.text,
      `Try this: ${qBase.text}`,
      `Can you solve this? ${qBase.text}`,
    ];
    return {
      ...qBase,
      text: promptStyles[(sessionRound + currentQuestion) % promptStyles.length],
      options: seededShuffle(qBase.options, sessionRound * 1000 + currentQuestion + 11),
    };
  }, [qBase, sessionRound, currentQuestion]);

  // Auto-speak question
  useEffect(() => {
    return speakQuestion(q.text);
  }, [currentQuestion, speakQuestion, q.text]);

  const handleOptionPress = async (option: ColorOption) => {
    if (selectedId) return;
    setSelectedId(option.id);
    setAnswerResult(option.correct ? 'correct' : 'wrong');

    if (option.correct) {
      await handleCorrectAnswer(option.name, onCorrect, () => {
        fadeToNextQuestion(() => {
          setSelectedId(null);
          setAnswerResult(null);
          setCurrentQuestion((p) => p + 1);
        });
      });
    } else {
      await handleWrongAnswer(option.name, onWrong);
      setTimeout(() => {
        setSelectedId(null);
        setAnswerResult(null);
      }, 200);
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
      <Animated.View style={{ opacity: contentOpacity, width: '100%' }}>
        <View style={styles.optionsContainer}>
          {q.options.map((option) => (
            <Animated.View key={option.id} style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                onPress={() => handleOptionPress(option)}
                style={[
                  styles.optionButton,
                  { backgroundColor: option.color },
                  selectedId === option.id && answerResult === 'correct' && styles.correctHighlight,
                  selectedId === option.id && answerResult === 'wrong' && styles.wrongHighlight,
                ]}
                activeOpacity={0.7}
                disabled={selectedId !== null}
                accessibilityLabel={option.name}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={styles.optionLabel}>{option.name}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
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
  correctHighlight: {
    borderWidth: 5,
    borderColor: '#16A34A',
    shadowColor: '#16A34A',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  wrongHighlight: {
    borderWidth: 5,
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
});

export default ColorsGame;
