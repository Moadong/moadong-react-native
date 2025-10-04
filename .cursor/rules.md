# Moadong App - 프로젝트 문서

## 프로젝트 개요

**프로젝트명**: moadong-app
**버전**: 1.0.0
**타입**: React Native + Expo 기반 크로스 플랫폼 모바일 애플리케이션
**라우팅**: Expo Router (파일 기반 라우팅)
**언어**: TypeScript (strict 모드)

## 기술 스택

### 핵심 프레임워크
- **React**: 19.1.0
- **React Native**: 0.81.4
- **Expo SDK**: ~54.0.12
- **TypeScript**: ~5.9.2

### 네비게이션 & 라우팅
- **Expo Router**: ~6.0.10 (파일 기반 라우팅)
- **React Navigation**: ^7.1.8
  - Bottom Tabs: ^7.4.0
  - Navigation Elements: ^2.6.3

### 주요 라이브러리
- **React Native Reanimated**: ~4.1.1 (애니메이션)
- **React Native Gesture Handler**: ~2.28.0 (제스처 처리)
- **Expo Haptics**: ~15.0.7 (햅틱 피드백)
- **Expo Image**: ~3.0.8 (최적화된 이미지)
- **Expo Symbols**: ~1.0.7 (SF Symbols 지원)

### 개발 도구
- **ESLint**: ^9.25.0 (expo 설정)
- **Expo Router Typed Routes**: 활성화

## 프로젝트 구조

```
moadong-app/
├── app/                          # 앱 화면 (파일 기반 라우팅)
│   ├── _layout.tsx              # 루트 레이아웃
│   ├── (tabs)/                  # 탭 네비게이션 그룹
│   │   ├── _layout.tsx          # 탭 레이아웃
│   │   ├── index.tsx            # 홈 화면
│   │   └── explore.tsx          # 탐색 화면
│   └── modal.tsx                # 모달 화면
├── assets/                      # 정적 자산
│   └── images/                  # 이미지 파일
├── components/                  # 재사용 가능한 컴포넌트
│   ├── ui/                      # UI 기본 컴포넌트
│   │   ├── collapsible.tsx
│   │   ├── icon-symbol.tsx
│   │   └── icon-symbol.ios.tsx
│   ├── themed-text.tsx          # 테마 적용 텍스트
│   ├── themed-view.tsx          # 테마 적용 뷰
│   ├── parallax-scroll-view.tsx # 패럴랙스 스크롤
│   ├── haptic-tab.tsx           # 햅틱 피드백 탭
│   ├── hello-wave.tsx           # 애니메이션 웨이브
│   └── external-link.tsx        # 외부 링크
├── constants/                   # 상수 및 테마
│   └── theme.ts                 # 색상 및 폰트 정의
├── hooks/                       # 커스텀 훅
│   ├── use-color-scheme.ts      # 색상 스킴 훅
│   ├── use-color-scheme.web.ts  # 웹용 색상 스킴
│   └── use-theme-color.ts       # 테마 색상 훅
└── scripts/                     # 유틸리티 스크립트
    └── reset-project.js         # 프로젝트 초기화

```

## 라우팅 시스템

### Expo Router 파일 기반 라우팅
- `app/` 디렉토리의 파일 구조가 자동으로 앱의 라우트를 정의
- 폴더명을 괄호로 감싸면 (예: `(tabs)`) URL 경로에 포함되지 않는 라우트 그룹 생성

### 현재 라우트 구조
```
/ (루트)
├── (tabs)/
│   ├── index      → 홈 화면 (탭)
│   └── explore    → 탐색 화면 (탭)
└── modal          → 모달 화면
```

### 라우팅 설정
- **Typed Routes**: 활성화됨 (타입 안전 라우팅)
- **Anchor**: `(tabs)` (기본 초기 경로)

## 테마 시스템

### 색상 스킴
프로젝트는 라이트/다크 모드를 지원하며, `constants/theme.ts`에 정의되어 있습니다.

#### 라이트 모드
- 텍스트: `#11181C`
- 배경: `#fff`
- 틴트: `#0a7ea4`
- 아이콘: `#687076`

#### 다크 모드
- 텍스트: `#ECEDEE`
- 배경: `#151718`
- 틴트: `#fff`
- 아이콘: `#9BA1A6`

### 폰트 시스템
플랫폼별로 다른 폰트 설정:
- **iOS**: SF Pro 시스템 폰트 (sans, serif, rounded, mono)
- **Web**: 시스템 폰트 스택
- **Android**: 기본 시스템 폰트

### 테마 컴포넌트
- `ThemedText`: 자동으로 테마 색상을 적용하는 텍스트 컴포넌트
- `ThemedView`: 자동으로 테마 배경색을 적용하는 뷰 컴포넌트

## 컴포넌트 패턴

### 1. Themed 컴포넌트
테마를 지원하는 컴포넌트는 `lightColor`, `darkColor` prop을 받습니다.

```typescript
<ThemedText lightColor="#000" darkColor="#fff">
  텍스트
</ThemedText>
```

