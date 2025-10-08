import { BorderRadius, MainColors, Spacing, TagColors } from '@/constants/theme';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MoaText } from './moa-text';
import { MoaView } from './moa-view';

/**
 * 컬러 시스템을 시각적으로 확인할 수 있는 컴포넌트
 * 개발 중에 디자인 시스템을 확인하고 테스트하는 용도
 */
export function ColorShowcase() {
  return (
    <ScrollView style={styles.container}>
      {/* Main Colors */}
      <MoaView style={styles.section}>
        <MoaText type="title1" style={styles.sectionTitle}>
          Main Colors (메인 컬러)
        </MoaText>
        <MoaText type="body2Regular" style={styles.description}>
          앱의 주요 컬러로 사용되는 오렌지 계열 컬러
        </MoaText>

        <View style={styles.colorGrid}>
          <ColorCard
            color={MainColors.main}
            name="Main"
            description="메인 컬러"
          />
          <ColorCard
            color={MainColors.main2}
            name="Main 2"
            description="메인 컬러 2"
          />
          <ColorCard
            color={MainColors.main3}
            name="Main 3"
            description="메인 컬러 3"
          />
          <ColorCard
            color={MainColors.main4}
            name="Main 4"
            description="메인 컬러 4"
          />
          <ColorCard
            color={MainColors.main5}
            name="Main 5"
            description="메인 컬러 5"
          />
        </View>
      </MoaView>

      {/* Tag Colors */}
      <MoaView style={styles.section}>
        <MoaText type="title1" style={styles.sectionTitle}>
          Tag Colors (태그 컬러)
        </MoaText>
        <MoaText type="body2Regular" style={styles.description}>
          동아리 카테고리별로 사용되는 컬러 시스템
        </MoaText>

        <View style={styles.tagSection}>
          <TagColorCard
            mainColor={TagColors.volunteer.main}
            lightColor={TagColors.volunteer.light}
            name="봉사"
            category="volunteer"
          />
          <TagColorCard
            mainColor={TagColors.academic.main}
            lightColor={TagColors.academic.light}
            name="학술"
            category="academic"
          />
          <TagColorCard
            mainColor={TagColors.religion.main}
            lightColor={TagColors.religion.light}
            name="종교"
            category="religion"
          />
          <TagColorCard
            mainColor={TagColors.hobby.main}
            lightColor={TagColors.hobby.light}
            name="취미교양"
            category="hobby"
          />
          <TagColorCard
            mainColor={TagColors.sports.main}
            lightColor={TagColors.sports.light}
            name="운동"
            category="sports"
          />
          <TagColorCard
            mainColor={TagColors.performance.main}
            lightColor={TagColors.performance.light}
            name="공연"
            category="performance"
          />
        </View>
      </MoaView>

      {/* Usage Example */}
      <MoaView style={styles.section}>
        <MoaText type="title1" style={styles.sectionTitle}>
          실제 사용 예시
        </MoaText>

        {/* 태그 예시 */}
        <View style={styles.exampleRow}>
          <View style={[styles.tag, { backgroundColor: TagColors.volunteer.main }]}>
            <MoaText type="caption1SemiBold" style={styles.tagText}>
              봉사
            </MoaText>
          </View>
          <View style={[styles.tag, { backgroundColor: TagColors.academic.main }]}>
            <MoaText type="caption1SemiBold" style={styles.tagText}>
              학술
            </MoaText>
          </View>
          <View style={[styles.tag, { backgroundColor: TagColors.sports.main }]}>
            <MoaText type="caption1SemiBold" style={styles.tagText}>
              운동
            </MoaText>
          </View>
        </View>

        {/* 배지 예시 */}
        <View style={styles.exampleRow}>
          <View style={[styles.badge, { backgroundColor: TagColors.volunteer.light }]}>
            <MoaText type="body2Regular" style={{ color: TagColors.volunteer.main }}>
              봉사
            </MoaText>
          </View>
          <View style={[styles.badge, { backgroundColor: TagColors.academic.light }]}>
            <MoaText type="body2Regular" style={{ color: TagColors.academic.main }}>
              학술
            </MoaText>
          </View>
          <View style={[styles.badge, { backgroundColor: TagColors.hobby.light }]}>
            <MoaText type="body2Regular" style={{ color: TagColors.hobby.main }}>
              취미교양
            </MoaText>
          </View>
        </View>

        {/* 버튼 예시 */}
        <View style={[styles.button, { backgroundColor: MainColors.main }]}>
          <MoaText type="body1SemiBold" style={styles.buttonText}>
            메인 버튼
          </MoaText>
        </View>
      </MoaView>
    </ScrollView>
  );
}

// 컬러 카드 컴포넌트
function ColorCard({
  color,
  name,
  description,
}: {
  color: string;
  name: string;
  description: string;
}) {
  return (
    <View style={styles.colorCard}>
      <View style={[styles.colorSwatch, { backgroundColor: color }]} />
      <MoaText type="body1SemiBold" style={styles.colorName}>
        {name}
      </MoaText>
      <MoaText type="caption1Medium" style={styles.colorValue}>
        {color}
      </MoaText>
      <MoaText type="caption1Medium" style={styles.colorDescription}>
        {description}
      </MoaText>
    </View>
  );
}

// 태그 컬러 카드 컴포넌트
function TagColorCard({
  mainColor,
  lightColor,
  name,
  category,
}: {
  mainColor: string;
  lightColor: string;
  name: string;
  category: string;
}) {
  return (
    <View style={styles.tagColorCard}>
      <View style={styles.tagColorRow}>
        <View style={[styles.tagColorSwatch, { backgroundColor: mainColor }]} />
        <View style={[styles.tagColorSwatch, { backgroundColor: lightColor }]} />
      </View>
      <MoaText type="body1SemiBold" style={styles.tagName}>
        {name}
      </MoaText>
      <MoaText type="caption1Medium" style={styles.tagCategory}>
        {category}
      </MoaText>
      <MoaText type="caption1Medium" style={styles.colorValue}>
        Main: {mainColor}
      </MoaText>
      <MoaText type="caption1Medium" style={styles.colorValue}>
        Light: {lightColor}
      </MoaText>
    </View>
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
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Spacing.lg,
    opacity: 0.7,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  colorCard: {
    width: 150,
    gap: Spacing.xs,
  },
  colorSwatch: {
    width: '100%',
    height: 100,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  colorName: {
    marginTop: Spacing.xs,
  },
  colorValue: {
    opacity: 0.7,
  },
  colorDescription: {
    opacity: 0.6,
    fontSize: 11,
  },
  tagSection: {
    gap: Spacing.lg,
  },
  tagColorCard: {
    gap: Spacing.xs,
  },
  tagColorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tagColorSwatch: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  tagName: {
    marginTop: Spacing.xs,
  },
  tagCategory: {
    opacity: 0.6,
    fontStyle: 'italic',
  },
  exampleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  tagText: {
    color: '#fff',
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonText: {
    color: '#fff',
  },
});

