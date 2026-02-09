import React from 'react';
import { Stack } from 'expo-router';

/**
 * Root layout with expo-router stack navigator
 */
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Solimo' }} />
      <Stack.Screen name="onboarding" options={{ title: 'Welcome', gestureEnabled: false }} />
      <Stack.Screen name="activity" options={{ title: 'Activity' }} />
      <Stack.Screen name="playground" options={{ title: 'Free Play' }} />
    </Stack>
  );
}
