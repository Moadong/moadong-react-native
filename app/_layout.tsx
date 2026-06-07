import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager, Platform } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BootstrapErrorDialog } from '@/components/bootstrap-error-dialog';
import { CustomSplashScreen } from '@/components/custom-splash-screen';
import { ForceUpdateDialog } from '@/components/force-update-dialog';
import {
  HomeWebViewPreloadProvider,
  useHomeWebViewPreloadContext,
} from '@/contexts/home-webview-preload-context';
import { MixpanelProvider } from '@/contexts/mixpanel-context';
import { SubscribedClubsProvider } from '@/contexts/subscribed-clubs-context';
import { useFcm } from '@/hooks/use-fcm';
import { BootstrapResult, runAppBootstrap } from '@/services/app-bootstrap.service';
import {
  getCachedForceUpdateRequired,
  refreshForceUpdateRequired,
} from '@/services/force-update.service';

// 네이티브 스플래시 화면을 자동으로 숨기지 않도록 설정
// 이것은 앱이 로드되자마자 실행되어야 합니다
SplashScreen.preventAutoHideAsync().catch(() => {
  /* 이미 숨겨진 경우 에러 무시 */
});

export const unstable_settings = {
  anchor: 'index',
};

type BootstrapStatus = 'idle' | 'running' | 'success' | 'failed';

const EMPTY_SUBSCRIBED_CLUB_IDS: string[] = [];

export default function RootLayout() {
  return (
    <HomeWebViewPreloadProvider>
      <RootLayoutContent />
    </HomeWebViewPreloadProvider>
  );
}

