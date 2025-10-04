import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <Text type="heading2">This is a modal</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text type="body1Regular" style={{ color: '#0a7ea4' }}>Go to home screen</Text>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
