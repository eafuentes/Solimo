import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { GameScrollContainer } from '../GameScrollContainer';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import { createSeededRng, getSessionQuestionOrder, seededInt, seededShuffle } from '../../lib/gameUtils';
import { useGameFeedback, getHintThreshold } from '../../hooks/useGameFeedback';

interface NumberOption {
  id: string;
  label: string;
  value: number;
  correct: boolean;
}

interface NumbersGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  sessionRound?: number;
  onCorrect: () => void;
  onWrong: () => void;
}

interface NumberQuestion {
  text: string;
  voiceText?: string;
  visual?: string;
  options: NumberOption[];
}

function makeNumberOptions(correct: number, rng: () => number, maxVal = 30): NumberOption[] {
  const values = new Set<number>([correct]);
  const nearby = [correct - 1, correct + 1, correct - 2, correct + 2, correct + 3, correct - 3];

  for (const value of seededShuffle(nearby, seededInt(rng, 1, 99999))) {
    if (value >= 1 && value <= maxVal && values.size < 3) values.add(value);
  }

  while (values.size < 3) {
    values.add(seededInt(rng, 1, maxVal));
  }

  return seededShuffle(Array.from(values), seededInt(rng, 1, 99999)).map((value, index) => ({
    id: `${index + 1}`,
    label: `${value}`,
    value,
    correct: value === correct,
  }));
}

