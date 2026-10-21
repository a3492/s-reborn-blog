# 웹 강연 뷰어 (PEOS) — 운영 가이드

재사용 가능한 정적 웹 강연 뷰어입니다. 기존 S-reborn 블로그(Astro + Cloudflare Pages)에
독립 경로로 통합되어 있으며, 기존 페이지/데이터/서비스에 영향을 주지 않습니다.

- 강연 목록: `/lectures/`
- KOAT 강연: `/lectures/koat-ai-2026/`
- 개별 슬라이드 직접 링크: `/lectures/koat-ai-2026/#slide-10` 또는 `/lectures/koat-ai-2026/#KOAT-S05`

## 디렉터리 구조

```
public/lectures/
  _assets/
    viewer.js        # 공용 뷰어 로직 (노트 코드 없음)
    viewer.css       # 공용 뷰어 스타일 (원본 시각 정체성 보존)
  koat-ai-2026/
    slides.json      # 공개 데이터 — 발표자 노트 제거됨
    images/          # KOAT-S01 ~ KOAT-S26 WebP

src/data/lectures.ts              # 강연 매니페스트
src/pages/lectures/index.astro    # 강연 목록 페이지
src/pages/lectures/[lecture]/index.astro  # 강연 뷰어 페이지 (동적)

scripts/build-lecture.mjs         # 내부 원본 → 공개 slides.json 생성 (노트 제거)

private/lectures/<id>/            # .gitignore — 저장소에 커밋 금지
  slides.source.json              # 발표자 노트 포함 내부 원본
  notes.json                      # 노트만 추출한 비공개 색인
```

## 발표자 노트 보호 방식

- **공개 저장소(public GitHub repo)와 배포물에는 노트를 두지 않습니다.** 화면에서 버튼만 숨기는
  방식이 아니라, 공개 `slides.json`·JS·HTML에서 `notes` 데이터 자체를 제거합니다.
- 뷰어 코드(`viewer.js`)에는 노트를 표시하는 로직이 존재하지 않습니다.
- 발표자 노트가 담긴 내부 원본(`private/`)은 `.gitignore` 처리되어 커밋되지 않습니다.
- 빌드 스크립트는 공개 출력에 `"notes"` 키가 남아 있으면 **빌드를 중단**합니다.

## 슬라이드 수정 방법

1. 내부 원본 `private/lectures/koat-ai-2026/slides.source.json` 을 연다.
   (이 파일은 저장소에 없습니다. 클라우드 에이전트 영구 저장소
   `/cursor/stores/self/lectures/koat-ai-2026/slides.source.json` 에 백업되어 있습니다.)
2. 해당 슬라이드 항목만 수정한다. 각 항목은 독립적이다:
   - `title` 화면 제목, `elements[]` 화면 텍스트(좌표·크기·정렬 포함)
   - `image` 이미지 경로, `notes` 발표자 노트(비공개)
   - `public`(기본 true, false 면 공개 제외), `version`(내부 버전 표기, 선택)
   - `id`(KOAT-S01 등 PEOS 자산 ID)와 `number`(순서)는 유지한다.
3. 공개 데이터 재생성:
   ```sh
   node scripts/build-lecture.mjs koat-ai-2026
   ```
   → `public/lectures/koat-ai-2026/slides.json` 이 노트 없이 갱신된다.
4. 이미지를 바꾸려면 `public/lectures/koat-ai-2026/images/` 의 해당 파일만 교체한다.
   다른 슬라이드/이미지는 건드리지 않는다.
5. `npm run build` 후 커밋·푸시하면 Cloudflare Pages 가 배포한다.

## 새 강연 추가 방법

1. `public/lectures/<새id>/images/` 에 이미지를, `private/lectures/<새id>/slides.source.json`
   에 내부 원본을 둔다.
2. `node scripts/build-lecture.mjs <새id>` 로 공개 `slides.json` 생성.
3. `src/data/lectures.ts` 의 `LECTURES` 에 항목을 추가한다.
4. `/lectures/<새id>/` 경로에 뷰어가 자동 생성된다.

## 조작법

방향키(←/→, PageUp/PageDown)로 이동, `F` 전체화면, `전체 보기`로 목차, `ESC`로 닫기.

## 콘텐츠 검증 주의

- 강연 텍스트·이미지·QR·외부 링크는 원본 PPTX 기반으로 재구성한 것입니다.
- 생성 이미지 내부의 숫자·의료/마케팅 표현은 검증된 사실로 인용하지 않습니다.
- 의료적 판단과 최종 책임은 의료인에게 있습니다.
