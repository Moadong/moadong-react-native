/**
 * 탭 컴포넌트
 */

import { MoaText } from '@/components/moa-text';
import { Colors } from '@/constants/theme';
import React from 'react';
import styled from 'styled-components/native';

/**
 * 탭 타입
 */
export type TabType = 'central';

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
      <TabContainer>
        <TabText isActive={activeTab === 'central'}>
          부경대학교 중앙동아리
        </TabText>
      </TabContainer>
    </Container>
  );
}

const Container = styled.View`
  background-color: ${Colors.light.background};
  padding-horizontal: 20px;
  padding-vertical: 12px;
`;

const TabContainer = styled.View`
  align-self: flex-start;
`;

const TabText = styled(MoaText)<{ isActive: boolean }>`
  color: #787878;
  font-size: 14px;
  font-weight: 700;
  padding-bottom: 1px;
  border-bottom-width: 1px;
  border-bottom-color: #787878;
`;

