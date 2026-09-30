# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

**모아동 (Moadong)** — 대학교 동아리 탐색 및 알림 구독을 위한 React Native + Expo 앱.

홈과 동아리 상세를 포함한 주요 화면은 웹(`EXPO_PUBLIC_WEBVIEW_URL`)을 WebView로 감싼 것이고, 네이티브는 부트스트랩·푸시·구독 상태·딥링크를 담당하는 셸입니다. 네이티브 화면은 웹뷰 로드 실패 시의 폴백으로 남아 있습니다.

- **Bundle ID**: `com.moadong.moadong`
- **딥링크 스킴**: `moadongapp://`, associated domain: `www.moadong.com`
- **React Native New Architecture** 활성화 (`newArchEnabled: true`)
- **React Compiler** / **typed routes** (실험적 기능) 활성화

## 명령어

```bash
npm start              # Expo 개발 서버 시작
npm run ios            # iOS 시뮬레이터 실행
npm run android        # Android 에뮬레이터 실행
npm run lint           # ESLint 실행 (expo lint)
npx expo start --dev-client  # 개발 클라이언트 빌드로 시작
```

환경 변수 (`.env`):
- `EXPO_PUBLIC_BASE_URL` — API 서버
- `EXPO_PUBLIC_WEBVIEW_URL` — 웹뷰가 로드할 웹 오리진 (기본값 `https://moadong.com`)
- `EXPO_PUBLIC_MIXPANEL_TOKEN` — 없으면 Mixpanel 비활성화

## 아키텍처

### 라우팅 (Expo Router 파일 기반)
```
app/
  _layout.tsx          # 루트 레이아웃: 강제 업데이트 체크 → 부트스트랩 → 스플래시, Context 프로바이더
  index.tsx            # 홈. HomeWebViewScreen 우선, 로드 실패 시 ui/home/home-screen 네이티브 폴백
  club/[id].tsx        # 동아리 상세 (WebView). ui/club-detail/club-detail-screen 재export
  clubDetail/[id].tsx  # 위와 동일한 ClubDetailScreen 재export. FCM 딥링크가 이 경로로 들어옴
  webview/[slug].tsx   # 범용 WebView. pageConfig / path / url 파라미터로 목적지 결정
  modal.tsx            # 모달 화면
```

하단 탭 네비게이터(`(tabs)/`)는 없습니다. 홈이 웹뷰로 전환되면서 탭 UI가 웹으로 넘어갔습니다.

### 부트스트랩 순서 (app/_layout.tsx)
실제 실행 순서 (`services/app-bootstrap.service.ts`):
1. Firebase Remote Config로 강제 업데이트 체크 (`force-update.service.ts`). 업데이트가 필요하면 여기서 멈춥니다
2. 액세스 토큰 조회/발급 (`ensureAccessToken`). 이후 단계의 선행 조건이라 순차 실행입니다
3. 아래 셋을 **병렬**로 실행합니다 (`Promise.all`) — 서로 순서가 없습니다
   - 서버에서 구독 동아리 목록 동기화
   - Mixpanel identify (`user:<JWT sub>`)
   - FCM 토큰 등록
4. 부트스트랩 성공 **이후, 스플래시가 내려간 뒤에** iOS ATT(앱 추적 투명성) 권한 요청

부트스트랩이 완료될 때까지 커스텀 스플래시 화면이 UI를 차단합니다. 실패하면 재시도 다이얼로그(`BootstrapErrorDialog`)가 뜹니다.

### API 레이어 (services/api.ts)
두 가지 Axios 클라이언트 인스턴스:
- `publicApi` — 인증 없는 요청
- `authApi` — `Bearer` 토큰 자동 첨부; 401 응답 시 `/auth/student`로 토큰 자동 갱신

신규 코드는 항상 `authApi` / `publicApi` 헬퍼를 사용하세요. `api` (default export)는 deprecated입니다.

### 상태 관리
Redux/Zustand 미사용. React Context 사용:
- `SubscribedClubsProvider` (`contexts/subscribed-clubs-context.tsx`) — 구독 동아리 ID 목록, 구독 토글, 서버 동기화
- `MixpanelProvider` (`contexts/mixpanel-context.tsx`) — 애널리틱스 세션 ID. 부트스트랩 결과를 props로 받습니다
- `HomeWebViewPreloadProvider` (`contexts/home-webview-preload-context.tsx`) — 홈 웹뷰 프리로드 상태. 스플래시 종료 시점을 결정합니다

### UI 레이어 패턴 (`ui/`)
`ui/` 하위 기능별 폴더 구조. 현재 `ui/home`과 `ui/club-detail` 둘입니다:
- `hook/` — 데이터 페칭 훅 (`use-clubs`, `use-subscribed-clubs`). 현재 `ui/home`에만 있습니다
- `model/` — 파생 상태 / 데이터 변환
- `components/` — 기능별 컴포넌트
- `index.ts` — barrel export

### 디자인 시스템 (constants/theme.ts)
`@/constants/theme`에서 임포트:
- `MainColors` — 오렌지 계열 팔레트 (`main` = `#FF5414`)
- `TagColors` — 카테고리별 색상 (봉사/학술/종교/취미교양/운동/공연)
- `Spacing` — 4px 기준 스케일: `xs`(4) `sm`(8) `md`(16) `lg`(24) `xl`(32) `xxl`(40) `xxxl`(48)
- `BorderRadius` — `xs`(4) `sm`(8) `md`(12) `lg`(16) `xl`(20) `full`(9999)

폰트: **Pretendard** (Regular/Medium/SemiBold/Bold). React Native의 `Text` 대신 `@/components/moa-text`의 `<MoaText type="...">` 사용.

타이포그래피 변형: `heading1-3`, `title1-3`, `body1SemiBold`, `body1Medium`, `body1Regular`, `body2Regular`, `caption1SemiBold`, `caption1Medium`.

### 네이밍 컨벤션
- 파일명: `kebab-case.tsx`
- 컴포넌트: `PascalCase`
- 훅: `use` 접두사 + `camelCase`
- named export 선호; default export는 `app/` 하위 화면 컴포넌트에만 사용
- 경로 별칭: `@/`는 프로젝트 루트를 가리킴

### 플랫폼별 파일
플랫폼 오버라이드는 `.ios.tsx` / `.web.ts` 접미사 사용 (예: `icon-symbol.ios.tsx`, `use-color-scheme.web.ts`).
