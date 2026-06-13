import { useHomeWebViewPreloadContext } from '@/contexts/home-webview-preload-context';
import { useMixpanelContext } from '@/contexts/mixpanel-context';
import { useSubscribedClubsContext } from '@/contexts/subscribed-clubs-context';
import { appendSessionId, getWebViewUserAgent } from '@/utils/webview';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Share, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  WebView,
  WebViewMessageEvent,
  WebViewNavigation,
} from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
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
  const canGoBackRef = useRef(false);
  const loadFailedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);

  const { markLoading, markReady, markFailed } = useHomeWebViewPreloadContext();
  const { sessionId, isLoading: sessionLoading } = useMixpanelContext();
  const { subscribedClubIds, toggleSubscribe } = useSubscribedClubsContext();

  const url = sessionLoading ? null : appendSessionId(BASE_URL, sessionId);

  useEffect(() => {
    if (url) {
      loadFailedRef.current = false;
      markLoading();
      console.log('[StartupTiming] homeWebViewSourceReady', Date.now());
    }
  }, [markLoading, url]);

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

          case 'NAVIGATE_BACK':
            webViewRef.current?.goBack();
            break;

          case 'NAVIGATE_WEBVIEW':
            if (!loaded) break;
            if (payload.slug?.startsWith('club/')) {
              const slugId = payload.slug.slice('club/'.length);
              if (!slugId) break;
              router.push({ pathname: '/club/[id]', params: { id: slugId, clubId: payload.clubId } });
            } else if (payload.slug?.startsWith('promotions/')) {
              router.push({ pathname: '/webview/[slug]', params: { slug: 'promotions', path: `/${payload.slug}`, hideHeader: 'true' } });
            } else {
              router.push({ pathname: '/webview/[slug]', params: { slug: payload.slug } });
            }
            break;

          case 'OPEN_EXTERNAL_URL':
            await WebBrowser.openBrowserAsync(payload.url);
            break;

          case 'SHARE':
            await Share.share({ title: payload.title, message: payload.text, url: payload.url });
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
    console.log('[StartupTiming] homeWebViewLoadEnd', Date.now());
    if (loadFailedRef.current) {
      return;
    }

    markReady();
    setLoaded(true);
  }, [markReady]);

  const handleError = useCallback(() => {
    loadFailedRef.current = true;
    markFailed();
    onError();
  }, [markFailed, onError]);

  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      canGoBackRef.current = navState.canGoBack;
    },
    [],
  );

  const handleShouldStartLoadWithRequest = useCallback(
    (request: ShouldStartLoadRequest) => {
      const baseOrigin = (process.env.EXPO_PUBLIC_WEBVIEW_URL ?? 'https://moadong.com').replace(/\/$/, '');
      if (request.url.startsWith('http') && !request.url.startsWith(baseOrigin)) {
        // iOS: navigationType === 'click' 은 사용자가 직접 링크를 탭한 경우만 해당
        //      초기 로드·서버 리다이렉트는 'other' 이므로 인터셉트하지 않음
        // Android: navigationType이 항상 'other'이므로 loaded 상태로 구분
        const isUserInitiated = Platform.OS === 'ios'
          ? request.navigationType === 'click'
          : loaded;
        if (isUserInitiated) {
          router.push({ pathname: '/webview/[slug]', params: { slug: 'external', url: request.url } });
          return false;
        }
        return true;
      }
      return true;
    },
    [router, loaded],
  );

  // Android 하드웨어 뒤로가기: 웹뷰 히스토리가 있으면 웹뷰 back, 없으면 기본 동작(종료)
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (canGoBackRef.current) {
          webViewRef.current?.goBack();
          return true;
        }
        return false;
      },
    );
    return () => subscription.remove();
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
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onError={handleError}
          onHttpError={handleError}
          javaScriptEnabled
          domStorageEnabled
          pullToRefreshEnabled
          allowsBackForwardNavigationGestures
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
