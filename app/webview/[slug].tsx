/**
 * 웹뷰 화면 컴포넌트
 * 동적 라우트로 다양한 웹페이지 표시
 */

import { MoaText } from '@/components/moa-text';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import styled from 'styled-components/native';

const webviewUrl = process.env.EXPO_PUBLIC_WEBVIEW_URL || 'https://develop.moadong.com';

const pageConfig: Record<string, { title: string; path: string }> = {
  introduce: {
    title: '서비스 소개',
    path: '/introduce',
  },
  'club-union': {
    title: '총 동아리 연합회',
    path: '/club-union',
  },
};

export default function WebViewScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const config = pageConfig[slug || ''];
  const url = config ? `${webviewUrl}${config.path}` : '';

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/more');
    }
  };

  if (!config) {
    return (
      <Container edges={['top', 'bottom']}>
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
    <Container edges={['top', 'bottom']}>
      <Header>
        <BackButton onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </BackButton>
        <HeaderTitle type="title2">{config.title}</HeaderTitle>
        <PlaceholderView />
      </Header>

      {loading && (
        <LoadingContainer>
          <ActivityIndicator size="large" color="#FF5414" />
          <LoadingText type="body1Regular">로딩 중...</LoadingText>
        </LoadingContainer>
      )}

      {error && (
        <ErrorContainer>
          <ErrorText type="body1Regular">
            페이지를 불러올 수 없습니다.{'\n'}
            인터넷 연결을 확인해주세요.
          </ErrorText>
        </ErrorContainer>
      )}

      <WebView
        source={{ uri: url }}
        style={{ flex: 1 }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
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
  border-bottom-color: #F0F0F0;
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

const LoadingContainer = styled.View`
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

const LoadingText = styled(MoaText)`
  margin-top: 12px;
  color: #666666;
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

