---
title: "터미널에서 Codex를 어떻게 쓰나요?"
date: "2026-04-05"
category: "faq"
draft: false
tags: ["FAQ", "Codex", "OpenAI", "터미널", "CLI", "cl2604021900"]
description: "Codex CLI 기본 사용법, 승인 모드, 자주 쓰는 옵션, Claude Code와의 사용 방식 비교"
read_time: 5
difficulty: "beginner"
type: "faq"
---

## 한줄 요약
프로젝트 폴더에서 `codex "원하는 작업"`을 입력하면 된다. Codex는 작업을 실행하기 전 사용자에게 승인을 요청하는 방식이 기본이며, 이 점이 Claude Code와 다르다.

## Q: 터미널에서 Codex를 어떻게 쓰나요?

## A: 간단 답변
`codex "할 일"`처럼 큰따옴표 안에 작업을 넣어 실행한다. 대화 없이 단발로 실행할 수 있고, 파일을 수정하거나 명령어를 실행하기 전에 항상 승인 여부를 물어봐 안전하다.

## 상세 설명

### 기본 실행 방법

```
# 프로젝트 폴더로 이동
cd 내프로젝트폴더

# 작업 지시
codex "이 코드에서 사용하지 않는 변수를 찾아줘"
```

Claude Code가 `claude`를 먼저 입력하고 대화 화면에서 요청하는 방식이라면, Codex는 실행 시 바로 작업을 전달한다.

### 승인 모드 (Approval Flow)

Codex의 특징은 파일 수정이나 명령어 실행 전에 사용자에게 확인을 받는다는 점이다.

```
Codex가 분석 중...
> 다음 작업을 수행할까요?
  1. utils.py 라인 42 수정
  2. tests/test_utils.py에 테스트 추가

[y] 모두 승인  [n] 거절  [d] 세부 확인
```

이 방식은 AI가 무언가를 실수로 망가뜨릴 가능성을 줄여준다. 처음 쓰는 사람에게는 안심이 된다.

### 승인 모드 옵션

| 옵션 | 설명 |
|------|------|
| `--approval-mode suggest` | 제안만 하고 실행 안 함 (기본값) |
| `--approval-mode auto-edit` | 파일 수정은 자동, 명령어 실행은 승인 |
| `--approval-mode full-auto` | 모두 자동 실행 (주의 필요) |

가볍게 써볼 때는 기본(suggest)이나 auto-edit, 신뢰하는 환경에서는 full-auto.

### 자주 쓰는 사용 패턴

버그 수정
```
codex "app.py를 실행하면 KeyError가 나는데 원인 찾고 수정해줘"
```

코드 설명
```
codex "이 프로젝트 구조를 설명해줘"
```

테스트 작성
```
codex "calculator.py의 모든 함수에 대해 pytest 테스트를 작성해줘"
```

리팩토링
```
codex "이 파일의 중복 코드를 함수로 분리해줘"
```

### 대화 모드

단발 명령 외에 대화 모드도 지원한다.

```
codex
# 대화 화면 진입
> 이 프로젝트에 어떤 파일들이 있어?
> 그 중 가장 복잡한 파일을 수정해줘
```

Claude Code와 동일하게 여러 번 주고받을 수 있다.

### Claude Code 사용법과 비교

| 항목 | Codex CLI | Claude Code |
|------|-----------|-------------|
| 기본 실행 | `codex "작업"` | `claude` 후 대화 |
| 승인 방식 | 단계별 승인 UI | 파일 수정 전 확인 |
| 안전 기본값 | suggest 모드 (더 보수적) | 기본 실행 |
| 샌드박스 실행 | 지원 | 미지원 |

## 핵심 정리
- `codex "할 일"` 형태로 바로 실행
- 기본적으로 파일 수정·명령어 실행 전 승인 요청
- `--approval-mode`로 자동화 수준 조절 가능
- 대화 모드(`codex` 단독 실행)도 지원

## 관련 글
- [Codex CLI 설치 방법은?](/blog/faq/codex-install) — 아직 설치 전이라면
- [Codex와 Claude Code 중 어떤 게 나을까요?](/blog/faq/codex-vs-claude-code) — 두 도구 실제 차이
- [Codex 비용은 어떻게 되나요?](/blog/faq/codex-cost) — 얼마나 드는지

[← FAQ 전체 보기](/blog/category/faq)
