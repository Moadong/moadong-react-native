import React from 'react';
import { type ViewProps } from 'react-native';
import styled from 'styled-components/native';

export interface ColumnProps extends ViewProps {
  gap?: number;
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

/**
 * 세로 방향 레이아웃 컴포넌트
 * 
 * @example
 * ```tsx
 * <Column gap={16} align="center" justify="space-between">
 *   <Text>위쪽</Text>
 *   <Text>아래쪽</Text>
 * </Column>
 * ```
 */
export function Column({ 
  gap = 0, 
  align = 'flex-start', 
  justify = 'flex-start', 
  wrap = 'nowrap',
  style,
  ...props 
}: ColumnProps) {
  return (
    <StyledColumn 
      gap={gap}
      align={align}
      justify={justify}
      wrap={wrap}
      style={style}
      {...props}
    />
  );
}

const StyledColumn = styled.View<{
  gap: number;
  align: string;
  justify: string;
  wrap: string;
}>`
  flex-direction: column;
  align-items: ${props => props.align};
  justify-content: ${props => props.justify};
  flex-wrap: ${props => props.wrap};
  gap: ${props => props.gap}px;
`;
