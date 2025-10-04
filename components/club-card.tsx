/**
 * 동아리 카드 컴포넌트
 */

import { AppImage } from '@/components/app-image';
import { Text } from '@/components/themed-text';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
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
      activeOpacity={0.7}
    >
      {/* 동아리 이미지 */}
      <View style={styles.imageContainer}>
        <AppImage 
          source={club.logo ? { uri: club.logo } : require('@/assets/images/icon.png')}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* 동아리 타입 배지 */}
        <View style={styles.typeBadge}>
          <Text type="caption1SemiBold" style={styles.typeText}>
            {club.division}
          </Text>
        </View>
      </View>

      {/* 동아리 정보 */}
      <View style={styles.content}>
        {/* 동아리 이름 */}
        <Text type="title3" style={styles.name} numberOfLines={1}>
          {club.name}
        </Text>

        {/* 동아리 설명 */}
        <Text type="body2Regular" style={styles.description} numberOfLines={2}>
          {club.introduction}
        </Text>

        {/* 카테고리 태그들 */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryTag}>
            <Text type="caption1Medium" style={styles.categoryText}>
              {club.category}
            </Text>
          </View>
          {club.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.categoryTag}>
              <Text type="caption1Medium" style={styles.categoryText}>
                {tag}
              </Text>
            </View>
          ))}
        </View>

        {/* 모집 상태 및 등록 버튼 */}
        <View style={styles.footer}>
          <Text type="caption1Medium" style={styles.memberCount}>
            {club.recruitmentStatus === 'OPEN' ? '모집중' : 
             club.recruitmentStatus === 'ALWAYS' ? '상시모집' :
             club.recruitmentStatus === 'CLOSED' ? '모집마감' : '모집예정'}
          </Text>
          
          <TouchableOpacity style={styles.registerButton}>
            <Text type="caption1SemiBold" style={styles.registerButtonText}>
              등록
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  } as ImageStyle,
  typeBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
  },
  content: {
    padding: Spacing.md,
  },
  name: {
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  description: {
    color: Colors.light.icon,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  categoryTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    color: Colors.light.icon,
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    color: Colors.light.icon,
  },
  registerButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});

