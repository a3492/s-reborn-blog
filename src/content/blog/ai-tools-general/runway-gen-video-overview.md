---
title: "Runway 이미지 투 비디오로 첫 컷 만들기 — 구도와 움직임을 나눠 설계하기"
date: 2026-04-07
updatedDate: 2026-11-22
category: "ai-tools-general"
subcategory: "도구소개"
thumbnail: ""
draft: false
tags: ["Runway", "영상생성", "Gen-3", "편집"]
originIds: ["cu"]
description: "Runway에서 스토리보드 이미지를 첫 프레임으로 삼고, 카메라와 빗방울 움직임을 따로 비교하는 실습입니다."
read_time: 5
difficulty: "beginner"
type: "guide"
key_takeaways:
  - "첫 프레임에서 구도를, 프롬프트에서 움직임을 정한다."
  - "시안을 비교할 때 한 변수만 바꾸고, 생성 옵션별 비용은 실행 전 확인한다."
---

아래 사례는 설명을 위한 가상의 상황입니다.

비 때문에 촬영을 취소한 윤은 Runway에서 젖은 거리의 첫 컷을 만들어 보려 했다. 화면에 가로등이 생겼지만 카메라가 서 있어야 할 자리가 매번 바뀌었다. 편집 타임라인에서 앞 장면과 연결해 보니 한 거리처럼 보이지 않았다. 윤은 프롬프트를 더 길게 쓰는 대신 스토리보드에서 **출발할 프레임 한 장**을 정했다.

**한 줄 요약.** 이미지 투 비디오에서는 첫 프레임으로 구도를 잡고, 프롬프트로 무엇이 어떻게 움직일지 정한다.

<figure class="editorial-figure" data-editorial-figure>
<svg viewBox="0 0 420 164" role="img" aria-label="같은 거리의 첫 프레임과 전진 뒤 프레임을 비교한다. 소실점은 그대로 있고 오른쪽 가로등이 더 크게 잡힌다.">
<path class="editorial-rule" d="M8 116V16h190v100z M222 116V16h190v100z M8 111l93-56 97 56 M222 111l93-56 97 56"/>
<path class="editorial-ink" d="M157 97V51h-15 M377 112V37h-26"/>
<path class="editorial-accent" d="M97 55h8m-4-4v8 M311 55h8m-4-4v8"/>
<text x="8" y="147">첫 프레임</text><text x="222" y="147">카메라 전진 뒤</text>
</svg>
<figcaption>같은 소실점을 향해 이동하면 가까운 가로등이 커진다. 시안에서 가로등의 위치가 갑자기 바뀌는지 확인할 수 있다.</figcaption>
</figure>

## 첫 프레임과 움직임을 따로 적는다

첫 프레임에는 가로등을 오른쪽에, 길의 소실점을 중앙에 뒀다. 움직임은 첫 시안에서 빗방울만, 다음 시안에서 카메라의 전진만 바꿨다. [Runway의 이미지 투 비디오 공식 가이드](https://help.runwayml.com/hc/en-us/articles/48324313115155-Image-to-Video-Prompting-Guide)에도 이미지로 구도와 조명을 잡고, 텍스트로 카메라·피사체·환경의 움직임을 설명하는 예가 있다.

| 시안 | 움직임 프롬프트 | 비교할 것 |
| --- | --- | --- |
| A | Light rain falls. The camera remains still. | 빗방울 움직임과 가로등 위치 |
| B | Light rain falls. The camera slowly moves forward. | 전진이 시작되는 지점과 앞 장면의 연결 |

## 짧게 비교하고 편집에서 결정한다

1. 사용할 수 있는 입력 이미지를 고르고 장면의 시작·끝을 스토리보드에 표시한다.
2. 선택한 모델과 생성 옵션에서 길이·비율·차감 크레딧을 실행 전에 확인한다. 가능한 경우 짧은 시안부터 비교한다.
3. 일시 정지해 프레임 사이에서 배경이나 물체가 변형되는지 확인한다. 사용할 컷만 편집 타임라인에 옮기고 색과 소리의 연결을 확인한다.

윤은 전진하는 시안이 단독으로는 마음에 들었지만, 앞 장면까지 이어 붙여 본 뒤 정지 카메라를 골랐다. 영상 전체의 방향이 기준이 되자 시안의 선택도 쉬워졌다.

## 이어 읽기

- [Midjourney 스타일 레퍼런스로 썸네일 톤 맞추기](/blog/ai-tools-general/midjourney-image-prompt-workflow/)에서 출발 이미지의 시각 조건을 잡아 보세요.
- [Higgsfield로 광고 훅 변형 비교하기](/blog/ai-tools-general/higgsfield-ai-creative-suite/)에서 카메라 움직임만 바꿔 비교하는 방법을 살펴보세요.
- [도구·리뷰 주제 모음](/blog/topics/tools/)에서 다른 영상 도구 글을 확인하세요.
