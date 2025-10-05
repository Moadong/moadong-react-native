import ClubDetailSkeleton from '@/components/skeletons/club-detail-skeleton';
import Constants from 'expo-constants';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function ClubWebViewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const uri = useMemo(() => {
    if (!id || typeof id !== 'string') {
      return 'https://develop.moadong.com/club';
    }

    return `https://develop.moadong.com/club/${id}`;
  }, [id]);

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri }}
        style={styles.webView}
        onLoadEnd={() => setIsLoading(false)}
      />
      {isLoading && (
        <View style={styles.skeletonContainer} pointerEvents="none">
          <ClubDetailSkeleton />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    backgroundColor: '#fff',
  },
  skeletonContainer: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: '#fff',
  },
  webView: {
    flex: 1,
  },
});
