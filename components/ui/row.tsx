import React from 'react';
import { type ViewProps } from 'react-native';
import styled from 'styled-components/native';

export interface RowProps extends ViewProps {
  gap?: number;
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
}

type StyledRowProps = {
  gap: number;
  align: NonNullable<RowProps['align']>;
  justify: NonNullable<RowProps['justify']>;
  wrap: NonNullable<RowProps['wrap']>;
};

/**
 * 가로 방향 레이아웃 컴포넌트
 * 
 * @example
 * ```tsx
 * <Row gap={16} align="center" justify="space-between">
 *   <Text>왼쪽</Text>
 *   <Text>오른쪽</Text>
 * </Row>
 * ```
 */
export function Row({ 
  gap = 0, 
  align = 'flex-start', 
  justify = 'flex-start', 
  wrap = 'nowrap',
  style,
  ...props 
}: RowProps) {
  return (
    <StyledRow 
      gap={gap}
      align={align}
      justify={justify}
      wrap={wrap}
      style={style}
      {...props}
    />
  );
}

const StyledRow = styled.View<StyledRowProps>`
  flex-direction: row;
  align-items: ${(props: StyledRowProps) => props.align};
  justify-content: ${(props: StyledRowProps) => props.justify};
  flex-wrap: ${(props: StyledRowProps) => props.wrap};
  gap: ${(props: StyledRowProps) => props.gap}px;
`;
