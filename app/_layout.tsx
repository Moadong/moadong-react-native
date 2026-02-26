import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BootstrapErrorDialog } from '@/components/bootstrap-error-dialog';
import { CustomSplashScreen } from '@/components/custom-splash-screen';
import { ForceUpdateDialog } from '@/components/force-update-dialog';
import { MixpanelProvider } from '@/contexts/mixpanel-context';
import { SubscribedClubsProvider } from '@/contexts/subscribed-clubs-context';
import { useFcm } from '@/hooks/use-fcm';
import { runAppBootstrap } from '@/services/app-bootstrap.service';
import { checkForceUpdateRequired } from '@/services/force-update.service';

// 네이티브 스플래시 화면을 자동으로 숨기지 않도록 설정
// 이것은 앱이 로드되자마자 실행되어야 합니다
SplashScreen.preventAutoHideAsync().catch(() => {
  /* 이미 숨겨진 경우 에러 무시 */
});

export const unstable_settings = {
  anchor: '(tabs)',
};

type BootstrapStatus = 'idle' | 'running' | 'success' | 'failed';

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [forceUpdateRequired, setForceUpdateRequired] = useState(false);
  const [forceUpdateChecked, setForceUpdateChecked] = useState(false);
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>('idle');
  const [bootstrapErrorMessage, setBootstrapErrorMessage] = useState<string | undefined>(undefined);
  const [subscribedClubsRefreshKey, setSubscribedClubsRefreshKey] = useState(0);

  const bootstrapSucceeded = bootstrapStatus === 'success';
  const shouldBlockSplash = forceUpdateRequired || !bootstrapSucceeded;

  // 강제 업데이트가 필요한 경우(또는 체크 전)에는 FCM 권한 프롬프트/핸들러 설정이 뜨지 않도록 비활성화
  useFcm(forceUpdateChecked && !forceUpdateRequired && bootstrapSucceeded);

  const runBootstrapSequence = useCallback(async () => {
    setBootstrapStatus('running');
    setBootstrapErrorMessage(undefined);

    const { subscribedClubCount } = await runAppBootstrap();
    setSubscribedClubsRefreshKey((prev) => prev + 1);
    setBootstrapStatus('success');
    console.log('✅ 부트스트랩 완료 - 구독 동아리 수:', subscribedClubCount);
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('📱 앱 초기화 시작...');

        // 1) 강제 업데이트 체크 (Remote Config)
        const required = await checkForceUpdateRequired();
        setForceUpdateRequired(required);
        setForceUpdateChecked(true);

        if (required) {
          console.log('⛔️ 강제 업데이트 필요: 부트스트랩 중단');
          return;
        }

        // 2) 강제 업데이트가 아닐 때만 ATT 요청
        await requestTrackingPermissionOnLaunch();

        // 3) Access Token -> FCM -> 구독 목록 -> Mixpanel 순서 부트스트랩
        await runBootstrapSequence();

        // 최소 로딩 시간 보장 (너무 빨리 사라지지 않도록)
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ 앱 초기화 완료');
      } catch (e) {
        console.warn('❌ 앱 초기화 중 오류:', e);
        setBootstrapStatus('failed');
        setBootstrapErrorMessage(getUserFriendlyBootstrapMessage(e));
      } finally {
        // 앱 준비 완료
        setAppIsReady(true);
      }
    }

    prepare();
  }, [runBootstrapSequence]);

  // 앱이 준비되면 네이티브 스플래시를 숨기고 커스텀 스플래시 시작
  useEffect(() => {
    if (appIsReady) {
      console.log('🎨 앱 준비 완료, 네이티브 스플래시 숨기고 커스텀 스플래시 표시');
      // 약간의 지연을 두어 커스텀 스플래시가 먼저 렌더링되도록 함
      setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {
          console.warn('⚠️ 네이티브 스플래시가 이미 숨겨짐');
        });
      }, 100);
    }
  }, [appIsReady]);

  const onFinishSplash = useCallback(() => {
    // 커스텀 스플래시 애니메이션이 완료되면
    console.log('🎭 커스텀 스플래시 종료, 메인 화면으로 전환');
    if (shouldBlockSplash) {
      console.log('⛔️ 스플래시 유지:', { forceUpdateRequired, bootstrapStatus });
      return;
    }
    setShowSplash(false);
  }, [forceUpdateRequired, bootstrapStatus, shouldBlockSplash]);

  const handleRetryBootstrap = useCallback(async () => {
    if (bootstrapStatus === 'running') {
      return;
    }

    try {
      await runBootstrapSequence();
    } catch (error) {
      console.warn('❌ 부트스트랩 재시도 실패:', error);
      setBootstrapStatus('failed');
      setBootstrapErrorMessage(getUserFriendlyBootstrapMessage(error));
    }
  }, [bootstrapStatus, runBootstrapSequence]);

  if (__DEV__) {
    console.log('🔄 RootLayout 렌더링', {
      showSplash,
      appIsReady,
      bootstrapStatus,
      forceUpdateRequired,
    });
  }

  return (
    <SafeAreaProvider>
      <MixpanelProvider>
        <SubscribedClubsProvider refreshKey={subscribedClubsRefreshKey}>
          <ThemeProvider value={DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
              visible={showSplash && appIsReady && !forceUpdateRequired && bootstrapStatus === 'failed'}
              message={bootstrapErrorMessage}
              isRetrying={bootstrapStatus === 'running'}
              onRetry={handleRetryBootstrap}
            />

            {/* 커스텀 스플래시 스크린 */}
            {showSplash && (
              <CustomSplashScreen 
                isReady={appIsReady} 
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

async function requestTrackingPermissionOnLaunch() {
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
