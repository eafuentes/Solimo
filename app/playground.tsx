import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Icons from '../src/components/icons';
import { ActivityId } from '../src/types';

/** Activity definitions with age-appropriate descriptions */
const activities: Array<{
  id: ActivityId;
  name: string;
  icon: React.FC<any>;
  description: string;
  emoji: string;
  color: string;
  bgColor: string;
}> = [
  {
    id: 'colors',
    name: 'Colors',
    icon: Icons.ColorIcon,
    description: 'Learn colors',
    emoji: '🎨',
    color: '#FF6B6B',
    bgColor: '#FFF0F0',
  },
  {
    id: 'shapes',
    name: 'Shapes',
    icon: Icons.ShapeIcon,
    description: 'Find shapes',
    emoji: '▲',
    color: '#4D96FF',
    bgColor: '#EFF6FF',
  },
  {
    id: 'numbers',
    name: 'Numbers',
    icon: Icons.NumberIcon,
    description: 'Count & add',
    emoji: '🔢',
    color: '#FFD93D',
    bgColor: '#FFFBEB',
  },
  {
    id: 'patterns',
    name: 'Patterns',
    icon: Icons.PatternIcon,
    description: 'Spot patterns',
    emoji: '🧩',
    color: '#9B59B6',
    bgColor: '#F5F0FF',
  },
  {
    id: 'memory',
    name: 'Memory',
    icon: Icons.MemoryIcon,
    description: 'Match pairs',
    emoji: '🧠',
    color: '#A8E6CF',
    bgColor: '#F0FFF4',
  },
  {
    id: 'sorting',
    name: 'Sorting',
    icon: Icons.SortingIcon,
    description: 'Sort items',
    emoji: '📦',
    color: '#FF8C42',
    bgColor: '#FFF5EB',
  },
  {
    id: 'logic',
    name: 'Logic',
    icon: Icons.LogicIcon,
    description: 'Solve puzzles',
    emoji: '💡',
    color: '#5FD3B0',
    bgColor: '#EFFFF8',
  },
];

/**
 * Playground — free practice mode
 * All activities available in a grid layout.
 * No daily limits — encourages autonomous exploration.
 */
export default function PlaygroundScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const iconSize = Math.min(width - 64, 80);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.6}
          accessibilityLabel="Go back"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>🎮 Free Play</Text>
          <Text style={styles.headerSubtitle}>Practice any activity!</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <TouchableOpacity
                key={activity.id}
                onPress={() =>
                  router.push({
                    pathname: '/activity',
                    params: { activityId: activity.id },
                  })
                }
                style={[
                  styles.activityCard,
                  {
                    borderBottomColor: activity.color,
                    borderBottomWidth: 4,
                    backgroundColor: activity.bgColor,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                <View style={styles.activityIcon}>
                  <IconComponent size={iconSize / 2} />
                </View>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityDescription}>{activity.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  activityCard: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  activityEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  activityIcon: {
    marginBottom: 8,
  },
  activityName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  activityDescription: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});
