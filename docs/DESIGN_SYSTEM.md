# 모아동 디자인 시스템

Figma 디자인을 기반으로 한 모아동 앱의 디자인 시스템 가이드입니다.

## 📝 목차

1. [타이포그래피](#타이포그래피)
2. [Pretendard 폰트 설정](#pretendard-폰트-설정)
3. [컬러 시스템](#컬러-시스템)
4. [스페이싱](#스페이싱)
5. [사용 예제](#사용-예제)

## 타이포그래피

Figma의 타이포그래피 시스템을 기반으로 Pretendard 폰트를 사용합니다.

### Typography Variants

#### Heading (제목용)

- **heading1**: 40px Bold - 가장 큰 제목 (앱 메인 타이틀)
- **heading2**: 36px Bold - 페이지 제목
- **heading3**: 28px Bold - 섹션 대제목

#### Title (섹션 제목용)

- **title1**: 24px Bold - 중요한 섹션 제목
- **title2**: 20px Bold - 일반 섹션 제목
- **title3**: 18px Bold - 작은 섹션 제목

#### Body (본문용)

- **body1SemiBold**: 16px SemiBold - 강조 본문
- **body1Medium**: 16px Medium - 중간 강조 본문
- **body1Regular**: 16px Regular - 기본 본문 (가장 많이 사용)
- **body2Regular**: 14px Regular - 작은 본문

#### Caption (작은 텍스트용)

- **caption1SemiBold**: 12px SemiBold - 강조 캡션
- **caption1Medium**: 12px Medium - 일반 캡션

### 사용 예제

```tsx
import { Text } from '@/components/themed-text';

// 페이지 제목
<Text type="heading2">환영합니다</Text>

// 섹션 제목
<Text type="title2">최근 활동</Text>

// 본문
<Text type="body1Regular">
  모아동은 동아리 관리를 쉽게 해주는 앱입니다.
</Text>

// 강조 본문
<Text type="body1SemiBold">중요한 내용</Text>

// 작은 텍스트
<Text type="caption1Medium">2024.10.04</Text>
```

## Pretendard 폰트 설정

### 1. 폰트 파일 다운로드

[Pretendard GitHub](https://github.com/orioncactus/pretendard/releases) 에서 최신 버전을 다운로드합니다.

필요한 폰트 파일:
- `Pretendard-Regular.otf` (400)
- `Pretendard-Medium.otf` (500)
- `Pretendard-SemiBold.otf` (600)
- `Pretendard-Bold.otf` (700)

### 2. 폰트 파일 저장

프로젝트에 폰트 디렉토리를 생성하고 폰트 파일을 저장합니다:

```
assets/
  fonts/
    Pretendard-Regular.otf
    Pretendard-Medium.otf
    Pretendard-SemiBold.otf
    Pretendard-Bold.otf
```

### 3. 폰트 로딩 설정

`app/_layout.tsx`에서 폰트를 로드합니다:

```tsx
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Pretendard': require('../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    // ... 나머지 레이아웃 코드
  );
}
```

### 4. React Native 폰트 가중치 매핑 (선택사항)

더 나은 폰트 가중치 제어를 위해 `react-native.config.js` 파일을 생성할 수 있습니다:

```js
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/'],
};
```

그리고 폰트를 링크합니다:

```bash
npx react-native-asset
```

## 컬러 시스템

Figma 디자인을 기반으로 한 컬러 시스템입니다.

### Main Colors (메인 컬러)

앱의 주요 컬러로 사용되는 오렌지 계열 컬러:

```tsx
import { MainColors } from '@/constants/theme';

MainColors.main   // #FF5414 - 메인 컬러 (가장 진함)
MainColors.main2  // #FF7543 - 메인 컬러 2
MainColors.main3  // #FF9F7C - 메인 컬러 3
MainColors.main4  // #FFDED2 - 메인 컬러 4
MainColors.main5  // #FFECE5 - 메인 컬러 5 (가장 연함)
```

### Tag Colors (태그 컬러)

동아리 카테고리별로 사용되는 컬러 시스템:

```tsx
import { TagColors } from '@/constants/theme';

// 봉사 (핑크)
TagColors.volunteer.main   // #FF6694
TagColors.volunteer.light  // #FFF0F4

// 학술 (블루)
TagColors.academic.main    // #5C85FF
TagColors.academic.light   // #EFF3FF

// 종교 (옐로우)
TagColors.religion.main    // #FFCE2D
TagColors.religion.light   // #FFFAEB

// 취미교양 (민트)
TagColors.hobby.main       // #44D8BB
TagColors.hobby.light      // #E8FAF6

// 운동 (오렌지)
TagColors.sports.main      // #FF9233
TagColors.sports.light     // #FFF7EB

// 공연 (퍼플)
TagColors.performance.main  // #BD69F6
TagColors.performance.light // #FAF2FF
```

### Semantic Colors (시맨틱 컬러)

다크모드를 지원하는 기본 컬러 시스템:

```tsx
import { Colors } from '@/constants/theme';

// Light 모드
Colors.light.text        // #11181C
Colors.light.background  // #fff
Colors.light.tint        // #FF5414 (MainColors.main)
Colors.light.icon        // #687076

// Dark 모드
Colors.dark.text         // #ECEDEE
Colors.dark.background   // #151718
Colors.dark.tint         // #fff
Colors.dark.icon         // #9BA1A6
```

### 컬러 사용 예제

#### 태그 컴포넌트

```tsx
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/themed-text';
import { TagColors, Spacing, BorderRadius } from '@/constants/theme';

export function CategoryTag({ category }: { category: 'volunteer' | 'academic' | 'sports' }) {
  const colors = {
    volunteer: TagColors.volunteer,
    academic: TagColors.academic,
    sports: TagColors.sports,
  };

  return (
    <View style={[styles.tag, { backgroundColor: colors[category].main }]}>
      <Text type="caption1SemiBold" style={styles.tagText}>
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    color: '#fff',
  },
});
```

#### 배지 컴포넌트 (Light 버전)

```tsx
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/themed-text';
import { TagColors, Spacing, BorderRadius } from '@/constants/theme';

export function CategoryBadge({ category }: { category: 'hobby' | 'religion' }) {
  const colors = {
    hobby: TagColors.hobby,
    religion: TagColors.religion,
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors[category].light }]}>
      <Text type="body2Regular" style={{ color: colors[category].main }}>
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
});
```

#### 메인 버튼

```tsx
import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/themed-text';
import { MainColors, Spacing, BorderRadius } from '@/constants/theme';

export function MainButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable 
      style={styles.button} 
      onPress={onPress}
    >
      <Text type="body1SemiBold" style={styles.buttonText}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: MainColors.main,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
});
```

#### 테마 컬러 사용

```tsx
import { Text } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

<ThemedView>
  <Text type="body1Regular">
    자동으로 다크모드에 대응합니다
  </Text>
</ThemedView>

// 커스텀 컬러
<Text 
  type="body1Regular"
  lightColor="#FF0000"
  darkColor="#FF6666"
>
  커스텀 컬러 텍스트
</Text>
```

## 스페이싱

일관된 간격을 위한 스페이싱 시스템 (4px 기준):

```tsx
import { Spacing } from '@/constants/theme';

Spacing.xs    // 4px
Spacing.sm    // 8px
Spacing.md    // 16px
Spacing.lg    // 24px
Spacing.xl    // 32px
Spacing.xxl   // 40px
Spacing.xxxl  // 48px
```

### 사용 예제

```tsx
import { View, StyleSheet } from 'react-native';
import { Spacing } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,      // 16px
    gap: Spacing.sm,          // 8px
    marginBottom: Spacing.lg, // 24px
  },
});
```

## Border Radius

일관된 모서리 둥글기:

```tsx
import { BorderRadius } from '@/constants/theme';

BorderRadius.xs    // 4px
BorderRadius.sm    // 8px
BorderRadius.md    // 12px
BorderRadius.lg    // 16px
BorderRadius.xl    // 20px
BorderRadius.full  // 9999px (완전한 원)
```

### 사용 예제

```tsx
import { View, StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '@/constants/theme';

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,  // 12px
    padding: Spacing.md,            // 16px
  },
  button: {
    borderRadius: BorderRadius.full, // 완전한 원형
  },
});
```

## 실전 예제

### 카드 컴포넌트

```tsx
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, BorderRadius } from '@/constants/theme';

export function Card() {
  return (
    <ThemedView style={styles.card}>
      <Text type="title2">카드 제목</Text>
      <Text type="body1Regular" style={styles.description}>
        카드 내용이 여기에 표시됩니다.
      </Text>
      <Text type="caption1Medium">2024.10.04</Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  description: {
    marginVertical: Spacing.sm,
  },
});
```

### 리스트 아이템

```tsx
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function ListItem({ title, subtitle, onPress }) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Text type="body1SemiBold">{title}</Text>
      <Text type="body2Regular">{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
});
```

## 사용 방법

Text 컴포넌트는 `type` prop을 통해 타이포그래피 스타일을 적용합니다:

```tsx
import { Text } from '@/components/themed-text';

// 기본 사용
<Text type="heading2">제목</Text>
<Text type="body1Regular">본문</Text>
<Text type="body1SemiBold">강조 본문</Text>

// type을 지정하지 않으면 기본값 'body1Regular' 적용
<Text>일반 텍스트</Text>
```

## 참고 자료

- [Figma 디자인](https://www.figma.com/design/LB4VudDhuIGjFayrm1kge1/%EB%AA%A8%EC%95%84%EB%8F%99)
- [Pretendard 폰트](https://github.com/orioncactus/pretendard)
- [Expo Font 문서](https://docs.expo.dev/develop/user-interface/fonts/)

