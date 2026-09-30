# Mixpanel 신원 통일 결정

- 작성: 2026-09-30
- 상태: **보류.** 방향은 B로 정했으나 지금 실행하지 않는다 (근거: 로그인이 웹뷰 안이고 네이티브 추적 비중이 작다)
- 관련: `services/app-bootstrap.service.ts`, `contexts/mixpanel-context.tsx`, 웹 `frontend/src/utils/initSDK.ts`

## 배경 — 지금 무슨 일이 일어나고 있나

한 사람이 Mixpanel에 두 명으로 기록된다.

| 이벤트 출처 | distinct_id | 근거 |
|---|---|---|
| 네이티브 | `user:<JWT sub>` | `app-bootstrap.service.ts:33` |
| 웹뷰 안의 웹 | `moadong_<ts>_<rand>` | `initSDK.ts` `mixpanel.identify(sessionId)` |

두 ID를 잇는 `alias`/머지 호출이 **양쪽 레포 어디에도 없다**(grep 0건). 백엔드는 Export API로 읽기만 한다.

**이건 회귀다.** `f496e47`(2026-02-26) 이전에는 네이티브도 `mixpanel.identify(session_id)`를 했고, 그 값은 웹이 URL로 받는 것과 같은 `@moadong_session_id`였다. 즉 **그때는 한 사람이었고 이 커밋이 갈라놨다.**

### 확인된 사실

- **같은 프로젝트다 (확인됨).** 프로덕션 프로젝트 `Moadong`(3611536)을 조회했을 때, `url`에 `app://moadong`이 포함된 이벤트(네이티브 SDK만 붙이는 기본값 — `use-mixpanel-track.ts:23`)와 웹 이벤트(`moadong_*` 814명)가 **같은 프로젝트 안에 함께 있었다.**

  즉 앱과 웹이 같은 통에 쓰고 있다. 토큰 문자열 자체는 레포에서 볼 수 없지만(앱은 GitHub secret, 웹은 호스팅 대시보드), **이벤트가 실제로 같이 쌓이는 것을 확인한 것이 문자열 비교보다 강한 증거다.** 이 항목은 더 확인할 것이 없다.
- **영향 트래픽은 작다.** 네이티브 이벤트가 90일 기준 유니크 2명. 홈이 웹뷰로 전환되며 네이티브 추적이 사실상 사라졌고, 퍼널(`FunnelDefinitions.java`)도 대부분 웹 이벤트다.
- **퍼널은 `distinctId`로 묶는다**(`FunnelDashboardService.java:36`). 앱/웹 경계를 넘는 전환은 이어지지 않는다.
- `ClubCard Clicked`는 양쪽에 다 정의돼 있다(네이티브 `constants/eventname.ts:5`, 웹 `frontend/src/constants/eventName.ts:37`).

## 대안

### A. 네이티브를 `session_id`로 되돌린다

`app-bootstrap.service.ts:33`을 `identifyMixpanel(sessionId)`로. 1줄. 웹 변경 없음.

- **이득**: 변경량 최소. `f496e47` 이전 상태로 복귀
- **비용**: **더 약한 신원을 고르게 된다**(아래 참고). `session_id`는 로컬에만 있어 복구 경로가 없다
- **판정**: 기각

### B. 웹을 `user:<sub>`로 옮긴다 — **선택**

웹 `initSDK.ts`가 주입된 학생 토큰에서 `sub`를 뽑아 `user:<sub>`로 identify한다. 앱은 그대로.

```ts
const injected = window.__MOADONG_STUDENT_TOKEN__;
const sub = injected && getTokenSubject(injected);
if (sub) mixpanel.identify(`user:${sub}`);        // 앱 웹뷰 → 네이티브와 동일
else if (sessionId) mixpanel.identify(sessionId); // 구버전 앱 호환
```

