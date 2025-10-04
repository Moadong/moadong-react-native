# 아이콘 네이밍 컨벤션

## 📝 네이밍 규칙

### 기본 형식
```
ic-{카테고리명}[-clicked].svg
```

- **접두사**: `ic-` (icon의 약자)
- **카테고리명**: 한글 그대로 사용
- **상태**: 
  - 기본 상태: 접미사 없음 (Light 버전, 비활성)
  - 선택 상태: `-clicked` (Dark 버전, 활성)

### 예시

| 카테고리 | 기본 상태 (Light) | 선택 상태 (Dark) |
|---------|------------------|-----------------|
| 전체 | `ic-전체.svg` | `ic-전체-clicked.svg` |
| 학술 | `ic-학술.svg` | `ic-학술-clicked.svg` |
| 봉사 | `ic-봉사.svg` | `ic-봉사-clicked.svg` |
| 운동 | `ic-운동.svg` | `ic-운동-clicked.svg` |
| 종교 | `ic-종교.svg` | `ic-종교-clicked.svg` |
| 취미교양 | `ic-취미교양.svg` | `ic-취미교양-clicked.svg` |
| 공연 | `ic-공연.svg` | `ic-공연-clicked.svg` |

## 🔄 파일 이름 변경 방법

### 방법 1: 자동 스크립트 사용

1. Figma에서 다운로드한 아이콘을 `assets/icons/` 폴더에 복사
2. 스크립트 실행:

```bash
bash scripts/rename-icons.sh
```

### 방법 2: 수동 변경

Figma에서 다운로드한 원본 파일명:
- `전체 모바일.svg` → `ic-전체.svg`
- `전체.svg` → `ic-전체-clicked.svg`
- `학술 모바일.svg` → `ic-학술.svg`
- `학술 모바일 (1).svg` → `ic-학술-clicked.svg`
- (나머지 동일한 패턴)

## 📦 React Native에서 사용하기

### 1. 아이콘 컴포넌트 생성

```tsx
// components/category-icon.tsx
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

type CategoryType = 
  | '전체' 
  | '학술' 
  | '봉사' 
  | '운동' 
  | '종교' 
  | '취미교양' 
  | '공연';

interface CategoryIconProps {
  category: CategoryType;
  selected?: boolean;
  size?: number;
}

const iconMap: Record<CategoryType, { default: any; selected: any }> = {
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

export function CategoryIcon({ 
  category, 
  selected = false, 
  size = 40 
}: CategoryIconProps) {
  const source = selected ? iconMap[category].selected : iconMap[category].default;
  
  return (
    <Image
      source={source}
      style={{ width: size, height: size }}
      contentFit="contain"
    />
  );
}
```

### 2. 사용 예제

```tsx
import { CategoryIcon } from '@/components/category-icon';
import { useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Text } from '@/components/themed-text';

export function CategoryFilter() {
  const [selected, setSelected] = useState<string>('전체');
  
  const categories = ['전체', '학술', '봉사', '운동', '종교', '취미교양', '공연'] as const;

  return (
    <View style={styles.container}>
      {categories.map((category) => (
        <Pressable
          key={category}
          onPress={() => setSelected(category)}
          style={styles.item}
        >
          <CategoryIcon 
            category={category}
            selected={selected === category}
            size={40}
          />
          <Text type="caption1Medium">{category}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  item: {
    alignItems: 'center',
    gap: 4,
  },
});
```

### 3. 배경색과 함께 사용

```tsx
import { View, StyleSheet } from 'react-native';
import { CategoryIcon } from '@/components/category-icon';
import { TagColors } from '@/constants/theme';

export function CategoryButton({ 
  category, 
  selected 
}: { 
  category: CategoryType; 
  selected: boolean;
}) {
  const colorMap = {
    전체: '#4A9FFF',
    학술: TagColors.academic.main,
    봉사: TagColors.volunteer.main,
    운동: TagColors.sports.main,
    종교: TagColors.religion.main,
    취미교양: TagColors.hobby.main,
    공연: TagColors.performance.main,
  };

  return (
    <View 
      style={[
        styles.button,
        { 
          backgroundColor: selected 
            ? colorMap[category] 
            : 'rgba(0,0,0,0.05)'
        }
      ]}
    >
      <CategoryIcon 
        category={category} 
        selected={selected}
        size={32}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

## 🎯 타입 정의

```typescript
// types/category.ts
export type CategoryType = 
  | '전체' 
  | '학술' 
  | '봉사' 
  | '운동' 
  | '종교' 
  | '취미교양' 
  | '공연';

export type IconState = 'default' | 'clicked';

export interface CategoryConfig {
  id: CategoryType;
  name: string;
  color: string;
  lightColor: string;
}
```

## 📚 참고

- 아이콘은 40x40px 기본 크기
- SVG 포맷으로 벡터 형식 사용
- Light 버전: 기본 상태 (비활성)
- Dark 버전: 선택 상태 (활성)
- 파일명에 한글 사용 가능 (React Native에서 지원)

## 🔗 관련 문서

- [디자인 시스템 가이드](./DESIGN_SYSTEM.md)
- [Figma 디자인](https://www.figma.com/design/LB4VudDhuIGjFayrm1kge1/%EB%AA%A8%EC%95%84%EB%8F%99)

