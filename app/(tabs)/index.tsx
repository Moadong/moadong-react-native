import { useHomeWebViewPreloadContext } from '@/contexts/home-webview-preload-context';
import { HomeWebViewScreen } from '@/ui/home/home-webview-screen';
import React, { Suspense, lazy, useCallback, useState } from 'react';

const LazyHomeScreen = lazy(() => import('@/ui/home/home-screen'));

export default function HomeTab() {
  const [webViewFailed, setWebViewFailed] = useState(false);
  const { markFailed } = useHomeWebViewPreloadContext();

  const handleWebViewError = useCallback(() => {
    markFailed();
    setWebViewFailed(true);
  }, [markFailed]);

  if (webViewFailed) {
    return (
      <Suspense fallback={null}>
        <LazyHomeScreen />
      </Suspense>
    );
  }

  return <HomeWebViewScreen onError={handleWebViewError} />;
}
