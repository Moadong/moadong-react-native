import { BorderRadius, Spacing } from '@/constants/theme';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { AppImage } from './app-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - (Spacing.md * 2);
const BANNER_HEIGHT = BANNER_WIDTH * 0.4; // 2.5:1 비율

/**
 * 배너 아이템
 */
interface BannerItem {
  id: string;
  image: 'banner-1' | 'banner-2';
  title?: string;
  onPress?: () => void;
}

/**
 * 배너 Props
 */
interface BannerProps {
  items?: BannerItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicator?: boolean;
}

/**
 * 배너 컴포넌트
 * 
 * @example
 * ```tsx
 * const banners = [
 *   { id: '1', image: 'banner-1', onPress: () => console.log('Banner 1') },
 *   { id: '2', image: 'banner-2', onPress: () => console.log('Banner 2') },
 * ];
 * 
 * <Banner items={banners} autoPlay={true} />
 * ```
 */
export function Banner({ 
  items = [
    { id: '1', image: 'banner-1' as const },
    { id: '2', image: 'banner-2' as const },
  ],
  autoPlay = true,
  autoPlayInterval = 3000,
  showIndicator = true,
}: BannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (autoPlay && items.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, autoPlayInterval);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [autoPlay, autoPlayInterval, items.length]);

  const handlePress = (item: BannerItem) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    item.onPress?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.bannerContainer}>
        {items.map((item, index) => (
          <Pressable
            key={item.id}
            onPress={() => handlePress(item)}
            style={[
              styles.banner,
              {
                opacity: index === currentIndex ? 1 : 0,
                zIndex: index === currentIndex ? 1 : 0,
              }
            ]}
          >
            <AppImage
              name={item.image}
              width={BANNER_WIDTH}
              height={BANNER_HEIGHT}
              contentFit="cover"
            />
          </Pressable>
        ))}
      </View>

      {showIndicator && items.length > 1 && (
        <View style={styles.indicatorContainer}>
          {items.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => setCurrentIndex(index)}
              style={[
                styles.indicator,
                index === currentIndex && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

/**
 * 심플한 단일 배너
 */
export function SimpleBanner({ 
  image = 'banner-1' as const,
  onPress,
}: {
  image?: 'banner-1' | 'banner-2';
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <AppImage
        name={image}
        width={BANNER_WIDTH}
        height={BANNER_HEIGHT}
        contentFit="cover"
        style={styles.simpleBanner}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
  },
  bannerContainer: {
    position: 'relative',
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
  },
  simpleBanner: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  indicatorActive: {
    width: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
});

