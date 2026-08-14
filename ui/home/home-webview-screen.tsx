import { useHomeWebViewPreloadContext } from '@/contexts/home-webview-preload-context';
import { useMixpanelContext } from '@/contexts/mixpanel-context';
import { useSubscribedClubsContext } from '@/contexts/subscribed-clubs-context';
import { ensureAccessToken } from '@/services/auth-token.service';
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
// new URL(...) 은 EXPO_PUBLIC_WEBVIEW_URL 이 잘못되면 모듈 로드 시점에 throw 하므로,
// 주입을 건너뛰고 넘어갈 수 있도록 직접 파싱한다.
const WEB_ORIGIN = BASE_URL.match(/^https?:\/\/[^/]+/i)?.[0] ?? null;

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
  const [studentToken, setStudentToken] = useState<string | null>(null);
  const [tokenResolved, setTokenResolved] = useState(false);

  const { markLoading, markReady, markFailed } = useHomeWebViewPreloadContext();
  const { sessionId, isLoading: sessionLoading } = useMixpanelContext();
  const { subscribedClubIds, toggleSubscribe } = useSubscribedClubsContext();

  // 웹의 첫 API 호출 전에 토큰이 준비돼 있어야 하므로, 조회가 끝난 뒤에 웹뷰를 렌더한다.
  // 발급에 실패하면 주입 없이 렌더하고 웹이 자체 토큰으로 폴백한다.
  useEffect(() => {
    let cancelled = false;
    ensureAccessToken()
      .then((token) => {
        if (!cancelled) setStudentToken(token);
      })
      .catch(() => {
        if (!cancelled) setStudentToken(null);
      })
      .finally(() => {
        if (!cancelled) setTokenResolved(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const url =
    sessionLoading || !tokenResolved ? null : appendSessionId(BASE_URL, sessionId);

  // 주입 스크립트는 웹뷰가 로드하는 모든 문서에서 실행되므로,
  // origin 가드 없이는 외부 사이트로 이동했을 때 베어러 토큰이 노출된다.
  const injectedToken =
    studentToken && WEB_ORIGIN
      ? `(function(){
           if (window.location.origin !== ${JSON.stringify(WEB_ORIGIN)}) return;
           window.__MOADONG_STUDENT_TOKEN__ = ${JSON.stringify(studentToken)};
         })(); true;`
      : undefined;

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
          injectedJavaScriptBeforeContentLoaded={injectedToken}
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
