import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Primary CTA button for Lumini
 * Bright, joyful, accessible design
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  disabled = false,
}: PrimaryButtonProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const styles = StyleSheet.create({
    button: {
      overflow: 'hidden',
      borderRadius: 40,
      shadowColor: disabled ? 'transparent' : '#FFD93D',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: disabled ? 0 : 8,
    },
    buttonContent: {
      backgroundColor: disabled ? '#D1D5DB' : '#FFD93D',
      paddingVertical: 18,
      paddingHorizontal: 32,
      borderRadius: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 18,
      fontWeight: '700',
      color: disabled ? '#6B7280' : '#1a1a1a',
      textAlign: 'center',
      letterSpacing: 0.3,
    },
  });

  return (
    <View style={styles.button}>
      <Animated.View
        style={[
          styles.buttonContent,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={0.8}
          style={{ width: '100%', alignItems: 'center' }}
        >
          <Text style={styles.buttonText}>{label}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default PrimaryButton;
