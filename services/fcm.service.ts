/**
 * Firebase Cloud Messaging (FCM) 서비스
 * - Firebase 앱 초기화 보장
 * - FCM 토큰 발급 및 서버 전달
 * - 토큰 갱신 / 메시지 리스너 관리
 */

import { FirebaseApp, getApps, initializeApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  FirebaseMessagingTypes,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

import { firebaseConfig } from '@/constants/firebase-config';
import { api } from './api';

let firebaseAppPromise: Promise<FirebaseApp> | null = null;
let messagingModule: FirebaseMessagingTypes.Module | null = null;
let initializationPromise: Promise<(() => void) | undefined> | null = null;
let currentToken: string | null = null;
let lastSyncedToken: string | null = null;

/**
 * Firebase 앱 초기화 (최초 1회)
 */
const ensureFirebaseApp = (): Promise<FirebaseApp> => {
  if (firebaseAppPromise) {
    return firebaseAppPromise;
  }

  firebaseAppPromise = (async () => {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      return existingApps[0];
    }

    try {
      const app = await initializeApp(firebaseConfig);
      return app;
    } catch (error) {
      firebaseAppPromise = null;
      console.error('❌ Firebase 앱 초기화 실패:', error);
      throw error;
    }
  })();

  return firebaseAppPromise;
};

/**
 * Messaging 모듈 확보 (캐싱)
 */
const ensureMessagingModule = async (): Promise<FirebaseMessagingTypes.Module> => {
  if (messagingModule) {
    return messagingModule;
  }

  const app = await ensureFirebaseApp();
  messagingModule = getMessaging(app);
  return messagingModule;
};

/**
 * 사용자 알림 권한 요청
 */
export const requestUserPermission = async (): Promise<boolean> => {
  try {
    const messaging = await ensureMessagingModule();

    if (Platform.OS === 'ios') {
      const status = await requestPermission(messaging, {
        sound: true,
        badge: true,
        announcement: true,
      });

      const enabled =
        status === AuthorizationStatus.AUTHORIZED ||
        status === AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.warn('❌ iOS 알림 권한이 거부되었습니다:', status);
      }

      return enabled;
    }

    // Android는 기본적으로 권한이 부여됨
    return true;
  } catch (error) {
    console.error('❌ FCM 권한 요청 실패:', error);
    return false;
  }
};

/**
 * FCM 토큰 발급 및 캐싱
 */
export const getFcmToken = async (): Promise<string | null> => {
  try {
    const messaging = await ensureMessagingModule();
    const token = await getToken(messaging);

    if (!token) {
      console.warn('❌ FCM 토큰을 발급받지 못했습니다.');
      return null;
    }

    currentToken = token;
    return token;
  } catch (error) {
    console.error('❌ FCM 토큰 발급 실패:', error);
    return null;
  }
};

/**
 * 서버에 FCM 토큰 등록
 */
export const sendFcmTokenToServer = async (token: string): Promise<boolean> => {
  if (!token || token === lastSyncedToken) {
    return true;
  }

  try {
    await api.post('/api/fcm', { fcmToken: token });
    lastSyncedToken = token;
    return true;
  } catch (error) {
    console.error('❌ FCM 토큰 서버 전송 실패:', error);
    return false;
  }
};

/**
 * FCM 초기화 (최초 1회 실행)
 */
export const initializeFcm = async (): Promise<(() => void) | undefined> => {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    const hasPermission = await requestUserPermission();
    if (!hasPermission) {
      return undefined;
    }

    const initialToken = await getFcmToken();
    if (!initialToken) {
      return undefined;
    }

    await sendFcmTokenToServer(initialToken);

    const messaging = await ensureMessagingModule();
    const unsubscribe = onTokenRefresh(messaging, async (newToken) => {
      currentToken = newToken;
      await sendFcmTokenToServer(newToken);
    });

    return unsubscribe;
  })().catch((error) => {
    initializationPromise = null;
    console.error('❌ FCM 초기화 실패:', error);
    return undefined;
  });

  return initializationPromise;
};

/**
 * 포그라운드 메시지 리스너 등록
 */
export const setupForegroundMessageHandler = async (): Promise<() => void> => {
  const messaging = await ensureMessagingModule();
  const unsubscribe = onMessage(messaging, async (remoteMessage) => {
    console.log('📩 포그라운드 메시지 수신:', remoteMessage);
  });

  return unsubscribe;
};

/**
 * 백그라운드 메시지 핸들러 등록
 */
export const registerBackgroundMessageHandler = async (): Promise<void> => {
  const messaging = await ensureMessagingModule();
  setBackgroundMessageHandler(messaging, async (remoteMessage) => {
    console.log('📩 백그라운드 메시지 수신:', remoteMessage);
  });
};
