/**
 * 검색 아이콘 SVG 컴포넌트
 */

import React from 'react';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

interface SearchIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function SearchIcon({ 
  width = 19, 
  height = 19, 
  color = '#4B4B4B' 
}: SearchIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 19 19" fill="none">
      <G clipPath="url(#clip0_3692_13366)">
        <Path 
          d="M13.1841 13.3682L15.2499 15.434L17.3157 17.4998" 
          stroke={color} 
          strokeWidth="1.5" 
          strokeLinecap="round"
        />
        <Circle 
          cx="8.28002" 
          cy="8.09594" 
          r="6.84594" 
          stroke={color} 
          strokeWidth="1.5"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3692_13366">
          <Rect width="19" height="19" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
}
