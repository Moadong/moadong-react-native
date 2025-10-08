import { BorderRadius, Spacing } from '@/constants/theme';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MoaText } from './moa-text';
import { MoaView } from './moa-view';

/**
 * 타이포그래피 시스템을 시각적으로 확인할 수 있는 컴포넌트
 * 개발 중에 디자인 시스템을 확인하고 테스트하는 용도
 */
export function TypographyShowcase() {
  return (
    <ScrollView style={styles.container}>
      <MoaView style={styles.section}>
        <MoaText type="title1" style={styles.sectionTitle}>
          Headings (제목)
        </MoaText>
        
        <View style={styles.item}>
          <MoaText type="heading1">Heading 1 - 40px Bold</MoaText>
          <MoaText type="caption1Medium" style={styles.meta}>
            heading1 • 40px • Bold • -0.5 letter spacing
          </MoaText>
        </View>

        <View style={styles.item}>
          <MoaText type="heading2">Heading 2 - 36px Bold</MoaText>
          <MoaText type="caption1Medium" style={styles.meta}>
            heading2 • 36px • Bold • -0.5 letter spacing
          </MoaText>
        </View>

        <View style={styles.item}>
          <MoaText type="heading3">Heading 3 - 28px Bold</MoaText>
          <MoaText type="caption1Medium" style={styles.meta}>
            heading3 • 28px • Bold • -0.3 letter spacing
          </MoaText>
        </View>
      </MoaView>

      <MoaView style={styles.section}>
        <MoaText type="title1" style={styles.sectionTitle}>
          Titles (섹션 제목)
        </MoaText>
        
        <View style={styles.item}>
          <MoaText type="title1">Title 1 - 24px Bold</MoaText>
          <MoaText type="caption1Medium" style={styles.meta}>
            title1 • 24px • Bold • -0.3 letter spacing
          </MoaText>
        </View>

        <View style={styles.item}>
          <MoaText type="title2">Title 2 - 20px Bold</MoaText>
          <MoaText type="caption1Medium" style={styles.meta}>
            title2 • 20px • Bold • -0.2 letter spacing
          </MoaText>
        </View>

        <View style={styles.item}>
          <MoaText type="title3">Title 3 - 18px Bold</MoaText>
          <MoaText type="caption1Medium" style={styles.meta}>
            title3 • 18px • Bold • -0.2 letter spacing
          </MoaText>
        </View>
      </MoaView>

      <MoaView style={styles.section}>
        <MoaText type="title1" style={styles.sectionTitle}>
          Body (본문)
        </MoaText>
        
        <View style={styles.item}>
          <MoaText type="body1SemiBold">
            Body 1 SemiBold - 16px SemiBold
          </MoaText>
          <MoaText type="caption1Medium" style={styles.meta}>
            body1SemiBold • 16px • SemiBold (600)
          </MoaText>
        </View>

        <View style={styles.item}>
          <MoaText type="body1Medium">
            Body 1 Medium - 16px Medium
          </MoaText>
          <MoaText type="caption1Medium" style={styles.meta}>
            body1Medium • 16px • Medium (500)
          </MoaText>
        </View>

        <View style={styles.item}>
          <MoaText type="body1Regular">
            Body 1 Regular - 16px Regular (기본)
          </MoaText>
          <MoaText type="caption1Medium" style={styles.meta}>
            body1Regular • 16px • Regular (400) • 가장 많이 사용
          </MoaText>
        </View>

        <View style={styles.item}>
          <MoaText type="body2Regular">
            Body 2 Regular - 14px Regular
          </MoaText>
          <MoaText type="caption1Medium" style={styles.meta}>
            body2Regular • 14px • Regular (400)
          </MoaText>
        </View>
      </MoaView>

      <MoaView style={styles.section}>
        <MoaText type="title1" style={styles.sectionTitle}>
          Caption (작은 텍스트)
        </MoaText>
        
        <View style={styles.item}>
          <MoaText type="caption1SemiBold">
            Caption 1 SemiBold - 12px SemiBold
          </MoaText>
          <MoaText type="caption1Medium" style={styles.meta}>
            caption1SemiBold • 12px • SemiBold (600)
          </MoaText>
        </View>

        <View style={styles.item}>
          <MoaText type="caption1Medium">
            Caption 1 Medium - 12px Medium
          </MoaText>
          <MoaText type="caption1Medium" style={styles.meta}>
            caption1Medium • 12px • Medium (500)
          </MoaText>
        </View>
      </MoaView>

      <MoaView style={styles.section}>
        <MoaText type="title1" style={styles.sectionTitle}>
          실제 사용 예시
        </MoaText>
        
        <MoaView style={styles.card}>
          <MoaText type="title2">카드 제목입니다</MoaText>
          <MoaText type="body1Regular" style={styles.cardText}>
            이것은 일반 본문 텍스트입니다. 가장 많이 사용되는 스타일로, 
            여러 줄에 걸쳐 내용을 표시할 때 사용합니다.
          </MoaText>
          <MoaText type="body1SemiBold">
            강조가 필요한 중요한 내용
          </MoaText>
          <MoaText type="caption1Medium" style={styles.cardMeta}>
            2024.10.04 • 모아동
          </MoaText>
        </MoaView>
      </MoaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  item: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  meta: {
    marginTop: Spacing.xs,
    opacity: 0.6,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    gap: Spacing.sm,
  },
  cardText: {
    marginVertical: Spacing.xs,
  },
  cardMeta: {
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
});