function buildNumbersQuestions(ageBand: AgeBand, sessionRound: number): NumberQuestion[] {
  const ageSeedMap: Record<AgeBand, number> = { '3-4': 101, '5-6': 202, '7-8': 303, '9-10': 404 };
  const rng = createSeededRng(ageSeedMap[ageBand] + sessionRound * 997);
  const questions: NumberQuestion[] = [];

  if (ageBand === '3-4') {
    const items = [
      { singular: 'apple', plural: 'apples', emoji: '🍎' },
      { singular: 'star', plural: 'stars', emoji: '⭐' },
      { singular: 'heart', plural: 'hearts', emoji: '❤️' },
      { singular: 'fish', plural: 'fish', emoji: '🐟' },
      { singular: 'sun', plural: 'suns', emoji: '☀️' },
      { singular: 'flower', plural: 'flowers', emoji: '🌸' },
    ];

    for (let i = 0; i < 6; i++) {
      const item = items[i % items.length];
      const count = seededInt(rng, 1, 6);
      questions.push({
        text: `How many ${count === 1 ? item.singular : item.plural}?`,
        visual: Array.from({ length: count }, () => item.emoji).join(''),
        options: makeNumberOptions(count, rng),
      });
    }
  } else if (ageBand === '5-6') {
    for (let i = 0; i < 6; i++) {
      const isAddition = rng() > 0.35;
      if (isAddition) {
        const a = seededInt(rng, 1, 8);
        const b = seededInt(rng, 1, 8);
        const correct = a + b;
        questions.push({
          text: `What is ${a} + ${b}?`,
          options: makeNumberOptions(correct, rng),
        });
      } else {
        const count = seededInt(rng, 4, 10);
        const emojis = ['🐝', '🎈', '🍪', '🚗', '⚽'];
        const emoji = emojis[seededInt(rng, 0, emojis.length - 1)];
        questions.push({
          text: 'How many are there?',
          visual: Array.from({ length: count }, () => emoji).join(''),
          options: makeNumberOptions(count, rng),
        });
      }
    }
  } else if (ageBand === '9-10') {
    // 4th-5th grade: multiplication, division, fractions, order of operations
    for (let i = 0; i < 8; i++) {
      const mode = seededInt(rng, 0, 4);

      if (mode === 0) {
        // Multiplication
        const a = seededInt(rng, 3, 12);
        const b = seededInt(rng, 2, 9);
        const correct = a * b;
        questions.push({ text: `What is ${a} × ${b}?`, voiceText: `What is ${a} times ${b}?`, options: makeNumberOptions(correct, rng, 120) });
      } else if (mode === 1) {
        // Division (clean divisible)
        const b = seededInt(rng, 2, 9);
        const correct = seededInt(rng, 2, 10);
        const a = b * correct;
        questions.push({ text: `What is ${a} ÷ ${b}?`, voiceText: `What is ${a} divided by ${b}?`, options: makeNumberOptions(correct, rng, 50) });
      } else if (mode === 2) {
        // Simple fractions: what is half of / third of / quarter of
        const fractions = [
          { label: 'half', divisor: 2 },
          { label: 'a third', divisor: 3 },
          { label: 'a quarter', divisor: 4 },
        ];
        const frac = fractions[seededInt(rng, 0, fractions.length - 1)];
        const correct = seededInt(rng, 2, 10);
        const whole = correct * frac.divisor;
        questions.push({ text: `What is ${frac.label} of ${whole}?`, options: makeNumberOptions(correct, rng, 50) });
      } else if (mode === 3) {
        // Order of operations: a + b × c
        const a = seededInt(rng, 1, 8);
        const b = seededInt(rng, 2, 5);
        const c = seededInt(rng, 2, 5);
        const correct = a + b * c;
        questions.push({ text: `What is ${a} + ${b} × ${c}?`, voiceText: `What is ${a} plus ${b} times ${c}?`, options: makeNumberOptions(correct, rng, 60) });
      } else {
        // Larger addition/subtraction
        const a = seededInt(rng, 20, 80);
        const b = seededInt(rng, 10, 40);
        if (rng() > 0.5) {
          const correct = a + b;
          questions.push({ text: `What is ${a} + ${b}?`, options: makeNumberOptions(correct, rng, 150) });
        } else {
          const big = Math.max(a, b);
          const small = Math.min(a, b);
          const correct = big - small;
          questions.push({ text: `What is ${big} - ${small}?`, options: makeNumberOptions(correct, rng, 80) });
        }
      }
    }
  } else {
    for (let i = 0; i < 6; i++) {
      const mode = seededInt(rng, 0, 2);

      if (mode === 0) {
        const a = seededInt(rng, 6, 18);
        const b = seededInt(rng, 3, 12);
        const correct = a + b;
        questions.push({ text: `What is ${a} + ${b}?`, options: makeNumberOptions(correct, rng) });
      } else if (mode === 1) {
        const a = seededInt(rng, 10, 20);
        const b = seededInt(rng, 3, 9);
        const correct = a - b;
        questions.push({ text: `What is ${a} - ${b}?`, options: makeNumberOptions(correct, rng) });
      } else {
        const a = seededInt(rng, 4, 15);
        const b = seededInt(rng, 4, 15);
        const correct = Math.max(a, b);
        questions.push({
          text: `Which is BIGGER: ${a} or ${b}?`,
          options: makeNumberOptions(correct, rng),
        });
      }
    }
  }

  return questions;
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
  sessionRound = 1,
  onCorrect,
  onWrong,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { scaleAnim, contentOpacity, speakQuestion, handleCorrectAnswer, handleWrongAnswer, fadeToNextQuestion, speakHint } = useGameFeedback();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hintGiven, setHintGiven] = useState(false);
  const questions = useMemo(() => buildNumbersQuestions(ageBand, sessionRound), [ageBand, sessionRound]);

  const questionOrder = useMemo(
    () => getSessionQuestionOrder(questions.length, sessionRound),
    [questions.length, sessionRound]
  );
  const q = questions[questionOrder[currentQuestion % questionOrder.length]];

  const spokenText = q.voiceText ?? q.text;

  useEffect(() => {
    return speakQuestion(spokenText);
  }, [currentQuestion, speakQuestion, spokenText]);

  // Reset wrong-attempt tracking on each new question
  useEffect(() => {
    setWrongAttempts(0);
    setHintGiven(false);
  }, [currentQuestion]);

  const handleOptionPress = async (option: NumberOption) => {
    if (selectedId) return;
    setSelectedId(option.id);
    setAnswerResult(option.correct ? 'correct' : 'wrong');

    if (option.correct) {
      setWrongAttempts(0);
      await handleCorrectAnswer(option.label, onCorrect, () => {
        fadeToNextQuestion(() => {
          setSelectedId(null);
          setAnswerResult(null);
          setCurrentQuestion((p) => p + 1);
        });
      });
    } else {
      const newAttempts = wrongAttempts + 1;
      setWrongAttempts(newAttempts);
      await handleWrongAnswer(option.label, onWrong);

      if (!hintGiven && newAttempts >= getHintThreshold(difficulty)) {
        setHintGiven(true);
        const hint = q.text.includes('+')
          ? `Try adding the numbers together!`
          : q.text.includes('-')
          ? `Try taking the small number away from the big one!`
          : q.text.includes('×')
          ? `Try multiplying the numbers!`
          : q.text.includes('÷')
          ? `Think about how many times one number fits into the other!`
          : q.text.includes('BIGGER')
          ? `Look carefully at both numbers. Which one is more?`
          : q.text.includes('half') || q.text.includes('third') || q.text.includes('quarter')
          ? `Try splitting the big number into equal parts!`
          : q.visual
          ? `Try counting each one slowly!`
          : `Take your time and think about it!`;
        await speakHint(hint);
      }

      setTimeout(() => {
        setSelectedId(null);
        setAnswerResult(null);
      }, 200);
    }
  };

  return (
    <GameScrollContainer backgroundColor="#FFFDE7">
      <View style={styles.headerSection}>
        <Text style={styles.questionText}>{q.text}</Text>
        <VoiceButton text={spokenText} style={styles.voiceButton} />
      </View>

      <Animated.View style={{ opacity: contentOpacity, width: '100%', alignItems: 'center' }}>
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
                style={[
                  styles.optionButton,
                  selectedId === option.id && answerResult === 'correct' && styles.correctHighlight,
                  selectedId === option.id && answerResult === 'wrong' && styles.wrongHighlight,
                ]}
                activeOpacity={0.7}
                disabled={selectedId !== null}
                accessibilityLabel={`Number ${option.label}`}
              >
                <Text style={styles.optionNumber}>{option.label}</Text>
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

export default NumbersGame;
