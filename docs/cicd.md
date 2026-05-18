# CI/CD 운영 계획

이 문서는 모아동 Expo React Native 앱의 Android/iOS 배포 전략과 저장소에 추가할 CI/CD 구성 계획을 정리한다.

## 기본 원칙

- EAS Build는 사용하지 않는다.
- Android는 GitHub Actions, fastlane, Expo prebuild를 사용해 Google Play에 배포한다.
- `prod` 브랜치에 머지되면 Android release AAB를 Google Play production 트랙의 draft release로 업로드한다.
- Android internal testing 업로드는 수동 GitHub Actions 실행으로 유지한다.
- iOS는 비용 문제로 Xcode Cloud의 Archive + TestFlight 배포를 우선 사용한다.
- 실제 secret 값, keystore, Firebase/Google/Apple 계정 파일은 저장소에 커밋하지 않는다.
- `EXPO_PUBLIC_*` 값은 클라이언트 번들에 포함되므로 비밀값으로 취급하지 않는다.

## 환경 변수

앱 실행과 CI에서 필요한 공개 환경 변수는 `.env.example`에 문서화한다.

| 이름 | 필수 | 설명 |
| --- | --- | --- |
| `EXPO_PUBLIC_BASE_URL` | O | API 서버 base URL |
| `EXPO_PUBLIC_WEBVIEW_URL` | O | WebView 화면에서 사용할 웹 base URL |
| `EXPO_PUBLIC_MIXPANEL_TOKEN` | O | Mixpanel 프로젝트 토큰. 번들에 포함되는 공개값 |

GitHub Actions에서는 가능하면 GitHub Variables에 `EXPO_PUBLIC_*` 값을 둔다. Secrets에 넣어도 동작은 하며, 현재 workflow는 Secrets를 먼저 읽고 없으면 Variables를 사용한다. 단, `EXPO_PUBLIC_*` 값은 번들에 포함되는 공개값이라는 점을 운영자가 오해하지 않아야 한다.

## 커밋 금지 파일

다음 파일은 로컬 또는 CI에서만 생성하고 저장소에 커밋하지 않는다.

- `.env`
- `google-services.json`
- `GoogleService-Info.plist`
- `*.jks`
- `*.keystore`
- `*.p8`
- `*.p12`
- `*.mobileprovision`

현재 `.gitignore`에는 `/android`, `/ios`, `.env`, `google-services.json`, `GoogleService-Info.plist`가 포함되어 있다. Android는 prebuild 산출물을 커밋하지 않는 흐름을 유지한다.

## GitHub Actions 트리거

현재 설정된 workflow 트리거는 다음과 같다.

| Workflow | 파일 | 트리거 | 동작 |
| --- | --- | --- | --- |
| Android Check | `.github/workflows/android-check.yml` | 모든 `pull_request`, `main` 브랜치 `push` | lint, Android prebuild, debug assemble 검증 |
| Android Release | `.github/workflows/android-release.yml` | `prod` 브랜치 `push` | production 트랙에 draft release AAB 업로드 |
| Android Release | `.github/workflows/android-release.yml` | `workflow_dispatch` 수동 실행 | 선택한 fastlane lane 실행. 기본값은 `internal` |

GitHub에서 PR을 `prod` 브랜치로 merge하면 `prod` 브랜치에 push 이벤트가 발생하므로 Android Release workflow가 자동 실행된다. 직접 push도 같은 이벤트로 취급된다.

## Android 배포 흐름

Android production draft release는 `prod` 브랜치에 merge될 때 자동으로 시작한다.

1. `prod` 브랜치 push로 `.github/workflows/android-release.yml`이 실행된다.
2. workflow가 `npm ci`로 의존성을 설치한다.
3. GitHub Secrets 또는 Variables의 `EXPO_PUBLIC_*` 값을 사용해 `.env`를 생성한다.
4. GitHub Secrets의 Firebase/Play/keystore 값을 임시 파일로 복원한다.
5. `bundle exec fastlane android production_draft`를 실행한다.
6. fastlane lane이 `CI=1 npx expo prebuild --platform android --clean`를 실행한다.
7. config plugin이 release signing config를 `android/app/build.gradle`에 반영한다.
8. Gradle이 release AAB를 생성한다.
9. fastlane `upload_to_play_store(track: "production", release_status: "draft")`로 Google Play production 트랙에 draft release를 생성한다.

