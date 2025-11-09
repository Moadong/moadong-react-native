/**
 * 구독 화면 로직 커스텀 훅
 */

import { Club } from '@/types/club.types';
import { useClubs } from '@/ui/home/hook/use-clubs';
import { useSubscribedClubs } from '@/ui/home/hook/use-subscribed-clubs';
import { useCallback, useMemo } from 'react';

/**
 * 구독 화면 훅 반환 값
 */
interface UseSubscribeScreenReturn {
  subscribedClubs: Club[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  isSubscribed: (clubId: string) => boolean;
  toggleSubscribe: (clubId: string) => Promise<void>;
}

/**
 * 구독 화면 데이터를 관리하는 훅
 * 
 * @example
 * ```typescript
 * const {
 *   subscribedClubs,
 *   loading,
 *   error,
 *   refetch,
 *   isSubscribed,
 *   toggleSubscribe,
 * } = useSubscribeScreen();
 * ```
 */
export function useSubscribeScreen(): UseSubscribeScreenReturn {
  // 구독 동아리 ID 목록 가져오기
  const {
    subscribedClubIds,
    isSubscribed,
    toggleSubscribe,
  } = useSubscribedClubs();

  // 모든 동아리 데이터 가져오기
  const {
    clubs,
    loading,
    error,
    refetch,
  } = useClubs({
    initialCategory: undefined, // 전체 카테고리
    initialType: 'central', // 중앙동아리
    autoFetch: true,
  });

  /**
   * 구독한 동아리만 필터링
   */
  const subscribedClubs = useMemo(() => {
    return clubs.filter(club => subscribedClubIds.includes(club.id));
  }, [clubs, subscribedClubIds]);

  /**
   * 새로고침 핸들러
   */
  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    subscribedClubs,
    loading,
    error,
    refetch: handleRefetch,
    isSubscribed,
    toggleSubscribe,
  };
}

