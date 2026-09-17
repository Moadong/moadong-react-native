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
