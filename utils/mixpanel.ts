import Constants from 'expo-constants';
import { Mixpanel } from 'mixpanel-react-native';

let mixpanelInstance: Mixpanel | null = null;
let isInitialized = false;

export const getMixpanel = async (): Promise<Mixpanel | null> => {
  if (mixpanelInstance && isInitialized) {
    return mixpanelInstance;
  }

  const mixpanelToken = Constants.expoConfig?.extra?.MIXPANEL_TOKEN || '';
  
  if (!mixpanelToken) {
    console.warn('[Mixpanel] Token이 설정되지 않았습니다.');
    return null;
  }

  if (!mixpanelInstance) {
    mixpanelInstance = new Mixpanel(mixpanelToken, false);
  }

  if (!isInitialized) {
    try {
      await mixpanelInstance.init();
      isInitialized = true;
    } catch (error) {
      console.error('[Mixpanel] 초기화 실패:', error);
      return null;
    }
  }

  return mixpanelInstance;
};
