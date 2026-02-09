import React from 'react';
import Svg, { Rect, Circle, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const MemoryIcon: React.FC<IconProps> = ({ size = 64, color = '#FF6B6B' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256">
      {/* Left card */}
      <Rect
        x="50"
        y="70"
        width="70"
        height="100"
        rx="8"
        fill="#FF6B6B"
        stroke="#2D3436"
        strokeWidth="3"
      />
      {/* Shine on left card */}
      <Circle cx="75" cy="100" r="15" fill="#FFB3B3" opacity="0.6" />

      {/* Right card */}
      <Rect
        x="136"
        y="70"
        width="70"
        height="100"
        rx="8"
        fill="#4D96FF"
        stroke="#2D3436"
        strokeWidth="3"
      />
      {/* Shine on right card */}
      <Circle cx="161" cy="100" r="15" fill="#A3D5FF" opacity="0.6" />

      {/* Connecting element */}
      <Path
        d="M 120 130 Q 128 140 136 130"
        stroke="#FFD93D"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default MemoryIcon;
