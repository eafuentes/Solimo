import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Rect, Polygon, Ellipse } from 'react-native-svg';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import { shuffleArray } from '../../lib/gameUtils';
import { useGameFeedback } from '../../hooks/useGameFeedback';

interface ShapeOption {
  id: string;
  name: string;
  emoji: string;
  correct: boolean;
}

interface ShapesGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  onCorrect: () => void;
  onWrong: () => void;
}

/**
 * Render an SVG shape illustration for the question area.
 * Uses react-native-svg so shapes are crisp on every screen size.
 */
function ShapeIllustration({ shape }: { shape: string }) {
  const size = 120;
  const half = size / 2;

  switch (shape) {
    case 'circle':
      return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={half}
            cy={half}
            r={half - 4}
            fill="#FF6B6B"
            stroke="#CC5555"
            strokeWidth={3}
          />
        </Svg>
      );
    case 'square':
      return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Rect
            x={4}
            y={4}
            width={size - 8}
            height={size - 8}
            rx={6}
            fill="#4DABF7"
            stroke="#3793DD"
            strokeWidth={3}
          />
        </Svg>
      );
    case 'triangle':
      return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Polygon
            points={`${half},8 ${size - 8},${size - 8} 8,${size - 8}`}
            fill="#51CF66"
            stroke="#3EAF52"
            strokeWidth={3}
          />
        </Svg>
      );
    case 'rectangle':
      return (
        <Svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
          <Rect
            x={4}
            y={4}
            width={size - 8}
            height={size * 0.6 - 8}
            rx={6}
            fill="#FAB005"
            stroke="#D99E04"
            strokeWidth={3}
          />
        </Svg>
      );
    case 'star':
      return (
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Polygon
            points="60,10 73,45 110,45 80,68 90,105 60,82 30,105 40,68 10,45 47,45"
            fill="#FF922B"
            stroke="#DD7A22"
            strokeWidth={3}
          />
        </Svg>
      );
    case 'diamond':
      return (
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Polygon
            points={`${half},8 ${size - 8},${half} ${half},${size - 8} 8,${half}`}
            fill="#CC5DE8"
            stroke="#AA4FC8"
            strokeWidth={3}
          />
        </Svg>
      );
    case 'oval':
      return (
        <Svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`}>
          <Ellipse
            cx={half}
            cy={size * 0.35}
            rx={half - 4}
            ry={size * 0.35 - 4}
            fill="#20C997"
            stroke="#1BAA82"
            strokeWidth={3}
          />
        </Svg>
      );
    case 'pentagon':
      return (
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Polygon
            points="60,10 110,45 95,100 25,100 10,45"
            fill="#339AF0"
            stroke="#2882D0"
            strokeWidth={3}
          />
        </Svg>
      );
    case 'hexagon':
      return (
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Polygon
            points="90,15 115,60 90,105 30,105 5,60 30,15"
            fill="#F06595"
            stroke="#CC5580"
            strokeWidth={3}
          />
        </Svg>
      );
    default:
      return null;
  }
}

/**
 * Shapes Game — teaches shape recognition, naming, and properties
 *
 * Age 3-4: Basic shapes (circle, square, triangle) with big visual cues
 * Age 5-6: More shapes (rectangle, star, diamond, oval)
 * Age 7-8: Properties (sides, corners) + pentagon, hexagon
 *
 * Pedagogical approach:
 * - Large SVG illustrations for clear visual identification
 * - Emoji + name labels for multi-modal learning
 * - Auto-spoken questions for pre-readers
 * - Positive reinforcement on every attempt
 */
export const ShapesGame: React.FC<ShapesGameProps> = ({
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
    Array<{ text: string; shape: string; options: ShapeOption[] }>
  > = {
    '3-4': [
      {
        text: 'Find the CIRCLE',
        shape: 'circle',
        options: [
          { id: '1', name: 'circle', emoji: '⭕', correct: true },
          { id: '2', name: 'square', emoji: '🟦', correct: false },
          { id: '3', name: 'triangle', emoji: '🔺', correct: false },
        ],
      },
      {
        text: 'Find the SQUARE',
        shape: 'square',
        options: [
          { id: '1', name: 'square', emoji: '🟦', correct: true },
          { id: '2', name: 'circle', emoji: '⭕', correct: false },
          { id: '3', name: 'triangle', emoji: '🔺', correct: false },
        ],
      },
      {
        text: 'Find the TRIANGLE',
        shape: 'triangle',
        options: [
          { id: '1', name: 'circle', emoji: '⭕', correct: false },
          { id: '2', name: 'triangle', emoji: '🔺', correct: true },
          { id: '3', name: 'square', emoji: '🟦', correct: false },
        ],
      },
      {
        text: 'Which one is ROUND?',
        shape: 'circle',
        options: [
          { id: '1', name: 'triangle', emoji: '🔺', correct: false },
          { id: '2', name: 'circle', emoji: '⭕', correct: true },
          { id: '3', name: 'square', emoji: '🟦', correct: false },
        ],
      },
      {
        text: 'Which has 3 SIDES?',
        shape: 'triangle',
        options: [
          { id: '1', name: 'triangle', emoji: '🔺', correct: true },
          { id: '2', name: 'square', emoji: '🟦', correct: false },
          { id: '3', name: 'circle', emoji: '⭕', correct: false },
        ],
      },
      {
        text: 'Which has 4 SIDES?',
        shape: 'square',
        options: [
          { id: '1', name: 'circle', emoji: '⭕', correct: false },
          { id: '2', name: 'triangle', emoji: '🔺', correct: false },
          { id: '3', name: 'square', emoji: '🟦', correct: true },
        ],
      },
    ],
    '5-6': [
      {
        text: 'Find the STAR',
        shape: 'star',
        options: [
          { id: '1', name: 'star', emoji: '⭐', correct: true },
          { id: '2', name: 'diamond', emoji: '💎', correct: false },
          { id: '3', name: 'circle', emoji: '⭕', correct: false },
        ],
      },
      {
        text: 'Find the DIAMOND',
        shape: 'diamond',
        options: [
          { id: '1', name: 'square', emoji: '🟦', correct: false },
          { id: '2', name: 'diamond', emoji: '💎', correct: true },
          { id: '3', name: 'triangle', emoji: '🔺', correct: false },
        ],
      },
      {
        text: 'Find the RECTANGLE',
        shape: 'rectangle',
        options: [
          { id: '1', name: 'rectangle', emoji: '🟧', correct: true },
          { id: '2', name: 'square', emoji: '🟦', correct: false },
          { id: '3', name: 'circle', emoji: '⭕', correct: false },
        ],
      },
      {
        text: 'Find the OVAL',
        shape: 'oval',
        options: [
          { id: '1', name: 'circle', emoji: '⭕', correct: false },
          { id: '2', name: 'oval', emoji: '🥚', correct: true },
          { id: '3', name: 'rectangle', emoji: '🟧', correct: false },
        ],
      },
      {
        text: 'Which is like a KITE?',
        shape: 'diamond',
        options: [
          { id: '1', name: 'star', emoji: '⭐', correct: false },
          { id: '2', name: 'diamond', emoji: '💎', correct: true },
          { id: '3', name: 'triangle', emoji: '🔺', correct: false },
        ],
      },
      {
        text: 'Which is like an EGG?',
        shape: 'oval',
        options: [
          { id: '1', name: 'oval', emoji: '🥚', correct: true },
          { id: '2', name: 'circle', emoji: '⭕', correct: false },
          { id: '3', name: 'square', emoji: '🟦', correct: false },
        ],
      },
    ],
    '7-8': [
      {
        text: 'Find the PENTAGON (5 sides)',
        shape: 'pentagon',
        options: [
          { id: '1', name: 'hexagon', emoji: '⬡', correct: false },
          { id: '2', name: 'pentagon', emoji: '⬠', correct: true },
          { id: '3', name: 'diamond', emoji: '💎', correct: false },
        ],
      },
      {
        text: 'Find the HEXAGON (6 sides)',
        shape: 'hexagon',
        options: [
          { id: '1', name: 'pentagon', emoji: '⬠', correct: false },
          { id: '2', name: 'star', emoji: '⭐', correct: false },
          { id: '3', name: 'hexagon', emoji: '⬡', correct: true },
        ],
      },
      {
        text: 'Which has 5 SIDES?',
        shape: 'pentagon',
        options: [
          { id: '1', name: 'pentagon', emoji: '⬠', correct: true },
          { id: '2', name: 'square', emoji: '🟦', correct: false },
          { id: '3', name: 'hexagon', emoji: '⬡', correct: false },
        ],
      },
      {
        text: 'Which has 6 SIDES?',
        shape: 'hexagon',
        options: [
          { id: '1', name: 'triangle', emoji: '🔺', correct: false },
          { id: '2', name: 'hexagon', emoji: '⬡', correct: true },
          { id: '3', name: 'pentagon', emoji: '⬠', correct: false },
        ],
      },
      {
        text: 'Which has NO corners?',
        shape: 'circle',
        options: [
          { id: '1', name: 'circle', emoji: '⭕', correct: true },
          { id: '2', name: 'square', emoji: '🟦', correct: false },
          { id: '3', name: 'triangle', emoji: '🔺', correct: false },
        ],
      },
      {
        text: 'Which has 3 CORNERS?',
        shape: 'triangle',
        options: [
          { id: '1', name: 'square', emoji: '🟦', correct: false },
          { id: '2', name: 'pentagon', emoji: '⬠', correct: false },
          { id: '3', name: 'triangle', emoji: '🔺', correct: true },
        ],
      },
    ],
  };

  const [questionOrder] = useState(() => shuffleArray(questions[ageBand].map((_, i) => i)));
  const q = questions[ageBand][questionOrder[currentQuestion % questionOrder.length]];

  useEffect(() => {
    return speakQuestion(q.text);
  }, [currentQuestion, speakQuestion, q.text]);

  const handleOptionPress = async (option: ShapeOption) => {
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

      <View style={styles.illustration}>
        <ShapeIllustration shape={q.shape} />
      </View>

      <View style={styles.optionsContainer}>
        {q.options.map((option) => (
          <Animated.View key={option.id} style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              onPress={() => handleOptionPress(option)}
              style={styles.optionButton}
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
    backgroundColor: '#F0F8FF',
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
  illustration: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    minHeight: 130,
  },
  optionsContainer: { width: '100%', gap: 14 },
  optionButton: {
    paddingVertical: 22,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  optionEmoji: { fontSize: 40, marginBottom: 6 },
  optionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default ShapesGame;
