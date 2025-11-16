/**
 * 구독 동아리 관리 커스텀 훅
 * Context 기반으로 전역 상태 공유
 */

import { useSubscribedClubsContext } from '@/contexts/subscribed-clubs-context';

/**
 * 구독 동아리 훅 반환 값
 */
interface UseSubscribedClubsReturn {
  subscribedClubIds: string[];
  isSubscribed: (clubId: string) => boolean;
  toggleSubscribe: (clubId: string) => Promise<{ needsPermission: boolean }>;
  syncWithServer: () => Promise<void>;
  loading: boolean;
}

/**
 * 구독 동아리를 관리하는 훅
 * 
 * @example
 * ```typescript
 * const {
 *   subscribedClubIds,
 *   isSubscribed,
 *   toggleSubscribe,
 * } = useSubscribedClubs();
 * 
 * // 구독 상태 확인
 * const subscribed = isSubscribed(club.id);
 * 
 * // 구독 토글
 * await toggleSubscribe(club.id);
 * ```
 */
export function useSubscribedClubs(): UseSubscribedClubsReturn {
  // Context에서 전역 상태 가져오기
  const context = useSubscribedClubsContext();
  
  return {
    subscribedClubIds: context.subscribedClubIds,
    isSubscribed: context.isSubscribed,
    toggleSubscribe: context.toggleSubscribe,
    syncWithServer: context.syncWithServer,
    loading: context.loading,
  };
}

