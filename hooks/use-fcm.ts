import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

import { initializeFcm, registerBackgroundMessageHandler, setupForegroundMessageHandler } from '@/services/fcm.service';

/**
 * 알림 탭에서 FCM data를 꺼낸다.
 *
 * iOS의 expo-notifications는 원격 푸시일 때 userInfo["body"]만 data로 넘긴다
 * (EXNotificationSerializer.m serializedNotificationData). 그건 Expo 푸시 서비스
 * 포맷이고 FCM은 커스텀 키를 userInfo 최상위에 두므로 content.data가 null이 된다.
 * iOS는 trigger.payload에 userInfo 원본이 통째로 남아 있어 그쪽으로 폴백한다.
 *
 * Android는 FCM data를 content.data로 그대로 복사하므로(NotificationSerializer.java)
 * 첫 경로에서 끝난다. 폴백이 Android 동작을 바꾸지 않도록 순서를 지켜야 한다.
 */
const extractNotificationData = (
  request: Notifications.NotificationRequest,
): Record<string, any> | undefined =>
  (request.content.data as Record<string, any> | null | undefined) ??
  ((request.trigger as { payload?: Record<string, any> } | null)?.payload);

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
    initializeFcm({ promptForPermission: false })
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
        if (response?.notification?.request) {
          handleNotificationData(extractNotificationData(response.notification.request));
        }
      })
      .catch((error) => {
        console.error('❌ 알림 응답 처리 실패:', error);
      });

    notificationUnsubscribe = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationData(extractNotificationData(response.notification.request));
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
