import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { GameScrollContainer } from '../GameScrollContainer';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import { getSessionQuestionOrder, seededShuffle } from '../../lib/gameUtils';
import { useGameFeedback } from '../../hooks/useGameFeedback';

interface SortingItem {
  id: string;
  emoji: string;
  label: string;
}

interface SortingGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  sessionRound?: number;
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
/** Static question bank — defined at module scope to avoid re-creation on every render */
const QUESTIONS: Record<
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
      {
        text: 'Which is a VEHICLE?',
        instruction: 'Which is a vehicle?',
        items: [
          { id: '1', emoji: '🚗', label: 'car', correct: true },
          { id: '2', emoji: '🌳', label: 'tree', correct: false },
          { id: '3', emoji: '🐶', label: 'dog', correct: false },
        ],
      },
      {
        text: 'Which GROWS in a garden?',
        instruction: 'Which grows in a garden?',
        items: [
          { id: '1', emoji: '🌻', label: 'flower', correct: true },
          { id: '2', emoji: '🚗', label: 'car', correct: false },
          { id: '3', emoji: '📺', label: 'TV', correct: false },
        ],
      },
      {
        text: 'Which do you WEAR?',
        instruction: 'Which do you wear?',
        items: [
          { id: '1', emoji: '👟', label: 'shoes', correct: true },
          { id: '2', emoji: '🍎', label: 'apple', correct: false },
          { id: '3', emoji: '🐱', label: 'cat', correct: false },
        ],
      },
      {
        text: 'Which gives us MILK?',
        instruction: 'Which animal gives us milk?',
        items: [
          { id: '1', emoji: '🐄', label: 'cow', correct: true },
          { id: '2', emoji: '🐦', label: 'bird', correct: false },
          { id: '3', emoji: '🐍', label: 'snake', correct: false },
        ],
      },
      {
        text: 'Which is FOOD?',
        instruction: 'Which is food?',
        items: [
          { id: '1', emoji: '🪨', label: 'rock', correct: false },
          { id: '2', emoji: '🍕', label: 'pizza', correct: true },
          { id: '3', emoji: '☁️', label: 'cloud', correct: false },
        ],
      },
      {
        text: 'Which has WHEELS?',
        instruction: 'Which has wheels?',
        items: [
          { id: '1', emoji: '🚲', label: 'bicycle', correct: true },
          { id: '2', emoji: '🌺', label: 'flower', correct: false },
          { id: '3', emoji: '📚', label: 'book', correct: false },
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
      {
        text: 'Which is SOFT?',
        instruction: 'Which is soft?',
        items: [
          { id: '1', emoji: '🪨', label: 'rock', correct: false },
          { id: '2', emoji: '🧸', label: 'teddy bear', correct: true },
          { id: '3', emoji: '🧱', label: 'brick', correct: false },
        ],
      },
      {
        text: 'Which is HARD?',
        instruction: 'Which is hard?',
        items: [
          { id: '1', emoji: '🪨', label: 'rock', correct: true },
          { id: '2', emoji: '🧶', label: 'yarn', correct: false },
          { id: '3', emoji: '☁️', label: 'cloud', correct: false },
        ],
      },
      {
        text: 'Which is TALL?',
        instruction: 'Which is tall?',
        items: [
          { id: '1', emoji: '🐁', label: 'mouse', correct: false },
          { id: '2', emoji: '🦒', label: 'giraffe', correct: true },
          { id: '3', emoji: '🐌', label: 'snail', correct: false },
        ],
      },
      {
        text: 'Which does NOT belong?',
        instruction: 'Which does not belong with the vehicles?',
        items: [
          { id: '1', emoji: '🚗', label: 'car', correct: false },
          { id: '2', emoji: '🚌', label: 'bus', correct: false },
          { id: '3', emoji: '🌻', label: 'flower', correct: true },
        ],
      },
      {
        text: 'Which is FAST?',
        instruction: 'Which is fast?',
        items: [
          { id: '1', emoji: '🐢', label: 'turtle', correct: false },
          { id: '2', emoji: '🐇', label: 'rabbit', correct: true },
          { id: '3', emoji: '🐌', label: 'snail', correct: false },
        ],
      },
      {
        text: 'Which is ROUND?',
        instruction: 'Which is round?',
        items: [
          { id: '1', emoji: '🍎', label: 'apple', correct: true },
          { id: '2', emoji: '📚', label: 'book', correct: false },
          { id: '3', emoji: '👟', label: 'shoe', correct: false },
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
      {
        text: 'Which is a FRUIT?',
        instruction: 'Which is a fruit, not a vegetable?',
        items: [
          { id: '1', emoji: '🥕', label: 'carrot', correct: false },
          { id: '2', emoji: '🍓', label: 'strawberry', correct: true },
          { id: '3', emoji: '🥦', label: 'broccoli', correct: false },
          { id: '4', emoji: '🥔', label: 'potato', correct: false },
        ],
      },
      {
        text: 'Which is a MUSICAL instrument?',
        instruction: 'Which is a musical instrument?',
        items: [
          { id: '1', emoji: '🎨', label: 'paint', correct: false },
          { id: '2', emoji: '🎸', label: 'guitar', correct: true },
          { id: '3', emoji: '📚', label: 'books', correct: false },
          { id: '4', emoji: '✂️', label: 'scissors', correct: false },
        ],
      },
      {
        text: 'Which has FEATHERS?',
        instruction: 'Which animal has feathers?',
        items: [
          { id: '1', emoji: '🐦', label: 'bird', correct: true },
          { id: '2', emoji: '🐱', label: 'cat', correct: false },
          { id: '3', emoji: '🐟', label: 'fish', correct: false },
          { id: '4', emoji: '🐍', label: 'snake', correct: false },
        ],
      },
      {
        text: 'Which does NOT belong?',
        instruction: 'Which does not belong with the colors?',
        items: [
          { id: '1', emoji: '🔴', label: 'red', correct: false },
          { id: '2', emoji: '🔵', label: 'blue', correct: false },
          { id: '3', emoji: '🍕', label: 'pizza', correct: true },
          { id: '4', emoji: '🟢', label: 'green', correct: false },
        ],
      },
      {
        text: 'Which is made of METAL?',
        instruction: 'Which is made of metal?',
        items: [
          { id: '1', emoji: '🪨', label: 'rock', correct: false },
          { id: '2', emoji: '🔑', label: 'key', correct: true },
          { id: '3', emoji: '🌿', label: 'leaf', correct: false },
          { id: '4', emoji: '🧴', label: 'sponge', correct: false },
        ],
      },
      {
        text: 'Which has FINS?',
        instruction: 'Which has fins?',
        items: [
          { id: '1', emoji: '🐟', label: 'fish', correct: true },
          { id: '2', emoji: '🐦', label: 'bird', correct: false },
          { id: '3', emoji: '🐶', label: 'dog', correct: false },
          { id: '4', emoji: '🐱', label: 'cat', correct: false },
        ],
      },
    ],
    '9-10': [
      {
        text: 'Which is a SOLID?',
        instruction: 'Which is a solid, not a liquid or gas?',
        items: [
          { id: '1', emoji: '🪨', label: 'rock', correct: true },
          { id: '2', emoji: '💧', label: 'water', correct: false },
          { id: '3', emoji: '💨', label: 'air', correct: false },
          { id: '4', emoji: '🫧', label: 'steam', correct: false },
        ],
      },
      {
        text: 'Which is a GAS?',
        instruction: 'Which is a gas?',
        items: [
          { id: '1', emoji: '🧊', label: 'ice', correct: false },
          { id: '2', emoji: '🪵', label: 'wood', correct: false },
          { id: '3', emoji: '💨', label: 'oxygen', correct: true },
          { id: '4', emoji: '🥛', label: 'milk', correct: false },
        ],
      },
      {
        text: 'Which is a MAMMAL?',
        instruction: 'Which animal is a mammal?',
        items: [
          { id: '1', emoji: '🐬', label: 'dolphin', correct: true },
          { id: '2', emoji: '🐍', label: 'snake', correct: false },
          { id: '3', emoji: '🦎', label: 'lizard', correct: false },
          { id: '4', emoji: '🐸', label: 'frog', correct: false },
        ],
      },
      {
        text: 'Which is a RENEWABLE energy?',
        instruction: 'Which is a renewable energy source?',
        items: [
          { id: '1', emoji: '☀️', label: 'solar', correct: true },
          { id: '2', emoji: '⛽', label: 'gasoline', correct: false },
          { id: '3', emoji: '🏭', label: 'coal', correct: false },
          { id: '4', emoji: '🛢️', label: 'oil', correct: false },
        ],
      },
      {
        text: 'Which does NOT belong?',
        instruction: 'Which does not belong with the planets?',
        items: [
          { id: '1', emoji: '🌍', label: 'Earth', correct: false },
          { id: '2', emoji: '🪐', label: 'Jupiter', correct: false },
          { id: '3', emoji: '⭐', label: 'Sun', correct: true },
          { id: '4', emoji: '🔴', label: 'Mars', correct: false },
        ],
      },
      {
        text: 'Which is an INSECT?',
        instruction: 'Which is an insect with 6 legs?',
        items: [
          { id: '1', emoji: '🕷️', label: 'spider', correct: false },
          { id: '2', emoji: '🐜', label: 'ant', correct: true },
          { id: '3', emoji: '🦀', label: 'crab', correct: false },
          { id: '4', emoji: '🐛', label: 'worm', correct: false },
        ],
      },
      {
        text: 'Which is part of the DIGESTIVE system?',
        instruction: 'Which organ is part of the digestive system?',
        items: [
          { id: '1', emoji: '🫁', label: 'lungs', correct: false },
          { id: '2', emoji: '🧠', label: 'brain', correct: false },
          { id: '3', emoji: '💪', label: 'stomach', correct: true },
          { id: '4', emoji: '👁️', label: 'eye', correct: false },
        ],
      },
      {
        text: 'Which is a CONDUCTOR of electricity?',
        instruction: 'Which material conducts electricity?',
        items: [
          { id: '1', emoji: '🪵', label: 'wood', correct: false },
          { id: '2', emoji: '🧱', label: 'rubber', correct: false },
          { id: '3', emoji: '⚙️', label: 'copper', correct: true },
          { id: '4', emoji: '🧶', label: 'plastic', correct: false },
        ],
      },
      {
        text: 'Which is a LIQUID?',
        instruction: 'Which is a liquid?',
        items: [
          { id: '1', emoji: '🪨', label: 'rock', correct: false },
          { id: '2', emoji: '🍊', label: 'juice', correct: true },
          { id: '3', emoji: '🪵', label: 'wood', correct: false },
          { id: '4', emoji: '🧱', label: 'brick', correct: false },
        ],
      },
      {
        text: 'Which is a REPTILE?',
        instruction: 'Which is a reptile?',
        items: [
          { id: '1', emoji: '🐺', label: 'wolf', correct: false },
          { id: '2', emoji: '🦎', label: 'lizard', correct: true },
          { id: '3', emoji: '🐦', label: 'bird', correct: false },
          { id: '4', emoji: '🐟', label: 'fish', correct: false },
        ],
      },
      {
        text: 'Which is NOT a continent?',
        instruction: 'Which is not a continent?',
        items: [
          { id: '1', emoji: '🌍', label: 'Africa', correct: false },
          { id: '2', emoji: '🇱🇷', label: 'Pacific Ocean', correct: true },
          { id: '3', emoji: '🌎', label: 'Asia', correct: false },
          { id: '4', emoji: '🌏', label: 'Europe', correct: false },
        ],
      },
      {
        text: 'Which is a PRODUCER in a food chain?',
        instruction: 'Which is a producer, not a consumer?',
        items: [
          { id: '1', emoji: '🌱', label: 'plant', correct: true },
          { id: '2', emoji: '🦁', label: 'lion', correct: false },
          { id: '3', emoji: '🐇', label: 'rabbit', correct: false },
          { id: '4', emoji: '🦅', label: 'eagle', correct: false },
        ],
      },
      {
        text: 'Which has a BACKBONE?',
        instruction: 'Which is a vertebrate with a backbone?',
        items: [
          { id: '1', emoji: '🪱', label: 'worm', correct: false },
          { id: '2', emoji: '🐶', label: 'dog', correct: true },
          { id: '3', emoji: '🧪', label: 'jellyfish', correct: false },
          { id: '4', emoji: '🐜', label: 'ant', correct: false },
        ],
      },
      {
        text: 'Which is a COMPOUND?',
        instruction: 'Which is a compound, not an element?',
        items: [
          { id: '1', emoji: '💧', label: 'water', correct: true },
          { id: '2', emoji: '🥇', label: 'gold', correct: false },
          { id: '3', emoji: '🌬️', label: 'oxygen', correct: false },
          { id: '4', emoji: '⚡', label: 'iron', correct: false },
        ],
      },
      {
        text: 'Which is a PRIMARY source?',
        instruction: 'Which is a primary historical source?',
        items: [
          { id: '1', emoji: '📝', label: 'diary', correct: true },
          { id: '2', emoji: '📚', label: 'textbook', correct: false },
          { id: '3', emoji: '🎥', label: 'documentary', correct: false },
          { id: '4', emoji: '📰', label: 'encyclopedia', correct: false },
        ],
      },
      {
        text: 'Which is an HERBIVORE?',
        instruction: 'Which animal only eats plants?',
        items: [
          { id: '1', emoji: '🦁', label: 'lion', correct: false },
          { id: '2', emoji: '🐄', label: 'cow', correct: true },
          { id: '3', emoji: '🐺', label: 'wolf', correct: false },
          { id: '4', emoji: '🦅', label: 'eagle', correct: false },
        ],
      },
    ],
  };

/**
 * Sorting Game — teaches categorization, grouping, and classification
 *
 * Pedagogical approach:
 * - Classification is a foundational cognitive skill
 * - Emoji visuals make abstract concepts concrete
 * - "Which one belongs?" builds logical reasoning
 */
export const SortingGame: React.FC<SortingGameProps> = ({
  ageBand,
  difficulty,
  sessionRound = 1,
  onCorrect,
  onWrong,
}) => {
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
    const prompts = [qBase.text, `New challenge: ${qBase.text}`, `Let's sort! ${qBase.text}`];
    return {
      ...qBase,
      text: prompts[(sessionRound + currentQuestion) % prompts.length],
      items: seededShuffle(qBase.items, sessionRound * 1000 + currentQuestion + 37),
    };
  }, [qBase, sessionRound, currentQuestion]);

  useEffect(() => {
    return speakQuestion(q.instruction);
  }, [currentQuestion, speakQuestion, q.instruction]);

  const handleItemPress = async (item: SortingItem & { correct: boolean }) => {
    if (selectedId) return;
    setSelectedId(item.id);
    setAnswerResult(item.correct ? 'correct' : 'wrong');

    if (item.correct) {
      await handleCorrectAnswer(item.label, onCorrect, () => {
        fadeToNextQuestion(() => {
          setSelectedId(null);
          setAnswerResult(null);
          setCurrentQuestion((p) => p + 1);
        });
      });
    } else {
      await handleWrongAnswer(item.label, onWrong);
      setTimeout(() => {
        setSelectedId(null);
        setAnswerResult(null);
      }, 200);
    }
  };

  return (
    <GameScrollContainer backgroundColor="#FFF3E0">
      <View style={styles.headerSection}>
        <Text style={styles.questionText}>{q.text}</Text>
        <VoiceButton text={q.instruction} style={styles.voiceButton} />
      </View>

      <Animated.View style={{ opacity: contentOpacity, width: '100%', alignItems: 'center' }}>
        <View style={styles.itemsContainer}>
          {q.items.map((item) => (
            <Animated.View key={item.id} style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                onPress={() => handleItemPress(item)}
                style={[
                  styles.itemButton,
                  selectedId === item.id && answerResult === 'correct' && styles.correctHighlight,
                  selectedId === item.id && answerResult === 'wrong' && styles.wrongHighlight,
                ]}
                activeOpacity={0.7}
                disabled={selectedId !== null}
                accessibilityLabel={item.label}
              >
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <Text style={styles.itemLabel}>{item.label}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    </GameScrollContainer>
  );
};

const styles = StyleSheet.create({
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

export default SortingGame;
