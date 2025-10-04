import AllIconDefault from '@/assets/icons/ic-전체.svg';
import AllIconSelected from '@/assets/icons/ic-전체-clicked.svg';
import PerformanceIconDefault from '@/assets/icons/ic-공연.svg';
import PerformanceIconSelected from '@/assets/icons/ic-공연-clicked.svg';
import ReligionIconDefault from '@/assets/icons/ic-종교.svg';
import ReligionIconSelected from '@/assets/icons/ic-종교-clicked.svg';
import HobbyIconDefault from '@/assets/icons/ic-취미교양.svg';
import HobbyIconSelected from '@/assets/icons/ic-취미교양-clicked.svg';
import VolunteerIconDefault from '@/assets/icons/ic-봉사.svg';
import VolunteerIconSelected from '@/assets/icons/ic-봉사-clicked.svg';
import AcademicIconDefault from '@/assets/icons/ic-학술.svg';
import AcademicIconSelected from '@/assets/icons/ic-학술-clicked.svg';
import SportsIconDefault from '@/assets/icons/ic-운동.svg';
import SportsIconSelected from '@/assets/icons/ic-운동-clicked.svg';
import { TagColors } from '@/constants/theme';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import type { ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';
import type { SvgProps } from 'react-native-svg';

/**
 * 카테고리 아이콘 타입
 */
export type CategoryType = 
  | '전체' 
  | '학술' 
  | '봉사' 
  | '운동' 
  | '종교' 
  | '취미교양' 
  | '공연';

/**
 * 카테고리 아이콘 Props
 */
type SvgComponent = React.FC<SvgProps>;

interface CategoryIconProps {
  category: CategoryType;
  selected?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * 일반 아이콘 Props
 */
type IconSource = ImageSourcePropType | SvgComponent;

interface IconProps {
  source: IconSource;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * 카테고리 아이콘 매핑
 */
const categoryIconMap: Record<CategoryType, { default: SvgComponent; selected: SvgComponent }> = {
  전체: {
    default: AllIconDefault,
    selected: AllIconSelected,
  },
  학술: {
    default: AcademicIconDefault,
    selected: AcademicIconSelected,
  },
  봉사: {
    default: VolunteerIconDefault,
    selected: VolunteerIconSelected,
  },
  운동: {
    default: SportsIconDefault,
    selected: SportsIconSelected,
  },
  종교: {
    default: ReligionIconDefault,
    selected: ReligionIconSelected,
  },
  취미교양: {
    default: HobbyIconDefault,
    selected: HobbyIconSelected,
  },
  공연: {
    default: PerformanceIconDefault,
    selected: PerformanceIconSelected,
  },
};

/**
 * 카테고리 색상 매핑
 */
export const categoryColorMap: Record<CategoryType, { main: string; light: string }> = {
  전체: TagColors.academic,
  학술: TagColors.academic,
  봉사: TagColors.volunteer,
  운동: TagColors.sports,
  종교: TagColors.religion,
  취미교양: TagColors.hobby,
  공연: TagColors.performance,
};

/**
 * 카테고리 아이콘 컴포넌트
 * 
 * @example
 * ```tsx
 * <CategoryIcon category="학술" selected={true} size={24} />
 * ```
 */
export function CategoryIcon({
  category,
  selected = false,
  size = 24,
  style,
}: CategoryIconProps) {
  const IconComponent = selected
    ? categoryIconMap[category].selected
    : categoryIconMap[category].default;

  return <IconComponent width={size} height={size} style={style} />;
}

/**
 * 일반 아이콘 컴포넌트
 * 동적으로 아이콘 소스를 받아서 렌더링
 * 
 * @example
 * ```tsx
 * import SearchIcon from '@/assets/icons/ic-search.svg';
 * 
 * <Icon 
 *   source={SearchIcon} 
 *   size={24} 
 *   color="#FF5414" 
 * />
 * ```
 */
function isSvgComponent(source: IconSource): source is SvgComponent {
  return typeof source === 'function';
}

export function Icon({
  source,
  size = 24,
  color,
  style,
}: IconProps) {
  if (isSvgComponent(source)) {
    const SvgComponent = source;
    return (
      <SvgComponent
        width={size}
        height={size}
        color={color}
        style={style}
      />
    );
  }

  return (
    <Image
      source={source}
      style={[
        { width: size, height: size },
        color && { tintColor: color },
        style as StyleProp<ImageStyle>,
      ]}
      contentFit="contain"
    />
  );
}

/**
 * 배경이 있는 카테고리 아이콘 컴포넌트
 * 
 * @example
 * ```tsx
 * <CategoryIconWithBackground 
 *   category="학술" 
 *   selected={true} 
 *   size={48} 
 * />
 * ```
 */
interface CategoryIconWithBackgroundProps {
  category: CategoryType;
  selected?: boolean;
  size?: number;
  style?: ViewStyle;
}

export function CategoryIconWithBackground({ 
  category, 
  selected = false, 
  size = 48, 
  style 
}: CategoryIconWithBackgroundProps) {
  const colors = categoryColorMap[category];
  const backgroundColor = selected ? colors.main : colors.light;

  return (
    <View style={[
      styles.iconBackground,
      { 
        width: size, 
        height: size, 
        backgroundColor,
        borderRadius: size / 2,
      },
      style,
    ]}>
      <CategoryIcon 
        category={category} 
        selected={selected} 
        size={size * 0.5} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconBackground: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
