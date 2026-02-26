import { getJwtSubject, getStoredAccessToken } from '@/services/auth-token-storage';
import { identifyMixpanel } from '@/utils/mixpanel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface MixpanelContextType {
  sessionId: string; 
  isLoading: boolean;
}

const MixpanelContext = createContext<MixpanelContextType | undefined>(undefined);

export const useMixpanelContext = () => {
  const context = useContext(MixpanelContext);
  if (!context) {
    throw new Error('useMixpanelContext must be used within MixpanelProvider');
  }
  return context;
};

interface MixpanelProviderProps {
  children: React.ReactNode;
}

const SESSION_ID_KEY = '@moadong_session_id';

/**
 * 랜덤 세션 ID 생성
 * 앱 최초 실행 시 1회만 생성하고 이후에는 저장된 값 사용
 */
const generateSessionId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `moadong_${timestamp}_${randomStr}`;
};

/**
 * AsyncStorage에서 session_id 가져오기 또는 생성
 */
const getOrCreateSessionId = async (): Promise<string> => {
  try {
    const storedSessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
    
    if (storedSessionId) {
      return storedSessionId;
    }
    
    const newSessionId = generateSessionId();
    await AsyncStorage.setItem(SESSION_ID_KEY, newSessionId);
    console.log('[MixpanelProvider] 새 Session ID 생성:', newSessionId);
    return newSessionId;
  } catch (error) {
    console.error('[MixpanelProvider] Session ID 로드/저장 실패:', error);
    // 에러 시 임시 ID 생성 (저장 안 함)
    return generateSessionId();
  }
};

async function getMixpanelDistinctId(sessionId: string): Promise<string> {
  const accessToken = await getStoredAccessToken();
  if (accessToken) {
    const subject = getJwtSubject(accessToken);
    if (subject) {
      return `user:${subject}`;
    }
  }

  return sessionId;
}

export const MixpanelProvider: React.FC<MixpanelProviderProps> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeMixpanel = async () => {
      try {
        const id = await getOrCreateSessionId();
        setSessionId(id);

        const distinctId = await getMixpanelDistinctId(id);
        const identified = await identifyMixpanel(distinctId);
        if (identified) {
          console.log('[MixpanelProvider] Mixpanel identified with:', distinctId);
        }
      } catch (error) {
        console.error('[MixpanelProvider] 초기화 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeMixpanel();
  }, []);

  return (
    <MixpanelContext.Provider value={{ sessionId, isLoading }}>
      {children}
    </MixpanelContext.Provider>
  );
};
