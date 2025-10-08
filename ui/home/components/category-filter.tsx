import { CategoryIcon, CategoryType, categoryColorMap } from '@/components/icon';
import { MoaText } from '@/components/moa-text';
import { BorderRadius, Spacing } from '@/constants/theme';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

/**
 * 카테고리 필터 Props
 */
interface CategoryFilterProps {
  selected?: CategoryType;
  onSelect?: (category: CategoryType) => void;
  showAllCategory?: boolean;
}

/**
 * 카테고리 필터 컴포넌트
 * 
 * @example
 * ```tsx
 * const [category, setCategory] = useState<CategoryType>('전체');
 * 
 * <CategoryFilter 
 *   selected={category} 
 *   onSelect={setCategory}
 * />
 * ```
 */
export function CategoryFilter({ 
  selected = '전체',
  onSelect,
  showAllCategory = true,
}: CategoryFilterProps) {
  const categories: CategoryType[] = showAllCategory
    ? ['전체', '학술', '봉사', '운동', '종교', '취미교양', '공연']
    : ['학술', '봉사', '운동', '종교', '취미교양', '공연'];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => (
        <CategoryFilterItem
          key={category}
          category={category}
          selected={selected === category}
          onPress={() => onSelect?.(category)}
        />
      ))}
    </ScrollView>
  );
}

/**
 * 카테고리 필터 아이템
 */
interface CategoryFilterItemProps {
  category: CategoryType;
  selected: boolean;
  onPress: () => void;
}

function CategoryFilterItem({ 
  category, 
  selected, 
  onPress 
}: CategoryFilterItemProps) {
  const backgroundColor = selected 
    ? 'rgba(0, 0, 0, 0.05)'
    : 'rgba(0, 0, 0, 0.00)' ;

  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { opacity: pressed ? 0.7 : 1 }
      ]}
    >
      <View 
        style={[
          styles.iconContainer,
          { backgroundColor }
        ]}
      >
        <CategoryIcon 
          category={category} 
          selected={selected}
          size={32}
        />
      </View>
      <MoaText 
        type="caption1Medium"
        style={[
          styles.label,
          selected && { color: categoryColorMap[category].main }
        ]}

      >
        {category}
      </MoaText>
    </Pressable>
  );
}

/**
 * 그리드 형태의 카테고리 선택 컴포넌트
 */
export function CategoryGrid({ 
  selected,
  onSelect,
  columns = 4,
}: CategoryFilterProps & { columns?: number }) {
  const categories: CategoryType[] = ['전체', '학술', '봉사', '운동', '종교', '취미교양', '공연'];

  return (
    <View style={styles.grid}>
      {categories.map((category) => {
        const isSelected = selected === category;
        const backgroundColor = isSelected 
          ? categoryColorMap[category] 
          : 'rgba(0, 0, 0, 0.05)';

        return (
          <Pressable
            key={category}
            onPress={() => onSelect?.(category)}
            style={[
              styles.gridItem,
              { width: `${100 / columns}%` }
            ]}
          >
            <View 
              style={[
                styles.gridIconContainer,
                { backgroundColor }
              ]}
            >
              <CategoryIcon 
                category={category} 
                selected={isSelected}
                size={40}
              />
            </View>
            <MoaText 
              type="caption1Medium"
              style={[
                styles.gridLabel,
                isSelected && { color: categoryColorMap[category] }
              ]}
            >
              {category}
            </MoaText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  item: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
  },
  gridItem: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  gridIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  gridLabel: {
    textAlign: 'center',
  },
});
