import { MoaImage } from "@/components/moa-image";
import { MoaText } from "@/components/moa-text";
import { PermissionDialog } from "@/components/permission-dialog";
import { USER_EVENT } from "@/constants/eventname";
import { useMixpanelContext } from "@/contexts";
import { useSubscribedClubsContext } from "@/contexts/subscribed-clubs-context";
import { useMixpanelTrack, useWebViewMessageHandler } from "@/hooks";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { ActivityIndicator, Platform, Share, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import styled from "styled-components/native";

export default function ClubWebViewScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id?: string; name?: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const { isSubscribed, toggleSubscribe } = useSubscribedClubsContext();
  const { sessionId } = useMixpanelContext();
  const trackEvent = useMixpanelTrack();
  const insets = useSafeAreaInsets();

  const webviewUrl = process.env.EXPO_PUBLIC_WEBVIEW_URL;

  const uri = useMemo(() => {
    if (!id || typeof id !== "string") {
      return `${webviewUrl}/club`;
    }

    const cleanUrl = webviewUrl?.replace(/\/$/, "") || "";
    const baseUrl = `${cleanUrl}/club/${id}`;
    
    const params = new URLSearchParams();
    if (sessionId) {
      params.append('session_id', sessionId);
    }
    if (id && isSubscribed(id)) {
      params.append('is_subscribed', 'true');
    }

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [id, webviewUrl, sessionId, isSubscribed]);

  const subscribed = useMemo(() => {
    return id ? isSubscribed(id) : false;
  }, [id, isSubscribed]);

  // UserAgent 생성
  const userAgent = useMemo(() => {
    const appVersion = Constants.expoConfig?.version || "1.0.0";
    const platform = Platform.OS === "ios" ? "iOS" : "Android";
    return `MoadongApp/${appVersion} (${platform})`;
  }, []);

  const handleLoadEnd = () => {
    // 약간의 지연을 두어 콘텐츠가 완전히 렌더링되도록 함
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleBack = () => {
    trackEvent(USER_EVENT.BACK_BUTTON_CLICKED, {
      from: "club_detail",
      clubName: name,
      url: "app://moadong/club",
    });

    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)");
    }
  };

  const handleSubscribeToggle = async () => {
    if (id && typeof id === "string") {
      const wasSubscribed = isSubscribed(id);

      trackEvent(USER_EVENT.SUBSCRIBE_BUTTON_CLICKED, {
        clubName: name,
        subscribed: !wasSubscribed,
        from: "club_detail",
        url: "app://moadong/club",
      });

      const result = await toggleSubscribe(id);
      if (result.needsPermission) {
        setShowPermissionDialog(true);
      }
    }
  };

  // WebView 메시지 핸들러
  const { handleMessage } = useWebViewMessageHandler({
    onNavigateBack: handleBack,
    onSubscribe: async (targetId: string, clubName?: string) => {
      trackEvent(USER_EVENT.SUBSCRIBE_BUTTON_CLICKED, {
        clubName: clubName || name,
        subscribed: true,
        from: 'club_detail',
        url: 'app://moadong/club',
      });

      // 이미 구독 중이면 무시
      if (isSubscribed(targetId)) return;
      
      const result = await toggleSubscribe(targetId);
      if (result.needsPermission) {
        setShowPermissionDialog(true);
      }
    },
    onUnsubscribe: async (targetId: string) => {
      // 구독 중이 아니면 무시
      if (!isSubscribed(targetId)) return;
      
      trackEvent(USER_EVENT.SUBSCRIBE_BUTTON_CLICKED, {
        clubName: name,
        subscribed: false,
        from: 'club_detail',
        url: 'app://moadong/club',
      });
      
      await toggleSubscribe(targetId);
    },
    onShare: async ({ title, text, url }: { title: string; text: string; url: string }) => {
      await Share.share({
        title,
        message: text,
        url,
      });
    },
  });
  
  const injectJS = `
    (function() {
      document.documentElement.style.setProperty('--rn-safe-top', '${insets.top}px');
      document.documentElement.style.setProperty('--rn-safe-bottom', '${insets.bottom}px');
    })();
    true;
  `;

  return (
    <Container edges={['bottom']}>
      <StatusBar translucent style="dark" />
      {hasError && (
        <Header>
          <BackButton onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#111111" />
          </BackButton>
          <HeaderTitle type="title2">동아리 상세</HeaderTitle>
          <SubscribeButton onPress={handleSubscribeToggle} activeOpacity={0.6}>
            <MoaImage
              source={
                subscribed
                  ? require('@/assets/icons/ic-subscribe-selected.png')
                  : require('@/assets/icons/ic-subscribe-unselected.png')
              }
              style={{ width: 24, height: 24 }}
              contentFit="contain"
            />
          </SubscribeButton>
        </Header>
      )}

      <WebViewContainer>
        <WebView
          source={{ uri }}
          style={{ flex: 1, backgroundColor: "#fff" }}
          userAgent={userAgent}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onMessage={handleMessage}
          injectedJavaScript={injectJS}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          startInLoadingState={false}
          scalesPageToFit={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"

        />
        {isLoading && (
          <LoadingContainer pointerEvents="none">
            <ActivityIndicator size="large" color="#FF5414" />
            <LoadingText type="body1Regular">로딩 중...</LoadingText>
          </LoadingContainer>
        )}
      </WebViewContainer>

      {/* 알림 권한 다이얼로그 */}
      <PermissionDialog
        visible={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
      />
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
  background-color: #fff;
`;

const BackButton = styled(TouchableOpacity)`
  padding: 4px;
`;

const HeaderTitle = styled(MoaText)`
  color: #111111;
  flex: 1;
  text-align: center;
`;

const SubscribeButton = styled(TouchableOpacity)`
  padding: 4px;
  justify-content: center;
  align-items: center;
`;

const WebViewContainer = styled.View`
  flex: 1;
  position: relative;
`;

const LoadingContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  background-color: #fff;
`;

const LoadingText = styled(MoaText)`
  margin-top: 12px;
  color: #666666;
`;
