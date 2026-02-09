/**
 * 구독 화면 컴포넌트
 */

import { MoaText } from '@/components/moa-text';
import { PermissionDialog } from '@/components/permission-dialog';
import { PAGE_VIEW_EVENT, USER_EVENT } from '@/constants/eventname';
import { useMixpanelTrack, useTrackScreenView } from '@/hooks';
import { Club } from '@/types/club.types';
import { useRouter } from 'expo-router';
import React, { RefObject, useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { EmptyState, SubscribedClubList } from './components';
import { useSubscribeScreen } from './hook';

/**
 * 구독 화면 메인 컴포넌트
 */
export function SubscribeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const listRef = useRef<FlatList<Club> | null>(null);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  
  useTrackScreenView(PAGE_VIEW_EVENT.SUBSCRIBE_PAGE);
  const trackEvent = useMixpanelTrack();

  // 구독 화면 데이터 및 로직
  const {
    subscribedClubs,
    loading,
    error,
    refetch,
    isSubscribed,
    toggleSubscribe,
  } = useSubscribeScreen();

  /**
   * 동아리 카드 클릭 핸들러
   */
  const handleClubPress = useCallback((club: Club) => {
    if (!club?.id) {
      return;
    }
    
    trackEvent(USER_EVENT.CLUB_CARD_CLICKED, {
      clubName: club.name,
      category: club.category,
      from: 'subscribe',
      url: 'app://moadong/(tabs)/subscribe',
    });
    
    router.push({
      pathname: '/club/[id]',
      params: { id: club.id, name: club.name }
    });
  }, [router, trackEvent]);

  /**
   * 구독 토글 핸들러
   */
  const handleSubscribeToggle = useCallback(async (club: Club) => {
    const wasSubscribed = isSubscribed(club.id);
    
    trackEvent(USER_EVENT.SUBSCRIBE_BUTTON_CLICKED, {
      clubName: club.name,
      subscribed: !wasSubscribed,
      from: 'subscribe',
      url: 'app://moadong/(tabs)/subscribe',
    });
    
    const result = await toggleSubscribe(club.id);
    if (result.needsPermission) {
      setShowPermissionDialog(true);
    }
  }, [toggleSubscribe, isSubscribed, trackEvent]);

  /**
   * 로딩 중 표시
   */
  if (loading && subscribedClubs.length === 0) {
    return (
      <Container style={{ paddingTop: insets.top }}>
        <Header>
          <HeaderTitle type="title1">구독</HeaderTitle>
        </Header>
        <LoadingContainer>
          <ActivityIndicator size="large" color="#FF5414" />
        </LoadingContainer>
      </Container>
    );
  }

  /**
   * 에러 발생 시 표시
   */
  if (error && subscribedClubs.length === 0) {
    return (
      <Container style={{ paddingTop: insets.top }}>
        <Header>
          <HeaderTitle type="title1">구독</HeaderTitle>
        </Header>
        <ErrorContainer>
          <ErrorTitle>구독한 동아리 목록을 불러오지 못했어요.</ErrorTitle>
          <RetryButton onPress={refetch} activeOpacity={0.8}>
            <RetryButtonText>재시도</RetryButtonText>
          </RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  /**
   * 구독한 동아리가 없을 때
   */
  if (subscribedClubs.length === 0) {
    return (
      <Container style={{ paddingTop: insets.top }}>
        <Header>
          <HeaderTitle type="title1">구독</HeaderTitle>
        </Header>
        <EmptyState />
      </Container>
    );
  }

  /**
   * 구독한 동아리 목록 표시
   */
  return (
    <Container style={{ paddingTop: insets.top }}>
      <Header>
        <HeaderTitle type="title1">구독</HeaderTitle>
      </Header>
      <SubscribedClubList
        clubs={subscribedClubs}
        loading={loading}
        onRefresh={refetch}
        onClubPress={handleClubPress}
        isSubscribed={isSubscribed}
        onSubscribeToggle={handleSubscribeToggle}
        listRef={listRef as RefObject<FlatList<Club>>}
      />
      
      {/* 알림 권한 다이얼로그 */}
      <PermissionDialog
        visible={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
      />
    </Container>
  );
}

// Styled Components
const Container = styled(View)`
  flex: 1;
  background-color: #fff;
`;

const Header = styled.View`
  padding-horizontal: 16px;
  padding-vertical: 16px;
  border-bottom-width: 1px;
  border-bottom-color: #F0F0F0;
`;

const HeaderTitle = styled(MoaText)`
  color: #111111;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ErrorContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 24px;
`;

const ErrorTitle = styled(MoaText)`
  color: #3A3A3A;
  text-align: center;
  margin-bottom: 16px;
  font-size: 18px;
`;

const RetryButton = styled(TouchableOpacity)`
  background-color: #FF5414;
  padding-horizontal: 28px;
  padding-vertical: 14px;
  border-radius: 8px;
`;

const RetryButtonText = styled(MoaText)`
  color: #fff;
  font-size: 16px;
`;

export default SubscribeScreen;

