/**
 * 메인 화면 컴포넌트
 */

import { Banner } from '@/components/banner';
import { CategoryFilter } from '@/components/category-filter';
import { ClubList } from '@/components/club-list';
import { CategoryType } from '@/components/icon';
import { MainHeader } from '@/components/main-header';
import { Tab, TabType } from '@/components/tab';
import { Spacing } from '@/constants/theme';
import { useClubs } from '@/hooks/use-clubs';
import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * 메인 화면 컴포넌트
 */
export default function MainScreen() {
  // 상태 관리
  const [activeTab, setActiveTab] = useState<TabType>('central');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('전체');
  const [searchValue, setSearchValue] = useState('');

  // 동아리 데이터 훅
  const {
    clubs,
    loading,
    error,
    fetchClubs,
    refetch,
    loadMore,
    hasMore,
  } = useClubs({
    initialCategory: selectedCategory,
    initialType: activeTab,
    autoFetch: true,
  });

  /**
   * 탭 변경 핸들러
   */
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    fetchClubs({
      category: selectedCategory === '전체' ? undefined : selectedCategory,
      type: tab,
      page: 0,
    });
  }, [selectedCategory, fetchClubs]);

  /**
   * 카테고리 변경 핸들러
   */
  const handleCategoryChange = useCallback((category: CategoryType) => {
    setSelectedCategory(category);
    fetchClubs({
      category: category === '전체' ? undefined : category,
      type: activeTab,
      page: 0,
    });
  }, [activeTab, fetchClubs]);

  /**
   * 검색 핸들러
   */
  const handleSearchPress = useCallback(() => {
    // TODO: 검색 화면으로 이동
    console.log('검색 화면으로 이동');
  }, []);

  /**
   * 메뉴 핸들러
   */
  const handleMenuPress = useCallback(() => {
    // TODO: 메뉴 열기
    console.log('메뉴 열기');
  }, []);

  /**
   * 동아리 카드 클릭 핸들러
   */
  const handleClubPress = useCallback((club: any) => {
    // TODO: 동아리 상세 화면으로 이동
    console.log('동아리 상세:', club);
  }, []);

  /**
   * 리스트 헤더 컴포넌트
   */
  const renderListHeader = () => (
    <>
      {/* 배너 섹션 */}
      <View style={styles.bannerSection}>
        <Banner />
      </View>

      {/* 카테고리 필터 섹션 */}
      <View style={styles.categorySection}>
        <CategoryFilter
          selected={selectedCategory}
          onSelect={handleCategoryChange}
        />
      </View>

      {/* 탭 섹션 */}
      <Tab
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <MainHeader
        onSearchPress={handleSearchPress}
        onMenuPress={handleMenuPress}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      {/* 동아리 목록 섹션 */}
      <View style={styles.clubListSection}>
        <ClubList
          clubs={clubs}
          loading={loading}
          onRefresh={refetch}
          onLoadMore={loadMore}
          onClubPress={handleClubPress}
          hasMore={hasMore}
          error={error}
          ListHeaderComponent={renderListHeader}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bannerSection: {
    marginBottom: Spacing.md,
  },
  categorySection: {
    marginBottom: Spacing.sm,
  },
  clubListSection: {
    flex: 1,
  },
});
