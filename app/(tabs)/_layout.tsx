import MenuIcon from "@/assets/icons/ic-menu.svg";
import HomeIcon from "@/assets/icons/ic_home.svg";
import { HapticTab } from "@/components/haptic-tab";
import { USER_EVENT } from "@/constants/eventname";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useMixpanelTrack } from "@/hooks/use-mixpanel-track";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const trackEvent = useMixpanelTrack();
  const insets = useSafeAreaInsets();
  const TAB_BAR_BASE_HEIGHT = 56;
  const TAB_BAR_BASE_PADDING_VERTICAL = 6;

  useEffect(() => {
    console.log('[StartupTiming] tabsMounted', Date.now());
  }, []);

  const handleTabPress = (tabName: string) => {
    trackEvent(USER_EVENT.BOTTOM_TAB_CLICKED, {
      tab: tabName,
      url: `app://moadong/(tabs)/${tabName}`,
    });
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].icon,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#F0F0F0",
          // 시스템 네비게이션 바 영역(특히 Android) SafeArea 반영
          height: TAB_BAR_BASE_HEIGHT + insets.bottom,
          paddingBottom: TAB_BAR_BASE_PADDING_VERTICAL + insets.bottom,
          paddingTop: TAB_BAR_BASE_PADDING_VERTICAL,
        },
        tabBarLabelStyle: {
          marginTop: 4,
          fontSize: 10,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ focused }) => (
            <HomeIcon
              width={28}
              height={28}
              color={
                focused
                  ? Colors[colorScheme ?? "light"].tint
                  : Colors[colorScheme ?? "light"].icon
              }
            />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress("home"),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "구독",
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require("@/assets/icons/ic-subscribe-selected.png")
                  : require("@/assets/icons/ic-subscribe-unselected.png")
              }
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress("explore"),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "메뉴",
          tabBarIcon: ({ focused }) => (
            <MenuIcon
              width={28}
              height={28}
              color={
                focused
                  ? Colors[colorScheme ?? "light"].tint
                  : Colors[colorScheme ?? "light"].icon
              }
            />
          ),
        }}
        listeners={{
          tabPress: () => handleTabPress("more"),
        }}
      />
    </Tabs>
  );
}
