import { ensureAccessToken } from './auth-token.service';
import { getJwtSubject } from './auth-token-storage';
import { getFcmToken, initializeFcm } from './fcm.service';
import { fetchSubscribedClubIdsByAccessToken, saveSubscribedClubIdsToStorage } from './subscription.service';
import { identifyMixpanel } from '@/utils/mixpanel';

export async function runAppBootstrap(): Promise<{ subscribedClubCount: number }> {
  const accessToken = await ensureAccessToken();

  await initializeFcm({ strict: true });

  const studentToken = await getFcmToken();
  if (!studentToken) {
    throw new Error('studentToken(FCM)이 없어 구독 목록을 조회할 수 없습니다.');
  }

  const subscribedClubIds = await fetchSubscribedClubIdsByAccessToken(studentToken);
  await saveSubscribedClubIdsToStorage(subscribedClubIds);

  const subject = getJwtSubject(accessToken);
  if (!subject) {
    throw new Error('JWT에서 식별 가능한 사용자 ID를 찾을 수 없습니다.');
  }

  const identified = await identifyMixpanel(`user:${subject}`);
  if (!identified) {
    throw new Error('Mixpanel 초기화에 실패했습니다.');
  }

  return { subscribedClubCount: subscribedClubIds.length };
}

