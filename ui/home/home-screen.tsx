import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';

import { CategoryType } from '@/components/icon';
import { Spacing } from '@/constants/theme';
import { Club } from '@/types/club.types';
import {
  Banner,
  CategoryFilter,
  ClubList,
  MainHeader,
  Tab,
  TabType,
} from '@/ui/home/components';
import { useClubs } from '@/ui/home/hook';

/**
 * 홈 화면 컴포넌트
 */
export function HomeScreen() {
  // 상태 관리
  const [activeTab, setActiveTab] = useState<TabType>('central');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('전체');
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();

  // 동아리 데이터 훅
  const {
    clubs,
    loading,
    error,
    fetchClubs,
    refetch,
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
  const handleClubPress = useCallback((club: Club) => {
    if (!club?.id) {
      return;
    }

    router.push(`/club/${club.id}`);
  }, [router]);

  const headerComponent = (
    <View>
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
      <View style={styles.tabSection}>
        <Tab
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </View>
    </View>
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
      <ClubList
        clubs={clubs}
        loading={loading}
        onRefresh={refetch}
        onClubPress={handleClubPress}
        error={error}
        style={styles.clubListSection}
        headerComponent={headerComponent}
      />
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
  tabSection: {
    marginBottom: Spacing.sm,
  },
  clubListSection: {
    flex: 1,
  },
});

export default HomeScreen;
