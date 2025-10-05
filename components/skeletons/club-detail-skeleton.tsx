import React from 'react';
import { StyleSheet, View } from 'react-native';

import SkeletonPlaceholder from '@/components/ui/skeleton-placeholder';

/**
 * 클럽 상세 페이지 스켈레톤 레이아웃
 * Figma 디자인을 기반으로 한 실제 레이아웃과 일치하는 스켈레톤
 */
export function ClubDetailSkeleton() {
  return (
    <View style={styles.container}>
      {/* 상단 네비게이션 바 */}
      <View style={styles.navBar}>
        <SkeletonPlaceholder style={styles.backButton} borderRadius={6} />
        <SkeletonPlaceholder style={styles.navTitle} />
        <SkeletonPlaceholder style={styles.menuButton} borderRadius={6} />
      </View>

      <View style = { { paddingVertical: 24} }/>
      {/* 동아리 기본 정보 */}
      <View style={styles.clubInfo}>
        <View style={styles.clubHeader}>
          <SkeletonPlaceholder style={styles.clubLogo} borderRadius={6} />
          <SkeletonPlaceholder style={styles.clubName} />
        </View>

        <View style = { { paddingVertical: 16 } }/>
        
        {/* 태그 영역 */}
        <View style={styles.tagsContainer}>
          <SkeletonPlaceholder style={styles.tag} borderRadius={4} />
          <SkeletonPlaceholder style={styles.tag} borderRadius={4} />
          <SkeletonPlaceholder style={styles.tag} borderRadius={4} />
          <SkeletonPlaceholder style={styles.tag} borderRadius={4} />
        </View>
      </View>

      {/* 탭 네비게이션 */}
      <View style = { { paddingVertical: 16 } }/>

      <View style={styles.tabContainer}>
    
        <View style={styles.tabLabels}>
          <SkeletonPlaceholder style={styles.tabLabel} />
          <SkeletonPlaceholder style={styles.tabLabel} />
          <SkeletonPlaceholder style={styles.tabLabel} />
          <SkeletonPlaceholder style={styles.tabLabel} />
        </View>
      </View>

      <View style = { { paddingVertical: 16 } }/>

      {/* 모집정보 섹션 */}
      <View style={styles.section}>
        <SkeletonPlaceholder style={styles.sectionTitle} />
        <View style={styles.infoRow}>
          <SkeletonPlaceholder style={styles.infoLabel} />
          <SkeletonPlaceholder style={styles.infoValue} />
        </View>
        <View style={styles.infoRow}>
          <SkeletonPlaceholder style={styles.infoLabel} />
          <SkeletonPlaceholder style={styles.infoValue} />
        </View>
      </View>

      {/* 구분선 */}
      <SkeletonPlaceholder style={styles.divider} />

      {/* 동아리정보 섹션 */}
      <View style={styles.section}>
        <SkeletonPlaceholder style={styles.sectionTitle} />
        <View style={styles.infoRow}>
          <SkeletonPlaceholder style={styles.infoLabel} />
          <SkeletonPlaceholder style={styles.infoValue} />
        </View>
        <View style={styles.infoRow}>
          <SkeletonPlaceholder style={styles.infoLabel} />
          <SkeletonPlaceholder style={styles.infoValue} />
        </View>
      </View>

      {/* 하단 구분선 */}
      <SkeletonPlaceholder style={styles.bottomDivider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
  },
  backButton: {
    width: 24,
    height: 24,
  },
  navTitle: {
    width: 80,
    height: 16,
  },
  menuButton: {
    width: 24,
    height: 24,
  },
  heroImage: {
    width: '100%',
    height: 387,
    backgroundColor: '#d9d9d9',
  },
  clubInfo: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  clubLogo: {
    width: 50,
    height: 50,
    backgroundColor: '#efefef',
  },
  clubName: {
    width: 100,
    height: 28,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    width: 60,
    height: 24,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabIndicator: {
    width: 80,
    height: 2,
    backgroundColor: '#3a3a3a',
    marginBottom: 8,
  },
  tabLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabLabel: {
    width: 60,
    height: 12,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    width: 80,
    height: 18,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 30,
  },
  infoLabel: {
    width: 60,
    height: 13,
  },
  infoValue: {
    width: 130,
    height: 13,
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 16,
  },
  bottomDivider: {
    width: '100%',
    height: 1,
    marginTop: 16,
  },
});

export default ClubDetailSkeleton;
