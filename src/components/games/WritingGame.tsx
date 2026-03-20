import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AgeBand } from '../../types';
import { useGameFeedback, getHintThreshold } from '../../hooks/useGameFeedback';
import { getSessionQuestionOrder, seededShuffle } from '../../lib/gameUtils';
import { VoiceButton } from '../VoiceButton';
import { TracingCanvas, CRAYON_COLORS } from './writing/TracingCanvas';
import { StrokeGuide } from './writing/StrokeGuide';
import {
  getCharacterPool,
  getToleranceForAge,
  getStrokeWidthForAge,
  CharacterData,
  SPELLING_CHALLENGES,
  SPELLING_CHALLENGES_78,
  SpellingChallenge,
} from './writing/letterPaths';
import {
  getPassingScore,
  getGuideOpacity,
  scoreToFeedback,
  TraceScore,
} from './writing/writingUtils';

interface WritingGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  sessionRound?: number;
  onCorrect: () => void;
  onWrong: () => void;
}

const TOTAL_QUESTIONS = 5;

/**
 * WritingGame — kids trace letters, numbers, and shapes with their finger.
 *
 * Pedagogical approach:
 * - Age 3-4: Pre-writing strokes (lines, circles, zigzags)
 * - Age 5-6: Numbers 0-9 and first uppercase letters
 * - Age 7-8: Full alphabet uppercase + lowercase
 * - Age 9-10: Confusing letter pairs + spelling challenges (one letter at a time, no label shown)
 *
 * Each character:
 * 1. Shows an animated stroke demo (dot traces the path)
 * 2. Presents dotted guide at difficulty-scaled opacity
 * 3. Child traces with finger (crayon-style colored trail)
 * 4. Score computed by path proximity
 * 5. Positive feedback always — never punitive
 *
 * Multi-stroke characters (e.g., "A" = 3 strokes) are traced sequentially.
 */
