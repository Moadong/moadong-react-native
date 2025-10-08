import ClubDetailSkeleton from '@/components/skeletons/club-detail-skeleton';
import Constants from 'expo-constants';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { WebView } from 'react-native-webview';
import styled from 'styled-components/native';

export default function ClubWebViewScreen() {
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

  return (
    <Container>
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
    </Container>
  );
}

// Styled Components
const Container = styled.View`
  flex: 1;
  margin-top: ${Constants.statusBarHeight}px;
  background-color: #fff;
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
