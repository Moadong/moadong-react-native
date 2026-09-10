
//WebView 메시지 타입 상수
export const WebViewMessageTypes = {
  NAVIGATE_BACK: 'NAVIGATE_BACK',
  NAVIGATE_WEBVIEW: 'NAVIGATE_WEBVIEW',
  NOTIFICATION_SUBSCRIBE: 'NOTIFICATION_SUBSCRIBE',
  NOTIFICATION_UNSUBSCRIBE: 'NOTIFICATION_UNSUBSCRIBE',
  SUBSCRIBE_TOGGLE: 'SUBSCRIBE_TOGGLE',
  REQUEST_SUBSCRIBE_STATE: 'REQUEST_SUBSCRIBE_STATE',
  SHARE: 'SHARE',
  OPEN_EXTERNAL_URL: 'OPEN_EXTERNAL_URL',
  OPEN_APP_SETTINGS: 'OPEN_APP_SETTINGS',
} as const;

// WebView 메시지 Discriminated Union 타입

export type WebViewMessage =
  | { type: 'NAVIGATE_BACK' }
  | { type: 'NAVIGATE_WEBVIEW'; payload: { slug: string; clubId?: string } }
  | { type: 'NOTIFICATION_SUBSCRIBE'; payload: { clubId: string; clubName?: string } }
  | { type: 'NOTIFICATION_UNSUBSCRIBE'; payload: { clubId: string } }
  | { type: 'SUBSCRIBE_TOGGLE'; payload: { clubId: string } }
  | { type: 'REQUEST_SUBSCRIBE_STATE' }
  | { type: 'SHARE'; payload: { title: string; text: string; url: string } }
  | { type: 'OPEN_EXTERNAL_URL'; payload: { url: string } }
  | { type: 'OPEN_APP_SETTINGS' };

// WebView 메시지 이벤트 타입 (react-native-webview)
export interface WebViewMessageEvent {
  nativeEvent: {
    data: string;
  };
}
