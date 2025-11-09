/**
 * 구독 동아리 전역 상태 관리 Context
 */

import { api } from '@/services/api';
import { getFcmToken } from '@/services/fcm.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const SUBSCRIBED_CLUBS_KEY = '@subscribed_clubs';

/**
 * 구독 Context 타입
 */
interface SubscribedClubsContextType {
  subscribedClubIds: string[];
  isSubscribed: (clubId: string) => boolean;
  toggleSubscribe: (clubId: string) => Promise<void>;
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
}

/**
 * 구독 동아리 전역 상태 Provider
 */
export function SubscribedClubsProvider({ children }: SubscribedClubsProviderProps) {
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
        console.log('✅ 구독 목록 로드:', clubIds.length, '개');
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

      await api.put('/api/fcm/subscribe', {
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
    const newClubIds = subscribedClubIds.includes(clubId)
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
        return;
      }

      await api.put('/api/fcm/subscribe', {
        fcmToken,
        clubIds: newClubIds,
      });

      console.log('✅ 구독 변경 서버 동기화 완료');
    } catch (error) {
      console.error('❌ 구독 변경 동기화 실패:', error);
    }
  }, [subscribedClubIds, saveSubscribedClubs]);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    loadSubscribedClubs();
  }, [loadSubscribedClubs]);

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

