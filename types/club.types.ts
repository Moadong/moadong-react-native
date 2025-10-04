/**
 * 동아리 관련 타입 정의
 */


/**
 * 동아리 타입
 */
export type ClubType = 'central' | 'department';

/**
 * 모집상태 타입
 */
export type RecruitmentStatus = 'ALWAYS' | 'OPEN' | 'CLOSED' | 'UPCOMING' | 'all';

/**
 * 분과 타입
 */
export type Division = '중앙' | '과동아리' | 'all';

/**
 * 카테고리 타입 (실제 API에서 사용하는 값)
 */
export type ApiCategory = '봉사' | '종교' | '취미교양' | '학술' | '운동' | '공연' | '기타' | 'all';

/**
 * 동아리 인터페이스 (실제 API 응답 구조)
 */
export interface Club {
  id: string;
  name: string;
  logo: string;
  tags: string[];
  state: string;
  category: string;
  division: string;
  introduction: string;
  recruitmentStatus: string;
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
 * 실제 API 응답 형식
 */
export interface ApiResponse<T> {
  statuscode: string;
  message: string;
  data: T;
}

/**
 * 동아리 검색 응답 데이터
 */
export interface ClubSearchData {
  clubs: Club[];
  totalCount: number;
}

/**
 * 페이지네이션 응답 (기존 호환성 유지)
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