수동으로 internal testing 배포가 필요하면 GitHub Actions에서 Android Release workflow를 `workflow_dispatch`로 실행하고 기본 lane인 `internal`을 선택한다.

### Android GitHub Secrets

| 이름 | 설명 |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | 업로드 keystore 파일을 base64로 인코딩한 값 |
| `MYAPP_UPLOAD_STORE_FILE` | CI에서 복원할 upload keystore 파일명. 권장값은 `moadong-upload.keystore` |
| `MYAPP_UPLOAD_STORE_PASSWORD` | upload keystore password |
| `MYAPP_UPLOAD_KEY_ALIAS` | upload key alias |
| `MYAPP_UPLOAD_KEY_PASSWORD` | upload key password |
| `GOOGLE_SERVICES_JSON_BASE64` | Android Firebase 설정 JSON 전체 내용을 base64로 인코딩한 값 |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Google Play Android Publisher API service account JSON 전체 내용 |
| `EXPO_PUBLIC_BASE_URL` | API 서버 base URL. Secrets 또는 Variables에 설정 가능 |
| `EXPO_PUBLIC_WEBVIEW_URL` | WebView 화면에서 사용할 웹 base URL. Secrets 또는 Variables에 설정 가능 |
| `EXPO_PUBLIC_MIXPANEL_TOKEN` | Mixpanel 프로젝트 토큰. Secrets 또는 Variables에 설정 가능 |

`MYAPP_UPLOAD_STORE_FILE`을 설정하지 않으면 workflow 기본값은 `moadong-upload.keystore`다.

### Android release signing

Expo prebuild 이후 Android native 파일은 재생성될 수 있으므로 release signing 설정은 수동 편집 대신 Expo config plugin으로 주입한다.

추가할 plugin:

```text
plugins/withAndroidReleaseSigning.js
```

`app.json`의 `plugins` 배열에는 다음 항목을 추가한다.

```json
"./plugins/withAndroidReleaseSigning"
```

plugin은 `android/app/build.gradle`에 다음 Gradle properties 기반 signing config를 idempotent하게 삽입한다.

```properties
MYAPP_UPLOAD_STORE_FILE=moadong-upload.keystore
MYAPP_UPLOAD_STORE_PASSWORD=...
MYAPP_UPLOAD_KEY_ALIAS=...
MYAPP_UPLOAD_KEY_PASSWORD=...
```

값은 로컬 또는 CI의 `android/gradle.properties`에서만 공급한다. 저장소에는 실제 비밀번호나 keystore를 넣지 않는다.

## Android check workflow

`.github/workflows/android-check.yml`은 PR/push 검증용으로 둔다.

검증 단계:

1. `npm ci`
2. `npm run lint`
3. CI용 placeholder `google-services.json` 생성
4. `CI=1 npx expo prebuild --platform android --clean`
5. `cd android && ./gradlew :app:assembleDebug`

이 workflow는 배포를 하지 않으며, secret 없이 실행 가능해야 한다. Firebase 실제 프로젝트 파일 대신 placeholder를 사용해 prebuild와 debug assemble만 확인한다.

## fastlane 구성

추가할 파일:

```text
Gemfile
fastlane/Appfile
fastlane/Fastfile
```

`Gemfile`은 fastlane 실행 환경을 고정한다.

`fastlane/Appfile`은 Android package name과 service account JSON 경로를 환경 변수 기반으로 둔다.

권장 환경 변수:

| 이름 | 설명 |
| --- | --- |
| `SUPPLY_JSON_KEY` | Google Play service account JSON 파일 경로 |
| `ANDROID_PACKAGE_NAME` | 기본값 `com.moadong.moadong` |

`fastlane/Fastfile`에는 `android internal`, `android production_draft` lane을 둔다.

공통 빌드 책임:

- 필요한 CI 파일이 있는지 확인한다.
- Android prebuild를 실행한다.
- `android/gradle.properties`에 signing property를 작성한다.
- `./gradlew bundleRelease`로 AAB를 만든다.

lane별 업로드 책임:

