import AsyncStorage from '@react-native-async-storage/async-storage';
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
