/**
 * Axios 설정 및 기본 API 클라이언트
 */

import { ApiErrorResponse } from '@/types/club.types';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { getStoredAccessToken } from './auth-token-storage';

const APP_VERSION_HEADER_KEY = 'APP_VERSION';

function getLoggableHeaders(headers: any): Record<string, any> | undefined {
  if (!headers) return undefined;
  if (typeof headers.toJSON === 'function') return headers.toJSON();
  if (typeof headers.entries === 'function') return Object.fromEntries(headers.entries());
  if (typeof headers === 'object') return { ...headers };
  return undefined;
}

function getAppVersion(): string | undefined {
  const version =
    Application.nativeApplicationVersion ??
    Constants.nativeAppVersion 

  return typeof version === 'string' && version.trim() ? version.trim() : undefined;
}

const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
if (!baseUrl) {
  console.warn(
    '⚠️ BASE_URL 환경 변수가 설정되어 있지 않습니다. 기본값으로 http://localhost:3000 을 사용합니다.',
  );
}

/**
 * API Base URL
 * 환경변수로 관리 가능
 */

/**
 * Axios 인스턴스 생성
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: baseUrl,
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
  async (config) => {
    // 앱 버전 헤더 추가 (서버에서 클라이언트 버전 추적/디버깅 용도)
    const appVersion = getAppVersion();
    if (appVersion) {
      const headers: any = config.headers ?? {};
      if (typeof headers.set === 'function') {
        headers.set(APP_VERSION_HEADER_KEY, appVersion);
      } else if (!headers[APP_VERSION_HEADER_KEY]) {
        headers[APP_VERSION_HEADER_KEY] = appVersion;
      }
      config.headers = headers;
    }

    const accessToken = await getStoredAccessToken();
    if (accessToken) {
      const headers: any = config.headers ?? {};
      if (typeof headers.set === 'function') {
        headers.set('Authorization', `Bearer ${accessToken}`);
      } else {
        headers.Authorization = `Bearer ${accessToken}`;
      }
      config.headers = headers;
    }

    if (__DEV__) {
      const headers = getLoggableHeaders(config.headers);
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers,
        appVersion: headers?.[APP_VERSION_HEADER_KEY],
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
