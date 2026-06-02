/**
 * 커스텀 Splash Screen 컴포넌트
 * 앱 로딩 시 표시되는 애니메이션 스플래시 화면
 */

import MoadongIcon from '@/assets/icons/ic-moadong.svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { MoaImage } from './moa-image';
import { MoaText } from './moa-text';

interface CustomSplashScreenProps {
  onFinish: () => void;
  isReady: boolean;
  blockFinish?: boolean;
}

export function CustomSplashScreen({ onFinish, isReady, blockFinish = false }: CustomSplashScreenProps) {
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const fadeOutOpacity = useSharedValue(1);
  const hasAnimatedOnce = useRef(false);
  const hasStartedFadeOut = useRef(false);

  const triggerFadeOut = useCallback((delayMs: number) => {
    fadeOutOpacity.value = withDelay(
      delayMs,
      withTiming(
        0,
        { duration: 300, easing: Easing.in(Easing.ease) },
        (finished) => {
          if (finished) {
            runOnJS(onFinish)();
          }
        }
      )
    );
  }, [fadeOutOpacity, onFinish]);

  const startAnimation = useCallback(() => {
    logoOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
    
    logoScale.value = withSpring(1, {
      damping: 12,
      stiffness: 120,
      mass: 0.7,
    });

    textOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );

    textTranslateY.value = withDelay(
      300,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) })
    );
  }, [logoOpacity, logoScale, textOpacity, textTranslateY]);

  useEffect(() => {
    if (!hasAnimatedOnce.current) {
      hasAnimatedOnce.current = true;
      startAnimation();
    }
  }, [startAnimation]);

  useEffect(() => {
    if (blockFinish) {
      hasStartedFadeOut.current = false;
      return;
    }

    if (!isReady || hasStartedFadeOut.current) {
      return;
    }

    hasStartedFadeOut.current = true;
    triggerFadeOut(0);
  }, [isReady, blockFinish, triggerFadeOut]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeOutOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      <LinearGradient
        colors={['#FFAE4A', '#FF7340', '#FF6228', '#FF4500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        {/* 배경 이미지 */}
        <MoaImage 
          source={require('@/assets/images/ic-splash-background.png')}
          style={styles.backgroundImage}
          contentFit="cover"
        />
        
        <View style={styles.content}>
          {/* 로고 아이콘 */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <MoadongIcon 
              width={102}
              height={81}
              color="#FFFFFF"
            />
          </Animated.View>

          {/* 앱 이름 */}
          <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
            <MoaText type="body1Regular" style={styles.appTagline}>
              모든 동아리를 한 곳에 모으다
            </MoaText>
          </Animated.View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'center',
  },
  appName: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  appTagline: {
    color: '#FFFFFF',
    opacity: 0.9,
    fontSize: 24,
    lineHeight: 33.6, // 140% of 24px
    letterSpacing: -0.72, // -3% of 24px
    fontWeight: '500',
  },
});
