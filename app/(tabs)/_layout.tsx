import MenuIcon from "@/assets/icons/ic-menu.svg";
import HomeIcon from "@/assets/icons/ic_home.svg";
import { HapticTab } from "@/components/haptic-tab";
import { USER_EVENT } from "@/constants/eventname";
import { Colors } from "@/constants/theme";
import { useMixpanelTrack } from "@/hooks";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const trackEvent = useMixpanelTrack();

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
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          marginTop: 4,
          fontSize: 10,
          fontWeight: "500",
        },
      }}
    >
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
          title: "알림",
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
    </Tabs>
  );
}
