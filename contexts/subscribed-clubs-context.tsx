/**
 * 구독 동아리 전역 상태 관리 Context
 */

import { authApi } from '@/services/api';
import {
  checkNotificationPermission,
  getFcmToken,
  requestUserPermission,
  sendFcmTokenToServer,
} from '@/services/fcm.service';
import {
  loadSubscribedClubIdsFromStorage,
  saveSubscribedClubIdsToStorage,
} from '@/services/subscription.service';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

/**
 * 구독 Context 타입
 */
interface SubscribedClubsContextType {
  subscribedClubIds: string[];
  isSubscribed: (clubId: string) => boolean;
  toggleSubscribe: (clubId: string) => Promise<{ needsPermission: boolean }>;
  syncWithServer: () => Promise<void>;
  loading: boolean;
}

/**
 * 구독 Context
 */
const SubscribedClubsContext = createContext<SubscribedClubsContextType | undefined>(undefined);

/**
 * 구독 Provider Props
 */
interface SubscribedClubsProviderProps {
  children: React.ReactNode;
  refreshKey?: number;
}

/**
 * 구독 동아리 전역 상태 Provider
 */
export function SubscribedClubsProvider({ children, refreshKey = 0 }: SubscribedClubsProviderProps) {
  const [subscribedClubIds, setSubscribedClubIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 로컬 스토리지에서 구독 목록 로드
   */
  const loadSubscribedClubs = useCallback(async () => {
    try {
      const clubIds = await loadSubscribedClubIdsFromStorage();
      setSubscribedClubIds(clubIds);
      console.log('✅ 구독 목록 로드:', clubIds.length, '개');
    } catch (error) {
      console.error('❌ 구독 목록 로드 실패:', error);
    }
  }, []);

  /**
   * 로컬 스토리지에 구독 목록 저장
   */
  const saveSubscribedClubs = useCallback(async (clubIds: string[]) => {
    try {
      await saveSubscribedClubIdsToStorage(clubIds);
      console.log('✅ 구독 목록 저장:', clubIds.length, '개');
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

      // subscribe 엔드포인트는 토큰이 사전 등록되어 있어야 함. 미등록 시 404를 막기 위한 가드.
      await sendFcmTokenToServer(fcmToken);

      await authApi.put('/api/v2/fcm/subscribe', {
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
  const toggleSubscribe = useCallback(async (clubId: string): Promise<{ needsPermission: boolean }> => {
    const isCurrentlySubscribed = subscribedClubIds.includes(clubId);
    
    // 구독 추가 시도인 경우에만 권한 체크
    if (!isCurrentlySubscribed) {
      // 1. 현재 권한 상태 확인
      const permission = await checkNotificationPermission();
      
      if (!permission.granted) {
        // 2. 권한이 없고 다시 물어볼 수 있는 경우 시스템 다이얼로그 표시
        if (permission.canAskAgain) {
          const granted = await requestUserPermission();
          if (!granted) {
            // 시스템 다이얼로그에서도 거부됨 - 권한 필요 알림
            return { needsPermission: true };
          }
          // 권한 허용됨 - 계속 진행
        } else {
          // 3. 다시 물어볼 수 없는 경우 (이미 거부됨) - 권한 필요 알림
          return { needsPermission: true };
        }
      }
    }

    const newClubIds = isCurrentlySubscribed
      ? subscribedClubIds.filter((id) => id !== clubId)
      : [...subscribedClubIds, clubId];

    // 상태 즉시 업데이트 (UI 반응성)
    setSubscribedClubIds(newClubIds);

    // 로컬 스토리지에 저장
    await saveSubscribedClubs(newClubIds);

    // 서버와 동기화 (비동기)
    try {
      const fcmToken = await getFcmToken();
      if (!fcmToken) {
        console.warn('⚠️ FCM 토큰이 없어 동기화를 건너뜁니다.');
        return { needsPermission: false };
      }

      // subscribe 엔드포인트는 토큰이 사전 등록되어 있어야 함. 미등록 시 404를 막기 위한 가드.
      await sendFcmTokenToServer(fcmToken);

      await authApi.put('/api/v2/fcm/subscribe', {
        fcmToken,
        clubIds: newClubIds,
      });

      console.log('✅ 구독 변경 서버 동기화 완료');
    } catch (error) {
      console.error('❌ 구독 변경 동기화 실패:', error);
    }
    
    return { needsPermission: false };
  }, [subscribedClubIds, saveSubscribedClubs]);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    loadSubscribedClubs();
  }, [loadSubscribedClubs, refreshKey]);

  const value: SubscribedClubsContextType = {
    subscribedClubIds,
    isSubscribed,
    toggleSubscribe,
    syncWithServer,
    loading,
  };

  return (
    <SubscribedClubsContext.Provider value={value}>
      {children}
    </SubscribedClubsContext.Provider>
  );
}

/**
 * 구독 Context Hook
 */
export function useSubscribedClubsContext(): SubscribedClubsContextType {
  const context = useContext(SubscribedClubsContext);
  if (context === undefined) {
    throw new Error('useSubscribedClubsContext must be used within SubscribedClubsProvider');
  }
  return context;
}

