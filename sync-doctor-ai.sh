#!/bin/bash
# Doctor AI Academy 정적 파일을 public/doctor-ai-academy/ 로 동기화
# 사용법: bash sync-doctor-ai.sh (레포 루트에서 실행)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/../doctor-ai-academy/doctor-ai-academy/"
DST="$SCRIPT_DIR/public/doctor-ai-academy/"

if [ ! -d "$SRC" ]; then
  echo "오류: doctor-ai-academy 소스 폴더를 찾을 수 없습니다: $SRC"
  exit 1
fi

rm -rf "$DST"
cp -r "$SRC" "$DST"

echo ""
echo "동기화 완료: doctor-ai-academy → public/doctor-ai-academy/"
echo "이제 git add public/doctor-ai-academy/ && git commit && git push 로 배포하세요."
