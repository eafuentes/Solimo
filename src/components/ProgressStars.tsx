import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ProgressStarsProps {
  /** Number of stars earned (correct answers) */
  current: number;
  /** Total stars needed to complete */
  total: number;
}

/**
 * Visual progress indicator using stars.
 * Child psychology: Stars provide tangible goal and motivation.
 * Each star fills up as the child answers correctly,
 * giving a clear sense of accomplishment and proximity to goal.
 */
export const ProgressStars: React.FC<ProgressStarsProps> = ({ current, total }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (current > 0) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [current]);

  return (
    <View style={styles.container}>
      <View style={styles.starsRow}>
        {Array.from({ length: total }, (_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.starContainer,
              i === current - 1 ? { transform: [{ scale: scaleAnim }] } : undefined,
            ]}
          >
            <Text style={[styles.star, i < current ? styles.starFilled : styles.starEmpty]}>
              {i < current ? '⭐' : '☆'}
            </Text>
          </Animated.View>
        ))}
      </View>
      <Text style={styles.label}>
        {current} of {total}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  starContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    fontSize: 28,
  },
  starFilled: {
    opacity: 1,
  },
  starEmpty: {
    opacity: 0.3,
    fontSize: 24,
    color: '#D1D5DB',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    marginTop: 4,
  },
});

export default ProgressStars;
