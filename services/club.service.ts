/**
 * 동아리 관련 API 서비스
 */

import { Club, ClubSearchParams, PageResponse } from '@/types/club.types';
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

    // 쿼리 파라미터 구성
    const queryParams: Record<string, any> = {
      page,
      size,
    };

    if (keyword) {
      queryParams.keyword = keyword;
    }

    if (category && category !== 'ALL') {
      queryParams.category = category;
    }

    if (type) {
      queryParams.type = type;
    }

    const response = await api.get<PageResponse<Club>>('/clubs/search', {
      params: queryParams,
    });

    return response;
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
    const response = await api.get<Club>(`/clubs/${id}`);
    return response;
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
    const response = await api.get<PageResponse<Club>>('/clubs/popular', {
      params: { size: limit },
    });
    return response.content;
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
    const response = await api.get<Club[]>('/clubs/recommended');
    return response;
  },
};

