#!/bin/bash

# 아이콘 파일 이름 변경 스크립트
# 사용법: bash scripts/rename-icons.sh

ICONS_DIR="assets/icons"

echo "🎨 아이콘 파일 이름 변경 시작..."

cd "$ICONS_DIR" || exit

# 전체
[ -f "전체 모바일.svg" ] && mv "전체 모바일.svg" "ic-전체.svg" && echo "✓ 전체 모바일.svg → ic-전체.svg"
[ -f "전체.svg" ] && mv "전체.svg" "ic-전체-clicked.svg" && echo "✓ 전체.svg → ic-전체-clicked.svg"

# 학술
[ -f "학술 모바일.svg" ] && mv "학술 모바일.svg" "ic-학술.svg" && echo "✓ 학술 모바일.svg → ic-학술.svg"
[ -f "학술 모바일-1.svg" ] && mv "학술 모바일-1.svg" "ic-학술-clicked.svg" && echo "✓ 학술 모바일-1.svg → ic-학술-clicked.svg"

# 봉사
[ -f "봉사 모바일.svg" ] && mv "봉사 모바일.svg" "ic-봉사.svg" && echo "✓ 봉사 모바일.svg → ic-봉사.svg"
[ -f "봉사 모바일-1.svg" ] && mv "봉사 모바일-1.svg" "ic-봉사-clicked.svg" && echo "✓ 봉사 모바일-1.svg → ic-봉사-clicked.svg"

# 운동
[ -f "운동 모바일.svg" ] && mv "운동 모바일.svg" "ic-운동.svg" && echo "✓ 운동 모바일.svg → ic-운동.svg"
[ -f "운동 모바일-1.svg" ] && mv "운동 모바일-1.svg" "ic-운동-clicked.svg" && echo "✓ 운동 모바일-1.svg → ic-운동-clicked.svg"

# 종교
[ -f "종교 모바일.svg" ] && mv "종교 모바일.svg" "ic-종교.svg" && echo "✓ 종교 모바일.svg → ic-종교.svg"
[ -f "종교 모바일-1.svg" ] && mv "종교 모바일-1.svg" "ic-종교-clicked.svg" && echo "✓ 종교 모바일-1.svg → ic-종교-clicked.svg"

# 취미교양
[ -f "취미교양 모바일.svg" ] && mv "취미교양 모바일.svg" "ic-취미교양.svg" && echo "✓ 취미교양 모바일.svg → ic-취미교양.svg"
[ -f "취미교양 모바일-1.svg" ] && mv "취미교양 모바일-1.svg" "ic-취미교양-clicked.svg" && echo "✓ 취미교양 모바일-1.svg → ic-취미교양-clicked.svg"

# 공연
[ -f "공연 모바일.svg" ] && mv "공연 모바일.svg" "ic-공연.svg" && echo "✓ 공연 모바일.svg → ic-공연.svg"
[ -f "공연 모바일-1.svg" ] && mv "공연 모바일-1.svg" "ic-공연-clicked.svg" && echo "✓ 공연 모바일-1.svg → ic-공연-clicked.svg"

echo ""
echo "✅ 완료!"
echo ""
echo "📁 변경된 파일 목록:"
ls -1 ic-*.svg 2>/dev/null || echo "변경된 파일이 없습니다."

