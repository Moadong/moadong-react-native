import React, { RefObject, useCallback, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { useRouter } from 'expo-router';

import { CategoryType } from '@/components/icon';
import { Club } from '@/types/club.types';
import {
  Banner,
  CategoryFilter,
  ClubList,
  MainHeader,
  Tab,
  TabType,
} from '@/ui/home/components';
import { useClubs, useSubscribedClubs } from '@/ui/home/hook';

/**
 * 홈 화면 컴포넌트
 */
export function HomeScreen() {
  // SafeArea insets
  const insets = useSafeAreaInsets();

  // 상태 관리
  const [activeTab, setActiveTab] = useState<TabType>('central');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('전체');
  const [searchValue, setSearchValue] = useState('');
  const listRef = useRef<FlatList<Club> | null>(null);
  const router = useRouter();
  const hasScrolledOnFocus = useRef(false); // 검색 포커스 시 스크롤 애니메이션 실행 여부

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

  // 구독 동아리 훅
  const {
    isSubscribed,
    toggleSubscribe,
  } = useSubscribedClubs();

  /**
   * 탭 변경 핸들러
   */
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    const keyword = searchValue.trim();
    fetchClubs({
      category: selectedCategory === '전체' ? undefined : selectedCategory,
      type: tab,
      keyword: keyword ? keyword : undefined,
    });
  }, [selectedCategory, fetchClubs, searchValue]);

  /**
   * 카테고리 변경 핸들러
   */
  const handleCategoryChange = useCallback((category: CategoryType) => {
    setSelectedCategory(category);
    // 카테고리 변경 시 검색 키워드 초기화
    setSearchValue('');
    fetchClubs({
      category: category === '전체' ? undefined : category,
      type: activeTab,
      keyword: undefined, // 키워드 초기화
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
   * 동아리 카드 클릭 핸들러
   */
  const handleClubPress = useCallback((club: Club) => {
    if (!club?.id) {
      return;
    }

    router.push(`/club/${club.id}`);
  }, [router]);

  const handleSearchFocus = useCallback(() => {
    // 최초 1회만 스크롤 애니메이션 실행
    if (!hasScrolledOnFocus.current) {
      try {
        listRef.current?.scrollToIndex({ index: 0, animated: true });
      } catch (error) {
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
      hasScrolledOnFocus.current = true;
    }
    
    const keyword = searchValue.trim();
    fetchClubs({
      category: selectedCategory === '전체' ? undefined : selectedCategory,
      type: activeTab,
      keyword: keyword ? keyword : undefined,
    });
  }, [searchValue, fetchClubs, selectedCategory, activeTab]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchValue(text);
  }, []);

  const handleSearchSubmit = useCallback((text: string) => {
    const keyword = text.trim();
    // 검색 제출 시에는 항상 스크롤 (검색 결과를 보기 위해)
    try {
      listRef.current?.scrollToIndex({ index: 0, animated: true });
    } catch (error) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
    
    fetchClubs({
      category: selectedCategory === '전체' ? undefined : selectedCategory,
      type: activeTab,
      keyword: keyword ? keyword : undefined,
    });
  }, [fetchClubs, selectedCategory, activeTab]);

  const headerComponent = (
    <HeaderContainer>
      {/* 배너 섹션 */}
      <BannerSection>
        <Banner />
      </BannerSection>

      {/* 카테고리 필터 섹션 */}
      <CategorySection>
        <CategoryFilter
          selected={selectedCategory}
          onSelect={handleCategoryChange}
        />
      </CategorySection>

      {/* 탭 섹션 */}
      <TabSection>
        <Tab
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </TabSection>
    </HeaderContainer>
  );

  return (
    <Container style={{ paddingTop: insets.top }}>
      {/* 헤더 */}
      <MainHeader
        onSearchPress={handleSearchPress}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onSearchFocus={handleSearchFocus}
        onSearchSubmit={handleSearchSubmit}
      />
      <ClubList
        clubs={clubs}
        loading={loading}
        onRefresh={refetch}
        onClubPress={handleClubPress}
        isSubscribed={isSubscribed}
        onSubscribeToggle={toggleSubscribe}
        error={error}
        style={{ flex: 1 }}
        headerComponent={headerComponent}
        listRef={listRef as RefObject<FlatList<Club>>}
      />
    </Container>
  );
}

// Styled Components
const Container = styled(View)`
  flex: 1;
  background-color: #fff;
`;

const HeaderContainer = styled.View``;

const BannerSection = styled.View`
  margin-bottom: 16px;
`;

const CategorySection = styled.View`
  margin-bottom: 8px;
`;

const TabSection = styled.View`
  margin-bottom: 8px;
`;

export default HomeScreen;
