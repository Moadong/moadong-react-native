import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CustomSplashScreen } from '@/components/custom-splash-screen';
import { SubscribedClubsProvider } from '@/contexts/subscribed-clubs-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFcm } from '@/hooks/use-fcm';

// 네이티브 스플래시 화면을 자동으로 숨기지 않도록 설정
// 이것은 앱이 로드되자마자 실행되어야 합니다
SplashScreen.preventAutoHideAsync().catch(() => {
  /* 이미 숨겨진 경우 에러 무시 */
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  useFcm();

  useEffect(() => {
    async function prepare() {
      try {
        console.log('📱 앱 초기화 시작...');
        // 여기에 앱 초기화 로직을 추가할 수 있습니다
        // 예: 폰트 로드, 데이터 프리페치 등
        
        // 최소 로딩 시간 보장 (너무 빨리 사라지지 않도록)
        await new Promise(resolve => setTimeout(resolve, 1000));
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

  const onFinishSplash = useCallback(async () => {
    // 커스텀 스플래시 애니메이션이 완료되면
    console.log('🎭 커스텀 스플래시 종료, 메인 화면으로 전환');
    setShowSplash(false);
    // 네이티브 스플래시 스크린 숨기기
    await SplashScreen.hideAsync();
    console.log('✨ 네이티브 스플래시도 숨김 완료');
  }, []);

  console.log('🔄 RootLayout 렌더링, showSplash:', showSplash, ', appIsReady:', appIsReady);

  return (
    <SafeAreaProvider>
      <SubscribedClubsProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="club/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="webview/[slug]" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
          
          {/* 커스텀 스플래시 스크린 */}
          {showSplash && (
            <CustomSplashScreen 
              isReady={appIsReady} 
              onFinish={onFinishSplash}
            />
          )}
        </ThemeProvider>
      </SubscribedClubsProvider>
    </SafeAreaProvider>
  );
}
