import { DIAGNOSTIC_EVENT } from '@/constants/eventname';
import { getMixpanel } from '@/utils/mixpanel';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const getWebViewUserAgent = (): string => {
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const platform = Platform.OS === 'ios' ? 'iOS' : 'Android';
  return `MoadongApp/${appVersion} (${platform})`;
};

export const appendSessionId = (url: string, sessionId: string): string => {
  if (!sessionId) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}session_id=${encodeURIComponent(sessionId)}`;
};

const WEBVIEW_URL = process.env.EXPO_PUBLIC_WEBVIEW_URL || 'https://moadong.com';

/** 웹뷰가 로드할 URL이 모아동 오리진인지. 학생 토큰을 주입해도 되는지의 기준이다. */
export const isWebViewOrigin = (url: string): boolean => {
  try {
    return new URL(url).origin === new URL(WEBVIEW_URL).origin;
  } catch {
    return false;
  }
};

/**
 * 웹이 첫 API 호출 시점에 앱과 같은 학생 신원을 쓰도록 토큰을 주입하는 스크립트.
 *
 * 가드가 두 겹이다.
 * 1. 진입 URL이 외부일 수 있어(webview/[slug]의 external) RN 쪽에서 먼저 막는다.
 *    비교 기준은 진입 URL이 아니라 모아동 URL이어야 한다 - 진입 URL끼리 비교하면
 *    외부 URL로 진입했을 때 "외부 == 외부"로 통과해 버린다.
 * 2. 주입 스크립트는 웹뷰가 로드하는 모든 문서에서 실행되므로 스크립트 안에서도
 *    실행 시점 origin을 다시 본다. 없으면 외부 사이트로 이동했을 때 토큰이 노출된다.
 *
 * 2번의 origin 비교는 웹뷰 안에서 한다. RN의 URL 폴리필은 호스트 대소문자와 기본 포트를
 * 정규화하지 않아, RN에서 만든 origin 문자열이 window.location.origin과 어긋날 수 있다.
 * 그래서 모아동 URL을 그대로 넘겨 웹뷰의 URL로 파싱한다. 파싱에 실패하면 주입하지 않는다.
 */
export const buildStudentTokenInjection = (
  targetUrl: string,
  token: string | null,
): string | undefined => {
  if (!token || !isWebViewOrigin(targetUrl)) return undefined;

  return `(function(){
         try {
           if (new URL(${JSON.stringify(WEBVIEW_URL)}).origin !== window.location.origin) return;
         } catch (e) {
           return;
         }
         window.__MOADONG_STUDENT_TOKEN__ = ${JSON.stringify(token)};
       })(); true;`;
};

// 웹이 앱보다 앞서 나가 새 메시지를 추가했는데 호스트가 그걸 모르는 상황을 관측한다.
// 각 호스트 switch의 default에서만 부르므로, 그 호스트가 실제로 처리하지 못한 것만 잡힌다.
// 리포팅 실패가 메시지 처리를 막아선 안 되므로 예외를 밖으로 내보내지 않는다.
export const reportUnknownBridgeMessage = (type: unknown, host: string): void => {
  // 서드파티가 쏜 비정형 메시지를 걸러내기 위해 문자열 type만 취급한다.
  if (typeof type !== 'string') return;

  console.warn(`[WebViewBridge] 처리되지 않은 메시지: ${type} (host: ${host})`);

  getMixpanel()
    .then(mixpanel =>
      mixpanel?.track(DIAGNOSTIC_EVENT.BRIDGE_UNKNOWN_MESSAGE, {
        message_type: type,
        host,
        app_version: Constants.expoConfig?.version || '1.0.0',
        platform: Platform.OS,
      }),
    )
    .catch(err => console.error('[WebViewBridge] 리포팅 실패:', err));
};
