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
  const payload = response as any;
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const directToken =
    typeof payload.accessToken === 'string'
      ? payload.accessToken
      : typeof payload.token === 'string'
        ? payload.token
        : null;

  if (directToken) {
    return directToken;
  }

  if (payload.data && typeof payload.data === 'object') {
    if (typeof payload.data.accessToken === 'string') {
      return payload.data.accessToken;
    }
    if (typeof payload.data.token === 'string') {
      return payload.data.token;
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