- `upload_to_play_store(track: "internal")`로 internal testing에 업로드한다.
- `upload_to_play_store(track: "production", release_status: "draft")`로 production draft release를 만든다.
- 초기 도입 단계에서는 metadata, images, screenshots 업로드를 skip한다.

## iOS Xcode Cloud 전략

iOS는 Xcode Cloud의 Archive + TestFlight 배포를 기본 경로로 사용한다. fastlane 기반 iOS 배포는 fallback 문서로만 남기고, 기본 구현 대상에는 포함하지 않는다.

### ios 폴더 커밋 전략

Xcode Cloud가 scheme을 안정적으로 인식하려면 `ios/`와 shared scheme이 저장소에 있어야 한다.

현재 저장소의 `.gitignore`는 `/ios`를 제외하고 있으므로 Xcode Cloud를 실제로 연결할 때는 다음 중 하나를 선택한다.

1. `/ios` ignore 규칙을 제거하고 `ios/` 전체를 커밋한다.
2. ignore 규칙은 유지하되 `git add -f ios/...`로 Xcode Cloud에 필요한 iOS native 파일을 명시적으로 커밋한다.

권장안은 1번이다. Xcode project, workspace, shared scheme, entitlements, Podfile 변경 이력을 일반 Git 변경으로 관리할 수 있기 때문이다.

native dependency, Expo plugin, app config, bundle identifier, entitlements, Firebase iOS 설정 방식이 바뀌면 로컬에서 다음 명령으로 iOS 산출물을 갱신한 뒤 커밋한다.

```bash
npx expo prebuild --platform ios --clean
```

### Xcode Cloud post clone script

추가할 파일:

```text
ci_scripts/ci_post_clone.sh
```

script 책임:

- npm 의존성 설치
- Xcode Cloud 환경 변수에서 `GoogleService-Info.plist` 복원
- `IOS_APS_ENVIRONMENT` 값에 따라 entitlement의 `aps-environment` 보정
- CocoaPods 설치

Xcode Cloud에서는 기본값을 `IOS_APS_ENVIRONMENT=production`으로 둔다. 로컬 개발이나 debug archive는 값을 지정하지 않거나 `development`로 둔다.

## Expo config 전환

iOS entitlement의 `aps-environment`를 환경별로 바꾸기 위해 `app.config.js`를 추가한다.

전략:

- 기존 `app.json`은 정적 설정의 source of truth로 유지한다.
- `app.config.js`는 `app.json`을 읽고 필요한 값만 환경 변수에 따라 보정한다.
- `IOS_APS_ENVIRONMENT=production`이면 `ios.entitlements["aps-environment"]`를 `production`으로 설정한다.
- 그 외에는 `development`로 설정한다.

확인 명령:

```bash
npx expo config --type public
IOS_APS_ENVIRONMENT=production npx expo config --type public
```

## 구현 대상 파일

최종 구현 시 추가하거나 수정할 파일은 다음과 같다.

```text
docs/cicd.md
.env.example
app.config.js
app.json
plugins/withAndroidReleaseSigning.js
Gemfile
fastlane/Appfile
fastlane/Fastfile
.github/workflows/android-check.yml
.github/workflows/android-release.yml
ci_scripts/ci_post_clone.sh
```

secret 값, keystore, `google-services.json`, `GoogleService-Info.plist`는 구현 대상 파일에 포함하지 않는다.

## 검증 계획

구현 완료 후 다음 순서로 확인한다.

```bash
npm run lint
npx expo config --type public
IOS_APS_ENVIRONMENT=production npx expo config --type public
CI=1 npx expo prebuild --platform android --clean
cd android && ./gradlew :app:assembleDebug
```

검증 포인트:

- Expo config가 기존 앱 설정을 유지한다.
- `IOS_APS_ENVIRONMENT=production`일 때 `aps-environment`가 `production`으로 바뀐다.
- Android prebuild 후 `android/app/build.gradle`에 release signing config가 중복 없이 들어간다.
- debug assemble은 secret 없이 placeholder Firebase 파일로 통과한다.
- release workflow는 `prod` 브랜치 push에서 Google Play production draft release 업로드를 수행한다.
- release workflow를 수동 실행하면 선택한 lane을 실행하며, 기본값은 internal testing 업로드다.
