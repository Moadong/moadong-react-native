import { Image, ImageProps } from 'expo-image';
import { StyleSheet } from 'react-native';

/**
 * 이미지 타입
 */
export type AppImageType = 
  | 'banner-1'
  | 'banner-2'
  | 'logo'
  | 'react-logo'
  | 'react-logo-2x'
  | 'react-logo-3x'
  | 'partial-react-logo';

/**
 * 앱 이미지 Props
 */
interface AppImageProps extends Omit<ImageProps, 'source'> {
  name: AppImageType;
  width?: number;
  height?: number;
}

/**
 * 이미지 소스 매핑
 */
const imageMap: Record<AppImageType, any> = {
  'banner-1': require('@/assets/images/banner-1.png'),
  'banner-2': require('@/assets/images/banner-2.png'),
  'logo': require('@/assets/images/icon.png'),
  'react-logo': require('@/assets/images/react-logo.png'),
  'react-logo-2x': require('@/assets/images/react-logo@2x.png'),
  'react-logo-3x': require('@/assets/images/react-logo@3x.png'),
  'partial-react-logo': require('@/assets/images/partial-react-logo.png'),
};

/**
 * 앱 이미지 컴포넌트
 * 
 * @example
 * ```tsx
 * <AppImage name="banner-1" width={350} height={200} />
 * <AppImage name="logo" width={100} height={100} />
 * ```
 */
export function AppImage({ 
  name, 
  width,
  height,
  style,
  contentFit = 'cover',
  ...props
}: AppImageProps) {
  return (
    <Image
      source={imageMap[name]}
      style={[
        width && height ? { width, height } : styles.defaultSize,
        style,
      ]}
      contentFit={contentFit}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  defaultSize: {
    width: 200,
    height: 200,
  },
});

