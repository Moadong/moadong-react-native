import { useMixpanelContext } from '@/contexts/mixpanel-context';
import { getMixpanel } from '@/utils/mixpanel';
import Constants from 'expo-constants';
import { useCallback } from 'react';
import { Platform } from 'react-native';

export const useMixpanelTrack = () => {
  const { isLoading } = useMixpanelContext();

  const trackEvent = useCallback(
    async (eventName: string, properties: Record<string, any> = {}) => {
      if (isLoading) {
        return;
      }

      const mixpanel = await getMixpanel();
      if (!mixpanel) return;

      const appVersion = Constants.expoConfig?.version || '1.0.0';
      mixpanel.track(eventName, {
        ...properties,
        timestamp: Date.now(),
        url: properties.url !== undefined ? properties.url : 'app://moadong',
        referrer: properties.referrer || '',
        app_version: appVersion,
        platform: Platform.OS,
      });
    },
    [isLoading],
  );

  return trackEvent;
};
