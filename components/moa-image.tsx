import { Image, ImageProps } from 'expo-image';
import { StyleSheet } from 'react-native';

/**
 * 앱 이미지 Props
 */
interface AppImageProps extends Omit<ImageProps, 'source'> {
  source: any;
  width?: number;
  height?: number;
}

/**
 * 앱 이미지 컴포넌트
 * 동적으로 이미지 소스를 받아서 렌더링
 * 
 * @example
 * ```tsx
 * <AppImage 
 *   source={require('@/assets/images/banner-1.png')} 
 *   width={350} 
 *   height={200} 
 * />
 * <AppImage 
 *   source={require('@/assets/images/banner-2.png')} 
 *   width={200} 
 *   height={120} 
 * />
 * ```
 */
export function MoaImage({ 
  source,
  width,
  height,
  style,
  contentFit = 'cover',
  ...props
}: AppImageProps) {
  return (
    <Image
      source={source}
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
