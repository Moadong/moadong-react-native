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
 * 일반 아이콘 타입
 */
export type IconType = '검색' | '메뉴';

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
  name: IconType;
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
 * 일반 아이콘 매핑
 */
const iconMap: Record<IconType, any> = {
  검색: require('@/assets/icons/ic-검색.svg'),
  메뉴: require('@/assets/icons/ic-메뉴.svg'),
};

/**
 * 카테고리 컬러 매핑
 */
export const categoryColorMap: Record<CategoryType, string> = {
  전체: '#4A9FFF',
  학술: TagColors.academic.main,
  봉사: TagColors.volunteer.main,
  운동: TagColors.sports.main,
  종교: TagColors.religion.main,
  취미교양: TagColors.hobby.main,
  공연: TagColors.performance.main,
};

/**
 * 카테고리 아이콘 컴포넌트
 * 
 * @example
 * ```tsx
 * <CategoryIcon category="학술" selected={false} size={40} />
 * <CategoryIcon category="봉사" selected={true} />
 * ```
 */
export function CategoryIcon({ 
  category, 
  selected = false, 
  size = 40,
  style,
}: CategoryIconProps) {
  const source = selected 
    ? categoryIconMap[category].selected 
    : categoryIconMap[category].default;
  
  return (
    <Image
      source={source}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
    />
  );
}

/**
 * 일반 아이콘 컴포넌트
 * 
 * @example
 * ```tsx
 * <Icon name="검색" size={24} />
 * <Icon name="메뉴" size={24} />
 * ```
 */
export function Icon({ 
  name, 
  size = 24,
  style,
}: IconProps) {
  return (
    <Image
      source={iconMap[name]}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
    />
  );
}

/**
 * 배경색과 함께 표시되는 카테고리 아이콘 Props
 */
interface CategoryIconWithBackgroundProps {
  category: CategoryType;
  selected?: boolean;
  size?: number;
  style?: ViewStyle;
}

/**
 * 배경색과 함께 표시되는 카테고리 아이콘
 * 
 * @example
 * ```tsx
 * <CategoryIconWithBackground category="학술" selected={false} />
 * <CategoryIconWithBackground category="봉사" selected={true} size={56} />
 * ```
 */
export function CategoryIconWithBackground({ 
  category, 
  selected = false,
  size = 48,
  style,
}: CategoryIconWithBackgroundProps) {
  const backgroundColor = selected 
    ? categoryColorMap[category] 
    : 'rgba(0, 0, 0, 0.05)';

  return (
    <View 
      style={[
        styles.iconContainer,
        { 
          backgroundColor,
          width: size,
          height: size,
          borderRadius: size * 0.25,
        },
        style,
      ]}
    >
      <CategoryIcon 
        category={category} 
        selected={selected}
        size={size * 0.6}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

