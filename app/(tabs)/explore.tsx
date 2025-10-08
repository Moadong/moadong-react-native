import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import { MoaText } from '@/components/moa-text';
import { MoaView } from '@/components/moa-view';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <MoaView style={styles.titleContainer}>
        <MoaText
          type="heading2"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Explore
        </MoaText>
      </MoaView>
      <MoaText>This app includes example code to help you get started.</MoaText>
      <Collapsible title="File-based routing">
        <MoaText>
          This app has two screens:{' '}
          <MoaText type="body1SemiBold">app/(tabs)/index.tsx</MoaText> and{' '}
          <MoaText type="body1SemiBold">app/(tabs)/explore.tsx</MoaText>
        </MoaText>
        <MoaText>
          The layout file in <MoaText type="body1SemiBold">app/(tabs)/_layout.tsx</MoaText>{' '}
          sets up the tab navigator.
        </MoaText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <MoaText type="body1Regular" style={{ color: '#0a7ea4' }}>Learn more</MoaText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <MoaText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <MoaText type="body1SemiBold">w</MoaText> in the terminal running this project.
        </MoaText>
      </Collapsible>
      <Collapsible title="Images">
        <MoaText>
          For static images, you can use the <MoaText type="body1SemiBold">@2x</MoaText> and{' '}
          <MoaText type="body1SemiBold">@3x</MoaText> suffixes to provide files for
          different screen densities
        </MoaText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <MoaText type="body1Regular" style={{ color: '#0a7ea4' }}>Learn more</MoaText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <MoaText>
          This template has light and dark mode support. The{' '}
          <MoaText type="body1SemiBold">useColorScheme()</MoaText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </MoaText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <MoaText type="body1Regular" style={{ color: '#0a7ea4' }}>Learn more</MoaText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <MoaText>
          This template includes an example of an animated component. The{' '}
          <MoaText type="body1SemiBold">components/HelloWave.tsx</MoaText> component uses
          the powerful{' '}
          <MoaText type="body1SemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </MoaText>{' '}
          library to create a waving hand animation.
        </MoaText>
        {Platform.select({
          ios: (
            <MoaText>
              The <MoaText type="body1SemiBold">components/ParallaxScrollView.tsx</MoaText>{' '}
              component provides a parallax effect for the header image.
            </MoaText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
