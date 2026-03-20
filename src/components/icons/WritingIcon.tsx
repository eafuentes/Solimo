import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

/**
 * WritingIcon — pencil with a traced letter "A" path.
 * Matches the icon style of the other activity icons.
 */
export const WritingIcon: React.FC<IconProps> = ({ size = 64 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 256 256">
      {/* Paper/canvas background */}
      <Path
        d="M40 30 H216 Q226 30 226 40 V216 Q226 226 216 226 H40 Q30 226 30 216 V40 Q30 30 40 30 Z"
        fill="#FFFEF5"
        stroke="#E8DFC0"
        strokeWidth="4"
      />

      {/* Dotted guide lines (like writing paper) */}
      <Line x1="55" y1="90" x2="200" y2="90" stroke="#E0D8C0" strokeWidth="1.5" strokeDasharray="4,4" />
      <Line x1="55" y1="140" x2="200" y2="140" stroke="#E0D8C0" strokeWidth="1.5" strokeDasharray="4,4" />
      <Line x1="55" y1="190" x2="200" y2="190" stroke="#E0D8C0" strokeWidth="1.5" />

      {/* Letter "A" traced in crayon style */}
      <Path
        d="M100 185 L128 65 L156 185"
        fill="none"
        stroke="#FF6B6B"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M108 150 L148 150"
        fill="none"
        stroke="#FF6B6B"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Pencil */}
      <Path
        d="M190 45 L210 55 L175 115 L160 120 L165 105 Z"
        fill="#FFD93D"
        stroke="#D4A800"
        strokeWidth="2"
      />
      <Path
        d="M160 120 L165 105 L175 115 Z"
        fill="#F5C542"
      />
      {/* Pencil tip */}
      <Path
        d="M160 120 L155 130 L165 105"
        fill="#333"
      />

      {/* Small crayon dot */}
      <Circle cx="70" cy="70" r="8" fill="#4D96FF" opacity={0.6} />
      <Circle cx="90" cy="55" r="6" fill="#6BCB77" opacity={0.5} />
    </Svg>
  );
};

export default WritingIcon;
