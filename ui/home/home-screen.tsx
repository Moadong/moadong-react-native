import React, { RefObject, useCallback, useRef, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { useRouter } from 'expo-router';

import { CategoryType } from '@/components/icon';
import { PermissionDialog } from '@/components/permission-dialog';
import { PAGE_VIEW_EVENT, USER_EVENT } from '@/constants/eventname';
import { useMixpanelTrack, useTrackScreenView } from '@/hooks';
import { Club } from '@/types/club.types';
import {
  Banner,
  CategoryFilter,
  ClubList,
  MainHeader,
  Tab,
  TabType
} from '@/ui/home/components';
import { useClubs, useSubscribedClubs } from '@/ui/home/hook';

export function HomeScreen() {
  // SafeArea insets
  const insets = useSafeAreaInsets();

  // 상태 관리
  const [activeTab, setActiveTab] = useState<TabType>('central');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('전체');
  const [searchValue, setSearchValue] = useState('');
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const listRef = useRef<FlatList<Club> | null>(null);
  const router = useRouter();
  const hasScrolledOnFocus = useRef(false); // 검색 포커스 시 스크롤 애니메이션 실행 여부

  useTrackScreenView(PAGE_VIEW_EVENT.MAIN_PAGE);
  const trackEvent = useMixpanelTrack();

  // 동아리 데이터 훅 
  const {
    clubs,
    loading,
    error,
    fetchClubs,
    refetch,
    clearClubs,
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
   * 탭 변경 핸들러 (UI만 표시, 기능 없음)
   */
  const handleTabChange = useCallback(() => {
    // 탭은 UI로만 표시, 실제 동작 없음
  }, []);

  /**
   * 카테고리 변경 핸들러
   */
  const handleCategoryChange = useCallback((category: CategoryType) => {
    trackEvent(USER_EVENT.CATEGORY_BUTTON_CLICKED, { 
      category,
      url: 'app://moadong/(tabs)',
    });
    
    setSelectedCategory(category);
    setSearchValue('');
    fetchClubs({
      category: category === '전체' ? undefined : category,
      type: activeTab,
      keyword: undefined,
    });
  }, [activeTab, fetchClubs, trackEvent]);

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

    trackEvent(USER_EVENT.CLUB_CARD_CLICKED, {
      clubName: club.name,
      category: club.category,
      url: 'app://moadong/(tabs)',
    });

    router.push({
      pathname: '/club/[id]',
      params: { id: club.id, name: club.name }
    });
  }, [router, trackEvent]);

  /**
   * 구독 토글 핸들러
   */
  const handleSubscribeToggle = useCallback(async (club: Club) => {
    const wasSubscribed = isSubscribed(club.id);
    const result = await toggleSubscribe(club.id);
    
    trackEvent(USER_EVENT.SUBSCRIBE_BUTTON_CLICKED, {
      clubName: club.name,
      subscribed: !wasSubscribed,
      url: 'app://moadong/(tabs)',
    });
    
    if (result.needsPermission) {
      setShowPermissionDialog(true);
    }
  }, [toggleSubscribe, isSubscribed, trackEvent]);

  const handleSearchFocus = useCallback(() => {
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
    
    if (keyword) {
      trackEvent(USER_EVENT.SEARCH_BOX_CLICKED, {
        keyword,
        tab: activeTab,
        url: 'app://moadong/(tabs)',
      });
    }
    
    setSelectedCategory('전체');
    
    try {
      listRef.current?.scrollToIndex({ index: 0, animated: true });
    } catch (error) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
    
    fetchClubs({
      category: undefined,
      type: activeTab,
      keyword: keyword ? keyword : undefined,
    });
  }, [fetchClubs, activeTab, trackEvent]);

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
        <Tab
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
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
        onSubscribeToggle={handleSubscribeToggle}
        error={error}
        style={{ flex: 1 }}
        headerComponent={headerComponent}
        listRef={listRef as RefObject<FlatList<Club>>}
      />
      
      {/* 알림 권한 다이얼로그 */}
      <PermissionDialog
        visible={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
      />
    </Container>
  );
}

const Container = styled(View)`
  flex: 1;
  background-color: #fff;
`;

const HeaderContainer = styled.View``;

const BannerSection = styled.View`
  margin-bottom: 16px;
`;

const CategorySection = styled.View`
  margin-bottom: 20px;
`;

export default HomeScreen;