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
      </View>

      {/* 동아리 정보 */}
      <View style={styles.content}>
        {/* 동아리 이름과 타입 */}
        <View style={styles.header}>
          <Text type="body1SemiBold" style={styles.name} numberOfLines={1}>
            {club.name}
          </Text>
          <View style={styles.typeBadge}>
            <Text type="caption1SemiBold" style={styles.typeText}>
              {club.division}
            </Text>
          </View>
        </View>

        {/* 동아리 설명 */}
        <Text type="body2Regular" style={styles.description} numberOfLines={2}>
          {club.introduction}
        </Text>

        {/* 카테고리 태그 */}
        <View style={styles.categoryContainer}>
          <View style={styles.categoryTag}>
            <Text type="caption1Medium" style={styles.categoryText}>
              {club.category}
            </Text>
          </View>
        </View>

        {/* 모집 상태 */}
        <View style={styles.footer}>
          <Text type="caption1Medium" style={styles.statusText}>
            {club.recruitmentStatus === 'OPEN' ? '모집중' : 
             club.recruitmentStatus === 'ALWAYS' ? '상시모집' :
             club.recruitmentStatus === 'CLOSED' ? '모집마감' : '모집예정'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: Spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  } as ImageStyle,
  content: {
    flex: 1,
    justifyContent: 'space-between',
    height: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  name: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  typeBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  typeText: {
    color: Colors.light.icon,
    fontSize: 10,
  },
  description: {
    color: Colors.light.icon,
    marginBottom: Spacing.xs,
    lineHeight: 16,
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  categoryTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  categoryText: {
    color: Colors.light.icon,
    fontSize: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  statusText: {
    color: Colors.light.icon,
    fontSize: 10,
  },
});

