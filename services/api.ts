/**
 * Axios 설정 및 기본 API 클라이언트
 */

import { ApiErrorResponse } from '@/types/club.types';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * API Base URL
 * 환경변수로 관리 가능
 */
const API_BASE_URL = 'https://yourun.shop/api';

/**
 * Axios 인스턴스 생성
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터
 * - 인증 토큰 추가
 * - 요청 로깅 (개발 환경)
 */
apiClient.interceptors.request.use(
  (config) => {
    // TODO: 인증 토큰이 있다면 추가
    // const token = AsyncStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    if (__DEV__) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    if (__DEV__) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터
 * - 응답 데이터 처리
 * - 에러 핸들링
 * - 응답 로깅 (개발 환경)
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (__DEV__) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        url: error.config?.url,
      });
    }

    // 에러 메시지 포맷팅
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        '알 수 없는 오류가 발생했습니다.';

    // 에러 상태별 처리
    if (error.response) {
      switch (error.response.status) {
        case 400:
          console.error('잘못된 요청입니다.');
          break;
        case 401:
          console.error('인증이 필요합니다.');
          // TODO: 로그인 페이지로 이동
          break;
        case 403:
          console.error('접근 권한이 없습니다.');
          break;
        case 404:
          console.error('요청한 리소스를 찾을 수 없습니다.');
          break;
        case 500:
          console.error('서버 오류가 발생했습니다.');
          break;
        default:
          console.error(errorMessage);
      }
    } else if (error.request) {
      console.error('네트워크 연결을 확인해주세요.');
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      originalError: error,
    });
  }
);

/**
 * API 클라이언트 export
 */
export default apiClient;

/**
 * 타입 안전한 API 호출 헬퍼
 */
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),
};

