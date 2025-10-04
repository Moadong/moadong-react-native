/**
 * 메인 화면 헤더 컴포넌트
 */

import MoadongLogo from '@/assets/icons/ic-moadong';
import SearchIcon from '@/assets/icons/ic-검색';
import MenuIcon from '@/assets/icons/ic-메뉴';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

/**
 * 메인 헤더 Props
 */
interface MainHeaderProps {
  onSearchPress?: () => void;
  onMenuPress?: () => void;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
}

/**
 * 메인 화면 헤더 컴포넌트
 * 
 * @example
 * ```typescript
 * <MainHeader 
 *   onSearchPress={() => navigation.navigate('Search')}
 *   onMenuPress={() => navigation.openDrawer()}
 * />
 * ```
 */
export function MainHeader({ 
  onSearchPress, 
  onMenuPress, 
  searchValue = '',
  onSearchChange 
}: MainHeaderProps) {
  return (
    <View style={styles.container}>
      {/* 로고 */}
      <View style={styles.logoContainer}>
        <MoadongLogo 
          width={80} 
          height={32}
          color="#FF5414"
        />
      </View>

      {/* 검색 바 */}
      <TouchableOpacity 
        style={styles.searchContainer}
        onPress={onSearchPress}
        activeOpacity={0.7}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="어떤 동아리를 찾으세요?"
          placeholderTextColor={Colors.light.icon}
          value={searchValue}
          onChangeText={onSearchChange}
          editable={false}
        />
        <SearchIcon 
          width={20} 
          height={20}
          color={Colors.light.icon}
        />
      </TouchableOpacity>

      {/* 메뉴 버튼 */}
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={onMenuPress}
        activeOpacity={0.7}
      >
        <MenuIcon 
          width={24} 
          height={24}
          color={Colors.light.text}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoContainer: {
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    paddingVertical: 0,
  },
  iconText: {
    fontSize: 20,
    color: Colors.light.icon,
  },
  menuButton: {
    padding: Spacing.sm,
  },
});

