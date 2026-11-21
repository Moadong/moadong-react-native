import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { Mixpanel } from 'mixpanel-react-native';

const SESSION_ID_KEY = '@moadong_session_id';

let mixpanelInstance: Mixpanel | null = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `moadong_${timestamp}_${randomStr}`;
};

export const getOrCreateMixpanelSessionId = async (): Promise<string> => {
  try {
    const storedSessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
    if (storedSessionId) {
      return storedSessionId;
    }

    const newSessionId = generateSessionId();
    await AsyncStorage.setItem(SESSION_ID_KEY, newSessionId);
    console.log('[Mixpanel] 새 Session ID 생성:', newSessionId);
    return newSessionId;
  } catch (error) {
    console.error('[Mixpanel] Session ID 로드/저장 실패:', error);
    return generateSessionId();
  }
};

/**
 * 기기 언어 설정을 super property로 등록한다. 웹(Moadong/moadong#1920)과 같은 키를 쓴다.
 *
 * Locale.current(앱 번들 언어와 협상된 값)가 아니라 기기 선호 언어 목록의 첫 값을 쓴다.
 * iOS 앱은 현지화를 en(developmentRegion) 하나만 선언하므로 협상된 값은 기기 언어와
 * 무관하게 en이 될 수 있다.
 * 값이 없으면 빈 문자열 세그먼트가 생기지 않도록 등록하지 않는다.
 * 부가 속성 하나 때문에 Mixpanel 초기화 전체가 실패하지 않도록 오류는 여기서 삼킨다.
 */
const registerDeviceLocale = (mixpanel: Mixpanel): void => {
  try {
    const deviceLocale = getLocales()[0]?.languageTag;
    if (!deviceLocale) return;
    mixpanel.registerSuperProperties({ device_locale: deviceLocale });
  } catch (error) {
    console.error('[Mixpanel] device_locale 등록 실패:', error);
  }
};

export const getMixpanel = async (): Promise<Mixpanel | null> => {
  if (mixpanelInstance && isInitialized) {
    return mixpanelInstance;
  }

  const mixpanelToken = process.env.EXPO_PUBLIC_MIXPANEL_TOKEN || '';
  
  if (!mixpanelToken) {
    console.warn('[Mixpanel] Token이 설정되지 않았습니다.');
    return null;
  }

  if (!mixpanelInstance) {
    mixpanelInstance = new Mixpanel(mixpanelToken, false);
  }

  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        if (mixpanelInstance) {
          await mixpanelInstance.init();
          registerDeviceLocale(mixpanelInstance);
          isInitialized = true;
        }
      } catch (error) {
        console.error('[Mixpanel] 초기화 실패:', error);
        // 실패 시 재시도를 위해 초기화 상태 초기화
        initializationPromise = null;
        throw error;
      }
    })();
  }

  try {
    await initializationPromise;
    return mixpanelInstance;
  } catch {
    return null;
  }
};

export const identifyMixpanel = async (distinctId: string): Promise<boolean> => {
  if (!distinctId) {
    return false;
  }

  const mixpanel = await getMixpanel();
  if (!mixpanel) {
    return false;
  }

  try {
    await mixpanel.identify(distinctId);
    return true;
  } catch (error) {
    console.error('[Mixpanel] identify 실패:', error);
    return false;
  }
};
