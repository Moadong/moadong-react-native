import { publicApi } from './api';
import { getStoredAccessToken, resolveAuthSubject, saveAccessToken } from './auth-token-storage';

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
    sub: await resolveAuthSubject(),
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

let issuePromise: Promise<string> | null = null;

export async function ensureAccessToken(): Promise<string> {
  const storedToken = await getStoredAccessToken();
  if (storedToken) {
    return storedToken;
  }

  // 첫 실행 시 부트스트랩과 웹뷰가 동시에 호출하면 서로 다른 sub/토큰이 발급되어
  // 앱 신원과 웹뷰 신원이 갈린다. 발급은 항상 한 번만 수행한다.
  if (!issuePromise) {
    issuePromise = issueAccessToken().finally(() => {
      issuePromise = null;
    });
  }

  return issuePromise;
}
