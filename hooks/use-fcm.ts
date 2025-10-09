import { useEffect } from 'react';
import { Platform } from 'react-native';

import { initializeFcm } from '@/services/fcm.service';

/**
 * 앱 시작 시 FCM 초기화를 1회 실행하는 커스텀 훅
 */
export const useFcm = () => {
  useEffect(() => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return;
    }

    let unsubscribe: (() => void) | undefined;

    initializeFcm()
      .then((cleanup) => {
        unsubscribe = cleanup;
      })
      .catch((error) => {
        console.error('❌ FCM 초기화 중 오류 발생:', error);
      });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
};
