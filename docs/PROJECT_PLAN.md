# 메인 화면 동아리 목록 기능 구현 계획

## 📋 프로젝트 개요

메인 화면에 동아리 목록을 표시하고, 카테고리별 필터링 기능을 제공하는 기능 구현

### 참고 자료
- **API 문서**: https://yourun.shop/swagger-ui/index.html#/Club/searchClubsByKeyword
- **Figma 디자인**: https://www.figma.com/design/LB4VudDhuIGjFayrm1kge1/%EB%AA%A8%EC%95%84%EB%8F%99?node-id=4258-9761&m=dev

## 🎯 주요 요구사항

### 1. API 연동
- **엔드포인트**: `GET /api/clubs/search`
- **쿼리 파라미터**:
  - `keyword`: 검색 키워드 (optional)
  - `category`: 카테고리 필터 (optional)
  - `page`: 페이지 번호
  - `size`: 페이지 크기

### 2. UI 구성요소
- **헤더**: 로고, 검색창, 메뉴 버튼
- **배너**: 자동 슬라이드 (3초 간격, 무한 반복)
- **카테고리 필터**: 7개 카테고리 (전체, 봉사, 종교, 취미교양, 학술, 운동, 공연)
- **동아리 목록**: 카드 형태의 리스트
- **탭**: 중앙동아리 / 과동아리 전환

### 3. 기능 요구사항
✅ 배너 3초 자동 전환
✅ 카테고리 클릭 시 아이콘 상태 변경 (default ↔ clicked)
✅ 카테고리 필터링된 동아리 목록 API 요청
✅ 무한 스크롤 배너 (banner-1 ↔ banner-2)

## 📁 파일 구조

```
├── services/
│   ├── api.ts                    # Axios 설정
│   └── club.service.ts           # 동아리 API 서비스
│
├── types/
│   └── club.types.ts             # 동아리 관련 타입 정의
│
├── components/
│   ├── club-card.tsx             # 동아리 카드 컴포넌트
│   ├── club-list.tsx             # 동아리 리스트 컴포넌트
│   ├── main-header.tsx           # 메인 헤더 컴포넌트
│   └── category-tabs.tsx         # 중앙/과동아리 탭
│
├── app/(tabs)/
│   └── index.tsx                 # 메인 화면
│
└── hooks/
    └── use-clubs.ts              # 동아리 데이터 훅
```

## 🔄 구현 단계

### Phase 1: API 레이어 구축 ✅
**목표**: 백엔드 API와 통신할 수 있는 기반 구축

#### 1.1 Axios 설정
```typescript
// services/api.ts
- Base URL 설정
- 요청/응답 인터셉터
- 에러 핸들링
```

#### 1.2 동아리 서비스
```typescript
// services/club.service.ts
- searchClubs(params): 동아리 검색
- getClubById(id): 동아리 상세
```

#### 1.3 타입 정의
```typescript
// types/club.types.ts
- Club 인터페이스
- SearchParams 인터페이스
- API Response 타입
```

### Phase 2: 컴포넌트 개발 ✅
**목표**: 재사용 가능한 UI 컴포넌트 구축

#### 2.1 동아리 카드 (`club-card.tsx`)
- 동아리 이미지
- 동아리 이름
- 한줄 소개
- 카테고리 태그들
- 등록 버튼

#### 2.2 동아리 리스트 (`club-list.tsx`)
- FlatList로 동아리 카드 렌더링
- 로딩 상태 표시
- 빈 상태 표시
- Pull to refresh

#### 2.3 메인 헤더 (`main-header.tsx`)
- 로고
- 검색창 (현재는 플레이스홀더)
- 검색 아이콘
- 메뉴 아이콘

#### 2.4 카테고리 탭 (`category-tabs.tsx`)
- 중앙동아리 / 과동아리 탭
- 선택 상태 표시

### Phase 3: 메인 화면 통합 ✅
**목표**: 모든 컴포넌트를 메인 화면에 통합

#### 3.1 상태 관리
```typescript
- selectedCategory: 선택된 카테고리
- clubType: 중앙동아리 | 과동아리
- clubs: 동아리 목록
- loading: 로딩 상태
```

