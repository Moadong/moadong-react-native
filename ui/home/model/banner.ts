export interface HomeBannerItem {
  id: string;
  image: any; // require()로 받은 이미지 소스
  imageUrl?: string;
  linkTo?: string | null;
  alt?: string;
  title?: string;
  onPress?: () => void;
}

export interface BannerProps {
  items?: HomeBannerItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicator?: boolean;
}
