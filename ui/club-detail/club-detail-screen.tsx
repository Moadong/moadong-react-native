import ClubDetailSkeleton from '@/components/skeletons/club-detail-skeleton';
import { MoaText } from '@/components/moa-text';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import styled from 'styled-components/native';

export default function ClubWebViewScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const uri = useMemo(() => {
    if (!id || typeof id !== 'string') {
      return 'https://develop.moadong.com/club';
    }

    return `https://develop.moadong.com/club/${id}`;
  }, [id]);

  const handleLoadEnd = () => {
    // 약간의 지연을 두어 콘텐츠가 완전히 렌더링되도록 함
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)');
    }
  };

  return (
    <Container edges={['top', 'bottom']}>
      <Header>
        <BackButton onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#111111" />
        </BackButton>
        <HeaderTitle type="title2">동아리 상세</HeaderTitle>
        <PlaceholderView />
      </Header>

      <WebViewContainer>
        <WebView
          source={{ uri }}
          style={{ flex: 1, backgroundColor: '#fff' }}
          onLoadEnd={handleLoadEnd}
          startInLoadingState={false}
          scalesPageToFit={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
        {isLoading && (
          <SkeletonContainer pointerEvents="none">
            <ClubDetailSkeleton />
          </SkeletonContainer>
        )}
      </WebViewContainer>
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

const PlaceholderView = styled.View`
  width: 32px;
`;

const WebViewContainer = styled.View`
  flex: 1;
  position: relative;
`;

const SkeletonContainer = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding-horizontal: 0px;
  padding-vertical: 0px;
  background-color: #fff;
`;
