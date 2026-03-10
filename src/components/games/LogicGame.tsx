import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import { getSessionQuestionOrder, seededShuffle } from '../../lib/gameUtils';
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
  sessionRound?: number;
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
/** Static question bank — defined at module scope to avoid re-creation on every render */
const QUESTIONS: Record<
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
      {
        text: 'What do you DRINK from?',
        instruction: 'What do you drink from?',
        options: [
          { id: '1', label: 'cup', emoji: '🥤', correct: true },
          { id: '2', label: 'plate', emoji: '🍽️', correct: false },
          { id: '3', label: 'shoe', emoji: '👟', correct: false },
        ],
      },
      {
        text: 'What do BIRDS do?',
        instruction: 'What do birds do?',
        options: [
          { id: '1', label: 'fly', emoji: '🐦', correct: true },
          { id: '2', label: 'swim', emoji: '🐟', correct: false },
          { id: '3', label: 'dig', emoji: '🪓', correct: false },
        ],
      },
      {
        text: 'What keeps us DRY in rain?',
        instruction: 'What keeps us dry in rain?',
        options: [
          { id: '1', label: 'umbrella', emoji: '☂️', correct: true },
          { id: '2', label: 'sunglasses', emoji: '🕶️', correct: false },
          { id: '3', label: 'fan', emoji: '🪨', correct: false },
        ],
      },
      {
        text: 'Where does a DOCTOR work?',
        instruction: 'Where does a doctor work?',
        options: [
          { id: '1', label: 'hospital', emoji: '🏥', correct: true },
          { id: '2', label: 'school', emoji: '🏫', correct: false },
          { id: '3', label: 'farm', emoji: '🌾', correct: false },
        ],
      },
      {
        text: 'What helps you SEE at night?',
        instruction: 'What helps you see at night?',
        options: [
          { id: '1', label: 'flashlight', emoji: '🔦', correct: true },
          { id: '2', label: 'pillow', emoji: '🛏️', correct: false },
          { id: '3', label: 'cookie', emoji: '🍪', correct: false },
        ],
      },
      {
        text: 'What do you use to CUT paper?',
        instruction: 'What do you use to cut paper?',
        options: [
          { id: '1', label: 'scissors', emoji: '✂️', correct: true },
          { id: '2', label: 'spoon', emoji: '🥄', correct: false },
          { id: '3', label: 'brush', emoji: '🪥', correct: false },
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
      {
        text: 'Summer is HOT. Winter is…?',
        instruction: 'Summer is hot. Winter is what?',
        options: [
          { id: '1', label: 'cold', emoji: '❄️', correct: true },
          { id: '2', label: 'hot', emoji: '🔥', correct: false },
          { id: '3', label: 'rainy', emoji: '🌧️', correct: false },
        ],
      },
      {
        text: 'A teacher works at a…?',
        instruction: 'Where does a teacher work?',
        options: [
          { id: '1', label: 'school', emoji: '🏫', correct: true },
          { id: '2', label: 'hospital', emoji: '🏥', correct: false },
          { id: '3', label: 'store', emoji: '🏪', correct: false },
        ],
      },
      {
        text: 'Up is to DOWN as left is to…?',
        instruction: 'Up is to down as left is to what?',
        options: [
          { id: '1', label: 'right', emoji: '➡️', correct: true },
          { id: '2', label: 'up', emoji: '⬆️', correct: false },
          { id: '3', label: 'down', emoji: '⬇️', correct: false },
        ],
      },
      {
        text: 'How many LEGS does a spider have?',
        instruction: 'How many legs does a spider have?',
        options: [
          { id: '1', label: '6', emoji: '🐜', correct: false },
          { id: '2', label: '8', emoji: '🕷️', correct: true },
          { id: '3', label: '4', emoji: '🐶', correct: false },
        ],
      },
      {
        text: 'What season do LEAVES fall?',
        instruction: 'In what season do leaves fall?',
        options: [
          { id: '1', label: 'autumn', emoji: '🍂', correct: true },
          { id: '2', label: 'spring', emoji: '🌸', correct: false },
          { id: '3', label: 'summer', emoji: '☀️', correct: false },
        ],
      },
      {
        text: 'Happy is to SAD as big is to…?',
        instruction: 'Happy is to sad as big is to what?',
        options: [
          { id: '1', label: 'small', emoji: '🐜', correct: true },
          { id: '2', label: 'big', emoji: '🐘', correct: false },
          { id: '3', label: 'fast', emoji: '🚀', correct: false },
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
      {
        text: 'Pen is to WRITE as scissors is to…?',
        instruction: 'Pen is to write as scissors is to what?',
        options: [
          { id: '1', label: 'cut', emoji: '✂️', correct: true },
          { id: '2', label: 'draw', emoji: '🎨', correct: false },
          { id: '3', label: 'erase', emoji: '🧻', correct: false },
        ],
      },
      {
        text: 'Which needs SUNLIGHT to grow?',
        instruction: 'Which needs sunlight to grow?',
        options: [
          { id: '1', label: 'plant', emoji: '🌱', correct: true },
          { id: '2', label: 'chair', emoji: '🪑', correct: false },
          { id: '3', label: 'rock', emoji: '🪨', correct: false },
        ],
      },
      {
        text: 'Eye is to SEE as ear is to…?',
        instruction: 'Eye is to see as ear is to what?',
        options: [
          { id: '1', label: 'hear', emoji: '👂', correct: true },
          { id: '2', label: 'taste', emoji: '👅', correct: false },
          { id: '3', label: 'touch', emoji: '✋', correct: false },
        ],
      },
      {
        text: 'What has KEYS but no locks?',
        instruction: 'What has keys but no locks?',
        options: [
          { id: '1', label: 'piano', emoji: '🎹', correct: true },
          { id: '2', label: 'door', emoji: '🚪', correct: false },
          { id: '3', label: 'box', emoji: '📦', correct: false },
        ],
      },
      {
        text: 'A square has how many EQUAL sides?',
        instruction: 'How many equal sides does a square have?',
        options: [
          { id: '1', label: '4', emoji: '4️⃣', correct: true },
          { id: '2', label: '3', emoji: '3️⃣', correct: false },
          { id: '3', label: '6', emoji: '6️⃣', correct: false },
        ],
      },
      {
        text: 'Rain is to UMBRELLA as cold is to…?',
        instruction: 'Rain is to umbrella as cold is to what?',
        options: [
          { id: '1', label: 'coat', emoji: '🧥', correct: true },
          { id: '2', label: 'sunglasses', emoji: '🕶️', correct: false },
          { id: '3', label: 'shorts', emoji: '🩳', correct: false },
        ],
      },
    ],
    '9-10': [
      {
        text: 'All dogs are animals. Buddy is a dog. So Buddy is…?',
        instruction: 'All dogs are animals. Buddy is a dog. What is Buddy?',
        options: [
          { id: '1', label: 'an animal', emoji: '🐾', correct: true },
          { id: '2', label: 'a cat', emoji: '🐱', correct: false },
          { id: '3', label: 'a plant', emoji: '🌱', correct: false },
        ],
      },
      {
        text: 'Earth is to SUN as Moon is to…?',
        instruction: 'Earth orbits the Sun. Moon orbits what?',
        options: [
          { id: '1', label: 'Earth', emoji: '🌍', correct: true },
          { id: '2', label: 'Sun', emoji: '☀️', correct: false },
          { id: '3', label: 'Mars', emoji: '🔴', correct: false },
        ],
      },
      {
        text: 'If A > B and B > C, then…?',
        instruction: 'If A is greater than B and B is greater than C, what do we know?',
        options: [
          { id: '1', label: 'A > C', emoji: '📏', correct: true },
          { id: '2', label: 'C > A', emoji: '📐', correct: false },
          { id: '3', label: 'A = C', emoji: '🟰', correct: false },
        ],
      },
      {
        text: 'I have 4 sides, all equal, and 4 right angles. What am I?',
        instruction: 'I have 4 equal sides and 4 right angles. What shape am I?',
        options: [
          { id: '1', label: 'square', emoji: '🟦', correct: true },
          { id: '2', label: 'rectangle', emoji: '🟧', correct: false },
          { id: '3', label: 'diamond', emoji: '💎', correct: false },
        ],
      },
      {
        text: 'Author is to BOOK as composer is to…?',
        instruction: 'Author is to book as composer is to what?',
        options: [
          { id: '1', label: 'music', emoji: '🎵', correct: true },
          { id: '2', label: 'painting', emoji: '🎨', correct: false },
          { id: '3', label: 'movie', emoji: '🎬', correct: false },
        ],
      },
      {
        text: 'Water FREEZES at what temperature?',
        instruction: 'At what temperature does water freeze in Celsius?',
        options: [
          { id: '1', label: '100°C', emoji: '🔥', correct: false },
          { id: '2', label: '0°C', emoji: '❄️', correct: true },
          { id: '3', label: '50°C', emoji: '🌡️', correct: false },
        ],
      },
      {
        text: 'If all roses are flowers, are all flowers roses?',
        instruction: 'All roses are flowers. Are all flowers roses?',
        options: [
          { id: '1', label: 'No', emoji: '❌', correct: true },
          { id: '2', label: 'Yes', emoji: '✅', correct: false },
          { id: '3', label: 'Sometimes', emoji: '🤔', correct: false },
        ],
      },
      {
        text: 'Which weighs MORE: a ton of feathers or a ton of bricks?',
        instruction: 'Which weighs more: a ton of feathers or a ton of bricks?',
        options: [
          { id: '1', label: 'They weigh the same', emoji: '⚖️', correct: true },
          { id: '2', label: 'Bricks', emoji: '🧱', correct: false },
          { id: '3', label: 'Feathers', emoji: '🪶', correct: false },
        ],
      },
      {
        text: 'What has a HEAD and a TAIL but no body?',
        instruction: 'What has a head and a tail but no body?',
        options: [
          { id: '1', label: 'a coin', emoji: '🪙', correct: true },
          { id: '2', label: 'a snake', emoji: '🐍', correct: false },
          { id: '3', label: 'a bird', emoji: '🐦', correct: false },
        ],
      },
      {
        text: 'If some cats are black, are ALL cats black?',
        instruction: 'If some cats are black, are all cats black?',
        options: [
          { id: '1', label: 'No', emoji: '❌', correct: true },
          { id: '2', label: 'Yes', emoji: '✅', correct: false },
          { id: '3', label: 'Sometimes', emoji: '🤔', correct: false },
        ],
      },
      {
        text: 'Speed is DISTANCE divided by…?',
        instruction: 'Speed equals distance divided by what?',
        options: [
          { id: '1', label: 'time', emoji: '⏰', correct: true },
          { id: '2', label: 'weight', emoji: '⚖️', correct: false },
          { id: '3', label: 'height', emoji: '📏', correct: false },
        ],
      },
      {
        text: 'Gravity pulls objects toward the…?',
        instruction: 'Gravity pulls objects toward what?',
        options: [
          { id: '1', label: 'center of Earth', emoji: '🌍', correct: true },
          { id: '2', label: 'sky', emoji: '☁️', correct: false },
          { id: '3', label: 'moon', emoji: '🌙', correct: false },
        ],
      },
      {
        text: 'Leaf is to TREE as petal is to…?',
        instruction: 'Leaf is to tree as petal is to what?',
        options: [
          { id: '1', label: 'flower', emoji: '🌺', correct: true },
          { id: '2', label: 'grass', emoji: '🌿', correct: false },
          { id: '3', label: 'rock', emoji: '🪨', correct: false },
        ],
      },
      {
        text: 'What fraction of an HOUR is 15 minutes?',
        instruction: 'What fraction of an hour is 15 minutes?',
        options: [
          { id: '1', label: 'one quarter', emoji: '¼', correct: true },
          { id: '2', label: 'one half', emoji: '½', correct: false },
          { id: '3', label: 'one third', emoji: '⅓', correct: false },
        ],
      },
      {
        text: 'Evaporation turns water into…?',
        instruction: 'Evaporation turns water into what?',
        options: [
          { id: '1', label: 'water vapor', emoji: '🌫️', correct: true },
          { id: '2', label: 'ice', emoji: '🧊', correct: false },
          { id: '3', label: 'mud', emoji: '🟤', correct: false },
        ],
      },
      {
        text: 'The LARGEST planet in our solar system is…?',
        instruction: 'What is the largest planet in our solar system?',
        options: [
          { id: '1', label: 'Jupiter', emoji: '🪐', correct: true },
          { id: '2', label: 'Earth', emoji: '🌍', correct: false },
          { id: '3', label: 'Mars', emoji: '🔴', correct: false },
        ],
      },
    ],
  };

/**
 * Logic Game — teaches reasoning, cause-effect, and problem solving
 *
 * Pedagogical approach:
 * - Builds higher-order thinking progressively
 * - Real-world scenarios make abstract logic concrete
 * - Questions feel like fun riddles, not tests
 */
export const LogicGame: React.FC<LogicGameProps> = ({
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
    const prompts = [qBase.text, `Think about this: ${qBase.text}`, `Brain boost: ${qBase.text}`];
    return {
      ...qBase,
      text: prompts[(sessionRound + currentQuestion) % prompts.length],
      options: seededShuffle(qBase.options, sessionRound * 1000 + currentQuestion + 53),
    };
  }, [qBase, sessionRound, currentQuestion]);

  useEffect(() => {
    return speakQuestion(q.instruction);
  }, [currentQuestion, speakQuestion, q.instruction]);

  const handleOptionPress = async (option: LogicOption) => {
    if (selectedId) return;
    setSelectedId(option.id);
    setAnswerResult(option.correct ? 'correct' : 'wrong');

    if (option.correct) {
      await handleCorrectAnswer(option.label, onCorrect, () => {
        fadeToNextQuestion(() => {
          setSelectedId(null);
          setAnswerResult(null);
          setCurrentQuestion((p) => p + 1);
        });
      });
    } else {
      await handleWrongAnswer(option.label, onWrong);
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
        <VoiceButton text={q.instruction} style={styles.voiceButton} />
      </View>

      <Animated.View style={{ opacity: contentOpacity, width: '100%' }}>
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
                accessibilityLabel={option.label}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Text style={styles.optionLabel}>{option.label}</Text>
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

export default LogicGame;
