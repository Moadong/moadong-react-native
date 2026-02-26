import { publicApi } from './api';
import { getOrCreateAuthSubject, getStoredAccessToken, saveAccessToken } from './auth-token-storage';

type IssueAccessTokenResponse =
  | {
      statuscode?: string;
      message?: string;
      data?: { accessToken?: string };
    }
  | { accessToken?: string; token?: string }
  | { data?: { accessToken?: string; token?: string } };

type IssueAccessTokenPayload = {
  sub: string;
  iat: number;
};

function extractAccessToken(response: IssueAccessTokenResponse): string | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  const directToken =
    'accessToken' in response && typeof response.accessToken === 'string'
      ? response.accessToken
      : 'token' in response && typeof response.token === 'string'
        ? response.token
        : null;

  if (directToken) {
    return directToken;
  }

  if ('data' in response && response.data && typeof response.data === 'object') {
    if (typeof response.data.accessToken === 'string') {
      return response.data.accessToken;
    }
    if (typeof response.data.token === 'string') {
      return response.data.token;
    }
  }

  return null;
}

export async function issueAccessToken(): Promise<string> {
  const payload: IssueAccessTokenPayload = {
    sub: await getOrCreateAuthSubject(),
    iat: Math.floor(Date.now() / 1000),
  };

  const response = await publicApi.post<IssueAccessTokenResponse>('/auth/student', payload);
  const token = extractAccessToken(response);

  if (!token) {
    throw new Error('Access Token 발급 응답에 토큰이 없습니다.');
  }

  await saveAccessToken(token);
  return token;
}

export async function ensureAccessToken(): Promise<string> {
  const storedToken = await getStoredAccessToken();
  if (storedToken) {
    return storedToken;
  }

  return issueAccessToken();
}

