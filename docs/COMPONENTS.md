# 컴포넌트 사용 가이드

## 📦 아이콘 & 이미지 컴포넌트

### 1. 카테고리 아이콘 (`CategoryIcon`)

동아리 카테고리를 나타내는 아이콘 컴포넌트입니다.

```tsx
import { CategoryIcon } from '@/components/icon';

// 기본 사용
<CategoryIcon category="학술" size={40} />

// 선택된 상태 (clicked)
<CategoryIcon category="봉사" selected={true} size={40} />

// 커스텀 스타일
<CategoryIcon 
  category="운동" 
  size={48} 
  style={{ marginRight: 8 }}
/>
```

**지원 카테고리:**
- `전체`, `학술`, `봉사`, `운동`, `종교`, `취미교양`, `공연`

### 2. 배경과 함께 표시되는 카테고리 아이콘 (`CategoryIconWithBackground`)

배경색이 있는 카테고리 아이콘입니다.

```tsx
import { CategoryIconWithBackground } from '@/components/icon';

// 기본 상태 (회색 배경)
<CategoryIconWithBackground category="학술" />

// 선택된 상태 (카테고리 색상 배경)
<CategoryIconWithBackground category="봉사" selected={true} />

// 크기 조절
<CategoryIconWithBackground 
  category="운동" 
  selected={true}
  size={56}
/>
```

### 3. 일반 아이콘 (`Icon`)

검색, 메뉴 등 일반 아이콘입니다.

```tsx
import { Icon } from '@/components/icon';

<Icon name="검색" size={24} />
<Icon name="메뉴" size={24} />
```

### 4. 앱 이미지 (`AppImage`)

배너, 로고 등 앱 내 이미지를 표시합니다.

```tsx
import { AppImage } from '@/components/app-image';

// 배너
<AppImage name="banner-1" width={350} height={140} />
<AppImage name="banner-2" width={350} height={140} />

// 로고
<AppImage name="logo" width={100} height={100} />
```

**지원 이미지:**
- `banner-1`, `banner-2` - 배너 이미지
- `logo` - 앱 로고
- `react-logo`, `react-logo-2x`, `react-logo-3x` - React 로고
- `partial-react-logo` - 부분 React 로고

## 🎯 실전 예제

### 카테고리 필터 (가로 스크롤)

```tsx
import { CategoryFilter } from '@/ui/home/components';
import { useState } from 'react';
import { CategoryType } from '@/components/icon';

export function HomeScreen() {
  const [category, setCategory] = useState<CategoryType>('전체');

  return (
    <View>
      <CategoryFilter 
        selected={category} 
        onSelect={setCategory}
      />
      
      <Text>선택된 카테고리: {category}</Text>
    </View>
  );
}
```

### 카테고리 그리드

```tsx
import { CategoryGrid } from '@/ui/home/components';
import { useState } from 'react';
import { CategoryType } from '@/components/icon';

export function CategorySelectScreen() {
  const [category, setCategory] = useState<CategoryType>('전체');

  return (
    <CategoryGrid 
      selected={category} 
      onSelect={setCategory}
      columns={4}
    />
  );
}
```

### 배너 슬라이더

```tsx
import { Banner } from '@/ui/home/components';

export function HomeScreen() {
  const banners = [
    { 
      id: '1', 
      image: 'banner-1' as const, 
      onPress: () => console.log('Banner 1 clicked') 
    },
    { 
      id: '2', 
      image: 'banner-2' as const,
      onPress: () => console.log('Banner 2 clicked')
    },
  ];

  return (
    <Banner 
      items={banners}
      autoPlay={true}
      autoPlayInterval={3000}
      showIndicator={true}
    />
  );
}
```

### 심플 배너

```tsx
import { SimpleBanner } from '@/ui/home/components';

export function EventScreen() {
  return (
    <SimpleBanner 
      image="banner-1"
      onPress={() => console.log('Banner clicked')}
    />
  );
}
```

### 헤더 with 검색 & 메뉴

```tsx
import { View, Pressable, StyleSheet } from 'react-native';
import { Icon } from '@/components/icon';
import { Text } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function Header() {
  return (
    <View style={styles.header}>
      <Text type="heading3">모아동</Text>
      
      <View style={styles.actions}>
        <Pressable onPress={() => console.log('Search')}>
          <Icon name="검색" size={24} />
        </Pressable>
        
        <Pressable onPress={() => console.log('Menu')}>
          <Icon name="메뉴" size={24} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
});
```

### 카테고리 태그

```tsx
import { View, StyleSheet } from 'react-native';
import { CategoryIcon, categoryColorMap } from '@/components/icon';
import { Text } from '@/components/themed-text';
import { Spacing, BorderRadius } from '@/constants/theme';

export function CategoryTag({ category }: { category: CategoryType }) {
  return (
    <View 
      style={[
        styles.tag,
        { backgroundColor: categoryColorMap[category] }
      ]}
    >
      <CategoryIcon 
        category={category} 
        selected={true}
        size={16}
      />
      <Text 
        type="caption1SemiBold" 
        style={styles.tagText}
      >
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    color: '#fff',
  },
});
```

## 🎨 컬러 시스템 통합

카테고리별 색상은 자동으로 적용됩니다:

```tsx
import { categoryColorMap } from '@/components/icon';

// 카테고리별 색상 가져오기
const color = categoryColorMap['학술']; // #5C85FF
```

**카테고리 색상:**
- 전체: `#4A9FFF`
- 학술: `#5C85FF`
- 봉사: `#FF6694`
- 운동: `#FF9233`
- 종교: `#FFCE2D`
- 취미교양: `#44D8BB`
- 공연: `#BD69F6`

## 📱 반응형 디자인

```tsx
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const iconSize = width < 375 ? 32 : 40; // 작은 화면에서 더 작은 아이콘

<CategoryIcon category="학술" size={iconSize} />
```

## 🔗 관련 문서

- [디자인 시스템 가이드](./DESIGN_SYSTEM.md)
- [아이콘 네이밍 컨벤션](./ICON_NAMING.md)
