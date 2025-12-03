/**
 * 동아리 카드 컴포넌트 (간소화 버전)
 * 메인 화면에서 사용할 컴팩트한 카드
 */

import MoadongGrayIcon from '@/assets/icons/ic-moadong-gray.svg';
import { MoaImage } from '@/components/moa-image';
import { MoaText } from '@/components/moa-text';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { Club } from '@/types/club.types';
import React from 'react';
import { ImageStyle, StyleSheet, TouchableOpacity, View } from 'react-native';

/**
 * 간소화된 동아리 카드 Props
 */
interface CompactClubCardProps {
  club: Club;
  onPress?: (club: Club) => void;
  style?: any;
}

/**
 * 간소화된 동아리 카드 컴포넌트
 * 메인 화면의 동아리 목록에서 사용
 * 
 * @example
 * ```typescript
 * <CompactClubCard 
 *   club={clubData}
 *   onPress={(club) => navigation.navigate('ClubDetail', { club })}
 * />
 * ```
 */
export function CompactClubCard({ club, onPress, style }: CompactClubCardProps) {
  const handlePress = () => {
    onPress?.(club);
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* 동아리 이미지 */}
      <View style={styles.imageContainer}>
        {club.logo ? (
          <MoaImage 
            source={{ uri: club.logo }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
            <MoadongGrayIcon width={60} height={60} />
          </View>
        )}
      </View>

      {/* 동아리 정보 */}
      <View style={styles.content}>
        {/* 동아리 이름 */}
        <MoaText type="body1SemiBold" style={styles.name} numberOfLines={1}>
          {club.name}
        </MoaText>

        {/* 동아리 설명 */}
        <MoaText type="body2Regular" style={styles.description} numberOfLines={2}>
          {club.introduction}
        </MoaText>

        {/* 카테고리 태그 */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryTag}>
            <MoaText type="caption1Medium" style={styles.categoryText}>
              {club.category}
            </MoaText>
          </View>
          {club.tags.slice(0, 1).map((tag, index) => (
            <View key={index} style={styles.categoryTag}>
              <MoaText type="caption1Medium" style={styles.categoryText}>
                {tag}
              </MoaText>
            </View>
          ))}
        </View>

        {/* 모집 상태 */}
        <MoaText type="caption1Medium" style={styles.memberCount}>
          {club.recruitmentStatus === 'OPEN' ? '모집중' : 
           club.recruitmentStatus === 'ALWAYS' ? '상시모집' :
           club.recruitmentStatus === 'CLOSED' ? '모집마감' : '모집예정'}
        </MoaText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
    padding: Spacing.sm,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  } as ImageStyle,
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    marginBottom: Spacing.xs,
  },
  description: {
    color: Colors.light.icon,
    marginBottom: Spacing.xs,
    lineHeight: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  categoryTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  categoryText: {
    color: Colors.light.icon,
    fontSize: 10,
  },
  memberCount: {
    color: Colors.light.icon,
    fontSize: 11,
  },
});

