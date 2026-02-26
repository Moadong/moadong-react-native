import AsyncStorage from '@react-native-async-storage/async-storage';

import { api } from './api';

const SUBSCRIBED_CLUBS_KEY = '@subscribed_clubs';

type SubscribedClubsResponse =
  | string[]
  | { clubIds?: string[]; subscribedClubIds?: string[] }
  | { data?: { clubIds?: string[]; subscribedClubIds?: string[] } };

function normalizeClubIds(payload: SubscribedClubsResponse): string[] {
  if (Array.isArray(payload)) {
    return payload.filter((clubId): clubId is string => typeof clubId === 'string');
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const directClubIds = 'clubIds' in payload && Array.isArray(payload.clubIds) ? payload.clubIds : null;
  if (directClubIds) {
    return directClubIds.filter((clubId): clubId is string => typeof clubId === 'string');
  }

  const directSubscribedIds =
    'subscribedClubIds' in payload && Array.isArray(payload.subscribedClubIds)
      ? payload.subscribedClubIds
      : null;
  if (directSubscribedIds) {
    return directSubscribedIds.filter((clubId): clubId is string => typeof clubId === 'string');
  }

  if ('data' in payload && payload.data && typeof payload.data === 'object') {
    if (Array.isArray(payload.data.clubIds)) {
      return payload.data.clubIds.filter((clubId): clubId is string => typeof clubId === 'string');
    }
    if (Array.isArray(payload.data.subscribedClubIds)) {
      return payload.data.subscribedClubIds.filter((clubId): clubId is string => typeof clubId === 'string');
    }
  }

  return [];
}

export async function loadSubscribedClubIdsFromStorage(): Promise<string[]> {
  try {
    const stored = await AsyncStorage.getItem(SUBSCRIBED_CLUBS_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((clubId): clubId is string => typeof clubId === 'string');
  } catch (error) {
    console.error('❌ 구독 목록 로드 실패:', error);
    return [];
  }
}

export async function saveSubscribedClubIdsToStorage(clubIds: string[]): Promise<void> {
  await AsyncStorage.setItem(SUBSCRIBED_CLUBS_KEY, JSON.stringify(clubIds));
}

export async function fetchSubscribedClubIdsByAccessToken(studentToken: string): Promise<string[]> {
  if (!studentToken) {
    throw new Error('studentToken이 없어 구독 목록을 조회할 수 없습니다.');
  }

  const response = await api.get<SubscribedClubsResponse>('/api/student/subscriptions', {
    params: { studentToken },
  });
  return normalizeClubIds(response);
}

