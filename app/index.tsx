import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  AppState,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  isCompletedToday,
  getAgeBand,
  setAgeBand,
  isSoundEnabled,
  getStreak,
  isOnboardingDone,
} from '../src/lib/storage';
import { getTodaysActivityId, getActivityName } from '../src/lib/schedule';
import { ParentCornerModal } from '../src/components/ParentCornerModal';
import { AgeBand } from '../src/types';
import * as Icons from '../src/components/icons';
import { VoiceButton } from '../src/components/VoiceButton';
import * as Speech from 'expo-speech';

/** Get time-appropriate greeting with emoji — child psychology: familiarity with routine */
function getTimeGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', emoji: '🌅' };
  if (hour < 17) return { text: 'Good afternoon', emoji: '☀️' };
  return { text: 'Good evening', emoji: '🌙' };
}

/** Activity-specific hints so kids know what to expect before starting */
function getActivityHint(id: string): string {
  const hints: Record<string, string> = {
    colors: 'Discover beautiful colors! 🎨',
    shapes: 'Find and learn about shapes! 🔷',
    numbers: 'Count, add, and have fun! 🔢',
    patterns: 'Spot the pattern and guess! 🧩',
    memory: 'Match pairs and train your brain! 🧠',
    sorting: 'Group things that belong together! 📦',
    logic: 'Think and solve fun puzzles! 💡',
  };
  return hints[id] || 'Short, fun, and easy to finish!';
}

/**
 * Home Screen — the child's daily landing page
 *
 * Design principles (child development & UX):
 * - Large, tappable hero card → reduces friction for young children
 * - Subtle pulse animation → draws attention without overwhelming
 * - Time-of-day greeting → builds routine (important for 3-8 year olds)
 * - Positive reinforcement → streak badges and completion celebrations
 * - Voice-first → pre-readers can navigate independently
 * - Single daily activity → prevents decision fatigue (Hick's Law for kids)
 * - Free Play always accessible → autonomy for motivated learners
 */
