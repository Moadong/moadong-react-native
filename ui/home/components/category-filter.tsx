import { CategoryIcon, CategoryType, categoryColorMap } from '@/components/icon';
import { MoaText } from '@/components/moa-text';
import { Row } from '@/components/ui';
import { BorderRadius } from '@/constants/theme';
import { Pressable } from 'react-native';
import styled from 'styled-components/native';

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
    <Row justify="space-between" style={{ paddingHorizontal: 16 }}>
      {categories.map((category) => (
        <CategoryFilterItem
          key={category}
          category={category}
          selected={selected === category}
          onPress={() => onSelect?.(category)}
        />
      ))}
    </Row>
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
    <ItemPressable onPress={onPress}>
      <IconContainer backgroundColor={backgroundColor} style={{ borderRadius: BorderRadius.sm }}>
        <CategoryIcon 
          category={category} 
          selected={selected}
          size={40}
        />
      </IconContainer>
      <LabelText type="caption1Medium" selected={selected} category={category}>
        {category}
      </LabelText>
    </ItemPressable>
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
    <GridContainer>
      {categories.map((category) => {
        const isSelected = selected === category;
        const backgroundColor = isSelected 
          ? categoryColorMap[category] 
          : 'rgba(0, 0, 0, 0.05)';

        return (
          <GridItemPressable
            key={category}
            onPress={() => onSelect?.(category)}
            width={`${100 / columns}%`}
          >
            <GridIconContainer backgroundColor={backgroundColor}>
              <CategoryIcon 
                category={category} 
                selected={isSelected}
                size={40}
              />
            </GridIconContainer>
            <GridLabelText selected={isSelected} category={category}>
              {category}
            </GridLabelText>
          </GridItemPressable>
        );
      })}
    </GridContainer>
  );
}

// Styled Components
const ItemPressable = styled(Pressable)`
  align-items: center;
  gap: 4px;
`;

const IconContainer = styled.View<{ backgroundColor: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  background-color: ${(props: { backgroundColor: string }) => props.backgroundColor};
`;

const LabelText = styled(MoaText)<{ selected: boolean; category: CategoryType }>`
  text-align: center;
  color: ${(props: { selected: boolean; category: CategoryType }) => 
    props.selected ? categoryColorMap[props.category].main : undefined};
`;

const GridContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  padding: 16px;
`;

const GridItemPressable = styled(Pressable)<{ width: string }>`
  align-items: center;
  padding-vertical: 16px;
  width: ${(props: { width: string }) => props.width};
`;

const GridIconContainer = styled.View<{ backgroundColor: string }>`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
  background-color: ${(props: { backgroundColor: string }) => props.backgroundColor};
`;

const GridLabelText = styled(MoaText)<{ selected: boolean; category: CategoryType }>`
  text-align: center;
  color: ${(props: { selected: boolean; category: CategoryType }) => 
    props.selected ? categoryColorMap[props.category] : undefined};
`;
