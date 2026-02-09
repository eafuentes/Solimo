import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Switch, StyleSheet, Animated } from 'react-native';
import { AgeBand } from '../types';
import {
  getAgeBand,
  setAgeBand,
  isSoundEnabled,
  setSoundEnabled,
  resetProgress,
  clearTodaysCompletion,
} from '../lib/storage';

interface ParentCornerModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Parent corner modal
 * Accessed via lock icon + 2 second press
 * Controls age band, sound, and reset
 */
export const ParentCornerModal: React.FC<ParentCornerModalProps> = ({
  visible,
  onClose,
}: ParentCornerModalProps) => {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [ageBand, setAgeBandLocal] = useState<AgeBand>('3-4');
  const [soundEnabled, setSoundEnabledLocal] = useState(true);

  React.useEffect(() => {
    if (visible) {
      Promise.all([getAgeBand(), isSoundEnabled()]).then(([age, sound]) => {
        setAgeBandLocal(age);
        setSoundEnabledLocal(sound);
      });
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleAgeBandChange = async (band: AgeBand) => {
    setAgeBandLocal(band);
    await setAgeBand(band);
  };

  const handleSoundChange = async (enabled: boolean) => {
    setSoundEnabledLocal(enabled);
    await setSoundEnabled(enabled);
  };

  const handleReset = async () => {
    await resetProgress();
    onClose();
  };

  const handleResetToday = async () => {
    await clearTodaysCompletion();
    onClose();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
      paddingHorizontal: 24,
      paddingBottom: 32,
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 32,
      padding: 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: '900',
      color: '#1a1a1a',
      marginBottom: 32,
    },
    sectionLabel: {
      fontSize: 18,
      fontWeight: '700',
      color: '#333',
      marginBottom: 12,
    },
    ageBandContainer: {
      marginBottom: 32,
      gap: 10,
    },
    ageBandButton: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 16,
      borderWidth: 3,
      justifyContent: 'center',
      alignItems: 'center',
    },
    ageBandButtonActive: {
      backgroundColor: '#DBEAFE',
      borderColor: '#3B82F6',
    },
    ageBandButtonInactive: {
      backgroundColor: '#F3F4F6',
      borderColor: '#D1D5DB',
    },
    ageBandText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#1a1a1a',
    },
    soundSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
      paddingVertical: 12,
    },
    resetButton: {
      backgroundColor: '#EF4444',
      paddingVertical: 16,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: '#EF4444',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    resetButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
    },
    closeButton: {
      backgroundColor: '#F3F4F6',
      paddingVertical: 16,
      borderRadius: 16,
    },
    closeButtonText: {
      color: '#1a1a1a',
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
    },
  });

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: [0, 600],
                  }),
                },
              ],
            },
          ]}
          onStartShouldSetResponder={() => true}
          onResponderTerminationRequest={() => false}
        >
          <Text style={styles.title}>Parent Corner</Text>

          {/* Age band selector */}
          <View>
            <Text style={styles.sectionLabel}>Age Band</Text>
            <View style={styles.ageBandContainer}>
              {(['3-4', '5-6', '7-8'] as AgeBand[]).map((band) => (
                <TouchableOpacity
                  key={band}
                  onPress={() => handleAgeBandChange(band)}
                  style={[
                    styles.ageBandButton,
                    ageBand === band ? styles.ageBandButtonActive : styles.ageBandButtonInactive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ageBandText}>{band} years</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sound toggle */}
          <View style={styles.soundSection}>
            <Text style={styles.sectionLabel}>Sound</Text>
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundChange}
              trackColor={{ false: '#D1D5DB', true: '#A8E6CF' }}
              thumbColor={soundEnabled ? '#5FD3B0' : '#F3F4F6'}
            />
          </View>

          {/* Reset button */}
          <TouchableOpacity
            onPress={handleResetToday}
            style={[styles.resetButton, { backgroundColor: '#F59E0B' }]}
            activeOpacity={0.8}
          >
            <Text style={styles.resetButtonText}>Reset Today Only</Text>
          </TouchableOpacity>

          {/* Full reset button */}
          <TouchableOpacity onPress={handleReset} style={styles.resetButton} activeOpacity={0.8}>
            <Text style={styles.resetButtonText}>Reset All Progress</Text>
          </TouchableOpacity>

          {/* Close button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.6}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ParentCornerModal;
