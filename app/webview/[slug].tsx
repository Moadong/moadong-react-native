/**
 * 웹뷰 화면 컴포넌트
 * 동적 라우트로 다양한 웹페이지 표시
 */

import { MoaText } from "@/components/moa-text";
import { useMixpanelContext } from "@/contexts/mixpanel-context";
import { useWebViewMessageHandler } from "@/hooks/use-webview-message-handler";
import { ensureAccessToken } from "@/services/auth-token.service";
import { appendSessionId, buildStudentTokenInjection, getWebViewUserAgent, isWebViewOrigin } from "@/utils/webview";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import styled from "styled-components/native";

const webviewUrl =
  process.env.EXPO_PUBLIC_WEBVIEW_URL || "https://develop.moadong.com";

const pageConfig: Record<
  string,
  { title: string; path?: string; url?: string }
> = {
  introduce: {
    title: "서비스 소개",
    path: "/introduce",
  },
  "club-union": {
    title: "총 동아리 연합회",
    path: "/club-union",
  },
  "festival-introduction": {
    title: "동아리 소개 한마당",
    path: "/festival-introduction",
  },
  promotions: {
    title: "홍보",
    path: "/promotions",
  },
  "privacy-policy": {
    title: "개인정보 처리방침",
    url: "https://honorable-cough-8f9.notion.site/232aad23209680f2a2cadb146eff81cd",
  },
};

export default function WebViewScreen() {
  const router = useRouter();
  const {
    slug,
    path,
    url: urlParam,
    title,
    hideHeader,
  } = useLocalSearchParams<{
    slug?: string;
    path?: string;
    url?: string;
    title?: string;
    hideHeader?: string;
  }>();
  const shouldHideHeader = hideHeader === "true";
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState(false);
  const { sessionId } = useMixpanelContext();

  const config = pageConfig[slug || ""];

  const baseUrl = urlParam
    ? String(urlParam)
    : path
      ? `${webviewUrl}${String(path).startsWith("/") ? "" : "/"}${String(path)}`
      : config
        ? (config.url ?? (config.path ? `${webviewUrl}${config.path}` : ""))
        : "";

  const url = useMemo(() => appendSessionId(baseUrl, sessionId), [baseUrl, sessionId]);

  /**
   * 우체통은 앱이 주입한 학생 토큰을 먼저 쓴다(웹 studentFetch). 주입이 없으면 웹이
   * 자체 토큰을 발급해 앱과 신원이 갈리고, 답장 푸시로 열린 편지함이 비어 보인다.
   * 답장 푸시의 path가 /feedback/letters/... 라 이 화면으로 들어온다.
   *
   * 주입은 content load 이전에 끝나야 하므로 토큰이 정해질 때까지 웹뷰를 렌더하지 않는다.
   * 외부 URL로 진입한 경우에는 주입할 일이 없으니 기다리지도 않는다.
   */
  const [studentToken, setStudentToken] = useState<string | null>(null);
  const [tokenResolved, setTokenResolved] = useState(false);

  useEffect(() => {
    if (!isWebViewOrigin(baseUrl)) {
      setTokenResolved(true);
      return;
    }

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
  }, [baseUrl]);

  const injectedToken = buildStudentTokenInjection(baseUrl, studentToken);

  const userAgent = getWebViewUserAgent();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleNavigateWebview = (slug: string, clubId?: string) => {
    if (slug.startsWith('club/')) {
      const slugId = slug.slice('club/'.length);
      if (!slugId) return;
      router.push({ pathname: '/club/[id]', params: { id: slugId, clubId } });
    } else {
      router.push({ pathname: '/webview/[slug]', params: { slug } });
    }
  };

  const { handleMessage } = useWebViewMessageHandler({
    onNavigateBack: handleBack,
    onNavigateWebview: handleNavigateWebview,
  });

  if (!config && !path && !urlParam) {
    return (
      <Container edges={["top", "bottom"]}>
        <Header>
          <BackButton onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#111111" />
          </BackButton>
          <HeaderTitle type="title2">오류</HeaderTitle>
          <PlaceholderView />
        </Header>
        <ErrorContainer>
          <ErrorText type="body1Regular">페이지를 찾을 수 없습니다.</ErrorText>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container edges={["top", "bottom"]}>
      {!shouldHideHeader && (
        <Header>
          <BackButton onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#111111" />
          </BackButton>
          <HeaderTitle type="title2">
            {title ?? config?.title ?? "웹페이지"}
          </HeaderTitle>
          <PlaceholderView />
        </Header>
      )}

      {error && (
        <ErrorContainer>
          <ErrorText type="body1Regular">
            페이지를 불러올 수 없습니다.{"\n"}
            인터넷 연결을 확인해주세요.
          </ErrorText>
        </ErrorContainer>
      )}

      <WebViewWrapper>
        {loading && !hasLoadedOnce && !error && (
          <LoadingContainer>
            <ActivityIndicator size="large" color="#FF5414" />
            <LoadingText type="body1Regular">로딩 중...</LoadingText>
          </LoadingContainer>
        )}

        {tokenResolved && (
          <StyledWebView
            source={{ uri: url }}
            userAgent={userAgent}
            injectedJavaScriptBeforeContentLoaded={injectedToken}
            onMessage={handleMessage}
            onLoadStart={() => {
              if (!hasLoadedOnce) {
                setLoading(true);
                setError(false);
              }
            }}
            onLoadEnd={() => {
              setLoading(false);
              if (!hasLoadedOnce) {
                setHasLoadedOnce(true);
              }
            }}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        )}
      </WebViewWrapper>

    </Container>
  );
}

// Styled Components
const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 16px;
  padding-vertical: 12px;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
`;

const BackButton = styled(TouchableOpacity)`
  padding: 4px;
`;

const HeaderTitle = styled(MoaText)`
  color: #111111;
  flex: 1;
  text-align: center;
`;

const PlaceholderView = styled.View`
  width: 32px;
`;

const WebViewWrapper = styled.View`
  flex: 1;
  position: relative;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
`;

const LoadingText = styled(MoaText)`
  margin-top: 12px;
  color: #666666;
`;

const StyledWebView = styled(WebView)`
  flex: 1;
`;

const ErrorContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const ErrorText = styled(MoaText)`
  color: #989898;
  text-align: center;
  line-height: 24px;
`;
