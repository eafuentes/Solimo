import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { setAgeBand, setOnboardingDone } from '../src/lib/storage';
import { AgeBand } from '../src/types';
import * as Speech from 'expo-speech';

/**
 * Onboarding — shown once on first launch
 *
 * Three steps:
 * 1. Welcome — warm greeting with app description
 * 2. Age picker — large, tappable age bands for kids/parents
 * 3. Ready — motivational send-off
 *
 * Design principles:
 * - Large targets (44pt+) for young fingers
 * - Minimal text, maximum imagery/emojis
 * - Voice narration for pre-readers
 * - Playful animations for engagement
 */

const STEPS = [
  {
    emoji: '✨',
    title: 'Welcome to Solimo!',
    subtitle: 'One fun learning adventure every day',
    voiceText: 'Welcome to Solimo! Get ready for a fun learning adventure every single day!',
  },
  {
    emoji: '👋',
    title: 'How old are you?',
    subtitle: 'This helps us pick the right activities',
    voiceText: 'How old are you? Pick your age so we can choose the best activities for you!',
  },
  {
    emoji: '🚀',
    title: "You're all set!",
    subtitle: "Let's start your first adventure!",
    voiceText: "You're all set! Let's start your very first adventure! Tap the button to play!",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [selectedAge, setSelectedAge] = useState<AgeBand | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const bounceAnim = useRef(new Animated.Value(0.8)).current;

  // Animate in each step
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    bounceAnim.setValue(0.8);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Voice narration for each step
    const timeout = setTimeout(() => {
      Speech.speak(STEPS[step].voiceText, {
        language: 'en',
        pitch: 1.18,
        rate: 0.92,
      });
    }, 600);

    return () => {
      clearTimeout(timeout);
      Speech.stop();
    };
  }, [step, fadeAnim, slideAnim, bounceAnim]);

  const handleAgeSelect = async (band: AgeBand) => {
    setSelectedAge(band);
    await setAgeBand(band);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleFinish = async () => {
    Speech.stop();
    await setOnboardingDone();
    router.replace('/');
  };

  const currentStep = STEPS[step];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === step ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: bounceAnim }],
          },
        ]}
      >
        <Text style={styles.emoji}>{currentStep.emoji}</Text>
        <Text style={styles.title}>{currentStep.title}</Text>
        <Text style={styles.subtitle}>{currentStep.subtitle}</Text>

        {/* Step 1: Age picker */}
        {step === 1 && (
          <View style={styles.ageContainer}>
            {(['3-4', '5-6', '7-8', '9-10'] as AgeBand[]).map((band) => (
              <TouchableOpacity
                key={band}
                onPress={() => handleAgeSelect(band)}
                activeOpacity={0.7}
                style={[
                  styles.ageButton,
                  { minWidth: Math.min(width - 80, 300) },
                  selectedAge === band ? styles.ageButtonSelected : styles.ageButtonUnselected,
                ]}
              >
                <Text style={styles.ageEmoji}>
                  {band === '3-4' ? '🧒' : band === '5-6' ? '👧' : band === '7-8' ? '🧑' : '🧑‍🎓'}
                </Text>
                <Text
                  style={[
                    styles.ageText,
                    selectedAge === band && styles.ageTextSelected,
                  ]}
                >
                  {band} years old
                </Text>
                {selectedAge === band && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.View>

      {/* Bottom button */}
      <View style={styles.bottomSection}>
        {step === 0 && (
          <TouchableOpacity
            onPress={handleNext}
            style={styles.primaryButton}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Let's Go! 🎉</Text>
          </TouchableOpacity>
        )}

        {step === 1 && (
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.primaryButton, !selectedAge && styles.buttonDisabled]}
            activeOpacity={0.8}
            disabled={!selectedAge}
          >
            <Text style={styles.primaryButtonText}>
              {selectedAge ? 'Next →' : 'Pick your age'}
            </Text>
          </TouchableOpacity>
        )}

        {step === 2 && (
          <TouchableOpacity
            onPress={handleFinish}
            style={[styles.primaryButton, styles.finishButton]}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Start My Adventure! 🚀</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: '#FFD93D',
    width: 28,
    borderRadius: 5,
  },
  dotInactive: {
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  ageContainer: {
    gap: 16,
    width: '100%',
    alignItems: 'center',
  },
  ageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderRadius: 24,
    borderWidth: 3,
    gap: 14,
  },
  ageButtonSelected: {
    backgroundColor: '#FFD93D',
    borderColor: '#F59E0B',
  },
  ageButtonUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  ageEmoji: {
    fontSize: 32,
  },
  ageText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    flex: 1,
  },
  ageTextSelected: {
    color: '#92400E',
  },
  checkMark: {
    fontSize: 24,
    fontWeight: '900',
    color: '#92400E',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 16,
  },
  primaryButton: {
    backgroundColor: '#FFD93D',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 30,
    minWidth: 240,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  finishButton: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
  },
});
