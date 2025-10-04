/**
 * 에셋 파일 타입 선언
 */

import React from 'react';
import { ImageSourcePropType } from 'react-native';
import { SvgProps } from 'react-native-svg';

declare module '*.png' {
  const content: ImageSourcePropType;
  export default content;
}

declare module '*.jpg' {
  const content: ImageSourcePropType;
  export default content;
}

declare module '*.jpeg' {
  const content: ImageSourcePropType;
  export default content;
}

declare module '*.gif' {
  const content: ImageSourcePropType;
  export default content;
}

declare module '*.svg' {
  const content: React.FC<SvgProps>;
  export default content;
}
