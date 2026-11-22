---
title: "CapCut 자동 자막 고치기 — 고유명사 치환표부터 최종 재생까지"
date: 2026-04-10
updatedDate: 2026-11-22
category: "ai-tools-general"
subcategory: "도구소개"
thumbnail: ""
draft: false
tags: ["CapCut", "편집", "자막", "숏폼"]
originIds: ["cu"]
description: "CapCut 자동 자막에서 이름과 브랜드 표기를 치환표로 정리하고, 원음과 타이밍을 대조하는 절차입니다."
read_time: 5
difficulty: "beginner"
type: "guide"
key_takeaways:
  - "고유명사는 승인 표기와 잘못 인식된 형태를 한 표에 정리한다."
  - "치환 뒤에는 원음과 자막 타이밍을 화면에서 대조한다."
---

아래 사례는 설명을 위한 가상의 상황입니다.

인터뷰 편집자 빈은 첫 자막을 보고 재생을 멈췄다. 인터뷰이 이름이 한 음절씩 갈라졌고, 같은 브랜드가 화면마다 다르게 적혔다. 자막은 이미 모두 들어가 있었다. 지금 필요한 건 새 자막을 만드는 일이 아니라 **같은 단어가 어디서 다르게 쓰였는지** 찾는 일이었다.

**한 줄 요약.** CapCut 자동 자막으로 초안을 만든 뒤 치환표로 이름과 전문 용어를 통일하고, 원음과 타이밍을 다시 확인한다.

## 잘못 읽힌 이름을 한 표로 모은다

[CapCut 공식 안내](https://www.capcut.com/help/how-to-recognise-subtitles)에 따라 원음 언어를 선택해 자동 자막을 생성한다. 메뉴는 버전에 따라 다를 수 있다. 이름과 제품명은 촬영에 사용한 자료나 당사자가 확인한 표기에서 가져온다.

| 자동 자막에서 찾을 말 | 확인한 표기 | 확인 방법 |
| --- | --- | --- |
| 채하 연 | 채하연 | 인터뷰 소개 자막과 대조 |
| 넥스레이어·넥스트 레이어 | 넥스트레이어 | 브랜드 표기표와 대조 |
| 클라 우드 | 클라우드 | 앞뒤 발화와 대조 |

빈이 짧은 인터뷰 시안과 준비된 표기표로 이 작업을 18분에 마친 것은 가상 사례의 설정입니다. 음질이나 화자 수에 따라 필요한 시간은 달라집니다.

## 맥락을 읽고 바꾸고, 처음부터 다시 재생한다

1. 표에 적은 틀린 표현을 자막 목록에서 찾는다. 검색·치환이 지원되면 미리 보기부터 하고, 지원되지 않으면 해당 자막 줄을 직접 편집한다. 문맥이 다른 값까지 한 번에 바꾸지 않는다.
2. 수정한 줄을 원음과 함께 재생해 첫 음절과 끝이 맞는지 본다. 숫자, 부정 표현, 화자가 바뀌는 구간은 특히 다시 듣는다.
3. 최종 영상 또는 미리보기 전체를 재생한다. 화면 아래 버튼이나 제목과 자막이 겹치지 않는지, 휴대전화에서 줄바꿈이 읽히는지 확인한다.

<figure class="editorial-figure" data-editorial-figure id="capcut-timing-figure">
<svg viewBox="0 0 420 194" role="img" aria-label="자막 한 줄의 시점을 나타낸 예시 타임라인. 초안 자막은 원음보다 먼저 뜨고, 수정 자막은 원음이 시작되는 지점에 맞춰 뜬다.">
<text class="editorial-note" x="12" y="39">원음</text>
<text class="editorial-note" x="12" y="84">초안 자막</text>
<text class="editorial-note" x="12" y="129">수정 자막</text>
<path class="editorial-rule" d="M126 34h282 M126 79h282 M126 124h282 M231 20v125" stroke-dasharray="4 4"/>
<path class="editorial-ink" d="M231 34h139 M156 79h139" stroke-width="6"/>
<rect class="editorial-accent" x="231" y="121" width="139" height="6" fill="currentColor"/>
<text x="192" y="173">발화 시작</text>
</svg>
<figcaption>이 타임라인은 한 줄을 대조하는 예시다. 표기를 고친 뒤, 재생하면서 자막의 시작을 원음의 첫 음절에 맞춘다.</figcaption>
</figure>

빈은 끝에서 같은 브랜드 표기가 다시 다르게 나온 줄 하나를 발견했다. 타임코드와 함께 치환표에 넣어 두자 다음 편에서 같은 말을 다시 검색할 수 있었다.

## 이어 읽기

- [Runway 이미지 투 비디오로 첫 컷 만들기](/blog/ai-tools-general/runway-gen-video-overview/)에서 자막을 붙일 앞 단계의 영상 시안을 만드는 법을 보세요.
- [Higgsfield로 광고 훅 변형 비교하기](/blog/ai-tools-general/higgsfield-ai-creative-suite/)에서 영상 후보를 같은 기준으로 검토하는 법을 읽어 보세요.
- [도구·리뷰 주제 모음](/blog/topics/tools/)에서 영상 편집과 생성 도구를 더 찾아보세요.