function RootLayoutContent() {
  const pathname = usePathname();
  const [showSplash, setShowSplash] = useState(true);
  const [forceUpdateRequired, setForceUpdateRequired] = useState(false);
  const [forceUpdateChecked, setForceUpdateChecked] = useState(false);
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>('idle');
  const [bootstrapErrorMessage, setBootstrapErrorMessage] = useState<string | undefined>(undefined);
  const [bootstrapResult, setBootstrapResult] = useState<BootstrapResult | null>(null);
  const bootstrapStatusRef = useRef<BootstrapStatus>('idle');
  const nativeSplashHiddenRef = useRef(false);
  const { isSettled: homeWebViewPreloadSettled, status: homeWebViewPreloadStatus } =
    useHomeWebViewPreloadContext();

  const bootstrapSucceeded = bootstrapStatus === 'success';
  const shouldWaitForHomeWebView = pathname === '/';
  const shouldBlockSplash =
    forceUpdateRequired ||
    !bootstrapSucceeded ||
    (shouldWaitForHomeWebView && !homeWebViewPreloadSettled);

  // 강제 업데이트가 필요한 경우(또는 체크 전)에는 FCM 권한 프롬프트/핸들러 설정이 뜨지 않도록 비활성화
  useFcm(forceUpdateChecked && !forceUpdateRequired && bootstrapSucceeded);

  useEffect(() => {
    bootstrapStatusRef.current = bootstrapStatus;
  }, [bootstrapStatus]);

  const runBootstrapSequence = useCallback(async () => {
    if (bootstrapStatusRef.current === 'running') {
      return;
    }

    bootstrapStatusRef.current = 'running';
    setBootstrapStatus('running');
    setBootstrapErrorMessage(undefined);

    const result = await runAppBootstrap();
    setBootstrapResult(result);
    bootstrapStatusRef.current = 'success';
    setBootstrapStatus('success');
    console.log('✅ 부트스트랩 완료', {
      subscribedClubCount: result.subscribedClubIds.length,
      timings: result.timings,
    });
  }, []);

  const handleBootstrapFailure = useCallback((error: unknown) => {
    console.warn('❌ 앱 초기화 중 오류:', error);
    bootstrapStatusRef.current = 'failed';
    setBootstrapStatus('failed');
    setBootstrapErrorMessage(getUserFriendlyBootstrapMessage(error));
  }, []);

  const refreshForceUpdateInBackground = useCallback(() => {
    refreshForceUpdateRequired()
      .then((required) => {
        setForceUpdateRequired(required);

        if (!required && bootstrapStatusRef.current === 'idle') {
          runBootstrapSequence().catch(handleBootstrapFailure);
        }
      })
      .catch((error) => {
        console.warn('⚠️ 강제 업데이트 백그라운드 갱신 실패:', error);
      });
  }, [handleBootstrapFailure, runBootstrapSequence]);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      try {
        console.log('📱 앱 초기화 시작...');

        // 1) 강제 업데이트 캐시 판정 (Remote Config fetch는 백그라운드에서 갱신)
        const required = await getCachedForceUpdateRequired();
        if (cancelled) {
          return;
        }

        setForceUpdateRequired(required);
        setForceUpdateChecked(true);
        refreshForceUpdateInBackground();

        if (required) {
          console.log('⛔️ 캐시 기준 강제 업데이트 필요: 부트스트랩 대기');
          return;
        }

        // 2) Access Token -> FCM/구독 목록/Mixpanel 병렬 부트스트랩
        await runBootstrapSequence();
        console.log('✅ 앱 초기화 완료');
      } catch (e) {
        if (!cancelled) {
          handleBootstrapFailure(e);
        }
      }
    }

    prepare();

    return () => {
      cancelled = true;
    };
  }, [handleBootstrapFailure, refreshForceUpdateInBackground, runBootstrapSequence]);

  // 커스텀 스플래시가 렌더된 다음 네이티브 스플래시를 바로 숨긴다.
  useEffect(() => {
    if (!showSplash || nativeSplashHiddenRef.current) {
      return;
    }

    const animationFrame = requestAnimationFrame(() => {
      nativeSplashHiddenRef.current = true;
      console.log('🎨 커스텀 스플래시 렌더 완료, 네이티브 스플래시 숨김', {
        nativeSplashHidden: Date.now(),
      });
      SplashScreen.hideAsync().catch(() => {
        console.warn('⚠️ 네이티브 스플래시가 이미 숨겨짐');
      });
    });

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [showSplash]);

  useEffect(() => {
    if (!bootstrapSucceeded || forceUpdateRequired || showSplash || Platform.OS !== 'ios') {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const interactionTask = InteractionManager.runAfterInteractions(() => {
      timeoutId = setTimeout(() => {
        requestTrackingPermissionAfterLaunch();
      }, 250);
    });

    return () => {
      interactionTask.cancel();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [bootstrapSucceeded, forceUpdateRequired, showSplash]);

  const onFinishSplash = useCallback(() => {
    // 커스텀 스플래시 애니메이션이 완료되면
    console.log('🎭 커스텀 스플래시 종료, 메인 화면으로 전환', {
      customSplashDismissed: Date.now(),
    });
    if (shouldBlockSplash) {
      console.log('⛔️ 스플래시 유지:', {
        forceUpdateRequired,
        bootstrapStatus,
        pathname,
        homeWebViewPreloadStatus,
      });
      return;
    }
    setShowSplash(false);
  }, [
    forceUpdateRequired,
    bootstrapStatus,
    pathname,
    homeWebViewPreloadStatus,
    shouldBlockSplash,
  ]);

  const handleRetryBootstrap = useCallback(async () => {
    if (bootstrapStatus === 'running') {
      return;
    }

    try {
      await runBootstrapSequence();
    } catch (error) {
      console.warn('❌ 부트스트랩 재시도 실패:', error);
      handleBootstrapFailure(error);
    }
  }, [bootstrapStatus, handleBootstrapFailure, runBootstrapSequence]);

  if (__DEV__) {
    console.log('🔄 RootLayout 렌더링', {
      showSplash,
      bootstrapStatus,
      forceUpdateRequired,
      pathname,
      homeWebViewPreloadStatus,
    });
  }

  const initialSubscribedClubIds =
    bootstrapResult?.subscribedClubIds ?? EMPTY_SUBSCRIBED_CLUB_IDS;

  return (
    <SafeAreaProvider>
      <MixpanelProvider
        initialSessionId={bootstrapResult?.sessionId}
        initialReady={bootstrapSucceeded}
      >
        <SubscribedClubsProvider initialClubIds={initialSubscribedClubIds}>
          <ThemeProvider value={DefaultTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="club/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="clubDetail/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="webview/[slug]" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="dark" />
            
            {/* 강제 업데이트 다이얼로그 (닫기 불가) */}
            <ForceUpdateDialog visible={forceUpdateRequired} />

            {/* 부트스트랩 오류 다이얼로그 (재시도 가능) */}
            <BootstrapErrorDialog
              visible={showSplash && !forceUpdateRequired && bootstrapStatus === 'failed'}
              message={bootstrapErrorMessage}
              isRetrying={bootstrapStatus === 'running'}
              onRetry={handleRetryBootstrap}
            />

            {/* 커스텀 스플래시 스크린 */}
            {showSplash && (
              <CustomSplashScreen 
                isReady={bootstrapSucceeded} 
                onFinish={onFinishSplash}
                blockFinish={shouldBlockSplash}
              />
            )}
          </ThemeProvider>
        </SubscribedClubsProvider>
      </MixpanelProvider>
    </SafeAreaProvider>
  );
}

async function requestTrackingPermissionAfterLaunch() {
  if (Platform.OS !== 'ios') {
    return;
  }

  try {
    const { status } = await getTrackingPermissionsAsync();
    if (status === 'undetermined') {
      await requestTrackingPermissionsAsync();
    }
  } catch (error) {
    console.warn('⚠️ ATT 권한 요청 실패:', error);
  }
}

function getUserFriendlyBootstrapMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message.toLowerCase() : '';

  if (rawMessage.includes('권한') || rawMessage.includes('permission')) {
    return '알림 권한이 꺼져 있어요. 권한을 허용한 뒤 다시 시도해 주세요.';
  }

  if (
    rawMessage.includes('network') ||
    rawMessage.includes('timeout') ||
    rawMessage.includes('네트워크')
  ) {
    return '인터넷 연결이 불안정해요. 연결 상태를 확인한 뒤 다시 시도해 주세요.';
  }

  return '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
}
