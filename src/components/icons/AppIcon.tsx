import React from 'react';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export const AppIcon: React.FC<IconProps> = ({ size = 64 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Defs>
        <RadialGradient id="glowGradient" cx="50%" cy="40%">
          <Stop offset="0%" stopColor="#FFF9E6" stopOpacity="1" />
          <Stop offset="50%" stopColor="#FFE680" stopOpacity="1" />
          <Stop offset="100%" stopColor="#FFD633" stopOpacity="1" />
        </RadialGradient>
      </Defs>

      {/* Main blob */}
      <Circle cx="512" cy="512" r="360" fill="url(#glowGradient)" />

      {/* Left eye */}
      <Circle cx="420" cy="460" r="28" fill="#2D3436" />

      {/* Right eye */}
      <Circle cx="604" cy="460" r="28" fill="#2D3436" />

      {/* Smile */}
      <Path
        d="M 420 540 Q 512 600 604 540"
        stroke="#2D3436"
        strokeWidth="24"
        fill="none"
        strokeLinecap="round"
      />

      {/* Sparkle accent top left */}
      <Circle cx="280" cy="250" r="16" fill="#FFE680" />
      <Path
        d="M 272 230 L 272 270 M 260 250 L 300 250"
        stroke="#FFE680"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Sparkle accent top right */}
      <Circle cx="740" cy="260" r="12" fill="#FFD633" />
      <Path
        d="M 734 245 L 734 275 M 725 260 L 755 260"
        stroke="#FFD633"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default AppIcon;
