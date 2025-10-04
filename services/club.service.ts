/**
 * 동아리 관련 API 서비스
 */

import { ApiResponse, Club, ClubSearchData, ClubSearchParams, PageResponse } from '@/types/club.types';
import { api } from './api';

/**
 * 동아리 서비스
 */
export const clubService = {
  /**
   * 동아리 검색
   * 
   * @example
   * ```typescript
   * const clubs = await clubService.searchClubs({
   *   keyword: '음악',
   *   category: '공연',
   *   page: 0,
   *   size: 20,
   * });
   * ```
   */
  searchClubs: async (params: ClubSearchParams = {}): Promise<PageResponse<Club>> => {
    const { keyword, category, type, page = 0, size = 20 } = params;

    // 실제 API 파라미터 구성
    const queryParams: Record<string, any> = {
      // 모집상태: ALWAYS(상시모집), OPEN(모집중), CLOSED(모집마감), UPCOMING(모집예정)
      recruitmentStatus: 'all', // 전체 검색
      
      // 분과: 중앙동아리/과동아리
      division: 'all',
      
      // 종류: 봉사, 종교, 취미교양, 학술, 운동, 공연, 기타
      category: category === '전체' || !category ? 'all' : category,
    };

    // 키워드 검색 (이름, 태그, 소개에서 검색)
    if (keyword && keyword.trim()) {
      queryParams.keyword = keyword.trim();
    }

    const response = await api.get<ApiResponse<ClubSearchData>>('/api/club/search/', {
      params: queryParams,
    });

    // API 응답을 PageResponse 형식으로 변환
    const clubs = response.data.clubs;
    const totalCount = response.data.totalCount;
    
    return {
      content: clubs,
      totalElements: totalCount,
      totalPages: Math.ceil(totalCount / size),
      size,
      number: page,
      first: page === 0,
      last: (page + 1) * size >= totalCount,
      empty: clubs.length === 0,
    };
  },

  /**
   * 동아리 상세 조회
   * 
   * @example
   * ```typescript
   * const club = await clubService.getClubById(1);
   * ```
   */
  getClubById: async (id: number): Promise<Club> => {
    const response = await api.get<ApiResponse<Club>>(`/api/club/${id}/`);
    return (response.data as any)?.data || {};
  },

  /**
   * 인기 동아리 목록 조회
   * 
   * @example
   * ```typescript
   * const popularClubs = await clubService.getPopularClubs(10);
   * ```
   */
  getPopularClubs: async (limit: number = 10): Promise<Club[]> => {
    const response = await api.get<ApiResponse<Club[]>>('/api/club/popular/', {
      params: { size: limit },
    });
    return (response.data as any)?.data || [];
  },

  /**
   * 추천 동아리 목록 조회
   * 
   * @example
   * ```typescript
   * const recommendedClubs = await clubService.getRecommendedClubs();
   * ```
   */
  getRecommendedClubs: async (): Promise<Club[]> => {
    const response = await api.get<ApiResponse<Club[]>>('/api/club/recommended/');
    return (response.data as any)?.data || [];
  },
};

