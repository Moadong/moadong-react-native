import { getMixpanel } from '@/utils/mixpanel';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useTrackScreenView = (
  screenName: string,
  properties?: Record<string, any>,
  skip: boolean = false,
) => {
  const isTracked = useRef(false);
  const startTime = useRef(Date.now());
  const propertiesRef = useRef(properties);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    propertiesRef.current = properties;
  }, [properties]);

  useEffect(() => {
    if (skip) return;

    isTracked.current = false;
    startTime.current = Date.now();

    const trackScreenVisit = async () => {
      const mixpanel = await getMixpanel();
      if (!mixpanel) return;
      
      mixpanel.track(`${screenName} Visited`, {
        timestamp: startTime.current,
        ...propertiesRef.current,
      });
    };

    trackScreenVisit();

    const trackScreenDuration = async () => {
      if (isTracked.current) return;
      isTracked.current = true;

      const mixpanel = await getMixpanel();
      if (!mixpanel) return;

      const duration = Date.now() - startTime.current;
      
      mixpanel.track(`${screenName} Duration`, {
        duration,
        duration_seconds: Math.round(duration / 1000),
        ...propertiesRef.current,
      });
    };

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        trackScreenDuration();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      trackScreenDuration();
      subscription.remove();
    };
  }, [screenName, skip]);
};
