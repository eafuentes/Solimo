import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Rect, Polygon, Ellipse } from 'react-native-svg';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import { getSessionQuestionOrder, seededShuffle } from '../../lib/gameUtils';
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
  sessionRound?: number;
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
/** Static question bank — defined at module scope to avoid re-creation on every render */
const QUESTIONS: Record<
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
      {
        text: 'Find the STAR',
        shape: 'star',
        options: [
          { id: '1', name: 'star', emoji: '⭐', correct: true },
          { id: '2', name: 'circle', emoji: '⭕', correct: false },
          { id: '3', name: 'square', emoji: '🟦', correct: false },
        ],
      },
      {
        text: 'Which is like a BALL?',
        shape: 'circle',
        options: [
          { id: '1', name: 'square', emoji: '🟦', correct: false },
          { id: '2', name: 'circle', emoji: '⭕', correct: true },
          { id: '3', name: 'triangle', emoji: '🔺', correct: false },
        ],
      },
      {
        text: 'Which is like a ROOF?',
        shape: 'triangle',
        options: [
          { id: '1', name: 'triangle', emoji: '🔺', correct: true },
          { id: '2', name: 'circle', emoji: '⭕', correct: false },
          { id: '3', name: 'square', emoji: '🟦', correct: false },
        ],
      },
      {
        text: 'Which is like a BOX?',
        shape: 'square',
        options: [
          { id: '1', name: 'circle', emoji: '⭕', correct: false },
          { id: '2', name: 'square', emoji: '🟦', correct: true },
          { id: '3', name: 'triangle', emoji: '🔺', correct: false },
        ],
      },
      {
        text: 'Which has NO sides?',
        shape: 'circle',
        options: [
          { id: '1', name: 'triangle', emoji: '🔺', correct: false },
          { id: '2', name: 'square', emoji: '🟦', correct: false },
          { id: '3', name: 'circle', emoji: '⭕', correct: true },
        ],
      },
      {
        text: 'Which looks like a PIZZA slice?',
        shape: 'triangle',
        options: [
          { id: '1', name: 'square', emoji: '🟦', correct: false },
          { id: '2', name: 'triangle', emoji: '🔺', correct: true },
          { id: '3', name: 'circle', emoji: '⭕', correct: false },
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
      {
        text: 'Which is like a MIRROR?',
        shape: 'rectangle',
        options: [
          { id: '1', name: 'rectangle', emoji: '🟧', correct: true },
          { id: '2', name: 'triangle', emoji: '🔺', correct: false },
          { id: '3', name: 'circle', emoji: '⭕', correct: false },
        ],
      },
      {
        text: 'Which has 5 POINTS?',
        shape: 'star',
        options: [
          { id: '1', name: 'diamond', emoji: '💎', correct: false },
          { id: '2', name: 'star', emoji: '⭐', correct: true },
          { id: '3', name: 'square', emoji: '🟦', correct: false },
        ],
      },
      {
        text: 'Which is like a WINDOW?',
        shape: 'square',
        options: [
          { id: '1', name: 'square', emoji: '🟦', correct: true },
          { id: '2', name: 'triangle', emoji: '🔺', correct: false },
          { id: '3', name: 'star', emoji: '⭐', correct: false },
        ],
      },
      {
        text: 'Which has 4 CORNERS?',
        shape: 'rectangle',
        options: [
          { id: '1', name: 'triangle', emoji: '🔺', correct: false },
          { id: '2', name: 'rectangle', emoji: '🟧', correct: true },
          { id: '3', name: 'circle', emoji: '⭕', correct: false },
        ],
      },
      {
        text: 'Find the CIRCLE',
        shape: 'circle',
        options: [
          { id: '1', name: 'circle', emoji: '⭕', correct: true },
          { id: '2', name: 'oval', emoji: '🥚', correct: false },
          { id: '3', name: 'diamond', emoji: '💎', correct: false },
        ],
      },
      {
        text: 'Find the TRIANGLE',
        shape: 'triangle',
        options: [
          { id: '1', name: 'star', emoji: '⭐', correct: false },
          { id: '2', name: 'diamond', emoji: '💎', correct: false },
          { id: '3', name: 'triangle', emoji: '🔺', correct: true },
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
      {
        text: 'Which has MORE sides: pentagon or hexagon?',
        shape: 'hexagon',
        options: [
          { id: '1', name: 'hexagon', emoji: '⬡', correct: true },
          { id: '2', name: 'pentagon', emoji: '⬠', correct: false },
          { id: '3', name: 'square', emoji: '🟦', correct: false },
        ],
      },
      {
        text: 'Which has 4 EQUAL sides?',
        shape: 'square',
        options: [
          { id: '1', name: 'rectangle', emoji: '🟧', correct: false },
          { id: '2', name: 'square', emoji: '🟦', correct: true },
          { id: '3', name: 'triangle', emoji: '🔺', correct: false },
        ],
      },
      {
        text: 'Which has 4 sides but NOT all equal?',
        shape: 'rectangle',
        options: [
          { id: '1', name: 'rectangle', emoji: '🟧', correct: true },
          { id: '2', name: 'square', emoji: '🟦', correct: false },
          { id: '3', name: 'hexagon', emoji: '⬡', correct: false },
        ],
      },
      {
        text: 'Which can ROLL?',
        shape: 'circle',
        options: [
          { id: '1', name: 'circle', emoji: '⭕', correct: true },
          { id: '2', name: 'square', emoji: '🟦', correct: false },
          { id: '3', name: 'triangle', emoji: '🔺', correct: false },
        ],
      },
      {
        text: 'Which shape is like a DIAMOND?',
        shape: 'diamond',
        options: [
          { id: '1', name: 'diamond', emoji: '💎', correct: true },
          { id: '2', name: 'hexagon', emoji: '⬡', correct: false },
          { id: '3', name: 'circle', emoji: '⭕', correct: false },
        ],
      },
      {
        text: 'Which shape TILES a floor perfectly?',
        shape: 'hexagon',
        options: [
          { id: '1', name: 'hexagon', emoji: '⬡', correct: true },
          { id: '2', name: 'pentagon', emoji: '⬠', correct: false },
          { id: '3', name: 'circle', emoji: '⭕', correct: false },
        ],
      },
    ],
    '9-10': [
      {
        text: 'A triangle has what type of angles if all are less than 90°?',
        shape: 'triangle',
        options: [
          { id: '1', name: 'acute', emoji: '📐', correct: true },
          { id: '2', name: 'obtuse', emoji: '📏', correct: false },
          { id: '3', name: 'right', emoji: '🔲', correct: false },
        ],
      },
      {
        text: 'How many lines of SYMMETRY does a circle have?',
        shape: 'circle',
        options: [
          { id: '1', name: 'infinite', emoji: '♾️', correct: true },
          { id: '2', name: 'four', emoji: '4️⃣', correct: false },
          { id: '3', name: 'one', emoji: '1️⃣', correct: false },
        ],
      },
      {
        text: 'A CUBE is a 3D version of which shape?',
        shape: 'square',
        options: [
          { id: '1', name: 'square', emoji: '🟦', correct: true },
          { id: '2', name: 'triangle', emoji: '🔺', correct: false },
          { id: '3', name: 'circle', emoji: '⭕', correct: false },
        ],
      },
      {
        text: 'A SPHERE is a 3D version of which shape?',
        shape: 'circle',
        options: [
          { id: '1', name: 'square', emoji: '🟦', correct: false },
          { id: '2', name: 'circle', emoji: '⭕', correct: true },
          { id: '3', name: 'triangle', emoji: '🔺', correct: false },
        ],
      },
      {
        text: 'A right angle measures exactly…?',
        shape: 'square',
        options: [
          { id: '1', name: '90 degrees', emoji: '📐', correct: true },
          { id: '2', name: '180 degrees', emoji: '📏', correct: false },
          { id: '3', name: '45 degrees', emoji: '📎', correct: false },
        ],
      },
      {
        text: 'How many FACES does a cube have?',
        shape: 'square',
        options: [
          { id: '1', name: '4', emoji: '4️⃣', correct: false },
          { id: '2', name: '6', emoji: '6️⃣', correct: true },
          { id: '3', name: '8', emoji: '8️⃣', correct: false },
        ],
      },
      {
        text: 'The distance AROUND a shape is called the…?',
        shape: 'rectangle',
        options: [
          { id: '1', name: 'perimeter', emoji: '📏', correct: true },
          { id: '2', name: 'area', emoji: '📐', correct: false },
          { id: '3', name: 'volume', emoji: '📦', correct: false },
        ],
      },
      {
        text: 'The space INSIDE a shape is called the…?',
        shape: 'rectangle',
        options: [
          { id: '1', name: 'perimeter', emoji: '📏', correct: false },
          { id: '2', name: 'area', emoji: '📐', correct: true },
          { id: '3', name: 'diameter', emoji: '⭕', correct: false },
        ],
      },
      {
        text: 'A CYLINDER is a 3D version of which shape?',
        shape: 'circle',
        options: [
          { id: '1', name: 'circle', emoji: '⭕', correct: true },
          { id: '2', name: 'square', emoji: '🟦', correct: false },
          { id: '3', name: 'triangle', emoji: '🔺', correct: false },
        ],
      },
      {
        text: 'A CONE has what shape as its base?',
        shape: 'circle',
        options: [
          { id: '1', name: 'circle', emoji: '⭕', correct: true },
          { id: '2', name: 'square', emoji: '🟦', correct: false },
          { id: '3', name: 'triangle', emoji: '🔺', correct: false },
        ],
      },
      {
        text: 'How many EDGES does a cube have?',
        shape: 'square',
        options: [
          { id: '1', name: '12', emoji: '📐', correct: true },
          { id: '2', name: '8', emoji: '📏', correct: false },
          { id: '3', name: '6', emoji: '📎', correct: false },
        ],
      },
      {
        text: 'How many VERTICES does a cube have?',
        shape: 'square',
        options: [
          { id: '1', name: '6', emoji: '📏', correct: false },
          { id: '2', name: '8', emoji: '📐', correct: true },
          { id: '3', name: '12', emoji: '📎', correct: false },
        ],
      },
      {
        text: 'An EQUILATERAL triangle has all sides…?',
        shape: 'triangle',
        options: [
          { id: '1', name: 'equal', emoji: '📏', correct: true },
          { id: '2', name: 'different', emoji: '📐', correct: false },
          { id: '3', name: 'curved', emoji: '⭕', correct: false },
        ],
      },
      {
        text: 'How many lines of SYMMETRY does a square have?',
        shape: 'square',
        options: [
          { id: '1', name: 'four', emoji: '4️⃣', correct: true },
          { id: '2', name: 'two', emoji: '2️⃣', correct: false },
          { id: '3', name: 'one', emoji: '1️⃣', correct: false },
        ],
      },
      {
        text: 'The sum of angles in a triangle is…?',
        shape: 'triangle',
        options: [
          { id: '1', name: '180 degrees', emoji: '📐', correct: true },
          { id: '2', name: '360 degrees', emoji: '📏', correct: false },
          { id: '3', name: '90 degrees', emoji: '📎', correct: false },
        ],
      },
      {
        text: 'A TRIANGULAR prism has what shape for its bases?',
        shape: 'triangle',
        options: [
          { id: '1', name: 'triangle', emoji: '🔺', correct: true },
          { id: '2', name: 'circle', emoji: '⭕', correct: false },
          { id: '3', name: 'square', emoji: '🟦', correct: false },
        ],
      },
    ],
  };

/**
 * Shapes Game — teaches shape recognition, naming, and properties
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
      `Find this shape: ${qBase.text}`,
      `Quick challenge: ${qBase.text}`,
    ];
    return {
      ...qBase,
      text: promptStyles[(sessionRound + currentQuestion) % promptStyles.length],
      options: seededShuffle(qBase.options, sessionRound * 1000 + currentQuestion + 23),
    };
  }, [qBase, sessionRound, currentQuestion]);

  useEffect(() => {
    return speakQuestion(q.text);
  }, [currentQuestion, speakQuestion, q.text]);

  const handleOptionPress = async (option: ShapeOption) => {
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

      <Animated.View style={{ opacity: contentOpacity, width: '100%', alignItems: 'center' }}>
        <View style={styles.illustration}>
          <ShapeIllustration shape={q.shape} />
        </View>

        <View style={styles.optionsContainer}>
          {q.options.map((option) => (
            <Animated.View key={option.id} style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                onPress={() => handleOptionPress(option)}
                style={[
                  styles.optionButton,
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
  correctHighlight: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
    shadowColor: '#16A34A',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  wrongHighlight: {
    borderColor: '#DC2626',
    backgroundColor: '#FEE2E2',
    shadowColor: '#DC2626',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
});

export default ShapesGame;
