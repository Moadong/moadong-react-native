import { MoaImage } from "@/components/moa-image";
import { USER_EVENT } from "@/constants/eventname";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useMixpanelTrack } from "@/hooks";
import { publicApi } from "@/services/api";
import { BannerProps, HomeBannerItem } from "@/ui/home/model/banner";
import { useRouter } from "expo-router";
import {
  openBrowserAsync,
  WebBrowserPresentationStyle,
} from "expo-web-browser";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BANNER_WIDTH = SCREEN_WIDTH;
const BANNER_HEIGHT = BANNER_WIDTH * 0.5;
const DEFAULT_ITEMS: HomeBannerItem[] = [
  { id: "1", image: require("@/assets/images/banner-1.png") },
  { id: "2", image: require("@/assets/images/banner-2.png") },
];
const BANNER_REQUEST_PAYLOAD = {
  type: "APP_HOME",
} as const;

interface BannerResponse {
  data?: {
    images?: any[];
  };
}

const CLUB_FESTIVAL_LINK = "CLUB_FESTIVAL";

function resolveLinkTo(linkTo?: string | null): string | null {
  if (!linkTo) {
    return null;
  }

  return linkTo;
}

function normalizeBannerItems(images: any[] | undefined): HomeBannerItem[] {
  if (!Array.isArray(images) || images.length === 0) {
    return [];
  }

  return images
    .map((banner, index): HomeBannerItem | null => {
      if (typeof banner === "string") {
        const image = banner.trim();
        if (!image) {
          return null;
        }

        return {
          id: String(index),
          image,
          imageUrl: image,
          linkTo: null,
          alt: undefined,
        };
      }

      const imageUrl =
        banner?.imageUrl ?? banner?.imageurl ?? banner?.image_url ?? "";
      const image = typeof imageUrl === "string" ? imageUrl.trim() : "";

      if (!image) {
        return null;
      }

      const id = banner?.id ?? banner?.bannerId ?? String(index);
      const linkTo =
        banner?.linkTo ?? banner?.linkto ?? banner?.link_to ?? null;

      return {
        id: String(id),
        image,
        imageUrl: image,
        linkTo: typeof linkTo === "string" ? linkTo : null,
        alt: typeof banner?.alt === "string" ? banner.alt : undefined,
      };
    })
    .filter((item): item is HomeBannerItem => item !== null);
}

function getFallbackBannerSource(index: number) {
  return DEFAULT_ITEMS[index % DEFAULT_ITEMS.length].image;
}

export function Banner({
  items: propsItems,
  autoPlay = true,
  autoPlayInterval = 3000,
  showIndicator = true,
}: BannerProps) {
  const trackEvent = useMixpanelTrack();
  const router = useRouter();
  const [apiItems, setApiItems] = useState<HomeBannerItem[] | null>(null);
  const [isBannerLoading, setIsBannerLoading] = useState(!propsItems?.length);
  const [failedBannerIds, setFailedBannerIds] = useState<Set<string>>(new Set());
  const items = propsItems ?? apiItems ?? DEFAULT_ITEMS;
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
    if (propsItems?.length) {
      setIsBannerLoading(false);
      return;
    }

    let isMounted = true;

    const fetchBanners = async () => {
      try {
        const response = await publicApi.get<BannerResponse>("/api/banner", {
          params: BANNER_REQUEST_PAYLOAD,
        });
        const nextItems = normalizeBannerItems(response?.data?.images);

        if (!isMounted) {
          return;
        }
        if (nextItems.length > 0) {
          setApiItems(nextItems);
        }
      } catch (error) {
        const status = (error as { status?: number })?.status;

        if (status === 405) {
          try {
            const fallbackResponse = await publicApi.post<BannerResponse>(
              "/api/banner",
              BANNER_REQUEST_PAYLOAD,
            );
            const fallbackItems = normalizeBannerItems(
              fallbackResponse?.data?.images,
            );

            if (!isMounted) {
              return;
            }
            if (fallbackItems.length > 0) {
              setApiItems(fallbackItems);
            }
            return;
          } catch {
            // no-op: common warning below
          }
        }

        if (__DEV__) {
          console.warn(
            "[Banner] 배너 API 로드 실패, 기본 배너를 사용합니다.",
            error,
          );
        }
      } finally {
        if (isMounted) {
          setIsBannerLoading(false);
        }
      }
    };

    fetchBanners();

    return () => {
      isMounted = false;
    };
  }, [propsItems]);

  useEffect(() => {
    if (!hasMultipleItems) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex(1);
    requestAnimationFrame(() => {
      listRef.current?.scrollToOffset({
        offset: BANNER_WIDTH,
        animated: false,
      });
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

  const handlePress = async (item: HomeBannerItem) => {
    clearAutoPlay();

    trackEvent(USER_EVENT.BANNER_CLICKED, {
      bannerId: item.id,
      linkTo: item.linkTo ?? null,
    });

    const targetLink = resolveLinkTo(item.linkTo);
    if (targetLink) {
      if (targetLink === CLUB_FESTIVAL_LINK) {
        router.push({
          pathname: "/webview/[slug]",
          params: { slug: "festival-introduction" },
        });
        item.onPress?.();
        startAutoPlay();
        return;
      }

      try {
        await openBrowserAsync(targetLink, {
          presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
        });
      } catch (error) {
        if (__DEV__) {
          console.warn("[Banner] 링크 열기 실패:", targetLink, error);
        }
      }
    }

    item.onPress?.();
    startAutoPlay();
  };

  if (isBannerLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.bannerSkeleton} />
      </View>
    );
  }

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
          renderItem={({ item, index }) => {
            const normalizedIndex = hasMultipleItems
              ? (index - 1 + items.length) % items.length
              : index % Math.max(items.length, 1);

            const hasImageError = failedBannerIds.has(item.id);
            const source = hasImageError
              ? getFallbackBannerSource(normalizedIndex)
              : item.image;

            return (
            <Pressable onPress={() => handlePress(item)} style={styles.banner}>
              <MoaImage
                source={source}
                width={BANNER_WIDTH}
                height={BANNER_HEIGHT}
                contentFit="cover"
                onError={() => {
                  setFailedBannerIds((prev) => {
                    if (prev.has(item.id)) {
                      return prev;
                    }
                    const next = new Set(prev);
                    next.add(item.id);
                    return next;
                  });
                }}
              />
            </Pressable>
          )}}
        />
      </View>
    </View>
  );
}

/**
 * 심플한 단일 배너
 */
export function SimpleBanner({
  image = DEFAULT_ITEMS[0].image,
  onPress,
}: {
  image?: any; // require()로 받은 이미지 소스
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <MoaImage
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
  container: {},
  bannerSkeleton: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: BorderRadius.md,
    backgroundColor: "#EFEFEF",
  },
  bannerContainer: {},
  list: {
    flexGrow: 0,
  },
  banner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  simpleBanner: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  indicatorActive: {
    width: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
});