필요한 것이 **이미 다 있다**:
- 주입 토큰 `window.__MOADONG_STUDENT_TOKEN__` — 홈 웹뷰(PR #28) + `[slug]`(PR #40)
- `sub` 추출 함수 `getTokenSubject` — `studentFetch.ts:22`. UUID v4 검증까지 한다. `const`라 export만 필요
- 시점 보장 — 주입은 `injectedJavaScriptBeforeContentLoaded`라 content load 이전, `initializeMixpanel()`은 `index.tsx:10` 모듈 로드 시점

### C. `alias` 또는 다중 `identify`로 머지

- **비용**: 프로젝트의 ID Merge 설정(Original/Simplified)에 의존하고, **머지는 되돌릴 수 없다**
- **판정**: 설정을 모르는 상태에서 비가역 작업을 할 수 없다. 기각

## 선택: B. 이유는 신원의 복구 가능성

| | 복구 가능? |
|---|---|
| `session_id` | **불가.** `@moadong_session_id`(AsyncStorage)에만 존재. `utils/mixpanel.ts:27-30`은 스토리지 오류 시 **저장 없이 일회용 ID를 반환**한다 → 그 순간 신원이 갈린다 |
| `user:<sub>` | **가능.** `sub`가 서버 `StudentUser.studentId`(unique index)에 있다. `resolveAuthSubject()`가 토큰 안 `sub`를 다시 보내 같은 신원으로 재발급받는다 |

두 값 모두 AsyncStorage에 있어 **내구성 자체는 같다**. 차이는 **서버가 아는지**다.

`session_id`를 신원으로 쓰는 한 위 `catch` 결함이 남는다. B를 택하면 `session_id`가 신원이 아니게 되어 그 결함이 사라진다.

방향의 근거가 하나 더 있다. `ensureAccessToken`의 single-flight 가드 주석(`auth-token.service.ts:72-73`)은 *"첫 실행 시 부트스트랩과 웹뷰가 동시에 호출하면 서로 다른 sub/토큰이 발급되어 앱 신원과 웹뷰 신원이 갈린다"*고 적고 있다. **학생 토큰 쪽에서는 이미 같은 함정을 겪고 고쳤고, Mixpanel 쪽만 안 고친 상태다.**

## 로그인 도입과의 관계

**로그인은 전부 웹뷰 안에서 이뤄진다.** 이 사실이 이 작업의 우선순위를 크게 낮춘다.

Mixpanel에서 익명→식별 전환은 로그인 시점에 `identify(accountId)`를 부르면 그때의 distinct_id가 계정 클러스터로 병합되는 식이다.

로그인이 웹뷰 안이면 **로그인 전 탐색과 로그인 이벤트가 모두 웹 SDK 한쪽에서 일어난다.** 즉 웹이 들고 있는 신원이 그대로 계정에 병합되고, "동아리 둘러봄 → 가입함" 같은 퍼널이 깨지지 않는다. 신원이 통일돼 있든 아니든 마찬가지다.

**그래서 남는 손실은 하나뿐이다** — 네이티브가 보내는 이벤트(`permission-dialog.tsx`, `banner.tsx`, `club-detail-screen.tsx`, 웹뷰 실패 시 `home-screen.tsx`)가 계정에 붙지 않고 별도 익명 프로필로 남는다. 그 규모가 90일 유니크 2명이다.

초안에서는 이 절을 "이 결정은 로그인의 선행 조건"이라고 적었다. **로그인이 네이티브 화면이라는 가정이었고, 그 가정이 틀렸다.** 네이티브 로그인이라면 가입 전 웹뷰 이력이 고아가 되므로 선행 조건이 맞지만, 웹뷰 로그인에서는 해당하지 않는다.

### 로그인 작업에서 따로 필요할 것 (이 결정과 별개)

로그인이 웹뷰 안에서만 일어나면 **앱 네이티브는 로그인 상태와 계정 ID를 모른다.** 네이티브 이벤트를 계정에 귀속시키거나 계정 단위 푸시를 보내려면, 웹이 로그인 결과를 브리지로 앱에 알려주는 메시지가 필요하다. 지금 브리지에는 그런 메시지가 없다(`webviewBridge.ts`). 이건 로그인 작업의 범위이고 이 문서의 결정과 독립이다.

### 로그인 작업 전에 확정해야 할 것

**프로젝트의 ID Merge 모드(Original vs Simplified)를 확인해야 한다.** 코드로는 확인이 불가능하고 Mixpanel 콘솔에서만 보인다.

- **Simplified**: `identify()`만으로 익명 ID가 계정 클러스터에 합류한다. `alias` 불필요
- **Original**: 첫 로그인에 `alias`, 이후 `identify`. 규칙이 다르고 틀리면 신원이 갈린다

**이건 이 문서의 결정과 무관하게 로그인 작업에서 반드시 필요하다.** 틀리면 계정 신원이 갈린다.

## 되돌릴 조건

**코드는 되돌릴 수 있지만 데이터는 아니다.**

기존 브라우저가 `moadong_Y`였는데 `user:X`로 identify하면 Mixpanel이 두 ID를 한 클러스터로 묶는다. **그 병합은 취소 불가다.** `initSDK.ts`를 한 줄 되돌리면 이후 이벤트는 원래 ID로 가지만, 이미 묶인 클러스터는 풀리지 않는다.

그래서 배포는 한 번에 하고, 되돌릴 판단은 코드 롤백이 아니라 **"이 신원 축을 유지할 것인가"** 수준에서 한다. 되돌릴 조건은 하나다 — 로그인 도입 시 계정 ID를 신원 축으로 쓰기로 정하면, `user:<sub>`는 익명 구간 전용으로 역할이 줄어든다. 그때 이 문서를 갱신한다.

## 명시적 한계

- **과거 데이터는 어떤 방법으로도 소급 병합되지 않는다.** 2026-02-26 이후 갈라진 프로필은 그대로 남는다. 이 수정은 "오늘부터"만 고친다
- **순수 브라우저 사용자는 여전히 익명이다.** 우체통에 들어가야 학생 토큰이 발급되므로(`studentFetch`가 `feedback.ts`에서만 쓰인다) 그 전에는 `sub`가 없다. 단 현재도 `session_id`가 없어 익명이므로 **상태 변화는 없다**
- 순수 브라우저 사용자와 앱 사용자가 다른 신원인 것은 분리가 아니라 다른 사람이다

## 실행 순서

### 지금 하는 것

1. 앱 죽은 코드 제거 — `contexts/mixpanel-context.tsx`의 폴백 분기. `_layout.tsx`가 `initialReady`를 항상 boolean으로 넘겨 도달 불가였고, 신원 결정 로직이 두 곳에 있는 것처럼 읽혀서 이번 조사에서 실제로 방어 코드로 오해했다. **이 정리는 결정과 무관하게 옳다** → 이 PR에 포함

### 재개 조건이 충족되면 하는 것

2. 웹 `initSDK.ts` 변경 + `getTokenSubject` export
3. `utils/mixpanel.ts:27-30`의 일회용 ID 반환 제거 (별건)
4. 검증 — 신규 설치로 앱 켜고 웹뷰에서 클릭 → Mixpanel 프로필 **1개**

## 결정

**방향은 B. 실행은 보류한다.**

B가 맞는 방향인 근거는 유지된다 — 두 신원 모두 AsyncStorage에 있어 내구성은 같지만 `sub`만 서버(`StudentUser.studentId`)에 있어 복구 경로가 있고, 필요한 조각(주입 토큰, `getTokenSubject`, 주입 시점 보장)이 이미 전부 존재한다.

**지금 실행하지 않는 이유:**

- 로그인이 웹뷰 안이라 가입 퍼널이 깨지지 않는다. 초안에서 이걸 선행 조건이라고 적었는데 가정이 틀렸다
- 갈라진 채로 남는 손실이 **네이티브 이벤트 90일 2명**이다. 고치는 비용(웹 레포 PR + 비가역 클러스터 병합 리스크)이 그 이득보다 크다
- 되돌릴 수 없는 작업을 이 정도 이득으로 하는 건 맞지 않다

**재개 조건 (하나라도 충족되면 다시 검토):**

1. 네이티브 화면·이벤트 비중이 늘어난다 (네이티브 추적 유니크 사용자가 유의미한 수준으로 증가)
2. 네이티브 이벤트를 계정에 귀속시켜야 하는 요구가 생긴다
3. 로그인 화면이 네이티브로 바뀐다
4. 네이티브/웹뷰 신원 분리로 실제 분석이 틀린 사례가 나온다

**같이 남는 별건:** `utils/mixpanel.ts:27-30`이 스토리지 오류 시 저장 없이 일회용 ID를 반환한다. 이건 B와 무관하게 **지금도 웹 신원을 갈라놓는 결함**이다(웹의 distinct_id가 `session_id`니까). 따로 볼 가치가 있다.
