import React from 'react';
import Svg, { Rect, Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const LogicIcon: React.FC<IconProps> = ({ size = 64, color = '#FF6B6B' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256">
      {/* Puzzle piece 1 (top-left) */}
      <Rect x="40" y="40" width="80" height="80" rx="8" fill="#FF6B6B" />
      <Circle cx="120" cy="80" r="14" fill="white" />

      {/* Puzzle piece 2 (top-right) */}
      <Rect x="136" y="40" width="80" height="80" rx="8" fill="#4D96FF" />
      <Circle cx="136" cy="80" r="14" fill="white" />

      {/* Puzzle piece 3 (bottom-left) */}
      <Rect x="40" y="136" width="80" height="80" rx="8" fill="#6BCB77" />
      <Circle cx="80" cy="136" r="14" fill="white" />

      {/* Puzzle piece 4 (bottom-right) */}
      <Rect x="136" y="136" width="80" height="80" rx="8" fill="#FFD93D" />
      <Circle cx="176" cy="136" r="14" fill="white" />
    </Svg>
  );
};

export default LogicIcon;
