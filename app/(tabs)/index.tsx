import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Text } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <Text type="heading2">Welcome!</Text>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Text type="title2">Step 1: Try it</Text>
        <Text>
          Edit <Text type="body1SemiBold">app/(tabs)/index.tsx</Text> to see changes.
          Press{' '}
          <Text type="body1SemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </Text>{' '}
          to open developer tools.
        </Text>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <Text type="title2">Step 2: Explore</Text>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <Text>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </Text>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Text type="title2">Step 3: Get a fresh start</Text>
        <Text>
          {`When you're ready, run `}
          <Text type="body1SemiBold">npm run reset-project</Text> to get a fresh{' '}
          <Text type="body1SemiBold">app</Text> directory. This will move the current{' '}
          <Text type="body1SemiBold">app</Text> to{' '}
          <Text type="body1SemiBold">app-example</Text>.
        </Text>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
