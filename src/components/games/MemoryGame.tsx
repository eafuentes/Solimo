import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgeBand } from '../../types';
import { VoiceButton } from '../VoiceButton';
import { shuffleArray } from '../../lib/gameUtils';
import { useGameFeedback } from '../../hooks/useGameFeedback';

interface MemoryGameProps {
  ageBand: AgeBand;
  difficulty: 1 | 2 | 3;
  sessionRound?: number;
  onCorrect: () => void;
  onWrong: () => void;
}

interface MemoryCard {
  id: string;
  emoji: string;
  pairId: string;
  flipped: boolean;
  matched: boolean;
}

/**
 * Get themed emoji sets by age band for varied replay experience.
 * Each set has pairs to match — younger kids get fewer pairs.
 */
function getEmojiSets(ageBand: AgeBand): string[][] {
  const sets: Record<AgeBand, string[][]> = {
    '3-4': [
      ['🐶', '🐱', '🐰'],
      ['🍎', '🍌', '🍊'],
      ['⭐', '❤️', '🌈'],
      ['🚗', '✈️', '🚂'],
      ['🌸', '🌻', '🌷'],
      ['🎈', '🎁', '🎉'],
      ['🐸', '🐢', '🐛'],
      ['🍕', '🍩', '🧁'],
    ],
    '5-6': [
      ['🐶', '🐱', '🐰', '🐻'],
      ['🍎', '🍌', '🍊', '🍇'],
      ['⭐', '❤️', '🌈', '🌙'],
      ['🦁', '🐸', '🦋', '🐝'],
      ['🚗', '🚌', '✈️', '🚂'],
      ['🌸', '🌻', '🌷', '🌹'],
      ['🎈', '🎁', '🎉', '🎶'],
      ['🍕', '🍩', '🧁', '🍦'],
    ],
    '7-8': [
      ['🐶', '🐱', '🐰', '🐻', '🦊'],
      ['🍎', '🍌', '🍊', '🍇', '🍓'],
      ['⭐', '❤️', '🌈', '🌙', '☀️'],
      ['🦁', '🐸', '🦋', '🐝', '🐢'],
      ['🚗', '🚌', '✈️', '🚂', '🚀'],
      ['🌸', '🌻', '🌷', '🌹', '🌺'],
      ['🎸', '🎹', '🥁', '🎺', '🎻'],
      ['⚽', '🏀', '🎾', '🏐', '⚾'],
    ],
    '9-10': [
      ['🧬', '🔬', '🧪', '🌡️', '⚗️', '🦠'],
      ['🌍', '🪐', '🌙', '☄️', '⭐', '🚀'],
      ['➕', '➖', '✖️', '➗', '🟰', '📐'],
      ['🏛️', '🗽', '🏰', '⛩️', '🕌', '🗿'],
      ['🦴', '🧠', '🫀', '🫁', '👁️', '🦷'],
      ['🎭', '🎨', '📖', '🎵', '🎬', '📸'],
      ['⚡', '💧', '🔥', '🌪️', '❄️', '☀️'],
      ['🐙', '🦑', '🐚', '🐠', '🦈', '🐋'],
    ],
  };
  return sets[ageBand];
}

/**
 * Memory Game — classic card matching for working memory development
 *
 * Age 3-4: 3 pairs (6 cards) — builds basic recall
 * Age 5-6: 4 pairs (8 cards) — strengthens working memory
 * Age 7-8: 5 pairs (10 cards) — challenges attention & memory
 *
 * Pedagogical approach:
 * - Card matching exercises visual working memory (a key cognitive skill)
 * - Theme rotation (animals, fruits, etc.) keeps engagement high
 * - "Find the matching pair!" is universally understood
 * - Celebrates each match with speech + animation
 * - No time pressure — kids learn at their own pace
 */
