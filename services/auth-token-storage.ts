import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@access_token';
const AUTH_SUBJECT_KEY = '@auth_subject';

let cachedAccessToken: string | null | undefined;
let cachedAuthSubject: string | null | undefined;

function generateUuidV4(): string {
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return template.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
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
