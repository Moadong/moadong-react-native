/**
 * 동아리 데이터를 관리하는 커스텀 훅
 */

import { CategoryType } from '@/components/icon';
import { clubService } from '@/services/club.service';
import { Club, ClubSearchParams } from '@/types/club.types';
import { useCallback, useEffect, useState } from 'react';

/**
 * 동아리 목록 훅 옵션
 */
interface UseClubsOptions {
  initialCategory?: CategoryType;
  initialType?: 'central' | 'department';
  autoFetch?: boolean;
}

/**
 * 동아리 목록 훅 반환 값
 */
interface UseClubsReturn {
  clubs: Club[];
  loading: boolean;
  error: string | null;
  fetchClubs: (params?: ClubSearchParams) => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
  clearClubs: () => void;
}

/**
 * 동아리 목록을 가져오고 관리하는 훅
 * 
 * @example
 * ```typescript
 * const {
 *   clubs,
 *   loading,
 *   error,
 *   fetchClubs,
 *   refetch,
 * } = useClubs({
 *   initialCategory: '전체',
 *   initialType: 'central',
 * });
 * ```
 */
export function useClubs(options: UseClubsOptions = {}): UseClubsReturn {
  const { 
    initialCategory = '전체', 
    initialType = 'central',
    autoFetch = true,
  } = options;

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentParams, setCurrentParams] = useState<ClubSearchParams>({
    category: initialCategory === '전체' ? undefined : initialCategory,
    type: initialType,
  });

  /**
   * 동아리 목록 가져오기
   */
  const fetchClubs = useCallback(async (params?: ClubSearchParams) => {
    setLoading(true);
    setError(null);

    const finalParams = { ...currentParams, ...params };
    setCurrentParams(finalParams);

    try {
      const response = await clubService.searchClubs(finalParams);
      setClubs(response.content);
    } catch (err: any) {
      setError(err.message || '동아리 목록을 불러오는데 실패했습니다.');
      console.error('동아리 목록 조회 에러:', err);
    } finally {
      setLoading(false);
    }
  }, []); // 의존성 배열을 비워서 무한 루프 방지

  /**
   * 현재 파라미터로 다시 가져오기 (Pull to refresh)
   */
  const refetch = useCallback(async () => {
    await fetchClubs({ ...currentParams });
  }, [currentParams, fetchClubs]);

  /**
   * 동아리 목록 비우기
   */
  const clearClubs = useCallback(() => {
    setClubs([]);
    setLoading(false);
    setError(null);
  }, []);

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    setClubs([]);
    setError(null);
    setCurrentParams({
      category: initialCategory === '전체' ? undefined : initialCategory,
      type: initialType,
    });
  }, [initialCategory, initialType]);

  /**
   * 초기 데이터 로드 
   */
  useEffect(() => {
    if (autoFetch) {
      // 초기 파라미터로 직접 호출
      fetchClubs({
        category: initialCategory === '전체' ? undefined : initialCategory,
        type: initialType,
      });
    }
  }, [autoFetch]);

  return {
    clubs,
    loading,
    error,
    fetchClubs,
    refetch,
    clearClubs,
    reset,
  };
}
