---
title: "세 번째 프롬프트에서 웃는 사람 — Lyria 3 Pro로 '곡의 뼈대'까지 말해 보기"
date: 2026-04-01
category: "ai-tools-general"
subcategory: "도구소개"
thumbnail: ""
draft: false
tags: ["cu", "Lyria", "Google", "Gemini", "음악생성", "DeepMind"]
description: "Google DeepMind가 2026년 3월 공개한 Lyria 3 Pro의 3분 길이·구조 프롬프팅 전략, Gemini·Vids·API 등 제품별 진입 경로, Suno와의 차이를 크리에이터 시선에서 풀었다."
read_time: 14
difficulty: "beginner"
type: "guide"
key_takeaways:
  - "Lyria 3 Pro는 인트로·벌스·코러스·브릿지 같은 구조를 프롬프트에 실을 수 있다. '분위기만'보다 '이 구간에서 킥이 들어온다'가 더 구체적인 결과를 만든다."
  - "Gemini 앱·Google Vids·ProducerAI·Vertex AI·AI Studio·Gemini API 중 어디서 쓸지를 먼저 정하고, 그날의 플랜·약관·국가별 제공 여부를 확인한다."
  - "태그 cu: Cursor 초안 — 약관·정책·국가별 제공은 공식 문서와 대조해 보강할 것."
---

어떤 날은 음악이 필요한 게 아니라 시간이 필요하다. 90초짜리 브랜드 필름에 깔릴 트랙을 고르는데, 스톡은 분위기가 맞아도 길이가 어정쩡하고, 잘린 부분에서 루프 이음새가 들린다. 그 틈을 채우려고 두 시간을 쓰다 보면, 음악을 고른 게 아니라 편집 시간을 낭비한 것이다.

Lyria 3 Pro는 그 문제를 다른 각도에서 건드린다. Google DeepMind가 2026년 3월 공개한 상위 음악 생성 모델로, 공식 설명의 핵심은 두 가지다. 최대 약 3분 길이의 트랙을 만들 수 있고, 인트로·벌스·코러스·브릿지처럼 구조를 프롬프트에 실을 수 있다는 것이다. ([Lyria 3 Pro 발표, The Keyword](https://blog.google/innovation-and-ai/technology/ai/lyria-3-pro))

30초짜리 루프에서 벗어나 한 번의 상승과 하강이 있는 곡을 만든다는 발상이다.

## 왜 3분이 이야기가 되나

음악 생성 도구를 처음 쓸 때 가장 흔한 착각은 "한 방에 완성곡"이다. 현실은 이렇다. 첫 결과는 의도의 60%, 두 번째는 70%, 세 번째에서 "아, 이거다"가 나온다. 세 번 돌리는 동안 트랙 길이가 30초라면, 들을 것도 없고 방향도 안 잡힌다.

12분 강의 영상이라면 BGM은 배경에 깔리는 소음이다. 하지만 90초짜리 브랜드 필름이라면 음악이 내레이션과 밀고 당기는 상대가 된다. 이때 20초 루프는 세 번째 반복부터 지루함이 느껴진다. 3분짜리는 한 번의 상승과 하강을 가질 여지를 준다. 편집자 입장에서 "여기서 킥이 들어오면 좋겠는데"라는 말이 가능한 음악이다.

## 구조를 프롬프트에 싣는 방법

"잔잔하게"라는 프롬프트와 "인트로는 기타만, 코러스에서 드럼이 들어오고, 브릿지에서 보컬을 빼"는 프롬프트의 결과는 다르다.

Lyria 3 Pro가 강조하는 구조 프롬프팅은 이런 식으로 쓸 수 있다.

- "intro: acoustic guitar only, no percussion"
- "verse: add soft piano, keep tempo around 90 BPM"
- "chorus: full band, kick drum enters"
- "bridge: strip back to piano, build tension"
- "outro: fade with guitar"

이게 한 번에 완벽히 나오는지는 실험과 반복의 영역이다. 도구는 대개 그렇다. 하지만 방향이 잡힌 프롬프트는 세 번째 시도에서 "이건 쓸 수 있겠다"는 구간이 나올 가능성이 높아진다.

## Google 생태계 안에서 어디서 쓰나

Lyria 3 Pro는 단독 앱이 아니라 여러 제품 안에 들어간다. 공식 안내 기준으로 정리하면 이렇다. ([Lyria 3 Pro](https://blog.google/innovation-and-ai/technology/ai/lyria-3-pro), [개발자 안내](https://blog.google/innovation-and-ai/technology/developers-tools/lyria-3-developers))

- Gemini 앱 — 유료 구독자부터 3분 생성 가능
- Google Vids — 영상 편집 중 음악 생성, Workspace·AI Pro/Ultra 대상 단계적 롤아웃
- ProducerAI — 작곡·프로듀싱 워크플로 연동, 무료·유료 모두 글로벌 제공
- Vertex AI — 기업용 퍼블릭 프리뷰, 대규모 배치 생성
- Google AI Studio / Gemini API — 개발자용, Lyria RealTime과 함께 제공

"Lyria를 쓰고 싶다"는 말보다 "나는 어디에서 음악이 필요한가"를 먼저 정하면 진입점이 보인다.

## Suno와 나란히 둘 때

둘 다 "텍스트로 음악"이지만 맥락이 다르다.

Suno는 독립 서비스로, 계정을 만들고 바로 쓸 수 있다. 크리에이터가 빠르게 실험하고 커뮤니티에서 공유하는 문화가 강하다. Lyria 3 Pro는 Google 계정·구독·Workspace·API라는 울타리 안에서 작동한다. 개인보다는 조직, 단발성보다는 파이프라인에 녹이는 쪽이 자연스럽다.

- 오늘 밤 쇼츠 BGM 세 개 뽑아야 한다 → 독립 서비스, 반복 실험 감각
- 광고 캠페인 음악을 API로 자동화하고 싶다 → Google 생태계, 기업 정책 확인

"더 좋다"보다 어디 무대에서 쓸지가 먼저다.

## SynthID와 아티스트 모방 회피

Google은 Lyria 3 계열에 대해 몇 가지를 공식적으로 반복한다. 모든 출력물에 SynthID 워터마크가 삽입되고, 특정 아티스트 이름을 넣으면 그 아티스트를 흉내 내는 게 아니라 넓은 영감으로만 처리한다고 한다. 상업 사용 전에 그날의 플랜·국가·제품별 약관을 확인하는 것은 어느 도구나 마찬가지다.

## 끝맺음 — 세 번째 프롬프트에서 웃는 사람

Lyria 3 Pro를 한 줄로 요약하면 이렇다. 음악을 짧게 샘플링하지 말고, 한 번 호흡으로 들려 보자.

3분은 도발적이다. 루프 세 개를 이어붙인 것과 한 번의 상승 곡선은 청자의 귀에 다르게 닿는다. 구조를 프롬프트에 실을 수 있다는 건, 기획서에 "00:45 코러스 진입"이라는 메모를 써 놓고 그걸 실제로 요청할 수 있다는 뜻이기도 하다.

첫 결과에 연애하지 말고, 길이·구조·악기 밀도를 한 칸씩만 바꿔서 세 번 굴린 뒤, 네 번째에서 "이건 내 영상이다"라고 말하게 만들기.

*편집 초안(cu). 약관·요금·국가별 제공·라이선스는 올린 날짜에 맞춰 공식 문서로 직접 확인.*
