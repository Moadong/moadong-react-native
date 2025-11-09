/**
 * 구독한 동아리 목록 컴포넌트
 */

import { Club } from '@/types/club.types';
import { ClubCard } from '@/ui/home/components/club-card';
import React, { RefObject } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import styled from 'styled-components/native';

/**
 * 구독한 동아리 목록 Props
 */
interface SubscribedClubListProps {
  clubs: Club[];
  loading: boolean;
  onRefresh: () => void;
  onClubPress: (club: Club) => void;
  isSubscribed: (clubId: string) => boolean;
  onSubscribeToggle: (clubId: string) => Promise<void>;
  listRef?: RefObject<FlatList<Club>>;
}

/**
 * 구독한 동아리 목록을 표시하는 컴포넌트
 */
export function SubscribedClubList({
  clubs,
  loading,
  onRefresh,
  onClubPress,
  isSubscribed,
  onSubscribeToggle,
  listRef,
}: SubscribedClubListProps) {
  const renderItem = ({ item }: { item: Club }) => (
    <ClubCard
      club={item}
      onPress={onClubPress}
      isSubscribed={isSubscribed(item.id)}
      onSubscribeToggle={onSubscribeToggle}
    />
  );

  const keyExtractor = (item: Club) => item.id;

  const renderListHeader = () => (
    <HeaderContainer>
      <CountText>총 {clubs.length}개의 동아리를 구독 중입니다</CountText>
    </HeaderContainer>
  );

  return (
    <FlatList
      ref={listRef}
      data={clubs}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={{ paddingVertical: 8 }}
      ListHeaderComponent={renderListHeader}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          tintColor="#FF5414"
          colors={['#FF5414']}
        />
      }
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        loading ? (
          <LoadingContainer>
            <ActivityIndicator size="large" color="#FF5414" />
          </LoadingContainer>
        ) : null
      }
    />
  );
}

// Styled Components
const HeaderContainer = styled.View`
  padding-horizontal: 16px;
  padding-vertical: 16px;
`;

const CountText = styled.Text`
  font-size: 14px;
  color: #666666;
  font-weight: 500;
`;

const LoadingContainer = styled.View`
  padding: 20px;
  align-items: center;
`;

