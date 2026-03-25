#!/bin/bash
# doctor-ai 파일을 blog/public/doctor-ai/ 로 동기화
# 사용법: bash sync-doctor-ai.sh (blog/ 폴더에서 실행)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$SCRIPT_DIR/../doctor-ai/doctor-ai/"
DST="$SCRIPT_DIR/public/doctor-ai/"

if [ ! -d "$SRC" ]; then
  echo "오류: doctor-ai 소스 폴더를 찾을 수 없습니다: $SRC"
  exit 1
fi

mkdir -p "$DST"

rsync -av --delete "$SRC" "$DST"

echo ""
echo "동기화 완료: doctor-ai → public/doctor-ai/"
echo "이제 git add public/doctor-ai/ && git commit && git push 로 배포하세요."
