/**
 * 동아리 목록 컴포넌트
 */

import { ClubCard } from '@/components/club-card';
import { Text } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { Club } from '@/types/club.types';
import React, { ReactElement } from 'react';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

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
}: ClubListProps) {
  /**
   * 빈 목록 렌더링
   */
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text type="body1Regular" style={styles.emptyText}>
        {loading ? '동아리를 불러오는 중...' : '등록된 동아리가 없습니다.'}
      </Text>
    </View>
  );

  /**
   * 에러 상태 렌더링
   */
  const renderErrorComponent = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Text type="body1Regular" style={styles.errorTitle}>
          동아리 목록을 불러오지 못했어요
        </Text>
        <Text type="body2Regular" style={styles.errorMessage}>
          새로고침 해주세요
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={onRefresh}
        >
          <Text type="body1SemiBold" style={styles.retryButtonText}>
            새로고침
          </Text>
        </TouchableOpacity>
      </View>
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
    <View style={[styles.container, style]}>
      {error && renderErrorComponent()}
      
      <FlatList
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
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: Spacing.lg,
    margin: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorTitle: {
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  errorMessage: {
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: Spacing.md,
    opacity: 0.8,
  },
  retryButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});
