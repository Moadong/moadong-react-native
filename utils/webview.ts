import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const getWebViewUserAgent = (): string => {
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const platform = Platform.OS === 'ios' ? 'iOS' : 'Android';
  return `MoadongApp/${appVersion} (${platform})`;
};

export const appendSessionId = (url: string, sessionId: string): string => {
  if (!sessionId) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}session_id=${encodeURIComponent(sessionId)}`;
};
