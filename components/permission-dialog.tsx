/**
 * 알림 권한 요청 다이얼로그 컴포넌트
 */

import { MoaText } from '@/components/moa-text';
import { USER_EVENT } from '@/constants/eventname';
import { Colors } from '@/constants/theme';
import { useMixpanelTrack } from '@/hooks/use-mixpanel-track';
import React, { useEffect } from 'react';
import { Linking, Modal, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

interface PermissionDialogProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * 알림 권한 설정 안내 다이얼로그
 */
export function PermissionDialog({ visible, onClose }: PermissionDialogProps) {
  const trackEvent = useMixpanelTrack();

  useEffect(() => {
    if (visible) {
      trackEvent(USER_EVENT.PERMISSION_DIALOG_SHOWN, {
        type: 'notification',
        url: 'app://moadong',
      });
    }
  }, [visible, trackEvent]);

  const handleClose = () => {
    trackEvent(USER_EVENT.PERMISSION_DIALOG_CLOSED, {
      action: 'cancel',
      url: 'app://moadong',
    });
    onClose();
  };

  const handleOpenSettings = () => {
    trackEvent(USER_EVENT.PERMISSION_DIALOG_CONFIRMED, {
      action: 'open_settings',
      url: 'app://moadong',
    });
    onClose();
    Linking.openSettings();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Overlay>
        <DialogContainer>
          <DialogContent>
            <Title type="title3">알림 권한이 필요해요</Title>
            <Message type="body1Regular">
              동아리 모집 및 활동 알림을 받으려면{'\n'}알림 권한이 필요해요
            </Message>
          </DialogContent>
          
          <ButtonRow>
            <CancelButton onPress={handleClose} activeOpacity={0.7}>
              <CancelButtonText type="body1Medium">닫기</CancelButtonText>
            </CancelButton>
            
            <ConfirmButton onPress={handleOpenSettings} activeOpacity={0.7}>
              <ConfirmButtonText type="body1Medium">설정으로 이동</ConfirmButtonText>
            </ConfirmButton>
          </ButtonRow>
        </DialogContainer>
      </Overlay>
    </Modal>
  );
}

// Styled Components
const Overlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  padding-horizontal: 40px;
`;

const DialogContainer = styled.View`
  background-color: #FFFFFF;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
`;

const DialogContent = styled.View`
  padding: 24px;
  align-items: center;
`;

const Title = styled(MoaText)`
  color: #111111;
  margin-bottom: 12px;
  text-align: center;
`;

const Message = styled(MoaText)`
  color: #666666;
  text-align: center;
  line-height: 22px;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  border-top-width: 1px;
  border-top-color: #F0F0F0;
`;

const CancelButton = styled(TouchableOpacity)`
  flex: 1;
  padding-vertical: 16px;
  align-items: center;
  border-right-width: 1px;
  border-right-color: #F0F0F0;
`;

const CancelButtonText = styled(MoaText)`
  color: #999999;
`;

const ConfirmButton = styled(TouchableOpacity)`
  flex: 1;
  padding-vertical: 16px;
  align-items: center;
`;

const ConfirmButtonText = styled(MoaText)`
  color: ${Colors.light.tint};
`;
