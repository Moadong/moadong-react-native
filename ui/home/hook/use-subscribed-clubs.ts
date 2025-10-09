/**
 * 구독 동아리 관리 커스텀 훅
 */

import { api } from '@/services/api';
import { getFcmToken } from '@/services/fcm.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const SUBSCRIBED_CLUBS_KEY = '@subscribed_clubs';

/**
 * 구독 동아리 훅 반환 값
 */
interface UseSubscribedClubsReturn {
  subscribedClubIds: string[];
  isSubscribed: (clubId: string) => boolean;
  toggleSubscribe: (clubId: string) => Promise<void>;
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
  const [subscribedClubIds, setSubscribedClubIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 로컬 스토리지에서 구독 목록 로드
   */
  const loadSubscribedClubs = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(SUBSCRIBED_CLUBS_KEY);
      if (stored) {
        const clubIds = JSON.parse(stored) as string[];
        setSubscribedClubIds(clubIds);
      }
    } catch (error) {
      console.error('❌ 구독 목록 로드 실패:', error);
    }
  }, []);

  /**
   * 로컬 스토리지에 구독 목록 저장
   */
  const saveSubscribedClubs = useCallback(async (clubIds: string[]) => {
    try {
      await AsyncStorage.setItem(SUBSCRIBED_CLUBS_KEY, JSON.stringify(clubIds));
    } catch (error) {
      console.error('❌ 구독 목록 저장 실패:', error);
    }
  }, []);

  /**
   * 서버와 구독 목록 동기화
   */
  const syncWithServer = useCallback(async () => {
    setLoading(true);
    try {
      const fcmToken = await getFcmToken();
      if (!fcmToken) {
        console.warn('⚠️ FCM 토큰이 없어 동기화를 건너뜁니다.');
        return;
      }

      await api.post('/api/fcm/subscribe', {
        fcmToken,
        clubIds: subscribedClubIds,
      });

      console.log('✅ 구독 목록 서버 동기화 완료');
    } catch (error) {
      console.error('❌ 구독 목록 동기화 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [subscribedClubIds]);

  /**
   * 특정 동아리 구독 여부 확인
   */
  const isSubscribed = useCallback((clubId: string): boolean => {
    return subscribedClubIds.includes(clubId);
  }, [subscribedClubIds]);

  /**
   * 구독 토글
   */
  const toggleSubscribe = useCallback(async (clubId: string) => {
    setSubscribedClubIds((prev) => {
      const newClubIds = prev.includes(clubId)
        ? prev.filter((id) => id !== clubId)
        : [...prev, clubId];

      // 로컬 스토리지에 저장
      saveSubscribedClubs(newClubIds);

      // 서버와 동기화 (비동기)
      (async () => {
        try {
          const fcmToken = await getFcmToken();
          if (!fcmToken) {
            console.warn('⚠️ FCM 토큰이 없어 동기화를 건너뜁니다.');
            return;
          }

          await api.post('/api/fcm/subscribe', {
            fcmToken,
            clubIds: newClubIds,
          });

          console.log('✅ 구독 변경 서버 동기화 완료');
        } catch (error) {
          console.error('❌ 구독 변경 동기화 실패:', error);
        }
      })();

      return newClubIds;
    });
  }, [saveSubscribedClubs]);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    loadSubscribedClubs();
  }, [loadSubscribedClubs]);

  return {
    subscribedClubIds,
    isSubscribed,
    toggleSubscribe,
    syncWithServer,
    loading,
  };
}

