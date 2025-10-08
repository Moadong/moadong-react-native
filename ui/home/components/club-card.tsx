/**
 * 동아리 카드 컴포넌트
 */

import { MoaImage } from '@/components/moa-image';
import { MoaText } from '@/components/moa-text';
import { Spacing } from '@/constants/theme';
import { Club } from '@/types/club.types';
import React from 'react';
import { ImageStyle, StyleSheet, TouchableOpacity, View } from 'react-native';

/**
 * 동아리 카드 Props
 */
interface ClubCardProps {
  club: Club;
  onPress?: (club: Club) => void;
  style?: any;
}

/**
 * 모집 상태별 색상 반환
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN':
      return '#00A6FF';
    case 'ALWAYS':
      return '#00A6FF';
    case 'CLOSED':
      return '#C5C5C5';
    default:
      return '#00A6FF';
  }
};

/**
 * 카테고리별 태그 색상 반환
 */
const getCategoryColor = (category: string) => {
  switch (category) {
    case '봉사':
      return '#FFEBF1';
    case '공연':
      return '#F7EBFF';
    case '운동':
      return '#FFF2DB';
    case '종교':
      return '#FFF6D6';
    case '취미교양':
      return '#E3FAF5';
    case '학술':
      return '#E5ECFF';
    default:
      return '#F5F5F5';
  }
};

/**
 * 동아리 카드 컴포넌트
 * 
 * @example
 * ```typescript
 * <ClubCard 
 *   club={clubData}
 *   onPress={(club) => navigation.navigate('ClubDetail', { club })}
 * />
 * ```
 */
export function ClubCard({ club, onPress, style }: ClubCardProps) {
  const handlePress = () => {
    onPress?.(club);
  };

  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* 동아리 이미지 */}
      <View style={styles.imageContainer}>
        <MoaImage 
          source={club.logo ? { uri: club.logo } : require('@/assets/images/icon.png')}
          style={styles.image}
          resizeMode="cover"
        />
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

        {/* 하단 정보 */}
        <View style={styles.footer}>
          {/* 모집 상태 */}
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(club.recruitmentStatus) }
          ]}>
            <MoaText type="caption1SemiBold" style={styles.statusText}>
              {club.recruitmentStatus === 'OPEN' ? '모집중' : 
               club.recruitmentStatus === 'ALWAYS' ? '상시모집' :
               club.recruitmentStatus === 'CLOSED' ? '모집마감' : '모집예정'}
            </MoaText>
          </View>

          {/* 카테고리 태그들 */}
          <View style={styles.tagsContainer}>
            <View style={[
              styles.categoryTag,
              { backgroundColor: getCategoryColor(club.category) }
            ]}>
              <MoaText type="caption1SemiBold" style={styles.categoryText}>
                #{club.category}
              </MoaText>
            </View>
            {/* 추가 태그들 (예: 프로젝트, 소프트웨어 등) */}
            <View style={styles.additionalTag}>
              <MoaText type="caption1SemiBold" style={styles.additionalTagText}>
                #프로젝트
              </MoaText>
            </View>
            <View style={styles.additionalTag}>
              <MoaText type="caption1SemiBold" style={styles.additionalTagText}>
                #소프트웨어
              </MoaText>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: 66,
    height: 66,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#F2F2F2',
  },
  image: {
    width: '100%',
    height: '100%',
  } as ImageStyle,
  content: {
    width: '100%',
    gap: 4,
  },
  name: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  description: {
    color: '#989898',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.28,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    width: '100%',
  },
  statusBadge: {
    paddingHorizontal: 26,
    paddingVertical: 8,
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.28,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    color: '#4B4B4B',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.28,
  },
  additionalTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  additionalTagText: {
    color: '#4B4B4B',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.28,
  },
});

