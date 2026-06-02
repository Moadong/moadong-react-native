import { HomeWebViewScreen } from '@/ui/home/home-webview-screen';
import React, { Suspense, lazy, useState } from 'react';

const LazyHomeScreen = lazy(() => import('@/ui/home/home-screen'));

export default function HomeTab() {
  const [webViewFailed, setWebViewFailed] = useState(false);

  if (webViewFailed) {
    return (
      <Suspense fallback={null}>
        <LazyHomeScreen />
      </Suspense>
    );
  }

  return <HomeWebViewScreen onError={() => setWebViewFailed(true)} />;
}
