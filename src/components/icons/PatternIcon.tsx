import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const PatternIcon: React.FC<IconProps> = ({ size = 64, color = '#FF6B6B' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256">
      {/* Row 1 */}
      <Rect x="50" y="50" width="35" height="35" rx="4" fill="#FF6B6B" />
      <Rect x="100" y="50" width="35" height="35" rx="4" fill="#4D96FF" />
      <Rect x="150" y="50" width="35" height="35" rx="4" fill="#FF6B6B" />

      {/* Row 2 */}
      <Rect x="50" y="100" width="35" height="35" rx="4" fill="#4D96FF" />
      <Rect x="100" y="100" width="35" height="35" rx="4" fill="#FF6B6B" />
      <Rect x="150" y="100" width="35" height="35" rx="4" fill="#4D96FF" />

      {/* Row 3 */}
      <Rect x="50" y="150" width="35" height="35" rx="4" fill="#FF6B6B" />
      <Rect x="100" y="150" width="35" height="35" rx="4" fill="#4D96FF" />
      <Rect x="150" y="150" width="35" height="35" rx="4" fill="#FF6B6B" />
    </Svg>
  );
};

export default PatternIcon;
