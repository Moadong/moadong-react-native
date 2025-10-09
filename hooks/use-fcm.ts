import { useEffect } from 'react';
import { Platform } from 'react-native';

import { initializeFcm, registerBackgroundMessageHandler, setupForegroundMessageHandler } from '@/services/fcm.service';

/**
 * 앱 시작 시 FCM 초기화를 1회 실행하는 커스텀 훅
 */
export const useFcm = () => {
  useEffect(() => {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return;
    }

    let tokenUnsubscribe: (() => void) | undefined;
    let messageUnsubscribe: (() => void) | undefined;

    // FCM 초기화
    initializeFcm()
      .then((cleanup) => {
        tokenUnsubscribe = cleanup;
      })
      .catch((error) => {
        console.error('❌ FCM 초기화 중 오류 발생:', error);
      });

    // 포그라운드 메시지 핸들러 설정
    setupForegroundMessageHandler()
      .then((cleanup) => {
        messageUnsubscribe = cleanup;
      })
      .catch((error) => {
        console.error('❌ 포그라운드 메시지 핸들러 설정 실패:', error);
      });

    // 백그라운드 메시지 핸들러 등록
    registerBackgroundMessageHandler()
      .catch((error) => {
        console.error('❌ 백그라운드 메시지 핸들러 등록 실패:', error);
      });

    return () => {
      if (tokenUnsubscribe) {
        tokenUnsubscribe();
      }
      if (messageUnsubscribe) {
        messageUnsubscribe();
      }
    };
  }, []);
};
