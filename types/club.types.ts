/**
 * 동아리 관련 타입 정의
 */


/**
 * 동아리 타입
 */
export type ClubType = 'central' | 'department';

/**
 * 동아리 인터페이스
 */
export interface Club {
  id: number;
  name: string;
  description: string;
  category: string[];
  imageUrl?: string;
  memberCount?: number;
  type: ClubType;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 동아리 검색 파라미터
 */
export interface ClubSearchParams {
  keyword?: string;
  category?: string;
  type?: ClubType;
  page?: number;
  size?: number;
}

/**
 * 페이지네이션 응답
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * API 에러 응답
 */
export interface ApiErrorResponse {
  message: string;
  status: number;
  timestamp: string;
  path?: string;
}

