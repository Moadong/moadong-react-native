import { WebViewMessage, WebViewMessageEvent, WebViewMessageTypes } from '@/types/webview-message.types';
import { reportUnknownBridgeMessage } from '@/utils/webview';
import { useCallback } from 'react';
import { Linking } from 'react-native';

interface UseWebViewMessageHandlerOptions {
  /** 처리되지 않은 메시지를 어느 화면이 받았는지 구분하기 위한 이름 */
  host: string;
  // 뒤로가기 요청 시 호출
  onNavigateBack?: () => void;
  // 웹뷰 내 화면 이동 요청 시 호출
  onNavigateWebview?: (slug: string, clubId?: string) => void;
  // 알림 구독 요청 시 호출
  onSubscribe?: (clubId: string, clubName?: string) => Promise<void> | void;
  // 알림 구독 해제 요청 시 호출
  onUnsubscribe?: (clubId: string) => Promise<void> | void;
  // 알림 구독 토글 요청 시 호출 (구버전 SUBSCRIBE/UNSUBSCRIBE를 대체)
  onSubscribeToggle?: (clubId: string) => Promise<void> | void;
  // 웹이 현재 구독 목록을 요청할 때 호출
  onRequestSubscribeState?: () => void;
  // 공유하기 요청 시 호출
  onShare?: (payload: { title: string; text: string; url: string }) => Promise<void> | void;
}

// WebView 메시지를 처리하는 Hook
export const useWebViewMessageHandler = ({
  host,
  onNavigateBack,
  onNavigateWebview,
  onSubscribe,
  onUnsubscribe,
  onSubscribeToggle,
  onRequestSubscribeState,
  onShare,
}: UseWebViewMessageHandlerOptions) => {
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = event.nativeEvent.data;
      if (!data) return;

      const message: WebViewMessage = JSON.parse(data);

      switch (message.type) {
        case WebViewMessageTypes.NAVIGATE_BACK:
          onNavigateBack?.();
          break;
        case WebViewMessageTypes.NAVIGATE_WEBVIEW:
          if (message.payload?.slug) {
            onNavigateWebview?.(message.payload.slug, message.payload.clubId);
          }
          break;
        case WebViewMessageTypes.NOTIFICATION_SUBSCRIBE:
          if (message.payload?.clubId) {
            onSubscribe?.(message.payload.clubId, message.payload.clubName);
          }
          break;
        case WebViewMessageTypes.NOTIFICATION_UNSUBSCRIBE:
          if (message.payload?.clubId) {
            onUnsubscribe?.(message.payload.clubId);
          }
          break;
        case WebViewMessageTypes.SUBSCRIBE_TOGGLE:
          if (message.payload?.clubId) {
            onSubscribeToggle?.(message.payload.clubId);
          }
          break;
        case WebViewMessageTypes.REQUEST_SUBSCRIBE_STATE:
          onRequestSubscribeState?.();
          break;
        case WebViewMessageTypes.SHARE:
          if (message.payload) {
            onShare?.(message.payload);
          }
          break;
        case WebViewMessageTypes.OPEN_EXTERNAL_URL: {
          const { url } = message.payload;
          if (url) {
            Linking.openURL(url).catch(err =>
              console.error('[WebViewHandler] URL 열기 실패:', err)
            );
          }
          break;
        }
        case WebViewMessageTypes.OPEN_APP_SETTINGS:
          Linking.openSettings().catch(err =>
            console.error('[WebViewHandler] 앱 설정 열기 실패:', err)
          );
          break;
        default:
          reportUnknownBridgeMessage((message as { type?: unknown }).type, host);
      }
    } catch (error) {
      console.error('[WebViewHandler] 메시지 파싱 오류:', error);
    }
  }, [
    host,
    onNavigateBack,
    onNavigateWebview,
    onSubscribe,
    onUnsubscribe,
    onSubscribeToggle,
    onRequestSubscribeState,
    onShare,
  ]);

  return { handleMessage };
};
