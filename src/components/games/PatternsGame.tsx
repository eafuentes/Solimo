import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import { createSeededRng, getSessionQuestionOrder, seededInt, seededShuffle } from '../../lib/gameUtils';
import { useGameFeedback } from '../../hooks/useGameFeedback';

interface PatternOption {
  id: string;
  label: string;
  correct: boolean;
}

interface PatternsGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  sessionRound?: number;
  onCorrect: () => void;
  onWrong: () => void;
}

interface PatternQuestion {
  text: string;
  pattern: string;
  options: PatternOption[];
}

function makePatternOptions(correct: string, distractors: string[], seed: number): PatternOption[] {
  const labels = seededShuffle([correct, ...distractors.slice(0, 2)], seed);
  return labels.map((label, index) => ({
    id: `${index + 1}`,
    label,
    correct: label === correct,
  }));
}

function buildPatternQuestions(ageBand: AgeBand, sessionRound: number): PatternQuestion[] {
  const ageSeedMap: Record<AgeBand, number> = { '3-4': 404, '5-6': 505, '7-8': 606, '9-10': 707 };
  const rng = createSeededRng(ageSeedMap[ageBand] + sessionRound * 997);
  const questions: PatternQuestion[] = [];

  if (ageBand === '3-4') {
    const emojiPairs = [
      ['🔴', '🔵'],
      ['⭐', '🌙'],
      ['🍎', '🍌'],
      ['🐱', '🐶'],
      ['❤️', '💙'],
      ['🟡', '🟢'],
    ];

    for (let i = 0; i < 6; i++) {
      const [a, b] = emojiPairs[seededInt(rng, 0, emojiPairs.length - 1)];
      const correct = b;
      questions.push({
        text: 'What comes next?',
        pattern: `${a} ${b} ${a} ${b} ${a} ❓`,
        options: makePatternOptions(correct, seededShuffle([a, '🟣', '🟠', '💚'], i + sessionRound), i + sessionRound),
      });
    }
  } else if (ageBand === '5-6') {
    const triplets = [
      ['🔴', '🔵', '🟢'],
      ['🍎', '🍊', '🍋'],
      ['⬆️', '➡️', '⬇️'],
      ['🐶', '🐱', '🐰'],
    ];

    for (let i = 0; i < 6; i++) {
      const useTriplet = rng() > 0.5;
      if (useTriplet) {
        const [a, b, c] = triplets[seededInt(rng, 0, triplets.length - 1)];
        const correct = b;
        questions.push({
          text: 'What comes next?',
          pattern: `${a} ${b} ${c} ${a} ${b} ${c} ${a} ❓`,
          options: makePatternOptions(correct, seededShuffle([a, c, '🔶', '🔷'], i + sessionRound * 3), i + sessionRound * 3),
        });
      } else {
        const [a, b] = seededShuffle(['🔺', '🔵', '🟡', '🟢'], seededInt(rng, 1, 9999)).slice(0, 2);
        const correct = b;
        questions.push({
          text: 'What comes next?',
          pattern: `${a} ${b} ${b} ${a} ${b} ${b} ${a} ❓`,
          options: makePatternOptions(correct, seededShuffle([a, '🔴', '🟣', '🟠'], i + sessionRound * 7), i + sessionRound * 7),
        });
      }
    }
  } else if (ageBand === '9-10') {
    // 4th-5th grade: geometric sequences, Fibonacci-like, input-output rules
    for (let i = 0; i < 8; i++) {
      const mode = seededInt(rng, 0, 3);
      if (mode === 0) {
        // Geometric sequence (multiply by 2 or 3)
        const multiplier = seededInt(rng, 2, 3);
        const start = seededInt(rng, 1, 4);
        const sequence = [start, start * multiplier, start * multiplier ** 2, start * multiplier ** 3];
        const correct = sequence[3] * multiplier;
        const distractors = [`${correct + multiplier}`, `${correct - 1}`, `${sequence[3] + sequence[2]}`];
        questions.push({
          text: `What number comes next?\n${sequence.join(', ')}, ?`,
          pattern: `${sequence.join('  ')}  ❓`,
          options: makePatternOptions(`${correct}`, seededShuffle(distractors, i + sessionRound * 13), i + sessionRound * 13),
        });
      } else if (mode === 1) {
        // Fibonacci-like (each number is sum of two before it)
        const a = seededInt(rng, 1, 3);
        const b = seededInt(rng, 1, 4);
        const sequence = [a, b, a + b, b + (a + b), (a + b) + (b + (a + b))];
        const correct = sequence[3] + sequence[4];
        const distractors = [`${correct + 1}`, `${correct - 2}`, `${sequence[4] * 2}`];
        questions.push({
          text: `Each number = sum of previous two.\n${sequence.join(', ')}, ?`,
          pattern: `${sequence.join('  ')}  ❓`,
          options: makePatternOptions(`${correct}`, seededShuffle(distractors, i + sessionRound * 15), i + sessionRound * 15),
        });
      } else if (mode === 2) {
        // Input-output rule (×n + c)
        const mult = seededInt(rng, 2, 4);
        const add = seededInt(rng, 0, 3);
        const inputs = [1, 2, 3, 4];
        const outputs = inputs.map((x) => x * mult + add);
        const correct = 5 * mult + add;
        const distractors = [`${correct + 1}`, `${correct - mult}`, `${correct + mult}`];
        const ruleHint = add > 0 ? `Rule: ×${mult} + ${add}` : `Rule: ×${mult}`;
        questions.push({
          text: `${ruleHint}\nInput 5 → Output ?`,
          pattern: inputs.map((x, idx) => `${x}→${outputs[idx]}`).join('  ') + '  5→❓',
          options: makePatternOptions(`${correct}`, seededShuffle(distractors, i + sessionRound * 17), i + sessionRound * 17),
        });
      } else {
        // Decreasing arithmetic sequence
        const start = seededInt(rng, 30, 60);
        const step = seededInt(rng, 3, 7);
        const sequence = [start, start - step, start - step * 2, start - step * 3];
        const correct = sequence[3] - step;
        const distractors = [`${correct + step}`, `${correct + 1}`, `${correct - step}`];
        questions.push({
          text: `What number comes next?\n${sequence.join(', ')}, ?`,
          pattern: `${sequence.join('  ')}  ❓`,
          options: makePatternOptions(`${correct}`, seededShuffle(distractors, i + sessionRound * 19), i + sessionRound * 19),
        });
      }
    }
  } else {
    for (let i = 0; i < 6; i++) {
      const mode = seededInt(rng, 0, 2);
      if (mode < 2) {
        const start = seededInt(rng, 1, 8);
        const step = mode === 0 ? seededInt(rng, 2, 4) : seededInt(rng, 3, 6);
        const sequence = [start, start + step, start + step * 2, start + step * 3];
        const correct = sequence[3] + step;
        const distractors = [`${correct - step}`, `${correct + 1}`, `${correct + step}`];
        questions.push({
          text: `What number comes next?\n${sequence.join(', ')}, ?`,
          pattern: `${sequence.join('  ')}  ❓`,
          options: makePatternOptions(`${correct}`, seededShuffle(distractors, i + sessionRound * 9), i + sessionRound * 9),
        });
      } else {
        const [a, b, c] = seededShuffle(['🔴', '🔵', '🟢', '🟣'], seededInt(rng, 1, 9999)).slice(0, 3);
        const correct = c;
        questions.push({
          text: 'What comes next?',
          pattern: `${a} ${b} ${c} ${a} ${b} ${c} ${a} ${b} ❓`,
          options: makePatternOptions(correct, seededShuffle([a, b, '🟠', '🟡'], i + sessionRound * 11), i + sessionRound * 11),
        });
      }
    }
  }

  return questions;
}

