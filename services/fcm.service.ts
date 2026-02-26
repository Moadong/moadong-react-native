/**
 * Firebase Cloud Messaging (FCM) 서비스
 * - Firebase 앱 초기화 보장
 * - FCM 토큰 발급 및 서버 전달
 * - 토큰 갱신 / 메시지 리스너 관리
 */

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
 * 알림 권한 상태 확인 (요청하지 않고 현재 상태만 확인)
 */
export const checkNotificationPermission = async (): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> => {
  try {
    const messaging = await ensureMessagingModule();

    if (Platform.OS === 'ios') {
      const status = await messaging.hasPermission();
      const granted =
        status === AuthorizationStatus.AUTHORIZED ||
        status === AuthorizationStatus.PROVISIONAL;
      
      // iOS에서는 DENIED 상태일 때 다시 물어볼 수 없음
      const canAskAgain = status === AuthorizationStatus.NOT_DETERMINED;
      
      return { granted, canAskAgain };
    } else if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      
      // Android에서는 권한이 없을 때 다시 요청 가능 여부를 확인하기 어려우므로
      // 일단 권한이 없으면 다시 물어볼 수 있다고 가정
      return { granted, canAskAgain: !granted };
    }
    return { granted: false, canAskAgain: false };
  } catch (error) {
    console.error('❌ 알림 권한 상태 확인 실패:', error);
    return { granted: false, canAskAgain: false };
  }
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
 * FCM 토큰 발급 및 메모리 캐싱(앱 실행 중)
 */
export const getFcmToken = async (): Promise<string | null> => {
  try {
    // 로컬 저장 없이 런타임 메모리에서만 캐싱
    if (currentToken) {
      return currentToken;
    }

    console.log('📱 새 FCM 토큰 발급 중...');
    const messaging = await ensureMessagingModule();
    await messaging.registerDeviceForRemoteMessages();
    const token = await getToken(messaging);

    if (!token) {
      console.warn('❌ FCM 토큰을 발급받지 못했습니다.');
      return null;
    }

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
    await api.put('/api/student/fcm-token', { fcmToken: token });
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
export const initializeFcm = async (options?: { strict?: boolean }): Promise<(() => void) | undefined> => {
  const strict = options?.strict ?? false;

  if (initializationPromise && !strict) {
    return initializationPromise;
  }

  const promise = (async () => {
    const hasPermission = await requestUserPermission();
    if (!hasPermission) {
      if (strict) {
        throw new Error('알림 권한이 거부되어 FCM 초기화를 완료할 수 없습니다.');
      }
      return undefined;
    }

    if (Platform.OS === 'ios') {
      await getApnsToken();
    }

    const initialToken = await getFcmToken();
    if (!initialToken) {
      if (strict) {
        throw new Error('FCM 토큰 발급 실패');
      }
      return undefined;
    }

    const synced = await sendFcmTokenToServer(initialToken);
    if (!synced && strict) {
      throw new Error('FCM 토큰 서버 전송 실패');
    }

    const messaging = await ensureMessagingModule();
    const unsubscribe = onTokenRefresh(messaging, async (newToken) => {
      currentToken = newToken;
      await sendFcmTokenToServer(newToken);
      
      if (Platform.OS === 'ios') {
        await getApnsToken();
      }
    });

    return unsubscribe;
  })();

  if (strict) {
    try {
      const result = await promise;
      initializationPromise = Promise.resolve(result);
      return result;
    } catch (error) {
      initializationPromise = null;
      throw error;
    }
  }

  initializationPromise = promise.catch((error) => {
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
