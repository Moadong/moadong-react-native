import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@access_token';
const AUTH_SUBJECT_KEY = '@auth_subject';

let cachedAccessToken: string | null | undefined;
let cachedAuthSubject: string | null | undefined;

// sub는 서버가 발급하는 신원(studentId)의 근거가 되므로 추측 가능한 값이면 안 된다.
// crypto.getRandomValues는 app/_layout.tsx의 react-native-get-random-values로 폴리필된다.
function generateUuidV4(): string {
  if (typeof globalThis.crypto?.getRandomValues !== 'function') {
    throw new Error('crypto.getRandomValues를 사용할 수 없어 auth subject를 생성할 수 없습니다.');
  }

  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function getStoredAccessToken(): Promise<string | null> {
  if (cachedAccessToken !== undefined) {
    return cachedAccessToken;
  }

  try {
    cachedAccessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return cachedAccessToken;
  } catch (error) {
    console.error('❌ Access Token 조회 실패:', error);
    cachedAccessToken = null;
    return null;
  }
}

export async function saveAccessToken(token: string): Promise<void> {
  cachedAccessToken = token;
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function getOrCreateAuthSubject(): Promise<string> {
  if (cachedAuthSubject !== undefined && cachedAuthSubject !== null) {
    return cachedAuthSubject;
  }

  try {
    const stored = await AsyncStorage.getItem(AUTH_SUBJECT_KEY);
    if (stored) {
      cachedAuthSubject = stored;
      return stored;
    }

    const subject = generateUuidV4();
    cachedAuthSubject = subject;
    await AsyncStorage.setItem(AUTH_SUBJECT_KEY, subject);
    return subject;
  } catch (error) {
    console.warn('⚠️ auth subject 저장 실패, 임시 값 사용:', error);
    cachedAuthSubject = generateUuidV4();
    return cachedAuthSubject;
  }
}

export function getJwtSubject(accessToken: string): string | null {
  try {
    const atobFn = typeof globalThis.atob === 'function' ? globalThis.atob : null;
    if (!atobFn) {
      return null;
    }

    const payloadPart = accessToken.split('.')[1];
    if (!payloadPart) {
      return null;
    }

    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payloadJson = atobFn(padded);
    const payload = JSON.parse(payloadJson) as Record<string, unknown>;

    return (
      (typeof payload.sub === 'string' && payload.sub) ||
      (typeof payload.userId === 'string' && payload.userId) ||
      (typeof payload.user_id === 'string' && payload.user_id) ||
      (typeof payload.id === 'string' && payload.id) ||
      null
    );
  } catch (error) {
    console.warn('⚠️ JWT payload 파싱 실패:', error);
    return null;
  }
}

/**
 * /auth/student 요청 본문에 실을 sub.
 *
 * 서버가 요청 sub를 무시하고 자체 UUID로 신원을 만들던 시절이 있어서, 기존 설치는
 * 저장된 @auth_subject와 토큰 안의 신원이 서로 다른 값이다. 실제 편지함이 달린 신원은
 * 토큰 쪽이므로, 저장된 토큰이 있으면 그 payload.sub를 그대로 다시 보낸다.
 * 토큰이 없는 신규 설치에서만 @auth_subject를 쓴다.
 */
export async function resolveAuthSubject(): Promise<string> {
  const accessToken = await getStoredAccessToken();
  const tokenSubject = accessToken ? getJwtSubject(accessToken) : null;

  return tokenSubject ?? getOrCreateAuthSubject();
}
