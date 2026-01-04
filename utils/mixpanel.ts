import { Mixpanel } from 'mixpanel-react-native';

let mixpanelInstance: Mixpanel | null = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

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
