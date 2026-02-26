import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@access_token';

export async function getStoredAccessToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('❌ Access Token 조회 실패:', error);
    return null;
  }
}

export async function saveAccessToken(token: string): Promise<void> {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
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

