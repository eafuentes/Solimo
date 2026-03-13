import React from 'react';
import { ScrollView, View, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
  backgroundColor?: string;
}

/**
 * Shared responsive container for all game screens.
 *
 * Fixes iPad layout issues:
 * - ScrollView prevents content cropping when it overflows (iPad, split-view)
 * - maxWidth constrains layout so buttons/text don't stretch on wide screens
 * - Centers content when it fits, scrolls when it doesn't
 * - Handles bottom safe area (top is handled by activity.tsx)
 */
export function GameScrollContainer({ children, backgroundColor = '#FFF9E6' }: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width > 600;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 24 },
        isWide && styles.contentWide,
      ]}
      bounces={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.inner, isWide && styles.innerWide]}>
        {children}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  contentWide: {
    paddingHorizontal: 32,
  },
  inner: {
    width: '100%',
    alignItems: 'center',
  },
  innerWide: {
    maxWidth: 500,
  },
});
