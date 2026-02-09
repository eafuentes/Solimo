import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { VoiceButton } from './VoiceButton';

interface GameLayoutProps {
  /** The question/instruction text */
  questionText: string;
  /** Content to render in the main area */
  children: React.ReactNode;
  /** Optional header badge text (e.g. "COLORS") */
  badge?: string;
  /** Background color override */
  backgroundColor?: string;
}

/**
 * Shared layout wrapper for all game screens.
 * Provides:
 * - Safe area padding
 * - Back button (friendly for kids)
 * - Question header with voice button
 * - Consistent spacing and styling
 */
export const GameLayout: React.FC<GameLayoutProps> = ({
  questionText,
  children,
  badge,
  backgroundColor = '#FFF9E6',
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor, paddingTop: insets.top + 8 }]}>
      {/* Top bar with back button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.6}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <View style={styles.backButton} />
      </View>

      {/* Question + Voice */}
      <View style={styles.headerSection}>
        <Text
          style={styles.questionText}
          accessibilityRole="header"
          adjustsFontSizeToFit
          numberOfLines={2}
        >
          {questionText}
        </Text>
        <VoiceButton text={questionText} style={styles.voiceButton} />
      </View>

      {/* Game content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  badge: {
    backgroundColor: '#E0F2FE',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#7DD3FC',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    width: '100%',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  voiceButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GameLayout;
