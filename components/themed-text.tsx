import { Text as RNText, type TextProps } from 'react-native';

import { FontFamily, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * Figma 디자인 시스템 기반 Typography 타입
 */
export type TypographyType =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'body1SemiBold'
  | 'body1Medium'
  | 'body1Regular'
  | 'body2Regular'
  | 'caption1SemiBold'
  | 'caption1Medium';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: TypographyType;
};

/**
 * 타이포그래피 시스템을 적용한 Text 컴포넌트
 * 
 * @example
 * ```tsx
 * <Text type="heading1">제목</Text>
 * <Text type="body1Regular">본문</Text>
 * ```
 */
export function Text({
  style,
  lightColor,
  darkColor,
  type = 'body1Regular',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  
  // 타이포그래피 스타일 가져오기
  const typographyStyle = getTypographyStyle(type);

  return (
    <RNText
      style={[
        { color },
        { fontFamily: FontFamily.pretendard },
        typographyStyle,
        style,
      ]}
      {...rest}
    />
  );
}

/**
 * type에 해당하는 타이포그래피 스타일 반환
 */
function getTypographyStyle(type: TypographyType) {
  switch (type) {
    case 'heading1':
      return Typography.heading1;
    case 'heading2':
      return Typography.heading2;
    case 'heading3':
      return Typography.heading3;
    case 'title1':
      return Typography.title1;
    case 'title2':
      return Typography.title2;
    case 'title3':
      return Typography.title3;
    case 'body1SemiBold':
      return Typography.body1SemiBold;
    case 'body1Medium':
      return Typography.body1Medium;
    case 'body1Regular':
      return Typography.body1Regular;
    case 'body2Regular':
      return Typography.body2Regular;
    case 'caption1SemiBold':
      return Typography.caption1SemiBold;
    case 'caption1Medium':
      return Typography.caption1Medium;
    default:
      return Typography.body1Regular;
  }
}
