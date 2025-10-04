import { BorderRadius, Spacing } from '@/constants/theme';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './themed-text';
import { ThemedView } from './themed-view';

/**
 * 타이포그래피 시스템을 시각적으로 확인할 수 있는 컴포넌트
 * 개발 중에 디자인 시스템을 확인하고 테스트하는 용도
 */
export function TypographyShowcase() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <Text type="title1" style={styles.sectionTitle}>
          Headings (제목)
        </Text>
        
        <View style={styles.item}>
          <Text type="heading1">Heading 1 - 40px Bold</Text>
          <Text type="caption1Medium" style={styles.meta}>
            heading1 • 40px • Bold • -0.5 letter spacing
          </Text>
        </View>

        <View style={styles.item}>
          <Text type="heading2">Heading 2 - 36px Bold</Text>
          <Text type="caption1Medium" style={styles.meta}>
            heading2 • 36px • Bold • -0.5 letter spacing
          </Text>
        </View>

        <View style={styles.item}>
          <Text type="heading3">Heading 3 - 28px Bold</Text>
          <Text type="caption1Medium" style={styles.meta}>
            heading3 • 28px • Bold • -0.3 letter spacing
          </Text>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <Text type="title1" style={styles.sectionTitle}>
          Titles (섹션 제목)
        </Text>
        
        <View style={styles.item}>
          <Text type="title1">Title 1 - 24px Bold</Text>
          <Text type="caption1Medium" style={styles.meta}>
            title1 • 24px • Bold • -0.3 letter spacing
          </Text>
        </View>

        <View style={styles.item}>
          <Text type="title2">Title 2 - 20px Bold</Text>
          <Text type="caption1Medium" style={styles.meta}>
            title2 • 20px • Bold • -0.2 letter spacing
          </Text>
        </View>

        <View style={styles.item}>
          <Text type="title3">Title 3 - 18px Bold</Text>
          <Text type="caption1Medium" style={styles.meta}>
            title3 • 18px • Bold • -0.2 letter spacing
          </Text>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <Text type="title1" style={styles.sectionTitle}>
          Body (본문)
        </Text>
        
        <View style={styles.item}>
          <Text type="body1SemiBold">
            Body 1 SemiBold - 16px SemiBold
          </Text>
          <Text type="caption1Medium" style={styles.meta}>
            body1SemiBold • 16px • SemiBold (600)
          </Text>
        </View>

        <View style={styles.item}>
          <Text type="body1Medium">
            Body 1 Medium - 16px Medium
          </Text>
          <Text type="caption1Medium" style={styles.meta}>
            body1Medium • 16px • Medium (500)
          </Text>
        </View>

        <View style={styles.item}>
          <Text type="body1Regular">
            Body 1 Regular - 16px Regular (기본)
          </Text>
          <Text type="caption1Medium" style={styles.meta}>
            body1Regular • 16px • Regular (400) • 가장 많이 사용
          </Text>
        </View>

        <View style={styles.item}>
          <Text type="body2Regular">
            Body 2 Regular - 14px Regular
          </Text>
          <Text type="caption1Medium" style={styles.meta}>
            body2Regular • 14px • Regular (400)
          </Text>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <Text type="title1" style={styles.sectionTitle}>
          Caption (작은 텍스트)
        </Text>
        
        <View style={styles.item}>
          <Text type="caption1SemiBold">
            Caption 1 SemiBold - 12px SemiBold
          </Text>
          <Text type="caption1Medium" style={styles.meta}>
            caption1SemiBold • 12px • SemiBold (600)
          </Text>
        </View>

        <View style={styles.item}>
          <Text type="caption1Medium">
            Caption 1 Medium - 12px Medium
          </Text>
          <Text type="caption1Medium" style={styles.meta}>
            caption1Medium • 12px • Medium (500)
          </Text>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <Text type="title1" style={styles.sectionTitle}>
          실제 사용 예시
        </Text>
        
        <ThemedView style={styles.card}>
          <Text type="title2">카드 제목입니다</Text>
          <Text type="body1Regular" style={styles.cardText}>
            이것은 일반 본문 텍스트입니다. 가장 많이 사용되는 스타일로, 
            여러 줄에 걸쳐 내용을 표시할 때 사용합니다.
          </Text>
          <Text type="body1SemiBold">
            강조가 필요한 중요한 내용
          </Text>
          <Text type="caption1Medium" style={styles.cardMeta}>
            2024.10.04 • 모아동
          </Text>
        </ThemedView>
      </ThemedView>
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

