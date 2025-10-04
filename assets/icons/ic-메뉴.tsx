/**
 * 메뉴 아이콘 SVG 컴포넌트
 */

import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

interface MenuIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function MenuIcon({ 
  width = 24, 
  height = 24, 
  color = '#4B4B4B' 
}: MenuIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 60 54" fill="none">
      <G clipPath="url(#clip0_3692_13371)">
        <Path 
          d="M3 3H57" 
          stroke={color} 
          strokeWidth="4.5" 
          strokeLinecap="round"
        />
        <Path 
          d="M3 27H57" 
          stroke={color} 
          strokeWidth="4.5" 
          strokeLinecap="round"
        />
        <Path 
          d="M3 51H57" 
          stroke={color} 
          strokeWidth="4.5" 
          strokeLinecap="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_3692_13371">
          <Rect width="60" height="54" fill="white"/>
        </ClipPath>
      </Defs>
    </Svg>
  );
}
