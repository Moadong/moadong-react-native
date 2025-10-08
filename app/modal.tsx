import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MoaText } from '@/components/moa-text';
import { MoaView } from '@/components/moa-view';

export default function ModalScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <MoaView style={styles.content}>
        <MoaText type="heading2">This is a modal</MoaText>
        <Link href="/" dismissTo style={styles.link}>
          <MoaText type="body1Regular" style={{ color: '#0a7ea4' }}>Go to home screen</MoaText>
        </Link>
      </MoaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
