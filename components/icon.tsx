import { TagColors } from '@/constants/theme';
import { Image, ImageStyle } from 'expo-image';
import { StyleSheet, View, ViewStyle } from 'react-native';

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
interface CategoryIconProps {
  category: CategoryType;
  selected?: boolean;
  size?: number;
  style?: ImageStyle;
}

/**
 * 일반 아이콘 Props
 */
interface IconProps {
  source: any;
  size?: number;
  color?: string;
  style?: ImageStyle;
}

/**
 * 카테고리 아이콘 매핑
 */
const categoryIconMap: Record<CategoryType, { default: any; selected: any }> = {
  전체: {
    default: require('@/assets/icons/ic-전체.svg'),
    selected: require('@/assets/icons/ic-전체-clicked.svg'),
  },
  학술: {
    default: require('@/assets/icons/ic-학술.svg'),
    selected: require('@/assets/icons/ic-학술-clicked.svg'),
  },
  봉사: {
    default: require('@/assets/icons/ic-봉사.svg'),
    selected: require('@/assets/icons/ic-봉사-clicked.svg'),
  },
  운동: {
    default: require('@/assets/icons/ic-운동.svg'),
    selected: require('@/assets/icons/ic-운동-clicked.svg'),
  },
  종교: {
    default: require('@/assets/icons/ic-종교.svg'),
    selected: require('@/assets/icons/ic-종교-clicked.svg'),
  },
  취미교양: {
    default: require('@/assets/icons/ic-취미교양.svg'),
    selected: require('@/assets/icons/ic-취미교양-clicked.svg'),
  },
  공연: {
    default: require('@/assets/icons/ic-공연.svg'),
    selected: require('@/assets/icons/ic-공연-clicked.svg'),
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
  style 
}: CategoryIconProps) {
  const iconSource = selected 
    ? categoryIconMap[category].selected 
    : categoryIconMap[category].default;

  return (
    <Image
      source={iconSource}
      style={[
        { width: size, height: size },
        style,
      ]}
      contentFit="contain"
    />
  );
}

/**
 * 일반 아이콘 컴포넌트
 * 동적으로 아이콘 소스를 받아서 렌더링
 * 
 * @example
 * ```tsx
 * <Icon 
 *   source={require('@/assets/icons/ic-검색.svg')} 
 *   size={24} 
 *   color="#FF5414" 
 * />
 * ```
 */
export function Icon({ 
  source, 
  size = 24, 
  color, 
  style 
}: IconProps) {
  return (
    <Image
      source={source}
      style={[
        { width: size, height: size },
        color && { tintColor: color },
        style,
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