/**
 * 탭 컴포넌트
 */

import { Text } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

/**
 * 탭 타입
 */
export type TabType = 'central' | 'department';

/**
 * 탭 Props
 */
interface TabProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  style?: any;
}

/**
 * 탭 컴포넌트
 * 
 * @example
 * ```typescript
 * <Tab 
 *   activeTab="central"
 *   onTabChange={(tab) => setActiveTab(tab)}
 * />
 * ```
 */
export function Tab({ activeTab, onTabChange, style }: TabProps) {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'central' && styles.activeTab
        ]}
        onPress={() => onTabChange('central')}
        activeOpacity={0.7}
      >
        <Text 
          type="body1SemiBold" 
          style={[
            styles.tabText,
            activeTab === 'central' && styles.activeTabText
          ]}
        >
          중앙동아리
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'department' && styles.activeTab
        ]}
        onPress={() => onTabChange('department')}
        activeOpacity={0.7}
      >
        <Text 
          type="body1SemiBold" 
          style={[
            styles.tabText,
            activeTab === 'department' && styles.activeTabText
          ]}
        >
          과동아리
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.light.tint,
  },
  tabText: {
    color: Colors.light.icon,
    fontSize: 14,
  },
  activeTabText: {
    color: Colors.light.tint,
  },
});

