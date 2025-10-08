/**
 * 동아리 목록 컴포넌트
 */

import { MoaText } from '@/components/moa-text';
import { Club } from '@/types/club.types';
import { ClubCard } from '@/ui/home/components';
import React, { ReactElement, RefObject } from 'react';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

/**
 * 동아리 목록 Props
 */
interface ClubListProps {
  clubs: Club[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onClubPress?: (club: Club) => void;
  error?: string | null;
  style?: any;
  headerComponent?: ReactElement | null;
  listRef?: RefObject<FlatList<Club>>;
}

/**
 * 동아리 목록 컴포넌트
 * 
 * @example
 * ```typescript
 * <ClubList 
 *   clubs={clubs}
 *   loading={loading}
 *   onRefresh={refetch}
 *   onClubPress={(club) => navigation.navigate('ClubDetail', { club })}
 *   headerComponent={<MyHeader />}
 * />
 * ```
 */
export function ClubList({
  clubs,
  loading = false,
  refreshing = false,
  onRefresh,
  onClubPress,
  error,
  style,
  headerComponent,
  listRef,
}: ClubListProps) {
  /**
   * 빈 목록 렌더링
   */
  const renderEmptyComponent = () => (
    <EmptyContainer>
      <EmptyText>
        {loading ? '동아리를 불러오는 중...' : '등록된 동아리가 없습니다.'}
      </EmptyText>
    </EmptyContainer>
  );

  /**
   * 에러 상태 렌더링
   */
  const renderErrorComponent = () => {
    if (!error) return null;
    
    return (
      <ErrorContainer>
        <ErrorTitle>
          동아리 목록을 불러오지 못했어요
        </ErrorTitle>
        <ErrorMessage>
          새로고침 해주세요
        </ErrorMessage>
        <RetryButton onPress={onRefresh}>
          <RetryButtonText>
            새로고침
          </RetryButtonText>
        </RetryButton>
      </ErrorContainer>
    );
  };

  /**
   * 동아리 카드 렌더링
   */
  const renderClubCard = ({ item }: { item: Club }) => (
    <ClubCard 
      club={item} 
      onPress={onClubPress}
    />
  );

  return (
    <Container style={style}>
      {error && renderErrorComponent()}
      
      <FlatList
        ref={listRef}
        data={clubs}
        renderItem={renderClubCard}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyComponent}
        ListHeaderComponent={headerComponent}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF5414']}
              tintColor="#FF5414"
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </Container>
  );
}

// Styled Components
const Container = styled.View`
  flex: 1;
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-vertical: 64px;
`;

const EmptyText = styled(MoaText)`
  color: #999;
  text-align: center;
`;

const ErrorContainer = styled.View`
  background-color: #FFEBEE;
  padding: 24px;
  margin: 16px;
  border-radius: 12px;
  align-items: center;
  border-left-width: 4px;
  border-left-color: #F44336;
`;

const ErrorTitle = styled(MoaText)`
  color: #D32F2F;
  text-align: center;
  margin-bottom: 8px;
  font-weight: 600;
`;

const ErrorMessage = styled(MoaText)`
  color: #D32F2F;
  text-align: center;
  margin-bottom: 16px;
  opacity: 0.8;
`;

const RetryButton = styled(TouchableOpacity)`
  background-color: #F44336;
  padding-horizontal: 24px;
  padding-vertical: 12px;
  border-radius: 8px;
`;

const RetryButtonText = styled(MoaText)`
  color: #fff;
  font-size: 14px;
`;
