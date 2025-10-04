/**
 * 모아동 앱 디자인 시스템
 * Figma 디자인을 기반으로 한 타이포그래피, 컬러, 스페이싱 시스템
 */

import { Platform, TextStyle } from 'react-native';

// ============================================================================
// Colors - Figma 디자인 기반
// ============================================================================

/**
 * Main 컬러 팔레트
 * 앱의 주요 컬러로 사용되는 오렌지 계열 컬러
 */
export const MainColors = {
  main: '#FF5414',      // Main 1 - 가장 진한 메인 컬러
  main2: '#FF7543',     // Main 2
  main3: '#FF9F7C',     // Main 3
  main4: '#FFDED2',     // Main 4
  main5: '#FFECE5',     // Main 5 - 가장 연한 메인 컬러
} as const;

/**
 * 태그 컬러 시스템
 * 동아리 카테고리별로 사용되는 컬러
 */
export const TagColors = {
  volunteer: {
    main: '#FF6694',    // 봉사 - 핑크
    light: '#FFF0F4',   // 봉사 light
  },
  academic: {
    main: '#5C85FF',    // 학술 - 블루
    light: '#EFF3FF',   // 학술 light
  },
  religion: {
    main: '#FFCE2D',    // 종교 - 옐로우
    light: '#FFFAEB',   // 종교 light
  },
  hobby: {
    main: '#44D8BB',    // 취미교양 - 민트
    light: '#E8FAF6',   // 취미교양 light
  },
  sports: {
    main: '#FF9233',    // 운동 - 오렌지
    light: '#FFF7EB',   // 운동 light
  },
  performance: {
    main: '#BD69F6',    // 공연 - 퍼플
    light: '#FAF2FF',   // 공연 light
  },
} as const;

/**
 * 시맨틱 컬러
 * 다크모드를 지원하는 기본 컬러 시스템
 */
const tintColorLight = MainColors.main;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// ============================================================================
// Typography - Figma 디자인 기반
// ============================================================================

/**
 * Font Weights
 * Pretendard 폰트를 기준으로 정의
 */
export const FontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semiBold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
};

/**
 * Typography Variants
 * Figma의 타이포그래피 시스템을 React Native 스타일로 변환
 * 
 * 명명 규칙: 
 * - heading: 제목용 (큰 텍스트, Bold)
 * - title: 섹션 제목용 (중간 텍스트, Bold)
 * - body: 본문용 (일반 텍스트, Regular/Medium/SemiBold)
 */
export const Typography = {
  // Heading Styles (제목용)
  heading1: {
    fontSize: 40,
    lineHeight: 56,
    fontWeight: FontWeights.bold,
    letterSpacing: -0.5,
  } as TextStyle,
  
  heading2: {
    fontSize: 36,
    lineHeight: 50,
    fontWeight: FontWeights.bold,
    letterSpacing: -0.5,
  } as TextStyle,
  
  heading3: {
    fontSize: 28,
    lineHeight: 39,
    fontWeight: FontWeights.bold,
    letterSpacing: -0.3,
  } as TextStyle,
  
  // Title Styles (섹션 제목용)
  title1: {
    fontSize: 24,
    lineHeight: 34,
    fontWeight: FontWeights.bold,
    letterSpacing: -0.3,
  } as TextStyle,
  
  title2: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: FontWeights.bold,
    letterSpacing: -0.2,
  } as TextStyle,
  
  title3: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: FontWeights.bold,
    letterSpacing: -0.2,
  } as TextStyle,
  
  // Body Styles (본문용)
  body1SemiBold: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: FontWeights.semiBold,
  } as TextStyle,
  
  body1Medium: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: FontWeights.medium,
  } as TextStyle,
  
  body1Regular: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: FontWeights.regular,
  } as TextStyle,
  
  body2Regular: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FontWeights.regular,
  } as TextStyle,
  
  // Caption Styles (작은 텍스트용)
  caption1SemiBold: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: FontWeights.semiBold,
  } as TextStyle,
  
  caption1Medium: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: FontWeights.medium,
  } as TextStyle,
};

/**
 * Pretendard 폰트 패밀리
 * expo-font를 사용하여 로드해야 합니다
 */
export const FontFamily = {
  pretendard: Platform.select({
    ios: 'Pretendard',
    android: 'Pretendard',
    web: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
  }),
};

// ============================================================================
// Spacing
// ============================================================================

/**
 * 일관된 간격 시스템
 * 4px 기준으로 8의 배수 사용
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

// ============================================================================
// Border Radius
// ============================================================================

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// ============================================================================
// Legacy Fonts (하위 호환성)
// ============================================================================

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
