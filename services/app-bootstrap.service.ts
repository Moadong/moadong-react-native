import { ensureAccessToken } from './auth-token.service';
import { getJwtSubject } from './auth-token-storage';
import { getFcmToken, initializeFcm, sendFcmTokenToServer } from './fcm.service';
import { fetchSubscribedClubIdsByAccessToken, saveSubscribedClubIdsToStorage } from './subscription.service';
import { getOrCreateMixpanelSessionId, identifyMixpanel } from '@/utils/mixpanel';

export type BootstrapTimings = Record<string, number>;

export interface BootstrapResult {
  accessToken: string;
  subject: string;
  sessionId: string;
  subscribedClubIds: string[];
  timings: BootstrapTimings;
}

async function registerFcmToken(): Promise<void> {
  await initializeFcm({ strict: false, promptForPermission: false });
  const fcmToken = await getFcmToken();
  if (fcmToken) {
    await sendFcmTokenToServer(fcmToken);
  }
}

async function syncSubscribedClubIds(): Promise<string[]> {
  const subscribedClubIds = await fetchSubscribedClubIdsByAccessToken();
  await saveSubscribedClubIdsToStorage(subscribedClubIds);
  return subscribedClubIds;
}

async function initializeMixpanelIdentity(subject: string): Promise<string> {
  const sessionId = await getOrCreateMixpanelSessionId();
  const identified = await identifyMixpanel(`user:${subject}`);
  if (!identified) {
    throw new Error('Mixpanel 초기화에 실패했습니다.');
  }

  return sessionId;
}

export async function runAppBootstrap(): Promise<BootstrapResult> {
  const timings: BootstrapTimings = {
    bootstrapStart: Date.now(),
  };

  const accessToken = await ensureAccessToken();
  timings.accessTokenReady = Date.now();

  const subject = getJwtSubject(accessToken);
  if (!subject) {
    throw new Error('JWT에서 식별 가능한 사용자 ID를 찾을 수 없습니다.');
  }

  const [subscribedClubIds, sessionId] = await Promise.all([
    syncSubscribedClubIds().finally(() => {
      timings.subscriptionsReady = Date.now();
    }),
    initializeMixpanelIdentity(subject).finally(() => {
      timings.mixpanelReady = Date.now();
    }),
    registerFcmToken().finally(() => {
      timings.fcmReady = Date.now();
    }),
  ]);

  timings.bootstrapEnd = Date.now();

  return {
    accessToken,
    subject,
    sessionId,
    subscribedClubIds,
    timings,
  };
}
