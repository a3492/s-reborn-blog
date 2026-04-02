---
title: "Codex CLI 비용은 어떻게 되나요?"
date: "2026-04-05"
category: "faq"
draft: false
tags: ["FAQ", "Codex", "OpenAI", "비용", "API", "cl2604021900"]
description: "Codex CLI OpenAI API 요금 구조, 실제 사용 시 비용 예시, Claude Code·Cursor와 비교"
read_time: 4
difficulty: "beginner"
type: "faq"
---

## 한줄 요약
Codex CLI 자체는 무료 설치지만 OpenAI API 사용량에 따라 비용이 발생한다. GPT-4o 기준으로 가볍게 쓰면 월 $5~10 수준이며, Claude Code API와 비슷하거나 약간 저렴하다.

## Q: Codex CLI 비용은 어떻게 되나요?

## A: 간단 답변
도구 설치는 무료, AI를 쓸 때마다 토큰(글자) 수 기준으로 OpenAI API 비용이 청구된다. ChatGPT Plus 구독과는 별도 과금이다. 처음에 $5~10만 충전해도 충분히 써볼 수 있다.

## 상세 설명

### OpenAI API 요금 (2026년 초 기준)

**GPT-4o (기본 모델)**

| 항목 | 단가 |
|------|------|
| 입력 토큰 | $2.5 / 100만 토큰 |
| 출력 토큰 | $10 / 100만 토큰 |

**o3 (추론 특화 모델)**

| 항목 | 단가 |
|------|------|
| 입력 토큰 | $10 / 100만 토큰 |
| 출력 토큰 | $40 / 100만 토큰 |

추론 모델은 복잡한 문제를 더 잘 풀지만 비용이 4~15배 높다. 일반 코딩 작업에는 GPT-4o가 적합하다.

### 실제 사용 예시로 보는 비용

**버그 수정 1회 (파일 3개 분석 + 수정)**
- 약 5,000~10,000 토큰
- 비용: $0.03~$0.08 (약 40~110원)

**중간 규모 리팩토링 (파일 10개)**
- 약 50,000~100,000 토큰
- 비용: $0.15~$0.40 (약 200~550원)

**하루 집중 개발 (6시간)**
- 약 $2~$8

### 월 사용량 예상

| 사용 패턴 | 월 예상 비용 (GPT-4o) |
|-----------|----------------------|
| 가끔 사용 (주 1~2회) | $3~$5 |
| 매일 가벼운 사용 | $8~$15 |
| 업무용 집중 사용 | $20~$80 |

### Claude Code API와 비교

| 모델 | 입력 | 출력 |
|------|------|------|
| GPT-4o (Codex) | $2.5/Mtok | $10/Mtok |
| Claude Sonnet (Claude Code) | $3/Mtok | $15/Mtok |
| o3 (Codex) | $10/Mtok | $40/Mtok |
| Claude Opus (Claude Code) | $15/Mtok | $75/Mtok |

같은 작업을 할 때 GPT-4o가 Claude Sonnet보다 약간 저렴하다. 하지만 응답 길이(출력 토큰)에 따라 실제 비용이 역전될 수 있다.

### ChatGPT Plus와의 관계

ChatGPT Plus ($20/월)와 OpenAI API는 **완전히 별개**다.

- ChatGPT Plus: chat.openai.com 웹사이트에서 GPT-4o 무제한 사용
- OpenAI API: 개발자용 API, 사용량 기반 과금

Codex CLI는 API를 사용한다. ChatGPT Plus를 구독 중이어도 API 크레딧을 따로 충전해야 한다.

### 비용 관리 방법

**모델 선택**
일반 작업은 GPT-4o, 정말 복잡한 알고리즘에만 o3를 쓰면 비용을 절감할 수 있다.

```
codex --model gpt-4o "코드 리뷰해줘"
codex --model o3 "이 알고리즘의 시간 복잡도를 최적화해줘"
```

**사용량 한도 설정**
platform.openai.com → Usage → Limits에서 월 지출 한도를 설정한다. 한도 초과 시 자동 차단된다.

## 핵심 정리
- GPT-4o 기준 Claude Code보다 약간 저렴
- ChatGPT Plus ≠ API 크레딧 (별도 충전 필요)
- 추론 모델(o3)은 4~15배 비쌈, 일반 작업엔 GPT-4o로 충분
- platform.openai.com에서 지출 한도 설정 가능

## 관련 글
- [Codex와 Claude Code 중 어떤 게 나을까요?](/blog/faq/codex-vs-claude-code) — 비용 포함 전체 비교
- [Codex CLI 설치 방법은?](/blog/faq/codex-install) — API 키 발급 포함 설치 안내
- [Claude Code 비용은?](/blog/faq/claude-code-cost) — Anthropic API 요금 비교

[← FAQ 전체 보기](/blog/category/faq)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
