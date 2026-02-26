import React from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import styledNative from 'styled-components/native';

import { Colors } from '@/constants/theme';
import { MoaText } from './moa-text';

type BootstrapErrorDialogProps = {
  visible: boolean;
  message?: string;
  isRetrying?: boolean;
  onRetry: () => void;
};

export function BootstrapErrorDialog({
  visible,
  message,
  isRetrying = false,
  onRetry,
}: BootstrapErrorDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <Overlay>
        <DialogContainer>
          <DialogContent>
            <Title type="title3">잠시 문제가 생겼어요</Title>
            <Message type="body1Regular">
              {message || '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'}
            </Message>
          </DialogContent>

          <ButtonRow>
            <RetryButton onPress={onRetry} activeOpacity={0.8} disabled={isRetrying}>
              <RetryButtonText type="body1Medium">
                {isRetrying ? '다시 시도 중...' : '다시 시도'}
              </RetryButtonText>
            </RetryButton>
          </ButtonRow>
        </DialogContainer>
      </Overlay>
    </Modal>
  );
}

const Overlay = styledNative.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  padding-horizontal: 40px;
`;

const DialogContainer = styledNative.View`
  background-color: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
`;

const DialogContent = styledNative.View`
  padding: 24px;
  align-items: center;
`;

const Title = styledNative(MoaText)`
  color: #111111;
  margin-bottom: 12px;
  text-align: center;
`;

const Message = styledNative(MoaText)`
  color: #666666;
  text-align: center;
  line-height: 22px;
`;

const ButtonRow = styledNative.View`
  border-top-width: 1px;
  border-top-color: #f0f0f0;
`;

const RetryButton = styledNative(TouchableOpacity)`
  padding-vertical: 16px;
  align-items: center;
`;

const RetryButtonText = styledNative(MoaText)`
  color: ${Colors.light.tint};
`;

