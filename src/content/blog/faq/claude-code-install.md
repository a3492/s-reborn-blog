---
title: "Claude Code를 설치하려면 뭐가 필요한가요?"
date: "2026-04-05"
category: "faq"
draft: false
tags: ["FAQ", "ClaudeCode", "설치", "cl2604021900"]
description: "Claude Code 설치에 필요한 것들, Node.js·npm·API 키 준비 방법, Windows·Mac 설치 과정"
read_time: 5
difficulty: "beginner"
type: "faq"
---

## 한줄 요약
Claude Code 설치에는 Node.js(18 이상)와 Anthropic API 키가 필요하다. npm으로 설치하며, 5분 안에 실행할 수 있다.

## Q: Claude Code를 설치하려면 뭐가 필요한가요?

## A: 간단 답변
세 가지가 필요하다. Node.js(자바스크립트 실행 환경), Anthropic API 키(Claude를 사용하기 위한 열쇠), 그리고 터미널을 열고 명령어를 입력할 의지. 세 번째가 제일 중요하다.

## 상세 설명

### 준비물 목록

| 항목 | 필요 버전/조건 | 무료 여부 |
|------|---------------|-----------|
| Node.js | 18 이상 | 무료 |
| npm | Node.js에 포함 | 무료 |
| Anthropic API 키 | anthropic.com에서 발급 | 유료 (사용량 기반) |
| 운영체제 | Mac, Linux, Windows WSL | — |

### 설치 순서

**1단계: Node.js 설치**

nodejs.org에서 LTS 버전을 받아서 설치한다. 설치 후 터미널에서 확인한다.

```
node --version
# v20.x.x 같은 숫자가 나오면 성공
```

**2단계: Claude Code 설치**

```
npm install -g @anthropic-ai/claude-code
```

설치 후:

```
claude --version
```

버전 번호가 나오면 설치 완료다.

**3단계: API 키 설정**

anthropic.com → Console → API Keys에서 키를 발급받는다. 그 다음 터미널에 환경변수로 설정한다.

Mac/Linux:
```
export ANTHROPIC_API_KEY=sk-ant-여기에키입력
```

Windows (PowerShell):
```
$env:ANTHROPIC_API_KEY="sk-ant-여기에키입력"
```

**4단계: 실행**

코드 프로젝트 폴더로 이동한 후:

```
claude
```

이렇게만 치면 Claude와 대화가 시작된다.

### Windows에서 주의할 점

Claude Code는 Windows 네이티브 CMD나 PowerShell보다 **WSL(Windows Subsystem for Linux)**에서 더 안정적으로 동작한다. Windows를 쓴다면 WSL 설치 후 Ubuntu 환경에서 사용하는 것을 권장한다.

WSL 설치: PowerShell에서 `wsl --install` 입력 후 재시작.

### API 키 발급 비용

API 키 자체는 무료로 발급된다. 비용은 Claude와 대화할 때 사용한 토큰(글자 수) 기준으로 청구된다. 처음에는 소액($5~10)만 충전해도 꽤 오래 쓸 수 있다.

## 핵심 정리
- Node.js 18+ + API 키 두 가지가 핵심
- `npm install -g @anthropic-ai/claude-code`로 설치
- Windows는 WSL 환경 권장
- API 키는 anthropic.com Console에서 무료 발급, 사용량 기반 과금

## 관련 글
- [Claude Code가 뭔가요?](/blog/faq/claude-code-what-is-it) — Claude.ai와의 차이부터 이해하기
- [터미널에서 Claude Code를 어떻게 쓰나요?](/blog/faq/claude-code-terminal) — 설치 후 첫 사용법
- [Claude Code 비용은 어떻게 되나요?](/blog/faq/claude-code-cost) — API 요금 구조 자세히 보기

[← FAQ 전체 보기](/blog/category/faq)
