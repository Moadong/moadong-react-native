import { getJwtSubject, getStoredAccessToken } from '@/services/auth-token-storage';
import { getOrCreateMixpanelSessionId, identifyMixpanel } from '@/utils/mixpanel';
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
  initialSessionId?: string;
  initialReady?: boolean;
}

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

export const MixpanelProvider: React.FC<MixpanelProviderProps> = ({
  children,
  initialSessionId,
  initialReady,
}) => {
  const usesBootstrapState = initialReady !== undefined;
  const [sessionId, setSessionId] = useState<string>(initialSessionId ?? '');
  const [isLoading, setIsLoading] = useState<boolean>(
    usesBootstrapState ? !initialReady : true,
  );

  useEffect(() => {
    if (usesBootstrapState) {
      setSessionId(initialSessionId ?? '');
      setIsLoading(!initialReady);
      return;
    }

    const initializeMixpanel = async () => {
      try {
        const id = await getOrCreateMixpanelSessionId();
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
  }, [initialReady, initialSessionId, usesBootstrapState]);

  return (
    <MixpanelContext.Provider value={{ sessionId, isLoading }}>
      {children}
    </MixpanelContext.Provider>
  );
};
