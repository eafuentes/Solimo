import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { setAudioModeAsync } from 'expo-audio';

interface VoiceButtonProps {
  text: string;
  style?: any;
  voiceType?: 'question' | 'label' | 'feedback'; // Different voice styles
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  text,
  style,
  voiceType = 'question',
}) => {
  // Configure audio mode once when component mounts
  useEffect(() => {
    const setupAudioMode = async () => {
      try {
        if (Platform.OS !== 'web') {
          await setAudioModeAsync({
            playsInSilentMode: true,
            interruptionMode: 'duckOthers',
          });
        }
      } catch (error) {
        console.warn('Audio mode setup error:', error);
      }
    };
    setupAudioMode();
  }, []);

  const handleSpeak = async () => {
    try {
      // Different voice settings for different contexts
      const voiceSettings = {
        question: { pitch: 1.1, rate: 0.88 }, // Warm, a bit more upbeat
        label: { pitch: 1.15, rate: 0.92 }, // Friendly, slightly brighter
        feedback: { pitch: 1.05, rate: 0.92 }, // Mildly upbeat
      };

      const settings = voiceSettings[voiceType] || voiceSettings.question;

      if (Platform.OS === 'web') {
        // Web Speech API for browsers
        const utterance = new (window as any).SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.pitch = settings.pitch;
        utterance.rate = settings.rate;
        utterance.volume = 1;
        (window as any).speechSynthesis.speak(utterance);
      } else {
        // expo-speech for iOS/Android
        const isSpeaking = await Speech.isSpeakingAsync();
        if (isSpeaking) {
          await Speech.stop();
        }

        Speech.speak(text, {
          language: 'en',
          pitch: settings.pitch,
          rate: settings.rate,
        });
      }
    } catch (error) {
      console.error('Voice error:', error);
    }
  };

  const styles = voiceButtonStyles;

  return (
    <TouchableOpacity onPress={handleSpeak} style={[styles.button, style]} activeOpacity={0.7}>
      <Text style={styles.text}>🔊</Text>
    </TouchableOpacity>
  );
};

const voiceButtonStyles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    fontSize: 24,
  },
});

export default VoiceButton;