export function WritingGame({
  ageBand,
  difficulty,
  sessionRound = 1,
  onCorrect,
  onWrong,
}: WritingGameProps) {
  const { width: screenWidth } = useWindowDimensions();
  const {
    scaleAnim,
    contentOpacity,
    speakQuestion,
    handleGenericCorrect,
    handleGenericWrong,
    fadeToNextQuestion,
    speakHint,
  } = useGameFeedback();

  // ── State ─────────────────────────────────────────────────────

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [activeStroke, setActiveStroke] = useState(0);
  const [showDemo, setShowDemo] = useState(true);
  const [canDraw, setCanDraw] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [selectedColor, setSelectedColor] = useState(CRAYON_COLORS[0]);
  const [canvasKey, setCanvasKey] = useState(0);
  const [demoKey, setDemoKey] = useState(0);
  const [strokeResults, setStrokeResults] = useState<TraceScore[]>([]);
  const [acceptedPaths, setAcceptedPaths] = useState<Array<{ d: string; color: string }>>([]);
  const [feedback, setFeedback] = useState<{ text: string; emoji: string; passed: boolean } | null>(null);
  const feedbackTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up feedback timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    };
  }, []);

  // Scramble state for spelling questions
  const [tileLetters, setTileLetters] = useState<string[]>([]);
  const [answerSlots, setAnswerSlots] = useState<(number | null)[]>([]);
  const [scrambleWrong, setScrambleWrong] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // ── Build question set ────────────────────────────────────────

  type GameQuestion =
    | { kind: 'single'; char: CharacterData }
    | { kind: 'spelling'; challenge: SpellingChallenge };

  const gameQuestions: GameQuestion[] = useMemo(() => {
    const seed = 601 + sessionRound * 997;

    if (ageBand === '9-10') {
      // Mix confusing-pair characters with spelling challenges
      const pool = getCharacterPool(ageBand);
      const validChars = pool.filter((c) => c.strokes.length > 0);
      const shuffledChars = seededShuffle(validChars, seed);
      const pickedChars = shuffledChars.slice(0, 3);

      // Pick 2 spelling challenges
      const shuffledSpelling = seededShuffle([...SPELLING_CHALLENGES], seed + 1);
      const pickedSpelling = shuffledSpelling.slice(0, 2);

      // Interleave: spelling1, char, spelling2, char, char
      return [
        { kind: 'spelling' as const, challenge: pickedSpelling[0] },
        { kind: 'single' as const, char: pickedChars[0] },
        { kind: 'spelling' as const, challenge: pickedSpelling[1] },
        ...pickedChars.slice(1).map((c) => ({ kind: 'single' as const, char: c })),
      ];
    }

    if (ageBand === '7-8') {
      // Mix characters with simple 3-letter spelling challenges
      const pool = getCharacterPool(ageBand);
      const validChars = pool.filter((c) => c.strokes.length > 0);
      const shuffledChars = seededShuffle(validChars, seed);
      const pickedChars = shuffledChars.slice(0, 3);

      const shuffledSpelling = seededShuffle([...SPELLING_CHALLENGES_78], seed + 1);
      const pickedSpelling = shuffledSpelling.slice(0, 2);

      // Interleave: char, spelling, char, spelling, char
      return [
        { kind: 'single' as const, char: pickedChars[0] },
        { kind: 'spelling' as const, challenge: pickedSpelling[0] },
        { kind: 'single' as const, char: pickedChars[1] },
        { kind: 'spelling' as const, challenge: pickedSpelling[1] },
        { kind: 'single' as const, char: pickedChars[2] },
      ];
    }

    // Standard pool for other ages
    const pool = getCharacterPool(ageBand);
    const valid = pool.filter((c) => c.strokes.length > 0);
    if (valid.length === 0) return [];
    const shuffled = seededShuffle(valid, seed);
    return shuffled
      .slice(0, Math.min(TOTAL_QUESTIONS, shuffled.length))
      .map((c) => ({ kind: 'single' as const, char: c }));
  }, [ageBand, sessionRound]);

  const questionOrder = useMemo(
    () => {
      // For 7-8 and 9-10, questions are already pre-ordered (interleaved)
      if (ageBand === '7-8' || ageBand === '9-10') {
        return Array.from({ length: gameQuestions.length }, (_, i) => i);
      }
      return getSessionQuestionOrder(gameQuestions.length, sessionRound);
    },
    [gameQuestions.length, sessionRound, ageBand],
  );

  // ── Derived values ────────────────────────────────────────────

  const currentQ = gameQuestions[questionOrder[currentQuestion] ?? 0];
  const spellingActive = currentQ?.kind === 'spelling';
  const currentChar: CharacterData | undefined =
    currentQ?.kind === 'single' ? currentQ.char : undefined;

  const tolerance = getToleranceForAge(ageBand);
  const trailWidth = getStrokeWidthForAge(ageBand);
  const guideOpacity = getGuideOpacity(difficulty);
  const passingScore = getPassingScore(difficulty);
  const hintThreshold = getHintThreshold(difficulty);

  // Canvas size: use most of screen width, max 400pt
  const canvasSize = Math.min(screenWidth - 48, 400);

  // ── Speak question on mount / question change ─────────────────

  useEffect(() => {
    if (!currentQ) return;
    setShowDemo(true);
    setCanDraw(false);
    setActiveStroke(0);
    setWrongAttempts(0);
    setStrokeResults([]);
    setAcceptedPaths([]);
    setFeedback(null);
    setCanvasKey((k) => k + 1);
    setScrambleWrong(false);

    // Set up scramble for spelling questions
    if (currentQ.kind === 'spelling') {
      const word = currentQ.challenge.word;
      const seed = 401 + currentQuestion * 113 + sessionRound * 47;

      // Word letters + 2 distractor letters for extra challenge
      const wordLetters = word.split('');
      const wordSet = new Set(wordLetters);
      const candidates = 'etaoinshrdlcumwfgypbvk'.split('').filter((l) => !wordSet.has(l));
      const distractors = seededShuffle([...candidates], seed + 7).slice(0, 2);
      const allTiles = [...wordLetters, ...distractors];

      // Shuffle all tiles together
      const shuffled = seededShuffle(allTiles, seed);
      setTileLetters(shuffled);
      setAnswerSlots(new Array(word.length).fill(null));
    }

    // Speak instruction
    const instruction = currentQ.kind === 'spelling'
      ? currentQ.challenge.instruction
      : currentQ.char.instruction;
    const cancel = speakQuestion(instruction, 300);
    return cancel;
  }, [currentQuestion]);

  // ── Handlers ──────────────────────────────────────────────────

  const handleDemoComplete = useCallback(() => {
    setShowDemo(false);
    setCanDraw(true);
  }, []);

  const handleStrokeComplete = useCallback(
    (result: TraceScore, segments: Array<{ d: string; color: string }>) => {
      if (!currentChar) return;

      const newResults = [...strokeResults, result];
      setStrokeResults(newResults);

      const fb = scoreToFeedback(result);
      setFeedback(fb);
      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => setFeedback(null), 2500);

      if (result.passed) {
        setAcceptedPaths((prev) => [...prev, ...segments]);

        const nextStroke = activeStroke + 1;
        if (nextStroke >= currentChar.strokes.length) {
          handleGenericCorrect(onCorrect, () => {
            fadeToNextQuestion(() => {
              setCurrentQuestion((q) => q + 1);
            });
          });
        } else {
          setActiveStroke(nextStroke);
          setShowDemo(true);
          setCanDraw(false);
        }
      } else {
        const newWrong = wrongAttempts + 1;
        setWrongAttempts(newWrong);
        onWrong();

        if (newWrong >= hintThreshold && currentChar.hint) {
          speakHint(currentChar.hint);
        } else {
          handleGenericWrong(() => {});
        }

        // Don't remount the canvas — keep the kid's drawing visible so they
        // can keep tracing on top of what they already drew.
        setTimeout(() => {
          setStrokeResults(newResults.slice(0, -1));
        }, 1200);
      }
    },
    [
      currentChar,
      activeStroke,
      strokeResults,
      wrongAttempts,
      hintThreshold,
      onCorrect,
      onWrong,
    ],
  );

  const handleRetry = useCallback(() => {
    setActiveStroke(0);
    setStrokeResults([]);
    setAcceptedPaths([]);
    setFeedback(null);
    setCanvasKey((k) => k + 1);
    setShowDemo(true);
    setCanDraw(false);
  }, []);

  const handleShowDemo = useCallback(() => {
    setShowDemo(true);
    setCanDraw(false);
    setDemoKey((k) => k + 1);
  }, []);

  // ── Scramble handlers ──────────────────────────────────────────

  /** Tap a scrambled letter tile → place in next empty answer slot */
  const handleTileTap = useCallback(
    (tileIdx: number) => {
      if (!currentQ || currentQ.kind !== 'spelling') return;
      if (scrambleWrong) return; // still showing wrong feedback

      const word = currentQ.challenge.word;
      const nextEmpty = answerSlots.indexOf(null);
      if (nextEmpty === -1) return; // all slots filled

      const newSlots = [...answerSlots];
      newSlots[nextEmpty] = tileIdx;
      setAnswerSlots(newSlots);

      // Check if all slots are filled
      if (newSlots.every((s) => s !== null)) {
        const built = newSlots.map((si) => tileLetters[si!]).join('');
        if (built === word) {
          // Correct!
          setFeedback({ text: `You spelled "${word}"!`, emoji: '🎉', passed: true });
          handleGenericCorrect(onCorrect, () => {
            fadeToNextQuestion(() => {
              setCurrentQuestion((q) => q + 1);
            });
          });
        } else {
          // Wrong — shake and reset
          setScrambleWrong(true);
          setFeedback({ text: 'Try again!', emoji: '🔄', passed: false });
          onWrong();
          Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
          ]).start(() => {
            setTimeout(() => {
              setAnswerSlots(new Array(word.length).fill(null));
              setScrambleWrong(false);
              setFeedback(null);
            }, 600);
          });
        }
      }
    },
    [currentQ, answerSlots, tileLetters, scrambleWrong, onCorrect, onWrong, shakeAnim],
  );

  /** Tap an answer slot → remove letter, send it back to the pool */
  const handleSlotTap = useCallback(
    (slotIdx: number) => {
      if (scrambleWrong) return;
      if (answerSlots[slotIdx] === null) return;
      const newSlots = [...answerSlots];
      newSlots[slotIdx] = null;
      setAnswerSlots(newSlots);
    },
    [answerSlots, scrambleWrong],
  );

  // ── Guard: no questions available ─────────────────────────────

  if ((!currentChar && !spellingActive) || !currentQ || gameQuestions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>🎉 Great practice today!</Text>
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────

  // Helper: which scrambled tile indices are already placed in answer slots?
  const usedTiles = new Set(answerSlots.filter((s): s is number => s !== null));

  return (
    <GestureHandlerRootView style={styles.container}>
      <Animated.View
        style={[styles.content, { opacity: contentOpacity, transform: [{ scale: scaleAnim }] }]}
      >
        {/* ─── SCRAMBLE PUZZLE (spelling) ─── */}
        {spellingActive && currentQ.kind === 'spelling' ? (
          <>
            {/* Instruction + voice */}
            <View style={styles.instructionRow}>
              <Text style={styles.instructionText}>🧩 Unscramble the word!</Text>
              <VoiceButton text={currentQ.challenge.word} voiceType="question" />
            </View>

            {/* Answer slots — tap to remove */}
            <Animated.View style={[styles.answerRow, { transform: [{ translateX: shakeAnim }] }]}>
              {answerSlots.map((scrambleIdx, slotIdx) => (
                <TouchableOpacity
                  key={slotIdx}
                  onPress={() => handleSlotTap(slotIdx)}
                  activeOpacity={0.7}
                  style={[
                    styles.answerSlot,
                    scrambleIdx !== null && styles.answerSlotFilled,
                    scrambleWrong && scrambleIdx !== null && styles.answerSlotWrong,
                  ]}
                >
                  <Text style={[
                    styles.answerSlotText,
                    scrambleIdx !== null && styles.answerSlotTextFilled,
                  ]}>
                    {scrambleIdx !== null ? tileLetters[scrambleIdx] : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>

            {/* Scrambled letter tiles — tap to place */}
            <View style={styles.tilesRow}>
              {tileLetters.map((letter, tileIdx) => {
                const used = usedTiles.has(tileIdx);
                return (
                  <TouchableOpacity
                    key={tileIdx}
                    onPress={() => !used && handleTileTap(tileIdx)}
                    activeOpacity={used ? 1 : 0.7}
                    style={[styles.letterTile, used && styles.letterTileUsed]}
                  >
                    <Text style={[styles.letterTileText, used && styles.letterTileTextUsed]}>
                      {letter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Feedback toast */}
            {feedback && (
              <View
                style={[
                  styles.feedbackToast,
                  feedback.passed ? styles.feedbackPassed : styles.feedbackRetry,
                  { marginTop: 16 },
                ]}
              >
                <Text style={styles.feedbackEmoji}>{feedback.emoji}</Text>
                <Text
                  style={[
                    styles.feedbackText,
                    feedback.passed ? styles.feedbackTextPassed : styles.feedbackTextRetry,
                  ]}
                >
                  {feedback.text}
                </Text>
              </View>
            )}

            {/* Hear again button */}
            <View style={[styles.actionRow, { marginTop: 16 }]}>
              <TouchableOpacity
                onPress={() => speakQuestion(currentQ.challenge.word, 0)}
                style={styles.actionButton}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>🔊 Hear again</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : currentChar ? (
          <>
            {/* ─── TRACING (single character) ─── */}
            {/* Instruction */}
            <View style={styles.instructionRow}>
              <Text style={styles.instructionText} numberOfLines={2}>
                {currentChar.instruction}
              </Text>
              <VoiceButton text={currentChar.instruction} voiceType="question" />
            </View>

            {/* Large character label — hidden for 9-10 */}
            {ageBand !== '9-10' && (
              <Text style={styles.characterLabel}>{currentChar.label}</Text>
            )}

            {/* Stroke progress for multi-stroke characters */}
            {currentChar.strokes.length > 1 && (
              <Text style={styles.strokeProgress}>
                Stroke {Math.min(activeStroke + 1, currentChar.strokes.length)} of{' '}
                {currentChar.strokes.length}
              </Text>
            )}

            {/* Canvas */}
            <View style={[styles.canvasWrapper, { width: canvasSize, height: canvasSize }]}>
              <TracingCanvas
                key={canvasKey}
                guideStrokes={currentChar.strokes}
                activeStroke={activeStroke}
                guideOpacity={guideOpacity}
                strokeWidth={trailWidth}
                strokeColor={selectedColor}
                tolerance={tolerance}
                difficulty={difficulty}
                frozenPaths={acceptedPaths}
                onStrokeComplete={handleStrokeComplete}
                onStrokeStart={() => { setShowDemo(false); setCanDraw(true); }}
              />
              {showDemo && currentChar.strokes[activeStroke] && (
                <StrokeGuide
                  key={`demo-${activeStroke}-${demoKey}`}
                  strokePath={currentChar.strokes[activeStroke]}
                  playing={showDemo}
                  onComplete={handleDemoComplete}
                />
              )}
            </View>

            {/* Toolbar */}
            <View style={styles.toolbar}>
              {feedback && (
                <View
                  style={[
                    styles.feedbackToast,
                    feedback.passed ? styles.feedbackPassed : styles.feedbackRetry,
                  ]}
                >
                  <Text style={styles.feedbackEmoji}>{feedback.emoji}</Text>
                  <Text
                    style={[
                      styles.feedbackText,
                      feedback.passed ? styles.feedbackTextPassed : styles.feedbackTextRetry,
                    ]}
                  >
                    {feedback.text}
                  </Text>
                </View>
              )}
              <View style={styles.colorRow}>
                {CRAYON_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorButtonActive,
                    ]}
                    activeOpacity={0.7}
                  />
                ))}
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  onPress={handleShowDemo}
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionButtonText}>👁️ Show me</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleRetry}
                  style={styles.actionButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.actionButtonText}>🔄 Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : null}
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    flex: 1,
  },
  characterLabel: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFD93D',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    marginBottom: 2,
  },
  strokeProgress: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    marginBottom: 6,
  },
  canvasWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  toolbar: {
    width: '100%',
    maxWidth: 400,
    marginTop: 12,
    gap: 10,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: '#1a1a1a',
    borderWidth: 3,
    transform: [{ scale: 1.15 }],
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#888',
    textAlign: 'center',
    marginTop: 60,
  },
  feedbackToast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignSelf: 'center',
  },
  feedbackPassed: {
    backgroundColor: '#DCFCE7',
    borderWidth: 2,
    borderColor: '#86EFAC',
  },
  feedbackRetry: {
    backgroundColor: '#FFF3CD',
    borderWidth: 2,
    borderColor: '#FFD93D',
  },
  feedbackEmoji: {
    fontSize: 22,
  },
  feedbackText: {
    fontSize: 15,
    fontWeight: '700',
  },
  feedbackTextPassed: {
    color: '#166534',
  },
  feedbackTextRetry: {
    color: '#92400E',
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 24,
  },
  answerSlot: {
    width: 52,
    height: 58,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  answerSlotFilled: {
    borderColor: '#60A5FA',
    borderStyle: 'solid',
    backgroundColor: '#EFF6FF',
  },
  answerSlotWrong: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFF0F0',
  },
  answerSlotText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D1D5DB',
    textTransform: 'uppercase',
  },
  answerSlotTextFilled: {
    color: '#1E40AF',
  },
  tilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  letterTile: {
    width: 56,
    height: 62,
    borderRadius: 16,
    backgroundColor: '#FFD93D',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  letterTileUsed: {
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0,
    elevation: 0,
  },
  letterTileText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#1a1a1a',
    textTransform: 'uppercase',
  },
  letterTileTextUsed: {
    color: '#D1D5DB',
  },
});