export const MemoryGame: React.FC<MemoryGameProps> = ({
  ageBand,
  difficulty,
  sessionRound = 1,
  onCorrect,
  onWrong,
}) => {
  const insets = useSafeAreaInsets();
  const { speak, speakQuestion, handleGenericCorrect, handleGenericWrong } = useGameFeedback();

  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIds, setFlippedIds] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const flipAnims = useRef<Record<string, Animated.Value>>({});
  const cardsRef = useRef<MemoryCard[]>([]);
  const flippedIdsRef = useRef<string[]>([]);
  const lockedRef = useRef(false);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    flippedIdsRef.current = flippedIds;
  }, [flippedIds]);

  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  // Initialize cards with a random emoji theme
  useEffect(() => {
    const sets = getEmojiSets(ageBand);
    const emojis = sets[(Math.max(sessionRound, 1) - 1) % sets.length];
    const pairs: MemoryCard[] = [];

    emojis.forEach((emoji, idx) => {
      pairs.push(
        { id: `a${idx}`, emoji, pairId: `p${idx}`, flipped: false, matched: false },
        { id: `b${idx}`, emoji, pairId: `p${idx}`, flipped: false, matched: false }
      );
    });

    const shuffled = shuffleArray(pairs);
    setCards(shuffled);
    cardsRef.current = shuffled;
    setFlippedIds([]);
    flippedIdsRef.current = [];
    setLocked(false);
    lockedRef.current = false;

    // Initialize flip animations
    const anims: Record<string, Animated.Value> = {};
    shuffled.forEach((card) => {
      anims[card.id] = new Animated.Value(0);
    });
    flipAnims.current = anims;
  }, [ageBand, sessionRound]);

  // Speak the instruction on mount
  useEffect(() => {
    return speakQuestion('Find the matching pairs!');
  }, [speakQuestion]);

  const flipCard = useCallback((id: string, toFlipped: boolean) => {
    const anim = flipAnims.current[id];
    if (!anim) return;
    Animated.spring(anim, {
      toValue: toFlipped ? 1 : 0,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCardPress = useCallback(
    async (cardId: string) => {
      const currentCards = cardsRef.current;
      const card = currentCards.find((c) => c.id === cardId);
      if (!card) return;
      if (lockedRef.current || card.flipped || card.matched) return;

      const currentFlipped = flippedIdsRef.current;
      if (currentFlipped.includes(card.id)) return;

      // Flip this card
      const newFlipped = [...currentFlipped, card.id];
      setFlippedIds(newFlipped);
      flippedIdsRef.current = newFlipped;
      flipCard(card.id, true);

      setCards((prev) => {
        const next = prev.map((c) => (c.id === card.id ? { ...c, flipped: true } : c));
        cardsRef.current = next;
        return next;
      });

      if (newFlipped.length === 2) {
        lockedRef.current = true;
        setLocked(true);
        const [firstId, secondId] = newFlipped;
        const first = cardsRef.current.find((c) => c.id === firstId);
        const second = cardsRef.current.find((c) => c.id === secondId);
        if (!first || !second) {
          setFlippedIds([]);
          flippedIdsRef.current = [];
          setLocked(false);
          lockedRef.current = false;
          return;
        }

        if (first.pairId === second.pairId) {
          // Match found!
          await handleGenericCorrect(onCorrect);
          setCards((prev) => {
            const next = prev.map((c) =>
              c.pairId === first.pairId ? { ...c, matched: true, flipped: true } : c
            );
            cardsRef.current = next;
            return next;
          });
          setFlippedIds([]);
          flippedIdsRef.current = [];
          setLocked(false);
          lockedRef.current = false;
        } else {
          // No match — flip back after a brief reveal
          await handleGenericWrong(onWrong);
          setTimeout(() => {
            flipCard(firstId, false);
            flipCard(secondId, false);
            setCards((prev) => {
              const next = prev.map((c) =>
                c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c
              );
              cardsRef.current = next;
              return next;
            });
            setFlippedIds([]);
            flippedIdsRef.current = [];
            setLocked(false);
            lockedRef.current = false;
          }, 600);
        }
      }
    },
    [flipCard, handleGenericCorrect, handleGenericWrong, onCorrect, onWrong]
  );

  // Determine grid columns and card size based on card count & age
  const cardSize = cards.length <= 6 ? 84 : cards.length <= 8 ? 76 : cards.length <= 10 ? 68 : 62;
  const numColumns = cards.length <= 6 ? 3 : cards.length <= 8 ? 4 : cards.length <= 10 ? 5 : 4;

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}
    >
      <View style={styles.headerSection}>
        <Text style={styles.questionText}>🧠 Find the matching pairs!</Text>
        <VoiceButton text="Find the matching pairs!" style={styles.voiceButton} />
      </View>

      <View style={[styles.grid, { maxWidth: numColumns * (cardSize + 12) }]}>
        {cards.map((card) => {
          const anim = flipAnims.current[card.id];
          const frontInterpolate = anim
            ? anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] })
            : '0deg';
          const backInterpolate = anim
            ? anim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] })
            : '180deg';

          return (
            <View key={card.id} style={[styles.cardWrapper, { width: cardSize, height: cardSize }]}>
              <TouchableOpacity
                style={[styles.cardTouchable, { width: cardSize, height: cardSize }]}
                onPress={() => handleCardPress(card.id)}
                activeOpacity={0.7}
                disabled={locked || card.flipped || card.matched}
                accessibilityLabel={card.flipped ? card.emoji : 'Hidden card'}
              >
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.card,
                    styles.cardBack,
                    { width: cardSize, height: cardSize },
                    card.matched && styles.cardMatched,
                    { transform: [{ rotateY: frontInterpolate }] },
                  ]}
                >
                  <Text style={styles.cardBackText}>❓</Text>
                </Animated.View>

                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.card,
                    styles.cardFront,
                    { width: cardSize, height: cardSize },
                    card.matched && styles.cardMatched,
                    { transform: [{ rotateY: backInterpolate }] },
                  ]}
                >
                  <Text style={[styles.cardEmoji, { fontSize: cardSize * 0.45 }]}>{card.emoji}</Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
    width: '100%',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    flex: 1,
  },
  voiceButton: { paddingVertical: 12, paddingHorizontal: 12 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  cardWrapper: {
  },
  card: {
    position: 'absolute',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  cardBack: {
    backgroundColor: '#7C4DFF',
  },
  cardFront: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cardMatched: {
    borderWidth: 3,
    borderColor: '#16A34A',
    backgroundColor: '#F0FFF4',
    opacity: 1,
  },
  cardTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBackText: {
    fontSize: 30,
  },
  cardEmoji: {
    fontSize: 34,
  },
});

export default MemoryGame;
