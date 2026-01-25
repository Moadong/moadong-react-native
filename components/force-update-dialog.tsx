/**
 * 강제 업데이트 다이얼로그 (닫기 불가)
 * - Remote Config `require_force_update`가 true일 때 스플래시 단계에서 앱 진입을 차단
 */
import React from 'react';
import { Linking, Modal, Platform, TouchableOpacity } from 'react-native';
import styledNative from 'styled-components/native';

import { Colors } from '@/constants/theme';
import { MoaText } from './moa-text';

type ForceUpdateDialogProps = {
  visible: boolean;
};

const IOS_APP_ID = '6755062085';
const ANDROID_PACKAGE = 'com.moadong.moadong';

const IOS_ITMS_URL = `itms-apps://apps.apple.com/kr/app/id${IOS_APP_ID}`;
const IOS_HTTPS_URL = `https://apps.apple.com/kr/app/id${IOS_APP_ID}`;

const ANDROID_MARKET_URL = `market://details?id=${ANDROID_PACKAGE}`;
const ANDROID_HTTPS_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

async function openUrlWithFallback(primaryUrl: string, fallbackUrl: string) {
  const canOpenPrimary = await Linking.canOpenURL(primaryUrl);
  if (canOpenPrimary) {
    await Linking.openURL(primaryUrl);
    return;
  }
  await Linking.openURL(fallbackUrl);
}

export function ForceUpdateDialog({ visible }: ForceUpdateDialogProps) {
  const handleUpdate = async () => {
    try {
      if (Platform.OS === 'ios') {
        await openUrlWithFallback(IOS_ITMS_URL, IOS_HTTPS_URL);
        return;
      }
      if (Platform.OS === 'android') {
        await openUrlWithFallback(ANDROID_MARKET_URL, ANDROID_HTTPS_URL);
        return;
      }
      await Linking.openURL(IOS_HTTPS_URL);
    } catch (error) {
      console.warn('❌ 스토어 이동 실패:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // Android 하드웨어 뒤로가기 등으로 닫히지 않도록 빈 핸들러 제공
      onRequestClose={() => {}}
    >
      <Overlay>
        <DialogContainer>
          <DialogContent>
            <Title type="title3">업데이트가 필요해요</Title>
            <Message type="body1Regular">
              원활한 서비스 이용을 위해{'\n'}최신 버전으로 업데이트해 주세요.
            </Message>
          </DialogContent>

          <ButtonRow>
            <UpdateButton onPress={handleUpdate} activeOpacity={0.8}>
              <UpdateButtonText type="body1Medium">업데이트</UpdateButtonText>
            </UpdateButton>
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

const UpdateButton = styledNative(TouchableOpacity)`
  padding-vertical: 16px;
  align-items: center;
`;

const UpdateButtonText = styledNative(MoaText)`
  color: ${Colors.light.tint};
`;

