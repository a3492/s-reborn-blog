---
title: "Codex CLI 설치 방법은? 뭐가 필요한가요?"
date: "2026-04-05"
category: "faq"
draft: false
tags: ["FAQ", "Codex", "OpenAI", "설치", "cl2604021900"]
description: "Codex CLI 설치에 필요한 것들, Node.js·OpenAI API 키 준비 방법, 첫 실행까지"
read_time: 4
difficulty: "beginner"
type: "faq"
---

## 한줄 요약
Codex CLI 설치에는 Node.js(22 이상)와 OpenAI API 키가 필요하다. npm으로 설치하며, Claude Code 설치와 거의 동일한 과정이다.

## Q: Codex CLI 설치 방법은? 뭐가 필요한가요?

## A: 간단 답변
Node.js와 OpenAI API 키 두 가지만 있으면 된다. npm 명령어 하나로 설치되고, 환경변수에 API 키를 넣으면 바로 쓸 수 있다.

## 상세 설명

### 준비물

| 항목 | 필요 버전/조건 | 무료 여부 |
|------|---------------|-----------|
| Node.js | 22 이상 | 무료 |
| npm | Node.js에 포함 | 무료 |
| OpenAI API 키 | platform.openai.com에서 발급 | 유료 (사용량 기반) |
| 운영체제 | Mac, Linux, Windows WSL | — |

### 설치 순서

1단계: Node.js 설치

nodejs.org에서 LTS 버전(22 이상)을 받아서 설치한다.

```
node --version
# v22.x.x 가 나오면 성공
```

2단계: Codex CLI 설치

```
npm install -g @openai/codex
```

설치 확인:

```
codex --version
```

3단계: OpenAI API 키 발급

platform.openai.com → API Keys → Create new secret key

발급된 키를 환경변수에 설정한다.

Mac/Linux:
```
export OPENAI_API_KEY=sk-proj-여기에키입력
```

Windows (PowerShell):
```
$env:OPENAI_API_KEY="sk-proj-여기에키입력"
```

4단계: 첫 실행

```
cd 내프로젝트폴더
codex
```

또는 바로 명령어 전달:

```
codex "이 파일에서 TODO 주석을 모두 찾아줘"
```

### Claude Code 설치와의 차이

| 항목 | Codex CLI | Claude Code |
|------|-----------|-------------|
| 설치 명령 | `npm install -g @openai/codex` | `npm install -g @anthropic-ai/claude-code` |
| 실행 명령 | `codex` | `claude` |
| API 키 변수 | `OPENAI_API_KEY` | `ANTHROPIC_API_KEY` |
| 필요 Node.js | 22+ | 18+ |
| API 키 발급처 | platform.openai.com | console.anthropic.com |

설치 과정이 거의 동일하다. 둘 다 써보고 싶다면 둘 다 설치해도 된다. API 키만 다르다.

### ChatGPT Plus 구독이 있어도 API 키가 필요한가

그렇다. ChatGPT 웹사이트 구독(ChatGPT Plus, $20/월)과 OpenAI API는 별도 결제 시스템이다. Codex CLI는 API를 통해 동작하므로 platform.openai.com에서 별도로 API 키를 발급하고 크레딧을 충전해야 한다.

### 무료 크레딧

신규 OpenAI API 계정에는 일정 기간 무료 크레딧이 제공될 수 있다. 가입 시 확인해보자. 크레딧이 있으면 별도 충전 없이 먼저 써볼 수 있다.

## 핵심 정리
- Node.js 22+ + OpenAI API 키 준비
- `npm install -g @openai/codex` 한 줄로 설치
- 환경변수 `OPENAI_API_KEY` 설정 후 `codex` 실행
- ChatGPT Plus 구독 ≠ API 사용 권한 (별도 결제)

## 관련 글
- [Codex가 뭔가요?](/blog/faq/codex-what-is-it) — 설치 전 기본 개념 이해
- [터미널에서 Codex를 어떻게 쓰나요?](/blog/faq/codex-terminal) — 설치 후 첫 사용법
- [Codex 비용은 어떻게 되나요?](/blog/faq/codex-cost) — API 요금 구조

[← FAQ 전체 보기](/blog/category/faq)
