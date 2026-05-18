
//WebView 메시지 타입 상수
export const WebViewMessageTypes = {
  NAVIGATE_BACK: 'NAVIGATE_BACK',
  NOTIFICATION_SUBSCRIBE: 'NOTIFICATION_SUBSCRIBE',
  NOTIFICATION_UNSUBSCRIBE: 'NOTIFICATION_UNSUBSCRIBE',
  SHARE: 'SHARE',
  OPEN_EXTERNAL_URL: 'OPEN_EXTERNAL_URL',
} as const;

// WebView 메시지 Discriminated Union 타입
 
export type WebViewMessage =
  | { type: 'NAVIGATE_BACK' }
  | { type: 'NOTIFICATION_SUBSCRIBE'; payload: { clubId: string; clubName?: string } }
  | { type: 'NOTIFICATION_UNSUBSCRIBE'; payload: { clubId: string } }
  | { type: 'SHARE'; payload: { title: string; text: string; url: string } }
  | { type: 'OPEN_EXTERNAL_URL'; payload: { url: string } };

// WebView 메시지 이벤트 타입 (react-native-webview)
export interface WebViewMessageEvent {
  nativeEvent: {
    data: string;
  };
}
