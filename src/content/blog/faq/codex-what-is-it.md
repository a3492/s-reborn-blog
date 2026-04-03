---
title: "OpenAI Codex가 뭔가요? Claude Code랑 다른 건가요?"
date: "2026-04-05"
category: "faq"
draft: false
tags: ["FAQ", "Codex", "OpenAI", "입문", "cl2604021900"]
description: "OpenAI Codex CLI와 Claude Code의 차이, Codex가 무엇을 할 수 있는지 입문자를 위한 설명"
read_time: 4
difficulty: "beginner"
type: "faq"
---

## 한줄 요약
OpenAI Codex는 OpenAI가 만든 터미널 기반 AI 코딩 도구다. Claude Code와 비슷하게 파일을 직접 읽고 수정하며 명령어를 실행한다. 둘의 핵심 차이는 사용하는 AI 모델이다 — Codex는 GPT 계열, Claude Code는 Claude 계열.

## Q: OpenAI Codex가 뭔가요? Claude Code랑 다른 건가요?

## A: 간단 답변
Codex CLI는 Claude Code와 동일한 목적의 도구다. 터미널에서 실행하고, 코드 파일을 직접 수정하고, 명령어를 실행한다. 차이는 뒤에서 돌아가는 AI 모델이다. Codex는 OpenAI GPT-4o 계열, Claude Code는 Anthropic Claude 계열을 사용한다.

## 상세 설명

### Codex CLI vs Claude Code 핵심 비교

| 항목 | Codex CLI | Claude Code |
|------|-----------|-------------|
| 제조사 | OpenAI | Anthropic |
| AI 모델 | GPT-4o, o3 등 | Claude Sonnet, Opus 등 |
| 실행 방식 | 터미널 (`codex`) | 터미널 (`claude`) |
| 파일 수정 | 직접 수정 | 직접 수정 |
| 명령어 실행 | 가능 | 가능 |
| 비용 | OpenAI API 사용량 기반 | Anthropic API 사용량 기반 |
| 오픈소스 | 예 (GitHub 공개) | 아니오 |

### Codex의 역사

"Codex"라는 이름은 사실 오래됐다. OpenAI는 2021년에 GitHub Copilot에 탑재된 코드 전용 모델을 "Codex"라고 불렀다. 2025년에 출시된 **Codex CLI**는 터미널 기반 코딩 에이전트로, 이름이 같지만 전혀 다른 제품이다. 현재 일반적으로 "Codex"라고 부를 때는 이 CLI 도구를 의미한다.

### 둘 다 할 수 있는 것

```
# Claude Code
claude
> 이 프로젝트의 버그를 찾아줘

# Codex
codex "이 프로젝트의 버그를 찾아줘"
```

둘 다 같은 방식으로 동작한다. 프로젝트 폴더에서 실행하면 파일을 읽고, 수정하고, 테스트를 돌린다.

### Codex가 Claude Code와 다른 점

**오픈소스**
Codex CLI 코드는 GitHub에 공개되어 있다. 어떻게 동작하는지 직접 볼 수 있다. Claude Code는 소스가 비공개다.

**멀티 모델 지원**
Codex는 기본 모델 외에 OpenAI의 o3, o4-mini 등 추론 특화 모델도 선택할 수 있다.

**샌드박스 보안 모드**
Codex는 코드 실행 시 샌드박스(격리 환경)에서 돌릴 수 있는 옵션이 있다. 테스트 실행이 실제 시스템에 영향을 주지 않도록 격리한다.

### 어떤 걸 선택해야 하나

이미 OpenAI API 키가 있다면 Codex, Anthropic API 키가 있다면 Claude Code가 진입 장벽이 낮다. AI 모델 선호도가 없다면 둘 다 써보고 결과가 더 마음에 드는 쪽을 쓰는 게 현실적이다.

## 핵심 정리
- Codex CLI = OpenAI가 만든 터미널 AI 코딩 도구
- Claude Code와 용도·방식이 동일, AI 모델만 다름
- Codex는 오픈소스, Claude Code는 비공개
- ChatGPT 쓰던 사람은 Codex, Claude 쓰던 사람은 Claude Code가 시작하기 편함

## 관련 글
- [Codex CLI 설치 방법은?](/blog/faq/codex-install) — 설치 준비물과 순서
- [Codex와 Claude Code 중 어떤 게 나을까요?](/blog/faq/codex-vs-claude-code) — 상황별 선택 기준
- [Claude Code가 뭔가요?](/blog/faq/claude-code-what-is-it) — Claude Code 기본 개념 비교

[← FAQ 전체 보기](/blog/category/faq)
