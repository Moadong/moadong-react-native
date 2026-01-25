import { WebViewMessage, WebViewMessageEvent, WebViewMessageTypes } from '@/types/webview-message.types';
import { useCallback } from 'react';

interface UseWebViewMessageHandlerOptions {
  // 뒤로가기 요청 시 호출
  onNavigateBack?: () => void;
  // 알림 구독 요청 시 호출
  onSubscribe?: (clubId: string, clubName?: string) => Promise<void> | void;
  // 알림 구독 해제 요청 시 호출
  onUnsubscribe?: (clubId: string) => Promise<void> | void;
  // 공유하기 요청 시 호출
  onShare?: (payload: { title: string; text: string; url: string }) => Promise<void> | void;
}

// WebView 메시지를 처리하는 Hook
export const useWebViewMessageHandler = ({
  onNavigateBack,
  onSubscribe,
  onUnsubscribe,
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
        case WebViewMessageTypes.SHARE:
          if (message.payload) {
            onShare?.(message.payload);
          }
          break;
        default:
          console.warn('[WebViewHandler] 알 수 없는 메시지 타입:', message);
      }
    } catch (error) {
      console.error('[WebViewHandler] 메시지 파싱 오류:', error);
    }
  }, [onNavigateBack, onSubscribe, onUnsubscribe, onShare]);

  return { handleMessage };
};
