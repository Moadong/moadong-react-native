/**
 * 웹뷰 화면 컴포넌트
 * 동적 라우트로 다양한 웹페이지 표시
 */

import { MoaText } from "@/components/moa-text";
import { useMixpanelContext } from "@/contexts";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ActivityIndicator, Platform, TouchableOpacity } from "react-native";
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
  } = useLocalSearchParams<{
    slug?: string;
    path?: string;
    url?: string;
    title?: string;
  }>();
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

  // session_id를 URL에 추가
  const url = useMemo(() => {
    if (!baseUrl) return "";
    if (!sessionId) return baseUrl;

    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}session_id=${encodeURIComponent(sessionId)}`;
  }, [baseUrl, sessionId]);

  // UserAgent 생성
  const userAgent = useMemo(() => {
    const appVersion = Constants.expoConfig?.version || "1.0.0";
    const platform = Platform.OS === "ios" ? "iOS" : "Android";
    return `MoadongApp/${appVersion} (${platform})`;
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)/more");
    }
  };

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
      <Header>
        <BackButton onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </BackButton>
        <HeaderTitle type="title2">
          {title ?? config?.title ?? "웹페이지"}
        </HeaderTitle>
        <PlaceholderView />
      </Header>

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

        <StyledWebView
          source={{ uri: url }}
          userAgent={userAgent}
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
