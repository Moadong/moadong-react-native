/**
 * 동아리 카드 컴포넌트
 */

import { MoaImage } from '@/components/moa-image';
import { MoaText } from '@/components/moa-text';
import { Column, Row } from '@/components/ui';
import { Club } from '@/types/club.types';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

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
    <StyledTouchableOpacity 
      style={style} 
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Row 레이아웃: 이미지 + 정보 */}
      <Row gap={20} align="flex-start">
        {/* 동아리 이미지 */}
        <ImageContainer>
          <MoaImage 
            source={club.logo ? { uri: club.logo } : require('@/assets/images/icon.png')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
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
              <CategoryTag backgroundColor={getCategoryColor(club.category)}>
                <CategoryText type="caption1SemiBold">
                  #{club.category}
                </CategoryText>
              </CategoryTag>
              {/* 추가 태그들 (예: 프로젝트, 소프트웨어 등) */}

              {club.tags.slice(0, 1).map((tag, index) => (
                <AdditionalTag key={index}>
                  <AdditionalTagText type="caption1SemiBold">
                    #{tag}
                  </AdditionalTagText>
                </AdditionalTag>
              ))}
            </TagsContainer>
          </FooterContainer>
    </StyledTouchableOpacity>
  );
}

// Styled Components 
const StyledTouchableOpacity = styled(TouchableOpacity)`
  background-color: #FFFFFF;
  border-radius: 14px;
  margin-horizontal: 16px;
  margin-vertical: 8px;
  padding-horizontal: 20px;
  padding-vertical: 20px;
  shadow-color: #000;
  shadow-offset: 0px 0px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 3;
  flex-direction: column;
  gap: 16px;
`;

const ImageContainer = styled.View`
  width: 66px;
  height: 66px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #F2F2F2;
`;

const ClubName = styled(MoaText)`
  color: #111111;
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
  letter-spacing: -0.4px;
`;

const Description = styled(MoaText)`
  color: #989898;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.28px;
  margin-bottom: 16px;
`;

const FooterContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 20px;
  width: 100%;
`;

const StatusBadge = styled.View<{ backgroundColor: string }>`
  height: 28px;
  width: 66px;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  background-color: ${(props: { backgroundColor: string }) => props.backgroundColor};
`;

const StatusText = styled(MoaText)`
  color: #FFFFFF;
  font-size: 14px;
`;

const TagsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  flex: 1;
`;

const CategoryTag = styled.View<{ backgroundColor: string }>`
  padding-horizontal: 8px;
  padding-vertical: 4px;
  border-radius: 6px;
  height: 28px;
  justify-content: center;
  align-items: center;
  background-color: ${(props: { backgroundColor: string }) => props.backgroundColor};
`;

const CategoryText = styled(MoaText)`
  color: #4B4B4B;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: -0.28px;
`;

const AdditionalTag = styled.View`
  background-color: #F5F5F5;
  padding-horizontal: 8px;
  padding-vertical: 4px;
  border-radius: 6px;
`;

const AdditionalTagText = styled(MoaText)`
  color: #4B4B4B;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: -0.28px;
`;

