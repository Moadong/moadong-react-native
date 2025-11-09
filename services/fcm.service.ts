/**
 * Firebase Cloud Messaging (FCM) 서비스
 * - Firebase 앱 초기화 보장
 * - FCM 토큰 발급 및 서버 전달
 * - 토큰 갱신 / 메시지 리스너 관리
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  FirebaseMessagingTypes,
  getMessaging,
  getToken,
  getAPNSToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { PermissionsAndroid, Platform } from 'react-native';

import { firebaseConfig } from '@/constants/firebase-config';
import { api } from './api';

// Firebase App 타입
type FirebaseApp = any;

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const FCM_TOKEN_KEY = '@fcm_token';

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
    } else if (Platform.OS === 'android') {
      const enabled = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      return enabled === PermissionsAndroid.RESULTS.GRANTED;
    }
    return false;
  } catch (error) {
    console.error('❌ FCM 권한 요청 실패:', error);
    return false;
  }
};

/**
 * 로컬 저장소에서 FCM 토큰 가져오기
 */
const getStoredFcmToken = async (): Promise<string | null> => {
  try {
    const storedToken = await AsyncStorage.getItem(FCM_TOKEN_KEY);
    return storedToken;
  } catch (error) {
    console.error('❌ 저장된 FCM 토큰 로드 실패:', error);
    return null;
  }
};

/**
 * 로컬 저장소에 FCM 토큰 저장
 */
const storeFcmToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
    console.log('✅ FCM 토큰 저장 완료');
  } catch (error) {
    console.error('❌ FCM 토큰 저장 실패:', error);
  }
};

/**
 * APNS 토큰 조회 (iOS 전용)
 */
export const getApnsToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS !== 'ios') {
      console.log('ℹ️ APNS 토큰은 iOS에서만 사용 가능합니다.');
      return null;
    }

    const messaging = await ensureMessagingModule();
    const apnsToken = await getAPNSToken(messaging);

    if (apnsToken) {
      console.log('🍎 APNS Device Token:', apnsToken);
      console.log('🍎 APNS Token (처음 20자):', apnsToken.substring(0, 20) + '...');
      return apnsToken;
    } else {
      console.warn('⚠️ APNS 토큰을 가져올 수 없습니다.');
      return null;
    }
  } catch (error) {
    console.error('❌ APNS 토큰 조회 실패:', error);
    return null;
  }
};

/**
 * FCM 토큰 발급 및 캐싱
 */
export const getFcmToken = async (): Promise<string | null> => {
  try {
    // 1. 로컬 저장소에서 먼저 확인
    const storedToken = await getStoredFcmToken();
    if (storedToken) {
      console.log('✅ 저장된 FCM 토큰 사용:', storedToken.substring(0, 20) + '...');
      currentToken = storedToken;
      return storedToken;
    }

    // 2. 저장된 토큰이 없으면 새로 발급
    console.log('📱 새 FCM 토큰 발급 중...');
    const messaging = await ensureMessagingModule();
    await messaging.registerDeviceForRemoteMessages();
    const token = await getToken(messaging);

    if (!token) {
      console.warn('❌ FCM 토큰을 발급받지 못했습니다.');
      return null;
    }

    // 3. 새 토큰 저장
    await storeFcmToken(token);
    currentToken = token;
    console.log('✅ 새 FCM 토큰 발급 완료');
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

    // iOS의 경우 APNS 토큰 조회 및 로그 출력
    if (Platform.OS === 'ios') {
      await getApnsToken();
    }

    const initialToken = await getFcmToken();
    if (!initialToken) {
      return undefined;
    }

    await sendFcmTokenToServer(initialToken);

    const messaging = await ensureMessagingModule();
    const unsubscribe = onTokenRefresh(messaging, async (newToken) => {
      currentToken = newToken;
      await storeFcmToken(newToken); // 새 토큰 저장
      await sendFcmTokenToServer(newToken);
      
      // 토큰 갱신 시에도 APNS 토큰 조회 (iOS만)
      if (Platform.OS === 'ios') {
        await getApnsToken();
      }
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
 * 로컬 알림 표시
 */
const showLocalNotification = async (
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // 즉시 표시
    });
    console.log('✅ 로컬 알림 표시 완료');
  } catch (error) {
    console.error('❌ 로컬 알림 표시 실패:', error);
  }
};

/**
 * 포그라운드 메시지 리스너 등록
 */
export const setupForegroundMessageHandler = async (): Promise<() => void> => {
  const messaging = await ensureMessagingModule();
  const unsubscribe = onMessage(messaging, async (remoteMessage) => {
    console.log('📩 포그라운드 메시지 수신:', remoteMessage);

    // 알림 표시
    const title = remoteMessage.notification?.title || '새 알림';
    const body = remoteMessage.notification?.body || '';
    await showLocalNotification(title, body, remoteMessage.data);
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
    
    // 백그라운드에서도 알림 표시
    const title = remoteMessage.notification?.title || '새 알림';
    const body = remoteMessage.notification?.body || '';
    await showLocalNotification(title, body, remoteMessage.data);
  });
};
