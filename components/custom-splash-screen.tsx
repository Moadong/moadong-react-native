/**
 * 커스텀 Splash Screen 컴포넌트
 * 앱 로딩 시 표시되는 애니메이션 스플래시 화면
 */

import MoadongIcon from '@/assets/icons/ic-moadong.svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
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

type IntroAnimationStep = 'logoOpacity' | 'logoScale' | 'textOpacity' | 'textTranslateY';

const INTRO_ANIMATION_STEP_COUNT = 4;
const SPLASH_FADE_OUT_DURATION_MS = 300;

export function CustomSplashScreen({ onFinish, isReady, blockFinish = false }: CustomSplashScreenProps) {
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const fadeOutOpacity = useSharedValue(1);
  const [introCompleted, setIntroCompleted] = useState(false);
  const hasAnimatedOnce = useRef(false);
  const hasStartedFadeOut = useRef(false);
  const completedIntroAnimationSteps = useRef(new Set<IntroAnimationStep>());

  const markIntroAnimationStepComplete = useCallback((step: IntroAnimationStep) => {
    if (completedIntroAnimationSteps.current.has(step)) {
      return;
    }

    completedIntroAnimationSteps.current.add(step);

    if (completedIntroAnimationSteps.current.size === INTRO_ANIMATION_STEP_COUNT) {
      setIntroCompleted(true);
    }
  }, []);

  const triggerFadeOut = useCallback(() => {
    fadeOutOpacity.value = withTiming(
      0,
      { duration: SPLASH_FADE_OUT_DURATION_MS, easing: Easing.in(Easing.ease) },
      (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      }
    );
  }, [fadeOutOpacity, onFinish]);

  const startAnimation = useCallback(() => {
    logoOpacity.value = withTiming(
      1,
      {
        duration: 500,
        easing: Easing.out(Easing.ease),
      },
      (finished) => {
        if (finished) {
          runOnJS(markIntroAnimationStepComplete)('logoOpacity');
        }
      }
    );
    
    logoScale.value = withSpring(
      1,
      {
        damping: 12,
        stiffness: 120,
        mass: 0.7,
      },
      (finished) => {
        if (finished) {
          runOnJS(markIntroAnimationStepComplete)('logoScale');
        }
      }
    );

    textOpacity.value = withDelay(
      300,
      withTiming(
        1,
        { duration: 400, easing: Easing.out(Easing.ease) },
        (finished) => {
          if (finished) {
            runOnJS(markIntroAnimationStepComplete)('textOpacity');
          }
        }
      )
    );

    textTranslateY.value = withDelay(
      300,
      withTiming(
        0,
        { duration: 400, easing: Easing.out(Easing.ease) },
        (finished) => {
          if (finished) {
            runOnJS(markIntroAnimationStepComplete)('textTranslateY');
          }
        }
      )
    );
  }, [
    logoOpacity,
    logoScale,
    markIntroAnimationStepComplete,
    textOpacity,
    textTranslateY,
  ]);

  useEffect(() => {
    if (!hasAnimatedOnce.current) {
      hasAnimatedOnce.current = true;
      startAnimation();
    }
  }, [startAnimation]);

  useEffect(() => {
    if (blockFinish) {
      hasStartedFadeOut.current = false;
      cancelAnimation(fadeOutOpacity);
      fadeOutOpacity.value = 1;
      return;
    }

    if (!isReady || !introCompleted || hasStartedFadeOut.current) {
      return;
    }

    hasStartedFadeOut.current = true;
    triggerFadeOut();
  }, [isReady, introCompleted, blockFinish, fadeOutOpacity, triggerFadeOut]);

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
