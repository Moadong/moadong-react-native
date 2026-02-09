import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

import { initializeFcm, registerBackgroundMessageHandler, setupForegroundMessageHandler } from '@/services/fcm.service';

/**
 * 앱 시작 시 FCM 초기화를 1회 실행하는 커스텀 훅
 */
export const useFcm = (enabled: boolean = true) => {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return;
    }

    let tokenUnsubscribe: (() => void) | undefined;
    let messageUnsubscribe: (() => void) | undefined;
    let notificationUnsubscribe: Notifications.Subscription | undefined;

    const handleNotificationData = (data?: Record<string, any>) => {
      if (!data) return;

      const action = data.action as string | undefined;
      const clubId = data.clubId as string | undefined;
      const path = data.path as string | undefined;

      // 서버에서 전달된 포맷: path=/webview/clubDetail/{clubId}, action=NAVIGATE_WEBVIEW, clubId={clubId}
      if (action === 'NAVIGATE_WEBVIEW') {
        const targetPath = path || (clubId ? `/webview/clubDetail/${clubId}` : undefined);
        if (targetPath) {
          if (targetPath.startsWith('/webview/clubDetail/')) {
            const derivedId = targetPath.replace('/webview/clubDetail/', '');
            if (derivedId) {
              router.push({
                pathname: '/clubDetail/[id]',
                params: { id: derivedId },
              });
            }
            return;
          }

          router.push({
            pathname: '/webview/[slug]',
            params: { slug: 'external', path: targetPath },
          });
        }
      }
    };

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

    // 알림 클릭(앱 열림) 처리
    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response?.notification?.request?.content?.data) {
          handleNotificationData(response.notification.request.content.data as Record<string, any>);
        }
      })
      .catch((error) => {
        console.error('❌ 알림 응답 처리 실패:', error);
      });

    notificationUnsubscribe = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationData(response.notification.request.content.data as Record<string, any>);
    });

    return () => {
      if (tokenUnsubscribe) {
        tokenUnsubscribe();
      }
      if (messageUnsubscribe) {
        messageUnsubscribe();
      }
      if (notificationUnsubscribe) {
        notificationUnsubscribe.remove();
      }
    };
  }, [enabled, router]);
};
