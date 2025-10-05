import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';

export default function ClubWebViewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
    backgroundColor: '#fff',
  },
  webView: {
    flex: 1,
  },
});