/**
 * Patterns Game — teaches pattern recognition and prediction
 *
 * Age 3-4: Simple AB patterns with colors/emojis
 * Age 5-6: ABB & ABC patterns, what comes next
 * Age 7-8: Number sequences, growing patterns
 *
 * Pedagogical approach:
 * - Visual pattern display with large, clear symbols
 * - "What comes next?" builds prediction skills
 * - Scaffolded from simple alternation to complex sequences
 * - Multi-modal: visual + spoken patterns
 * - Difficulty-aware hints: reveals correct answer after repeated wrong attempts
 */
export const PatternsGame: React.FC<PatternsGameProps> = ({
  ageBand,
  difficulty,
  sessionRound = 1,
  onCorrect,
  onWrong,
}) => {
  const insets = useSafeAreaInsets();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { scaleAnim, contentOpacity, speakQuestion, handleGenericCorrect, handleGenericWrong, fadeToNextQuestion } = useGameFeedback();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<'correct' | 'wrong' | null>(null);
  const questions = useMemo(() => buildPatternQuestions(ageBand, sessionRound), [ageBand, sessionRound]);

  const questionOrder = useMemo(
    () => getSessionQuestionOrder(questions.length, sessionRound),
    [questions.length, sessionRound]
  );
  const q = questions[questionOrder[currentQuestion % questionOrder.length]];

  useEffect(() => {
    return speakQuestion(q.text);
  }, [currentQuestion, speakQuestion, q.text]);

  const handleOptionPress = async (option: PatternOption) => {
    if (selectedId) return;
    setSelectedId(option.id);
    setAnswerResult(option.correct ? 'correct' : 'wrong');

    if (option.correct) {
      await handleGenericCorrect(onCorrect, () => {
        fadeToNextQuestion(() => {
          setSelectedId(null);
          setAnswerResult(null);
          setCurrentQuestion((p) => p + 1);
        });
      });
    } else {
      await handleGenericWrong(onWrong);
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
        <View style={styles.patternSection}>
          <Text style={styles.patternText}>{q.pattern}</Text>
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
                accessibilityLabel={`Option ${option.label}`}
              >
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
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
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
  patternSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  patternText: {
    fontSize: 36,
    letterSpacing: 4,
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
    minWidth: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#CE93D8',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  optionLabel: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
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

export default PatternsGame;
