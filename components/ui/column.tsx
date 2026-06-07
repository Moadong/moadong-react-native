import React from 'react';
import { type ViewProps } from 'react-native';
import styled from 'styled-components/native';

export interface ColumnProps extends ViewProps {
  gap?: number;
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

type StyledColumnProps = {
  gap: number;
  align: NonNullable<ColumnProps['align']>;
  justify: NonNullable<ColumnProps['justify']>;
  wrap: NonNullable<ColumnProps['wrap']>;
};

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

const StyledColumn = styled.View<StyledColumnProps>`
  flex-direction: column;
  align-items: ${(props: StyledColumnProps) => props.align};
  justify-content: ${(props: StyledColumnProps) => props.justify};
  flex-wrap: ${(props: StyledColumnProps) => props.wrap};
  gap: ${(props: StyledColumnProps) => props.gap}px;
`;