#### 3.2 레이아웃 구성
```
┌─────────────────────┐
│ Header              │
├─────────────────────┤
│ Banner (자동 슬라이드)│
├─────────────────────┤
│ Category Filter     │
├─────────────────────┤
│ Tabs (중앙/과동아리) │
├─────────────────────┤
│ Club List           │
│   - Card 1          │
│   - Card 2          │
│   - Card 3          │
│   - ...             │
└─────────────────────┘
```

### Phase 4: 기능 구현 ✅
**목표**: 인터랙션 및 데이터 흐름 구현

#### 4.1 배너 자동 전환
- 3초마다 다음 배너로 전환
- banner-1 → banner-2 → banner-1 (무한 반복)
- 수동 전환 가능
- 인디케이터 표시

#### 4.2 카테고리 필터링
```typescript
const handleCategoryChange = (category: CategoryType) => {
  setSelectedCategory(category);
  // API 재요청
  fetchClubs({ category, clubType });
};
```

#### 4.3 탭 전환
```typescript
const handleTabChange = (type: 'central' | 'department') => {
  setClubType(type);
  // API 재요청
  fetchClubs({ category: selectedCategory, clubType: type });
};
```

### Phase 5: 최적화 및 테스트 ✅
**목표**: 성능 최적화 및 버그 수정

#### 5.1 성능 최적화
- React.memo로 컴포넌트 메모이제이션
- useMemo로 계산 최적화
- useCallback으로 함수 메모이제이션

#### 5.2 에러 처리
- API 에러 핸들링
- 네트워크 에러 표시
- 재시도 기능

#### 5.3 테스트
- 카테고리 필터링 동작 확인
- 배너 자동 전환 확인
- 탭 전환 확인
- API 에러 시나리오 테스트

## 📊 API 명세

### 동아리 검색 API

**Request**
```
GET /api/clubs/search?keyword={keyword}&category={category}&page={page}&size={size}
```

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| keyword | string | X | 검색 키워드 |
| category | string | X | 카테고리 (전체, 학술, 봉사, 운동, 종교, 취미교양, 공연) |
| page | number | X | 페이지 번호 (default: 0) |
| size | number | X | 페이지 크기 (default: 20) |

**Response**
```typescript
{
  content: Array<{
    id: number;
    name: string;
    description: string;
    category: string[];
    imageUrl?: string;
    memberCount?: number;
    type: 'central' | 'department';
  }>;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
```

## 🎨 디자인 명세

### 색상
- **배경색**: `#FFFFFF`
- **카드 배경**: `#F8F9FA`
- **카테고리 색상**: `TagColors` (기존 디자인 시스템)
- **등록 버튼**: `MainColors.main` (#FF5414)

### 타이포그래피
- **동아리 이름**: `body1SemiBold` (16px SemiBold)
- **소개**: `body2Regular` (14px Regular)
- **카테고리 태그**: `caption1Medium` (12px Medium)

### 간격
- **카드 간격**: `Spacing.md` (16px)
- **카드 내부 패딩**: `Spacing.md` (16px)
- **카테고리 필터 간격**: `Spacing.md` (16px)

## 🔧 기술 스택

- **HTTP Client**: Axios
- **상태 관리**: React Hooks (useState, useEffect)
- **이미지**: expo-image
- **스타일링**: StyleSheet (React Native)
- **네비게이션**: expo-router

## ⚠️ 주의사항

1. **API Base URL**: 환경변수로 관리
2. **에러 처리**: 사용자에게 친화적인 에러 메시지
3. **로딩 상태**: 스켈레톤 UI 또는 스피너
4. **이미지 최적화**: 캐싱 및 리사이징
5. **카테고리 매핑**: 한글 ↔ 영문 변환 필요 시

## 📱 반응형 고려사항

- 화면 너비에 따른 카드 크기 조정
- 작은 화면에서 카테고리 필터 스크롤
- Safe Area 고려

## 🚀 배포 전 체크리스트

- [ ] API 연동 테스트
- [ ] 카테고리 필터링 동작 확인
- [ ] 배너 자동 전환 확인
- [ ] 탭 전환 동작 확인
- [ ] 에러 처리 확인
- [ ] 로딩 상태 확인
- [ ] 디자인 QA
- [ ] 성능 테스트

## 📝 추후 개선 사항

- 동아리 상세 페이지 연결
- 검색 기능 구현
- 페이지네이션 또는 무한 스크롤
- 동아리 찜하기 기능
- 필터 옵션 추가 (정렬, 인원수 등)

