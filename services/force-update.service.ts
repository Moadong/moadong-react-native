/**
 * 강제 업데이트(Force Update) 체크 서비스
 * - Firebase Remote Config의 `require_force_update` boolean 값을 가져와 앱 진입을 차단할지 결정
 */
import { Platform } from 'react-native';

import { getApps, initializeApp } from '@react-native-firebase/app';
import remoteConfig from '@react-native-firebase/remote-config';

import { firebaseConfig } from '@/constants/firebase-config';

type FirebaseApp = any;

let firebaseAppPromise: Promise<FirebaseApp> | null = null;

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
      console.error('❌ Firebase 앱 초기화 실패 (force update):', error);
      throw error;
    }
  })();

  return firebaseAppPromise;
};

export async function checkForceUpdateRequired(): Promise<boolean> {
  // 네이티브 앱(iOS/Android)만 대상. 웹/기타 플랫폼은 false 처리.
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return false;
  }

  try {
    await ensureFirebaseApp();

    await remoteConfig().setDefaults({
      require_force_update: false,
    });

    await remoteConfig().setConfigSettings({
      fetchTimeMillis: 5000,
      minimumFetchIntervalMillis: __DEV__ ? 0 : 60 * 60 * 1000, // 1h
    });

    // fetch 실패해도 기존 활성값/기본값으로 판단 가능하도록 catch
    await remoteConfig().fetchAndActivate().catch((error) => {
      console.warn('⚠️ Remote Config fetchAndActivate 실패 (force update):', error);
      return false;
    });

    return remoteConfig().getBoolean('require_force_update');
  } catch (error) {
    console.warn('⚠️ 강제 업데이트 체크 실패 (force update):', error);
    return false;
  }
}