### 2. ThemedText 타입
- `default`: 기본 텍스트 (16px, line-height 24)
- `title`: 타이틀 (32px, bold)
- `defaultSemiBold`: 세미볼드 텍스트 (16px, 600)
- `subtitle`: 서브타이틀 (20px, bold)
- `link`: 링크 스타일 (16px, #0a7ea4)

### 3. 햅틱 피드백
`HapticTab` 컴포넌트를 사용하여 탭 전환 시 햅틱 피드백 제공

### 4. 아이콘
- `IconSymbol`: SF Symbols 기반 아이콘 시스템
- iOS와 다른 플랫폼에 대한 별도 구현 제공

## TypeScript 설정

### 컴파일러 옵션
- **Strict 모드**: 활성화
- **Path Alias**: `@/*` → 프로젝트 루트

### 사용 예시
```typescript
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
```

## Expo 설정 (app.json)

### 주요 설정
- **New Architecture**: 활성화 (React Native 최신 아키텍처)
- **React Compiler**: 실험적 기능 활성화
- **Edge-to-Edge**: Android에서 활성화
- **User Interface Style**: automatic (시스템 설정 따름)
- **Scheme**: `moadongapp://` (딥링크 지원)

### 플랫폼별 설정

#### iOS
- 태블릿 지원: 활성화

#### Android
- 배경색: `#E6F4FE`
- Edge-to-Edge: 활성화
- Predictive Back Gesture: 비활성화

#### Web
- 정적 출력
- Favicon 지원

## 개발 가이드라인

### 1. 파일 생성 규칙
- 모든 컴포넌트는 kebab-case로 명명 (예: `themed-text.tsx`)
- 화면 파일은 `app/` 디렉토리 내 적절한 위치에 생성
- 재사용 가능한 컴포넌트는 `components/` 디렉토리에 배치
- UI 기본 컴포넌트는 `components/ui/` 디렉토리에 배치

### 2. 임포트 규칙
- 프로젝트 내부 임포트는 `@/` 별칭 사용
- React Native 컴포넌트는 직접 임포트
- Expo 모듈은 `expo-*` 형식으로 임포트

### 3. 스타일링
- StyleSheet.create() 사용
- 인라인 스타일은 최소화
- 테마 색상은 `useThemeColor` 훅 사용
- 플랫폼별 스타일은 `Platform.select()` 사용

### 4. 타입 정의
- Props 타입은 명시적으로 정의
- 컴포넌트는 함수형으로 작성
- React.FC 대신 명시적 반환 타입 권장

### 5. 애니메이션
- React Native Reanimated 사용
- 복잡한 애니메이션은 `useAnimatedStyle` 훅 활용
- Worklets 지원 활성화됨

## NPM 스크립트

```bash
npm start           # Expo 개발 서버 시작
npm run android     # Android 앱 실행
npm run ios         # iOS 앱 실행
npm run web         # 웹 버전 실행
npm run lint        # ESLint 실행
npm run reset-project  # 프로젝트 초기화 (예제 코드 제거)
```

## 코딩 컨벤션

### 1. 명명 규칙
- **컴포넌트**: PascalCase (예: `ThemedText`)
- **파일명**: kebab-case (예: `themed-text.tsx`)
- **함수/변수**: camelCase (예: `useColorScheme`)
- **상수**: UPPER_SNAKE_CASE 또는 camelCase (테마 객체)
- **타입/인터페이스**: PascalCase (예: `ThemedTextProps`)

### 2. 컴포넌트 구조
```typescript
// 1. 임포트
import { StyleSheet } from 'react-native';
import { Component } from '@/components/component';

// 2. 타입 정의
export type MyComponentProps = {
  prop1: string;
  prop2?: number;
};

// 3. 컴포넌트 정의
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  // 훅
  const value = useHook();
  
  // 렌더
  return (
    <View style={styles.container}>
      {/* 내용 */}
    </View>
  );
}

// 4. 스타일
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### 3. 파일 구조
- export는 named export 사용 (default export는 화면 컴포넌트에만)
- 하나의 파일에는 하나의 주요 컴포넌트만 배치
- 관련 타입은 같은 파일에 정의

## 주의사항

### 1. React 19 사용
- 최신 React 19.1.0 사용 중
- 새로운 React 기능 활용 가능

### 2. New Architecture
- Expo newArchEnabled: true
- Fabric 렌더러 사용
- TurboModules 지원

### 3. React Compiler
- 실험적 기능 활성화됨
- 자동 메모이제이션 지원

### 4. 플랫폼별 파일
- `.ios.tsx`, `.android.tsx`, `.web.tsx` 확장자로 플랫폼별 구현 가능
- 예: `icon-symbol.ios.tsx`, `use-color-scheme.web.ts`

## 확장 가능성

### 추가 화면 생성
1. `app/` 디렉토리에 새 파일 생성
2. 탭에 추가하려면 `app/(tabs)/` 내에 생성
3. 모달/스택 화면은 `app/` 루트에 생성

### 새 컴포넌트 추가
1. `components/` 디렉토리에 파일 생성
2. UI 기본 컴포넌트는 `components/ui/` 에 배치
3. 테마 지원이 필요하면 `useThemeColor` 훅 활용

### 상태 관리
- 현재 전역 상태 관리 라이브러리 미사용
- 필요시 Context API, Zustand, Redux 등 추가 가능

## 디버깅

### 개발자 도구 열기
- **iOS**: `cmd + d`
- **Android**: `cmd + m`
- **Web**: `F12`

### 유용한 도구
- Expo DevTools: 개발 서버 실행 시 자동으로 열림
- React DevTools: 컴포넌트 트리 검사
- Network Inspector: 네트워크 요청 모니터링

## 배포

현재 프로젝트는 개발 단계이며, 배포 전 다음 사항을 고려해야 합니다:
1. `app.json`에 앱 아이콘, 스플래시 스크린 커스터마이징
2. 번들 식별자 및 패키지명 설정
3. EAS Build 구성 (Expo Application Services)
4. 앱 스토어 메타데이터 준비

## 참고 자료

- [Expo 문서](https://docs.expo.dev/)
- [Expo Router 가이드](https://docs.expo.dev/router/introduction/)
- [React Native 문서](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)

---

**마지막 업데이트**: 2025-10-04
**프로젝트 버전**: 1.0.0

