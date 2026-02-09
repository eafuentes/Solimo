import React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const NumberIcon: React.FC<IconProps> = ({ size = 64, color = '#FF6B6B' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256">
      {/* Row 1: 1 dot */}
      <Circle cx="128" cy="60" r="12" fill="#FF6B6B" />

      {/* Row 2: 2 dots */}
      <Circle cx="100" cy="110" r="12" fill="#FF6B6B" />
      <Circle cx="156" cy="110" r="12" fill="#FF6B6B" />

      {/* Row 3: 3 dots */}
      <Circle cx="80" cy="160" r="12" fill="#4D96FF" />
      <Circle cx="128" cy="160" r="12" fill="#4D96FF" />
      <Circle cx="176" cy="160" r="12" fill="#4D96FF" />

      {/* Row 4: 4 dots */}
      <Circle cx="70" cy="210" r="12" fill="#FFD93D" />
      <Circle cx="110" cy="210" r="12" fill="#FFD93D" />
      <Circle cx="150" cy="210" r="12" fill="#FFD93D" />
      <Circle cx="190" cy="210" r="12" fill="#FFD93D" />
    </Svg>
  );
};

export default NumberIcon;
