import { useMixpanelContext } from '@/contexts';
import { useSubscribedClubsContext } from '@/contexts/subscribed-clubs-context';
import { appendSessionId, getWebViewUserAgent } from '@/utils/webview';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import styled from 'styled-components/native';

const BASE_URL = `${(process.env.EXPO_PUBLIC_WEBVIEW_URL || 'https://moadong.com').replace(/\/$/, '')}/webview/main`;
const USER_AGENT = getWebViewUserAgent();

interface HomeWebViewScreenProps {
  onError: () => void;
}

export function HomeWebViewScreen({ onError }: HomeWebViewScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [loaded, setLoaded] = useState(false);

  const { sessionId, isLoading: sessionLoading } = useMixpanelContext();
  const { subscribedClubIds, toggleSubscribe } = useSubscribedClubsContext();

  const url = sessionLoading ? null : appendSessionId(BASE_URL, sessionId);

  const sendMessage = useCallback((data: object) => {
    webViewRef.current?.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(JSON.stringify(data))} })); true;`,
    );
  }, []);

  const sendSubscribeState = useCallback(() => {
    sendMessage({ type: 'SUBSCRIBE_STATE', payload: { subscribedClubIds } });
  }, [sendMessage, subscribedClubIds]);

  // 구독 목록 변경 시 자동으로 웹에 동기화
  useEffect(() => {
    if (loaded) sendSubscribeState();
  }, [subscribedClubIds, loaded, sendSubscribeState]);

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      try {
        const { type, payload } = JSON.parse(event.nativeEvent.data);

        switch (type) {
          case 'REQUEST_SUBSCRIBE_STATE':
            sendSubscribeState();
            break;

          case 'SUBSCRIBE_TOGGLE': {
            const wasSubscribed = subscribedClubIds.includes(payload.clubId);
            const result = await toggleSubscribe(payload.clubId);
            sendMessage({
              type: 'SUBSCRIBE_RESULT',
              payload: {
                clubId: payload.clubId,
                subscribed: result.needsPermission ? wasSubscribed : !wasSubscribed,
                needsPermission: result.needsPermission,
              },
            });
            break;
          }

          case 'NAVIGATE_WEBVIEW':
            if (payload.slug?.startsWith('club/')) {
              const clubId = payload.slug.slice('club/'.length);
              if (!clubId) break;
              router.push({ pathname: '/club/[id]', params: { id: clubId } });
            } else if (payload.slug?.startsWith('promotions/')) {
              router.push({ pathname: '/webview/[slug]', params: { slug: 'promotions', path: `/${payload.slug}`, hideHeader: 'true' } });
            } else {
              router.push({ pathname: '/webview/[slug]', params: { slug: payload.slug } });
            }
            break;

          case 'OPEN_EXTERNAL_URL':
            await WebBrowser.openBrowserAsync(payload.url);
            break;

          case 'REQUEST_APP_VERSION':
            sendMessage({
              type: 'APP_VERSION',
              payload: { version: Constants.expoConfig?.version ?? 'unknown' },
            });
            break;
        }
      } catch {
        // 파싱 실패 무시
      }
    },
    [subscribedClubIds, toggleSubscribe, sendMessage, sendSubscribeState, router],
  );

  const handleLoadEnd = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <Container style={{ paddingTop: insets.top }}>
      {!loaded && (
        <LoadingOverlay>
          <ActivityIndicator size='large' color='#FF5414' />
        </LoadingOverlay>
      )}
      {url && (
        <WebView
          ref={webViewRef}
          style={{ flex: 1 }}
          source={{ uri: url }}
          userAgent={USER_AGENT}
          onMessage={handleMessage}
          onLoadEnd={handleLoadEnd}
          onError={onError}
          onHttpError={onError}
          javaScriptEnabled
          domStorageEnabled
          pullToRefreshEnabled
        />
      )}
    </Container>
  );
}

const Container = styled(View)`
  flex: 1;
  background-color: #fff;
`;

const LoadingOverlay = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  z-index: 10;
`;
