import { BorderRadius, Spacing } from '@/constants/theme';
import { BannerProps, HomeBannerItem } from '@/ui/home/model/banner';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { AppImage } from '@/components/app-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH;
const BANNER_HEIGHT = BANNER_WIDTH * 0.5;

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
    { id: '1', image: require('@/assets/images/banner-1.png') },
    { id: '2', image: require('@/assets/images/banner-2.png') },
  ],
  autoPlay = true,
  autoPlayInterval = 3000,
  showIndicator = true,
}: BannerProps) {
  const hasMultipleItems = items.length > 1;
  const extendedItems = useMemo<HomeBannerItem[]>(() => {
    if (!hasMultipleItems) {
      return items;
    }
    const first = items[0];
    const last = items[items.length - 1];
    return [last, ...items, first];
  }, [hasMultipleItems, items]);

  const [currentIndex, setCurrentIndex] = useState(hasMultipleItems ? 1 : 0);
  const listRef = useRef<FlatList<HomeBannerItem>>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (!hasMultipleItems) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex(1);
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({ offset: BANNER_WIDTH, animated: false });
    });
  }, [hasMultipleItems, items.length]);

  const clearAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };

  const startAutoPlay = () => {
    if (!autoPlay || !hasMultipleItems) {
      return;
    }

    clearAutoPlay();
    autoPlayTimerRef.current = setInterval(() => {
      const nextIndex = currentIndexRef.current + 1;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);
      listRef.current?.scrollToOffset({
        offset: nextIndex * BANNER_WIDTH,
        animated: true,
      });
    }, autoPlayInterval);
  };

  useEffect(() => {
    startAutoPlay();
    return clearAutoPlay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, autoPlayInterval, hasMultipleItems]);

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (!hasMultipleItems) {
      return;
    }

    const xOffset = event.nativeEvent.contentOffset.x;
    const rawIndex = Math.round(xOffset / BANNER_WIDTH);
    let nextIndex = rawIndex;

    if (rawIndex === 0) {
      nextIndex = extendedItems.length - 2;
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({
          offset: nextIndex * BANNER_WIDTH,
          animated: false,
        });
      });
    } else if (rawIndex === extendedItems.length - 1) {
      nextIndex = 1;
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({
          offset: nextIndex * BANNER_WIDTH,
          animated: false,
        });
      });
    }

    setCurrentIndex(nextIndex);
  };

  const handleScrollBeginDrag = () => {
    clearAutoPlay();
  };

  const handleScrollEndDrag = () => {
    startAutoPlay();
  };

  const normalizedIndex = hasMultipleItems
    ? (currentIndex - 1 + items.length) % items.length
    : currentIndex;

  const scrollToNormalizedIndex = (targetIndex: number) => {
    if (!hasMultipleItems) {
      setCurrentIndex(targetIndex);
      return;
    }

    if (targetIndex === normalizedIndex) {
      return;
    }

    const diff = targetIndex - normalizedIndex;
    const nextIndex = currentIndex + diff;

    listRef.current?.scrollToOffset({
      offset: nextIndex * BANNER_WIDTH,
      animated: true,
    });
    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
    startAutoPlay();
  };

  const handlePress = (item: HomeBannerItem) => {
    clearAutoPlay();
    item.onPress?.();
    startAutoPlay();
  };

  return (
    <View style={styles.container}>
      <View style={styles.bannerContainer}>
        <FlatList
          ref={listRef}
          data={extendedItems}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          initialScrollIndex={hasMultipleItems ? 1 : 0}
          initialNumToRender={extendedItems.length}
          maxToRenderPerBatch={extendedItems.length}
          windowSize={extendedItems.length + 2}
          removeClippedSubviews={false}
          scrollEventThrottle={16}
          style={styles.list}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          getItemLayout={(_, index) => ({
            length: BANNER_WIDTH,
            offset: BANNER_WIDTH * index,
            index,
          })}
          snapToInterval={BANNER_WIDTH}
          decelerationRate="fast"
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          renderItem={({ item }) => (
            <Pressable onPress={() => handlePress(item)} style={styles.banner}>
              <AppImage
                source={item.image}
                width={BANNER_WIDTH}
                height={BANNER_HEIGHT}
                contentFit="cover"
              />
            </Pressable>
          )}
        />
      </View>
    </View>
  );
}

/**
 * 심플한 단일 배너
 */
export function SimpleBanner({ 
  image = require('@/assets/images/banner-1.png'),
  onPress,
}: {
  image?: any; // require()로 받은 이미지 소스
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <AppImage
        source={image}
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
  },
  bannerContainer: {
  },
  list: {
    flexGrow: 0,
  },
  banner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
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
