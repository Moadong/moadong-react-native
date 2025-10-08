import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type MoaViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function MoaView({ style, lightColor, darkColor, ...otherProps }: MoaViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