export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [completed, setCompleted] = useState(false);
  const [activityId, setActivityId] = useState<string>('');
  const [activityName, setActivityName] = useState('');
  const [parentCornerVisible, setParentCornerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAgeBand, setCurrentAgeBand] = useState<AgeBand>('3-4');
  const [showAgeSelector, setShowAgeSelector] = useState(false);
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [dailyStreak, setDailyStreak] = useState(0);
  const hasWelcomedRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  // ── Data Loading ──────────────────────────────────────────────

  const loadStreak = useCallback(async () => {
    const streak = await getStreak();
    setDailyStreak(streak);
  }, []);

  const loadHome = useCallback(
    async (showLoading: boolean) => {
      if (showLoading) setIsLoading(true);

      // Redirect first-time users to onboarding
      const onboarded = await isOnboardingDone();
      if (!onboarded) {
        router.replace('/onboarding');
        return;
      }

      const today = getTodaysActivityId();
      setActivityId(today);
      setActivityName(getActivityName(today));

      const [completedToday, userAgeBand, sound] = await Promise.all([
        isCompletedToday(),
        getAgeBand(),
        isSoundEnabled(),
      ]);
      setCompleted(completedToday);
      setCurrentAgeBand(userAgeBand);
      setSoundEnabledState(sound);

      await loadStreak();
      if (showLoading) setIsLoading(false);
    },
    [loadStreak]
  );

  useEffect(() => {
    loadHome(true);
  }, [loadHome]);

  useFocusEffect(
    useCallback(() => {
      loadHome(false);
      return () => {
        Speech.stop();
      };
    }, [loadHome])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') loadHome(false);
    });
    return () => sub.remove();
  }, [loadHome]);

  // ── Animations ────────────────────────────────────────────────

  // Gentle pulse on hero card invites kids to tap
  useEffect(() => {
    if (isLoading || completed) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isLoading, completed, pulseAnim]);

  // Fade in content after loading for a polished feel
  useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoading, fadeInAnim]);

  // ── Voice Welcome ─────────────────────────────────────────────

  useEffect(() => {
    if (isLoading || !soundEnabled || hasWelcomedRef.current || !activityName) return;
    hasWelcomedRef.current = true;
    const { text: greeting } = getTimeGreeting();
    Speech.speak(`${greeting}! Today's adventure is ${activityName}. Tap to play!`, {
      language: 'en',
      pitch: 1.18,
      rate: 0.92,
    });
  }, [isLoading, soundEnabled, activityName]);

  // ── Handlers ──────────────────────────────────────────────────

  const iconMap: Record<string, React.FC<any>> = {
    colors: Icons.ColorIcon,
    shapes: Icons.ShapeIcon,
    numbers: Icons.NumberIcon,
    patterns: Icons.PatternIcon,
    memory: Icons.MemoryIcon,
    sorting: Icons.SortingIcon,
    logic: Icons.LogicIcon,
  };

  const IconComponent = iconMap[activityId];
  const iconSize = Math.min(width - 64, 200);

  const handleStartPress = () => {
    Speech.stop();
    router.push({ pathname: '/activity', params: { activityId } });
  };

  const handlePlaygroundPress = () => {
    Speech.stop();
    router.push('/playground');
  };

  /** Pick an encouraging message once per activity load — stable across re-renders */
  const encouragingMessage = useMemo(() => {
    const messages = [
      "You're doing great! Ready to learn?",
      "Let's have some fun learning today!",
      'One bright activity, plenty of fun!',
      'Ready for an adventure?',
      "Let's make learning magical!",
      "Today's going to be awesome!",
      'Every day is a new adventure!',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }, [activityId]);

  const handleAgeBandChange = async (band: AgeBand) => {
    setCurrentAgeBand(band);
    await setAgeBand(band);
    setShowAgeSelector(false);
  };

  // ── Render ────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>✨</Text>
        <ActivityIndicator size="large" color="#FFD93D" />
        <Text style={{ fontSize: 18, color: '#888', marginTop: 12 }}>Getting ready...</Text>
      </View>
    );
  }

  const greeting = getTimeGreeting();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Settings button */}
      <View style={styles.topSection}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <TouchableOpacity
            onPress={() => setParentCornerVisible(true)}
            style={styles.settingsButton}
            activeOpacity={0.6}
            accessibilityLabel="Parent settings"
            accessibilityRole="button"
          >
            <Text style={{ fontSize: 28 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main scrollable content */}
      <Animated.View style={{ flex: 1, opacity: fadeInAnim }}>
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.mainContentScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heroTitle}>
            {greeting.emoji} {greeting.text}!
          </Text>
          <Text style={styles.heroSubtitle}>{encouragingMessage}</Text>

          {dailyStreak > 0 && (
            <View style={styles.streakBadge}>
              <Text>🔥</Text>
              <Text style={styles.streakText}>
                Streak: {dailyStreak} day{dailyStreak > 1 ? 's' : ''}
              </Text>
            </View>
          )}

          {/* ✨ Hero Card — tappable! Kids can tap the icon to start playing */}
          <TouchableOpacity
            onPress={handleStartPress}
            activeOpacity={0.85}
            style={{ width: '100%' }}
            accessibilityLabel={`Play ${activityName}`}
            accessibilityRole="button"
          >
            <Animated.View
              style={[styles.activityCard, !completed && { transform: [{ scale: pulseAnim }] }]}
            >
              <View style={styles.activityBadge}>
                <Text style={styles.activityBadgeText}>
                  {completed ? '✅ COMPLETED' : "TODAY'S ADVENTURE"}
                </Text>
              </View>
              {IconComponent && (
                <View style={styles.iconContainer}>
                  <IconComponent size={iconSize} />
                </View>
              )}
              <Text style={styles.activityName}>
                {activityName.charAt(0).toUpperCase() + activityName.slice(1)}
              </Text>
              <Text style={styles.activityHint}>{getActivityHint(activityId)}</Text>

              {!completed ? (
                <View style={styles.tapIndicator}>
                  <Text style={styles.tapIndicatorText}>👆 Tap to play!</Text>
                </View>
              ) : (
                <View style={styles.tapIndicatorCompleted}>
                  <Text style={styles.tapIndicatorCompletedText}>Tap to play again</Text>
                </View>
              )}

              <View style={styles.voiceRow}>
                <VoiceButton text={`Today's adventure is ${activityName}. Tap to play!`} />
                <Text style={styles.voiceRowText}>Tap to hear</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>

          {completed && (
            <View style={styles.completedContainer}>
              <Text style={styles.completedText}>✨ Great job today!</Text>
            </View>
          )}

          {/* Playground — always visible for free practice */}
          <TouchableOpacity
            onPress={handlePlaygroundPress}
            style={styles.playgroundButton}
            activeOpacity={0.8}
          >
            <Text style={styles.playgroundButtonText}>🎮 Free Play</Text>
          </TouchableOpacity>

          <Text style={styles.descriptionText}>One bright activity per day ✨</Text>

          <TouchableOpacity
            onPress={() => setShowAgeSelector(true)}
            style={styles.ageSelectorButton}
            activeOpacity={0.7}
          >
            <Text style={styles.ageSelectorButtonText}>👧 I'm {currentAgeBand} years old</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      {/* Age selector modal */}
      {showAgeSelector && (
        <TouchableOpacity
          style={styles.ageModalOverlay}
          activeOpacity={1}
          onPress={() => setShowAgeSelector(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.ageModalContent}>
              <Text style={styles.ageModalTitle}>How old are you?</Text>
              <ScrollView contentContainerStyle={styles.ageOptionsContainer}>
                {(['3-4', '5-6', '7-8', '9-10'] as AgeBand[]).map((band) => (
                  <TouchableOpacity
                    key={band}
                    onPress={() => handleAgeBandChange(band)}
                    style={[
                      styles.ageOption,
                      currentAgeBand === band ? styles.ageOptionActive : styles.ageOptionInactive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.ageOptionText}>{band} years</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      <ParentCornerModal
        visible={parentCornerVisible}
        onClose={() => {
          setParentCornerVisible(false);
          loadHome(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  topSection: {
    paddingTop: 8,
    paddingRight: 16,
    paddingBottom: 8,
  },
  settingsButton: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  mainContent: { flex: 1 },
  mainContentScroll: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  streakBadge: {
    backgroundColor: '#FEF08A',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakText: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  activityCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 20,
  },
  activityBadge: {
    backgroundColor: '#E0F2FE',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#7DD3FC',
  },
  activityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: 0.4,
  },
  iconContainer: {
    marginBottom: 16,
    padding: 24,
    backgroundColor: '#FFF7D6',
    borderRadius: 28,
  },
  activityName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  activityHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  tapIndicator: {
    marginTop: 16,
    backgroundColor: '#FFD93D',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  tapIndicatorText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  tapIndicatorCompleted: {
    marginTop: 12,
  },
  tapIndicatorCompletedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
  },
  voiceRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceRowText: { fontSize: 12, color: '#666', fontWeight: '600' },
  completedContainer: {
    backgroundColor: '#A8E6CF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#5FD3B0',
    marginBottom: 16,
  },
  completedText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2d6a4f',
    textAlign: 'center',
  },
  playgroundButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
    minWidth: 280,
  },
  playgroundButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  ageSelectorButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#E0F2FE',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#0284C7',
  },
  ageSelectorButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0284C7',
    textAlign: 'center',
  },
  ageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  ageModalContent: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 32,
    width: '100%',
    maxHeight: '80%',
  },
  ageModalTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 24,
    textAlign: 'center',
  },
  ageOptionsContainer: { gap: 14, paddingBottom: 8 },
  ageOption: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageOptionActive: { backgroundColor: '#FFD93D', borderColor: '#F59E0B' },
  ageOptionInactive: { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' },
  ageOptionText: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
});
