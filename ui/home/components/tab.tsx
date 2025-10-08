/**
 * 탭 컴포넌트
 */

import { MoaText } from '@/components/moa-text';
import { Colors } from '@/constants/theme';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

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
    <Container style={style}>
      <TabTouchable
        isActive={activeTab === 'central'}
        onPress={() => onTabChange('central')}
        activeOpacity={0.7}
      >
        <TabText isActive={activeTab === 'central'}>
          중앙동아리
        </TabText>
      </TabTouchable>

      <TabTouchable
        isActive={activeTab === 'department'}
        onPress={() => onTabChange('department')}
        activeOpacity={0.7}
      >
        <TabText isActive={activeTab === 'department'}>
          과동아리
        </TabText>
      </TabTouchable>
    </Container>
  );
}

// Styled Components
const Container = styled.View`
  flex-direction: row;
  background-color: ${Colors.light.background};
  padding-horizontal: 16px;
  padding-vertical: 8px;
  border-bottom-width: 1px;
  border-bottom-color: #F0F0F0;
`;

const TabTouchable = styled(TouchableOpacity)<{ isActive: boolean }>`
  flex: 1;
  padding-vertical: 8px;
  align-items: center;
  border-bottom-width: 2px;
  border-bottom-color: ${(props: { isActive: boolean }) => props.isActive ? Colors.light.tint : 'transparent'};
`;

const TabText = styled(MoaText)<{ isActive: boolean }>`
  color: ${(props: { isActive: boolean }) => props.isActive ? Colors.light.tint : Colors.light.icon};
  font-size: 14px;
`;

