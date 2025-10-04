/**
 * 동아리 데이터를 관리하는 커스텀 훅
 */

import { CategoryType } from '@/components/icon';
import { clubService } from '@/services/club.service';
import { Club, ClubSearchParams, PageResponse } from '@/types/club.types';
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
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
  fetchClubs: (params?: ClubSearchParams) => Promise<void>;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
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
  const [pageInfo, setPageInfo] = useState<PageResponse<Club> | null>(null);
  const [currentParams, setCurrentParams] = useState<ClubSearchParams>({
    category: initialCategory === '전체' ? undefined : initialCategory,
    type: initialType,
    page: 0,
    size: 20,
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
      
      // 페이지가 0이면 새로운 목록, 아니면 추가
      if (finalParams.page === 0) {
        setClubs(response.content);
      } else {
        setClubs((prev) => [...prev, ...response.content]);
      }
      
      setPageInfo(response);
    } catch (err: any) {
      setError(err.message || '동아리 목록을 불러오는데 실패했습니다.');
      console.error('동아리 목록 조회 에러:', err);
    } finally {
      setLoading(false);
    }
  }, [currentParams]);

  /**
   * 현재 파라미터로 다시 가져오기 (Pull to refresh)
   */
  const refetch = useCallback(async () => {
    await fetchClubs({ ...currentParams, page: 0 });
  }, [currentParams, fetchClubs]);

  /**
   * 다음 페이지 로드 (무한 스크롤)
   */
  const loadMore = useCallback(async () => {
    if (!pageInfo || pageInfo.last || loading) {
      return;
    }

    await fetchClubs({
      ...currentParams,
      page: currentParams.page! + 1,
    });
  }, [pageInfo, loading, currentParams, fetchClubs]);

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    setClubs([]);
    setError(null);
    setPageInfo(null);
    setCurrentParams({
      category: initialCategory === '전체' ? undefined : initialCategory,
      type: initialType,
      page: 0,
      size: 20,
    });
  }, [initialCategory, initialType]);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    if (autoFetch) {
      fetchClubs();
    }
  }, [autoFetch]); // fetchClubs는 의존성에서 제외 (무한 루프 방지)

  return {
    clubs,
    loading,
    error,
    totalPages: pageInfo?.totalPages || 0,
    currentPage: pageInfo?.number || 0,
    hasMore: pageInfo ? !pageInfo.last : false,
    fetchClubs,
    refetch,
    loadMore,
    reset,
  };
}

