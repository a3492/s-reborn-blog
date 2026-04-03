---
title: "Temperature와 Top-p — AI의 창의성을 조절하는 다이얼"
date: 2026-03-07
category: ai
subcategory: LLM기초
tags: ["Temperature", "Top-p", "파라미터", "AI기초"]
description: "AI 답변이 매번 다른 이유, Temperature 설정으로 일관성과 창의성을 조절하는 법."
thumbnail: ""
draft: false
---

## 한줄 요약
Temperature는 AI의 모험심 조절기다. 낮으면 안전하고 예측 가능한 답, 높으면 다양하고 창의적인 답.

## 본문

### 같은 질문에 왜 매번 다른 답이 나올까

ChatGPT에 같은 질문을 두 번 하면 답이 다르다. 버그가 아니라 의도된 설계다.

LLM은 다음 토큰을 예측할 때 확률 분포를 계산한다.

```
"고혈압 치료의 1차 약제는 ___"

후보 토큰과 확률:
  "ARB"   → 35%
  "ACEi"  → 30%
  "CCB"   → 20%
  "이뇨제" → 10%
  "베타"   → 5%
```

이 확률 중에서 어떤 토큰을 선택할지를 결정하는 게 Temperature다.

### Temperature 이해하기

| Temperature | 동작 | 비유 |
|:-----------:|------|------|
| 0 | 항상 확률 가장 높은 토큰 선택 | 교과서만 읽는 모범생 |
| 0.3 | 높은 확률 위주, 가끔 변화 | 신중한 전공의 |
| 0.7 | 적당히 다양한 선택 | 경험 많은 전문의 (기본값) |
| 1.0 | 확률 분포 그대로 샘플링 | 자유로운 브레인스토밍 |
| 1.5+ | 낮은 확률 토큰도 자주 선택 | 취한 상태의 창작자 |

Temperature = 0일 때:
```
"고혈압 치료의 1차 약제는 ARB"  (항상 같은 답)
```

Temperature = 1.0일 때:
```
1회: "고혈압 치료의 1차 약제는 ARB"
2회: "고혈압 치료의 1차 약제는 CCB"
3회: "고혈압 치료의 1차 약제는 ACEi"
→ 매번 다르지만 모두 합리적
```

Temperature = 1.8일 때:
```
"고혈압 치료의 1차 약제는 비타민C"  (환각 위험 증가)
```

### Top-p (Nucleus Sampling)

Temperature와 함께 쓰이는 또 다른 파라미터가 Top-p다.

Top-p = 0.9라면: 확률 상위 90%에 해당하는 토큰들만 후보로 삼는다.

```
확률 분포:
  ARB(35%) + ACEi(30%) + CCB(20%) = 85%  ← 여기까지 포함
  이뇨제(10%) → 누적 95% ← Top-p=0.9면 제외될 수도
  베타(5%) → 제외
```

Top-p가 낮을수록 "안전한" 답변, 높을수록 다양한 답변이 나온다.

### 의료에서 Temperature 설정 가이드

| 상황 | 추천 Temperature | 추천 Top-p | 이유 |
|------|:----------------:|:----------:|------|
| 약물 용량 확인 | 0 | 1.0 | 정확성 최우선, 변동 불필요 |
| 감별진단 목록 | 0.3 | 0.9 | 다양성 약간 필요, 정확성 중요 |
| SOAP 노트 작성 | 0.5 | 0.95 | 자연스러운 문장 + 정확성 |
| 환자 교육 자료 | 0.7 | 0.95 | 읽기 좋은 자연스러운 문체 |
| 브레인스토밍 | 0.9 | 1.0 | 다양한 아이디어 |
| 블로그 글 작성 | 0.8 | 0.95 | 창의적이면서 일관된 문체 |

원칙: 정확성이 중요하면 낮게, 창의성이 중요하면 높게.

### API에서 설정하는 법

ChatGPT Plus 사용자는 Temperature를 직접 설정할 수 없다 (기본값 사용). 하지만 API를 통해 사용하면 세밀한 조정이 가능하다.

```python
# OpenAI API 예시
response = openai.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "고혈압 1차 약제는?"}],
    temperature=0,      # 정확성 최우선
    top_p=1.0,
)

# Claude API 예시
response = anthropic.messages.create(
    model="claude-3-5-sonnet",
    messages=[{"role": "user", "content": "고혈압 1차 약제는?"}],
    temperature=0,
)
```

### Seed 파라미터 — 재현성 확보

연구 목적으로 "같은 질문에 항상 같은 답"이 필요하다면, `seed` 파라미터를 사용한다.

```python
response = openai.chat.completions.create(
    model="gpt-4",
    messages=[...],
    temperature=0.7,
    seed=42,          # 같은 seed → 같은 결과
)
```

의학 연구에서 AI 분석의 재현성을 보장할 때 필수적이다.

### 자주 하는 실수

1. "Temperature 0이면 무조건 정확하다"

아니다. Temperature 0은 "가장 확률이 높은 답"을 선택할 뿐이다. 학습 데이터가 틀리면 Temperature 0이어도 틀린다. [환각](/blog/ai/ai-hallucination-why-llm-lies/)은 Temperature와 무관하게 발생한다.

2. "Temperature를 높이면 더 똑똑해진다"

아니다. Temperature는 "다양성"을 조절하지, "지능"을 조절하지 않는다. 높이면 오히려 엉뚱한 답이 나올 확률이 올라간다.

3. "Temperature와 Top-p를 동시에 낮추면 안전하다"

보통 둘 중 하나만 조정하는 것을 권장한다. 동시에 극단적으로 설정하면 답변이 지나치게 단조로워진다.

## 핵심 정리
- Temperature = 답변의 다양성/예측 불가능성 조절 (0~2, 기본 0.7~1.0)
- Top-p = 후보 토큰의 범위 조절 (0~1, 기본 0.9~1.0)
- 의학 정보 → 낮은 Temperature, 창작/교육 자료 → 높은 Temperature
- Temperature 0이어도 환각은 발생할 수 있다

---

## 임상 적용

| 작업 | Temperature | 코드/도구 |
|------|:-----------:|-----------|
| 약물 정보 질의 | 0 | API 사용 시 직접 설정 |
| 진료 기록 작성 | 0.3~0.5 | API 사용 시 직접 설정 |
| 교육 자료 생성 | 0.7 | ChatGPT 기본값으로 충분 |
| 아이디어 발굴 | 0.9~1.0 | "다양하게 5가지 제안해 줘" 프롬프트 |

## 관련 글
- [토큰이란 무엇인가 — LLM의 언어 단위 이해하기](/blog/ai/what-is-token-llm/)
- [LLM의 컨텍스트 윈도우, 의사처럼 이해하기](/blog/ai/llm-context-window-explained/)
- [AI 환각 — LLM은 왜 거짓말을 하는가](/blog/ai/ai-hallucination-why-llm-lies/)
- [프롬프트 엔지니어링 기초 — 의사를 위한 실전 가이드](/blog/ai/prompt-engineering-for-doctors/)
