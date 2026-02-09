import React from 'react';
import Svg, { Circle, Rect, Polygon } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const SortingIcon: React.FC<IconProps> = ({ size = 64, color = '#FF6B6B' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256">
      {/* Red circles */}
      <Circle cx="60" cy="80" r="18" fill="#FF6B6B" />
      <Circle cx="60" cy="130" r="18" fill="#FF6B6B" />

      {/* Blue squares */}
      <Rect x="120" y="62" width="36" height="36" rx="4" fill="#4D96FF" />
      <Rect x="120" y="112" width="36" height="36" rx="4" fill="#4D96FF" />

      {/* Yellow triangles */}
      <Polygon points="190,75 210,125 170,125" fill="#FFD93D" />
      <Polygon points="190,145 210,195 170,195" fill="#FFD93D" />
    </Svg>
  );
};

export default SortingIcon;
