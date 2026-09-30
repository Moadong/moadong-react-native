import React, { createContext, useContext } from 'react';

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
  /**
   * 부트스트랩 성공 여부. 필수로 둔다 - optional 이던 시절에는 넘기지 않는 경우를 위한
   * 폴백 분기가 있었고, 그 분기가 프로바이더 안에서 따로 identify 를 했다. 실제로는
   * 마운트 지점(app/_layout.tsx)이 항상 넘겨서 도달하지 않는 코드였는데, 신원 결정
   * 로직이 두 곳에 있는 것처럼 읽혔다. 신원은 부트스트랩에서만 정한다.
   */
  initialReady: boolean;
}

export const MixpanelProvider: React.FC<MixpanelProviderProps> = ({
  children,
  initialSessionId,
  initialReady,
}) => (
  <MixpanelContext.Provider
    value={{ sessionId: initialSessionId ?? '', isLoading: !initialReady }}
  >
    {children}
  </MixpanelContext.Provider>
);
