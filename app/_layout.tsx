import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CustomSplashScreen } from '@/components/custom-splash-screen';
import { MixpanelProvider } from '@/contexts/mixpanel-context';
import { SubscribedClubsProvider } from '@/contexts/subscribed-clubs-context';
import { useFcm } from '@/hooks/use-fcm';
import { Mixpanel } from 'mixpanel-react-native';

// 네이티브 스플래시 화면을 자동으로 숨기지 않도록 설정
// 이것은 앱이 로드되자마자 실행되어야 합니다
SplashScreen.preventAutoHideAsync().catch(() => {
  /* 이미 숨겨진 경우 에러 무시 */
});

// Mixpanel 인스턴스 생성
const trackAutomaticEvents = false;
const mixpanelToken = Constants.expoConfig?.extra?.MIXPANEL_TOKEN || '';
const mixpanel = new Mixpanel(mixpanelToken, trackAutomaticEvents);

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  useFcm();

  useEffect(() => {
    async function prepare() {
      try {
        console.log('📱 앱 초기화 시작...');
        
        await mixpanel.init();
        console.log('✅ Mixpanel 초기화 완료');
        
        // 여기에 앱 초기화 로직을 추가할 수 있습니다
        // 예: 폰트 로드, 데이터 프리페치 등

        await requestTrackingPermissionOnLaunch();
        
        // 최소 로딩 시간 보장 (너무 빨리 사라지지 않도록)
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ 앱 초기화 완료');
      } catch (e) {
        console.warn('❌ 앱 초기화 중 오류:', e);
      } finally {
        // 앱 준비 완료
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

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
    setShowSplash(false);
  }, []);

  console.log('🔄 RootLayout 렌더링, showSplash:', showSplash, ', appIsReady:', appIsReady);

  return (
    <SafeAreaProvider>
      <MixpanelProvider>
        <SubscribedClubsProvider>
          <ThemeProvider value={DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="club/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="webview/[slug]" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="dark" />
            
            {/* 커스텀 스플래시 스크린 */}
            {showSplash && (
              <CustomSplashScreen 
                isReady={appIsReady} 
                onFinish={onFinishSplash}
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
