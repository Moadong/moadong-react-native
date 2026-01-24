/**
 * 메인 화면 헤더 컴포넌트
 */

import MoadongLogo from '@/assets/icons/ic-moadong.svg';
import SearchIcon from '@/assets/icons/ic-search.svg';
import { Colors } from '@/constants/theme';
import React, { useRef } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

/**
 * 메인 헤더 Props
 */
interface MainHeaderProps {
  onSearchPress?: () => void;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  onSearchFocus?: () => void;
  onSearchSubmit?: (text: string) => void;
}

/**
 * 메인 화면 헤더 컴포넌트
 * 
 * @example
 * ```typescript
 * <MainHeader 
 *   onSearchPress={() => navigation.navigate('Search')}
 * />
 * ```
 */
export function MainHeader({ 
  onSearchPress, 
  searchValue = '',
  onSearchChange,
  onSearchFocus,
  onSearchSubmit,
}: MainHeaderProps) {
  const inputRef = useRef<TextInput | null>(null);

  return (
    <Container>
      {/* 로고 */}
      <LogoContainer>
        <MoadongLogo 
          width={32}
          height={26}
          color="#FF5414"
        />
      </LogoContainer>

      {/* 검색 바 */}
      <SearchTouchable 
        onPress={() => {
          onSearchPress?.();
          inputRef.current?.focus();
        }}
        activeOpacity={0.7}
      >
        <SearchInput
          ref={inputRef}
          placeholder="어떤 동아리를 찾으세요?"
          placeholderTextColor={Colors.light.icon}
          value={searchValue}
          onChangeText={onSearchChange}
          onFocus={onSearchFocus}
          onSubmitEditing={({ nativeEvent }: { nativeEvent: { text: string } }) => onSearchSubmit?.(nativeEvent.text)}
          returnKeyType="search"
          blurOnSubmit
          autoCorrect={false}
          autoCapitalize="none"
        />
        <SearchIcon
          width={20}
          height={20}
          color={Colors.light.icon}
        />
      </SearchTouchable>
    </Container>
  );
}

// Styled Components
const Container = styled.View`
  flex-direction: row;
  align-items: center;
  padding-horizontal: 20px;
  padding-vertical: 8px;
  background-color: ${Colors.light.background};
  border-bottom-width: 1px;
  border-bottom-color: #F0F0F0;
`;

const LogoContainer = styled.View`
  margin-right: 16px;
  justify-content: center;
  align-items: center;
`;

const SearchTouchable = styled(TouchableOpacity)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  background-color: #F8F8F8;
  border-radius: 12px;
  padding-horizontal: 16px;
  padding-vertical: 8px;
`;

const SearchInput = styled(TextInput)`
  flex: 1;
  font-size: 14px;
  color: ${Colors.light.text};
  padding-vertical: 0px;
`;
