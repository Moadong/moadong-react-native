/**
 * 동아리 카드 컴포넌트
 */

import MoadongGrayIcon from '@/assets/icons/ic-moadong-gray.svg';
import { MoaImage } from '@/components/moa-image';
import { MoaText } from '@/components/moa-text';
import { Column, Row } from '@/components/ui';
import { Club } from '@/types/club.types';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';

/**
 * 동아리 카드 Props
 */
interface ClubCardProps {
  club: Club;
  onPress?: (club: Club) => void;
  isSubscribed?: boolean;
  onSubscribeToggle?: (clubId: string) => void;
  style?: any;
}

/**
 * 모집 상태별 색상 반환
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN':
      return '#3DBBFF';
    case 'ALWAYS':
      return '#49D5AD';
    case 'CLOSED':
      return '#C5C5C5';
    default:
      return '#3DBBFF';
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
 *   isSubscribed={isSubscribed(club.id)}
 *   onSubscribeToggle={toggleSubscribe}
 * />
 * ```
 */
export function ClubCard({ club, onPress, isSubscribed = false, onSubscribeToggle, style }: ClubCardProps) {
  const handlePress = () => {
    onPress?.(club);
  };

  const handleSubscribePress = (e: any) => {
    e.stopPropagation();
    onSubscribeToggle?.(club.id);
  };

  return (
    <StyledTouchableOpacity 
      style={style} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Row 레이아웃: 이미지 + 정보 + 구독 아이콘 */}
      <Row gap={16} align="flex-start">
        {/* 동아리 이미지 */}
        <ImageContainer>
          {club.logo ? (
            <MoaImage 
              source={{ uri: club.logo }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <MoadongGrayIcon width={50} height={50} />
            </View>
          )}
        </ImageContainer>

        {/* 동아리 정보 Column */}
        <Column gap={4} style={{ flex: 1 }}>
          {/* 동아리 이름 */}
          <ClubName type="body1SemiBold" numberOfLines={1}>
            {club.name}
          </ClubName>

          {/* 동아리 설명 */}
          <Description type="body2Regular" numberOfLines={2}>
            {club.introduction}
          </Description>
        </Column>

        {/* 구독 아이콘 */}
        <SubscribeButton onPress={handleSubscribePress} activeOpacity={0.6}>
          <MoaImage
            source={
              isSubscribed
                ? require('@/assets/icons/ic-subscribe-selected.png')
                : require('@/assets/icons/ic-subscribe-unselected.png')
            }
            style={{ width: 22, height: 22 }}
            contentFit="contain"
          />
        </SubscribeButton>
      </Row>

       {/* 하단 정보 */}
       <FooterContainer>
            {/* 모집 상태 */}
            <StatusBadge backgroundColor={getStatusColor(club.recruitmentStatus)}>
              <StatusText type="caption1SemiBold">
                {club.recruitmentStatus === 'OPEN' ? '모집중' : 
                 club.recruitmentStatus === 'ALWAYS' ? '상시모집' :
                 club.recruitmentStatus === 'CLOSED' ? '모집마감' : '모집예정'}
              </StatusText>
            </StatusBadge>

            {/* 카테고리 태그들 */}
            <TagsContainer>
              {/* 카테고리가 있을 때만 표시 */}
              {club.category && club.category.trim() !== '' && (
                <CategoryTag backgroundColor={getCategoryColor(club.category)}>
                  <CategoryText type="caption1SemiBold">
                    #{club.category}
                  </CategoryText>
                </CategoryTag>
              )}
              
              {/* 추가 태그들 (예: 프로젝트, 소프트웨어 등) - 내용이 있을 때만 표시 */}
              {club.tags && club.tags.length > 0 && club.tags.slice(0, 1).map((tag, index) => (
                tag && tag.trim() !== '' && (
                  <AdditionalTag key={index}>
                    <AdditionalTagText type="caption1SemiBold">
                      #{tag}
                    </AdditionalTagText>
                  </AdditionalTag>
                )
              ))}
            </TagsContainer>
          </FooterContainer>
    </StyledTouchableOpacity>
  );
}

// Styled Components 
const StyledTouchableOpacity = styled(TouchableOpacity)`
  background-color: #FFFFFF;
  border-radius: 10px;
  margin-horizontal: 16px;
  margin-vertical: 6px;
  padding-horizontal: 16px;
  padding-vertical: 16px;
  shadow-color: #000;
  shadow-offset: 0px 0px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 3;
  flex-direction: column;
  gap: 8px;
`;

const ImageContainer = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  overflow: hidden;
  background-color: #EFEFEF;
`;

const ClubName = styled(MoaText)`
  color: #3A3A3A;
  font-size: 16px;
  font-weight: 700;
  line-height: 22.4px;
  letter-spacing: -0.32px;
`;

const Description = styled(MoaText)`
  color: #818181;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: -0.24px;
`;

const FooterContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

const StatusBadge = styled.View<{ backgroundColor: string }>`
  height: 25px;
  width: 50px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  background-color: ${(props: { backgroundColor: string }) => props.backgroundColor};
`;

const StatusText = styled(MoaText)`
  color: #FFFFFF;
  font-size: 12px;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  flex: 1;
`;

const CategoryTag = styled.View<{ backgroundColor: string }>`
  padding-horizontal: 8px;
  padding-vertical: 4px;
  border-radius: 8px;
  height: 25px;
  justify-content: center;
  align-items: center;
  background-color: ${(props: { backgroundColor: string }) => props.backgroundColor};
`;

const CategoryText = styled(MoaText)`
  color: #3A3A3A;
  font-size: 12px;
  font-weight: 600;
  line-height: 16.8px;
  letter-spacing: -0.24px;
`;

const AdditionalTag = styled.View`
  background-color: #EBEBEB;
  padding-horizontal: 8px;
  padding-vertical: 4px;
  border-radius: 8px;
  height: 25px;
  justify-content: center;
  align-items: center;
`;

const AdditionalTagText = styled(MoaText)`
  color: #3A3A3A;
  font-size: 12px;
  font-weight: 600;
  line-height: 16.8px;
  letter-spacing: -0.24px;
`;

const SubscribeButton = styled(TouchableOpacity)`
  padding: 2px;
  justify-content: center;
  align-items: center;
`;
