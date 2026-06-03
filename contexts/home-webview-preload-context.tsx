import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type HomeWebViewPreloadStatus = 'idle' | 'loading' | 'ready' | 'failed';

interface HomeWebViewPreloadContextType {
  status: HomeWebViewPreloadStatus;
  isSettled: boolean;
  markLoading: () => void;
  markReady: () => void;
  markFailed: () => void;
  reset: () => void;
}

const HomeWebViewPreloadContext = createContext<HomeWebViewPreloadContextType | undefined>(
  undefined,
);

interface HomeWebViewPreloadProviderProps {
  children: React.ReactNode;
}

export function HomeWebViewPreloadProvider({
  children,
}: HomeWebViewPreloadProviderProps) {
  const [status, setStatus] = useState<HomeWebViewPreloadStatus>('idle');

  const markLoading = useCallback(() => {
    setStatus((currentStatus) => (currentStatus === 'ready' ? currentStatus : 'loading'));
  }, []);

  const markReady = useCallback(() => {
    setStatus('ready');
  }, []);

  const markFailed = useCallback(() => {
    setStatus('failed');
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
  }, []);

  const value = useMemo(
    () => ({
      status,
      isSettled: status === 'ready' || status === 'failed',
      markLoading,
      markReady,
      markFailed,
      reset,
    }),
    [markFailed, markLoading, markReady, reset, status],
  );

  return (
    <HomeWebViewPreloadContext.Provider value={value}>
      {children}
    </HomeWebViewPreloadContext.Provider>
  );
}

export function useHomeWebViewPreloadContext(): HomeWebViewPreloadContextType {
  const context = useContext(HomeWebViewPreloadContext);
  if (!context) {
    throw new Error(
      'useHomeWebViewPreloadContext must be used within HomeWebViewPreloadProvider',
    );
  }

  return context;
}
