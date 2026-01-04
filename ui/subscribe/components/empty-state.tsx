/**
 * 구독 빈 상태 컴포넌트
 */

import { MoaImage } from '@/components/moa-image';
import { MoaText } from '@/components/moa-text';
import { USER_EVENT } from '@/constants/eventname';
import { MainColors } from '@/constants/theme';
import { useMixpanelTrack } from '@/hooks';
import { useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

/**
 * 구독한 동아리가 없을 때 표시되는 컴포넌트
 */
export function EmptyState() {
  const router = useRouter();
  const trackEvent = useMixpanelTrack();

  const handleGoHome = () => {
    trackEvent(USER_EVENT.GO_HOME_BUTTON_CLICKED, {
      from: 'subscribe_empty',
      url: 'app://moadong/(tabs)/home',
    });
    
    router.push('/(tabs)');
  };

  return (
    <Container>
      <IconContainer>
        <MoaImage
          source={require('@/assets/icons/ic-subscribe-selected.png')}
          style={{ width: 80, height: 80, opacity: 0.3 }}
          contentFit="contain"
        />
      </IconContainer>

      <Title type="title2">구독한 동아리가 없어요</Title>
      
      <Description type="body1Regular">
        관심있는 동아리를 구독하고{'\n'}새로운 모집 및 활동 소식을 받아보세요
      </Description>

      <HomeButton onPress={handleGoHome} activeOpacity={0.8}>
        <ButtonText type="body1SemiBold">홈으로 가기</ButtonText>
      </HomeButton>
    </Container>
  );
}

// Styled Components
const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #fff;
`;

const IconContainer = styled.View`
  margin-bottom: 24px;
`;

const Title = styled(MoaText)`
  color: #111111;
  margin-bottom: 12px;
  text-align: center;
`;

const Description = styled(MoaText)`
  color: #989898;
  text-align: center;
  margin-bottom: 32px;
  line-height: 24px;
`;

const HomeButton = styled(TouchableOpacity)`
  background-color: ${MainColors.main};
  padding-horizontal: 32px;
  padding-vertical: 14px;
  border-radius: 12px;
`;

const ButtonText = styled(MoaText)`
  color: #FFFFFF;
`;

