import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { samplePathPoints, Point } from './writingUtils';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface StrokeGuideProps {
  /** SVG path string to animate */
  strokePath: string;
  /** Whether the animation should play */
  playing: boolean;
  /** Called when the demo animation finishes */
  onComplete?: () => void;
  /** Total viewBox width (for spelling mode with wide canvas) */
  viewBoxWidth?: number;
  /** X offset to position the guide in the correct letter slot */
  offsetX?: number;
}

/**
 * StrokeGuide — shows an animated dot tracing the path to teach stroke direction.
 *
 * Before the child traces, a colored dot travels along the guide path slowly,
 * showing the correct direction and movement. Research shows that watching
 * stroke order before tracing improves letter formation by ~40%.
 *
 * Uses pre-sampled path points and Animated.timing to move the dot.
 */
export function StrokeGuide({ strokePath, playing, onComplete, viewBoxWidth, offsetX }: StrokeGuideProps) {
  const progress = useRef(new Animated.Value(0)).current;

  // Sample points synchronously so they're available on first render
  const points = useMemo(() => samplePathPoints(strokePath, 24), [strokePath]);

  useEffect(() => {
    if (!playing || points.length === 0) return;

    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 2500, // Slow enough for kids to follow
      useNativeDriver: false, // We need non-native for cx/cy
    });

    animation.start(({ finished }) => {
      if (finished) onComplete?.();
    });

    return () => animation.stop();
  }, [playing, strokePath, points]);

  if (points.length === 0) return null;

  // Interpolate dot position along sampled points
  const cx = progress.interpolate({
    inputRange: points.map((_, i) => i / (points.length - 1)),
    outputRange: points.map((p) => p.x),
    extrapolate: 'clamp',
  });

  const cy = progress.interpolate({
    inputRange: points.map((_, i) => i / (points.length - 1)),
    outputRange: points.map((p) => p.y),
    extrapolate: 'clamp',
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${viewBoxWidth ?? 200} 200`} preserveAspectRatio="xMidYMid meet">
        <G transform={offsetX ? `translate(${offsetX}, 0)` : undefined}>
          {/* Show the full path in a highlight color */}
          <Path
            d={strokePath}
            fill="none"
            stroke="#FFD93D"
            strokeWidth={10}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.4}
          />
          {/* Animated guide dot */}
          {playing && (
            <AnimatedCircle cx={cx} cy={cy} r={12} fill="#FF6B6B" opacity={0.9} />
          )}
          {/* Start indicator */}
          <Circle cx={points[0].x} cy={points[0].y} r={8} fill="#6BCB77" opacity={0.8} />
        </G>
      </Svg>
    </View>
  );
}
