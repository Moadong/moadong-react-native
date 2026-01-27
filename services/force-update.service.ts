/**
 * 강제 업데이트(Force Update) 체크 서비스
 * - Firebase Remote Config의 `min_supported_version`(String)을 가져와
 *   현재 앱 버전 < 최소 지원 버전이면 앱 진입을 차단
 */
import { Platform } from 'react-native';

import { getApps, initializeApp } from '@react-native-firebase/app';
import remoteConfig from '@react-native-firebase/remote-config';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

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

function getNativeAppVersion(): string | undefined {
  const version =
    Application.nativeApplicationVersion ??
    Constants.nativeAppVersion ??
    Constants.expoConfig?.version ??
    Constants.manifest?.version ??
    Constants.manifest2?.version;

  return typeof version === 'string' && version.trim() ? version.trim() : undefined;
}

function isVersionLessThan(current: string, min: string): boolean {
  const currentParts = current.split('.').map((p) => parseInt(p, 10));
  const minParts = min.split('.').map((p) => parseInt(p, 10));

  const len = Math.max(currentParts.length, minParts.length);
  for (let i = 0; i < len; i++) {
    const a = Number.isFinite(currentParts[i]) ? currentParts[i] : 0;
    const b = Number.isFinite(minParts[i]) ? minParts[i] : 0;
    if (a < b) return true;
    if (a > b) return false;
  }
  return false;
}

export async function checkForceUpdateRequired(): Promise<boolean> {
  // 네이티브 앱(iOS/Android)만 대상. 웹/기타 플랫폼은 false 처리.
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return false;
  }

  try {
    console.log('🧪 Remote Config(force update) 시작');
    await ensureFirebaseApp();

    await remoteConfig().setDefaults({
      // 권장: 최소 지원 버전(예: "1.2.0")
      min_supported_version: '',
    });

    await remoteConfig().setConfigSettings({
      fetchTimeMillis: 5000,
      minimumFetchIntervalMillis: __DEV__ ? 0 : 60 * 60 * 1000, // 1h
    });

    // fetch 실패해도 기존 활성값/기본값으로 판단 가능하도록 catch
    const fetchedRemotely = await remoteConfig().fetchAndActivate().catch((error) => {
      console.warn('⚠️ Remote Config fetchAndActivate 실패 (force update):', error);
      return false;
    });

    const rcMinVersion = remoteConfig().getValue('min_supported_version');
    const minSupportedVersion = rcMinVersion.asString();

    const currentVersion = getNativeAppVersion();
    const versionBlocked =
      !!currentVersion &&
      !!minSupportedVersion &&
      isVersionLessThan(currentVersion, minSupportedVersion);

    const required = versionBlocked;

    // 디버깅 로그: Remote Config에서 무엇을 받았는지 확인
    console.log('🧩 Remote Config (force update)', {
      fetchedRemotely,
      keys: {
        min_supported_version: {
          valueRaw: minSupportedVersion,
          source: rcMinVersion.getSource?.() ?? 'unknown',
        },
      },
      app: {
        currentVersion,
        versionBlocked,
      },
      required,
      lastFetchStatus: remoteConfig().lastFetchStatus,
      fetchTimeMillis: remoteConfig().fetchTimeMillis,
    });

    return required;
  } catch (error) {
    console.warn('⚠️ 강제 업데이트 체크 실패 (force update):', error);
    return false;
  }
}

