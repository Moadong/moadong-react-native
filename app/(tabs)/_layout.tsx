import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

import MenuIcon from '@/assets/icons/ic-menu.svg';
import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F0F0F0',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/icons/ic-home-selected.png')
                  : require('@/assets/icons/ic-home-unselected.png')
              }
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: '구독',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/icons/ic-subscribe-selected.png')
                  : require('@/assets/icons/ic-subscribe-unselected.png')
              }
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: '더보기',
          tabBarIcon: ({ focused }) => (
            <MenuIcon
              width={24}
              height={24}
              color={focused ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].icon}
            />
          ),
        }}
      />
    </Tabs>
  );
}
