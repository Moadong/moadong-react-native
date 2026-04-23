import { HomeScreen } from '@/ui/home/home-screen';
import { HomeWebViewScreen } from '@/ui/home/home-webview-screen';
import React, { useState } from 'react';

export default function HomeTab() {
  const [webViewFailed, setWebViewFailed] = useState(false);

  if (webViewFailed) {
    return <HomeScreen />;
  }

  return <HomeWebViewScreen onError={() => setWebViewFailed(true)} />;
}
