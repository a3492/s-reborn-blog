---
title: "Midjourney 스타일 레퍼런스로 썸네일 톤 맞추기"
date: 2026-04-08
updatedDate: 2026-11-22
category: "ai-tools-general"
subcategory: "도구소개"
thumbnail: ""
draft: false
tags: ["Midjourney", "이미지", "프롬프트", "디자인"]
originIds: ["cu"]
description: "Midjourney의 스타일 레퍼런스로 썸네일 시리즈의 색과 질감을 맞추고, 장면만 바꿔 비교하는 실습입니다."
read_time: 5
difficulty: "beginner"
type: "guide"
key_takeaways:
  - "스타일 레퍼런스와 화면 비율을 유지하고 장면의 대상만 바꾼다."
  - "시드 번호는 실험 재현을 돕지만 스타일 레퍼런스를 대신하지 않는다."
---

아래 사례는 설명을 위한 가상의 상황입니다.

나래는 책상 위에 올릴 리뷰 채널 썸네일 두 장을 나란히 띄웠다. 한 장은 차가운 파란색, 한 장은 반짝이는 금빛이었다. 둘 다 마음에 들었지만 같은 채널의 다음 회차처럼 보이지 않았다. 프롬프트 끝의 “더 사실적으로”를 지우고, 승인받은 첫 장에서 **어떤 요소를 유지할지** 적기 시작했다.

**한 줄 요약.** 스타일 레퍼런스와 비율을 유지한 채 대상만 바꿔야, 시리즈에서 무엇이 맞고 무엇이 어긋나는지 판단하기 쉽다.

## 첫 장에서 고정할 것을 세 가지 적는다

나래가 고른 기준은 남색 배경, 부드러운 측광, 왼쪽 제목 여백이었다. [Midjourney 스타일 레퍼런스 공식 안내](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference)에 따르면 스타일 참조는 색감이나 질감 같은 시각적 인상을 가이드한다. 대상이나 배치도 그대로 유지하려면 프롬프트와 화면 비율에서 따로 지정하고 결과를 확인한다.

<figure class="editorial-figure" data-editorial-figure>
<svg viewBox="0 0 420 158" role="img" aria-label="조명과 카메라 썸네일의 오른쪽에 각각 다른 물체가 있고, 왼쪽 제목 여백과 빛 방향은 같다.">
<path class="editorial-rule" d="M8 115V13h190v102z M222 115V13h190v102z M88 13v102 M302 13v102" stroke-dasharray="3 4"/>
<path class="editorial-accent" fill="none" d="m163 23 23 21m-23-7 23 21m191-35 23 21m-23-7 23 21"/>
<path class="editorial-ink" d="M117 68h48l-9-22h-30z M141 68v28m-19 0h38 M334 70h48v26h-48z m7 0v-7h13v7 m-6 12a8 8 0 1 0 16 0a8 8 0 1 0-16 0"/>
<text x="8" y="146">탁상 조명</text><text x="222" y="146">카메라</text>
</svg>
<figcaption>대상이 달라도 제목 여백과 빛 방향은 같다. 썸네일을 나란히 놓으면 고정한 조건이 유지됐는지 보인다.</figcaption>
</figure>

## 같은 설정으로 다른 대상을 한 번씩 돌린다

1. 사용 권한이 있는 참조 이미지 한 장을 선택한다. 웹에서는 스타일 참조 슬롯을, 이미지 주소를 쓰는 환경에서는 스타일 참조 옵션을 확인한다.
2. 썸네일을 만들 화면 비율과 제목이 들어갈 여백을 고정한다.
3. 제품명만 바꾼 뒤 두 장을 작은 크기로 나란히 본다. 색·빛 방향·여백 중 어긋난 것이 있으면 한 항목씩 수정한다.

> Desk lamp on the right, open space for a title on the left, soft side light, dark navy background, no text. [스타일 참조와 16:9 비율을 같은 값으로 지정]

텍스트는 이미지 생성 단계에서 굽기보다 편집기에서 넣으면 회차마다 위치와 가독성을 쉽게 맞출 수 있다. 같은 시드를 쓰더라도 모델, 설정, 입력이 달라지면 결과는 달라질 수 있다. 납품할 때는 원본 레퍼런스의 사용 권한도 확인한다.

나래는 두 장을 축소한 뒤 금빛을 걷어 낸 버전을 골랐다. 승인받은 참조 이미지와 배치 조건을 남겨 다음 회차도 같은 기준으로 비교할 수 있게 했다.

## 이어 읽기

- [프롬프트·컨텍스트 주제 모음](/blog/topics/prompting/)에서 바꿀 변수와 고정할 조건을 표현하는 법을 확인하세요.
- [Runway 이미지 투 비디오로 첫 컷 만들기](/blog/ai-tools-general/runway-gen-video-overview/)에서 같은 정지 화면을 움직임으로 확장해 보세요.
- [도구·리뷰 주제 모음](/blog/topics/tools/)에서 다른 이미지·영상 도구를 비교해 보세요.
