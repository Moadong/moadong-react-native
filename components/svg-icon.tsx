/**
 * SVG 아이콘 컴포넌트
 */

import React from 'react';
import { SvgXml } from 'react-native-svg';

/**
 * SVG 아이콘 Props
 */
interface SvgIconProps {
  xml: string;
  size?: number;
  width?: number;
  height?: number;
  color?: string;
  style?: any;
}

/**
 * SVG 아이콘 컴포넌트
 * 
 * @example
 * ```tsx
 * <SvgIcon 
 *   xml={searchSvg} 
 *   size={24} 
 *   color="#FF5414" 
 * />
 * <SvgIcon 
 *   xml={moadongLogoSvg} 
 *   width={80} 
 *   height={32} 
 * />
 * ```
 */
export function SvgIcon({ xml, size, width, height, color, style }: SvgIconProps) {
  // 색상이 지정된 경우 SVG의 fill을 변경
  const coloredXml = color ? xml.replace(/fill="[^"]*"/g, `fill="${color}"`) : xml;
  
  return (
    <SvgXml 
      xml={coloredXml} 
      width={width || size} 
      height={height || size} 
      style={style}
    />
  );
}

/**
 * 검색 아이콘 SVG
 */
export const searchSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
<path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

/**
 * 메뉴 아이콘 SVG
 */
export const menuSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
<line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
<line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

/**
 * 모아동 로고 SVG
 */
export const moadongLogoSvg = `
<svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="2" y="2" width="76" height="28" rx="4" fill="#FF5414"/>
<text x="40" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white">모아동</text>
</svg>
`;
