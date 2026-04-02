---
title: "Claude Code가 뭔가요? Claude.ai랑 다른 건가요?"
date: "2026-04-05"
category: "faq"
draft: false
tags: ["FAQ", "ClaudeCode", "입문", "cl2604021900"]
description: "Claude Code와 Claude.ai의 차이, Claude Code가 무엇을 할 수 있는지 입문자를 위한 설명"
read_time: 4
difficulty: "beginner"
type: "faq"
---

## 한줄 요약
Claude Code는 터미널(명령줄)에서 실행하는 AI 코딩 도구다. claude.ai 웹사이트와 달리, 코드 파일을 직접 읽고 수정하고 명령어를 실행할 수 있다.

## Q: Claude Code가 뭔가요? Claude.ai랑 다른 건가요?

## A: 간단 답변
Claude.ai는 웹 브라우저에서 대화하는 챗봇이다. Claude Code는 내 컴퓨터 터미널에 설치해서 쓰는 도구로, 파일을 직접 열고, 코드를 수정하고, 터미널 명령어까지 실행해준다. 같은 Claude AI 모델을 쓰지만 할 수 있는 일이 다르다.

## 상세 설명

### Claude.ai vs Claude Code 비교

| 항목 | Claude.ai | Claude Code |
|------|-----------|-------------|
| 실행 방식 | 웹 브라우저 접속 | 터미널에 설치 |
| 파일 접근 | 직접 불가 (첨부만) | 내 컴퓨터 파일 직접 읽기·수정 |
| 명령어 실행 | 불가 | 터미널 명령어 실행 가능 |
| 코드 수정 | 복사·붙여넣기 필요 | 파일 직접 수정 |
| 비용 | 무료 플랜 있음 | API 사용량 기반 과금 |
| 설치 필요 | 없음 | Node.js + npm 설치 필요 |

### Claude Code가 하는 일

Claude Code는 내 컴퓨터의 특정 프로젝트 폴더 안에서 작동한다. 터미널을 열고 `claude` 명령어를 치면 AI와 대화가 시작된다.

```
$ claude
> 이 프로젝트의 버그를 찾아줘
```

이렇게 입력하면 Claude Code가:
1. 프로젝트 폴더의 파일들을 읽는다
2. 문제를 파악한다
3. 코드를 직접 수정한다
4. 테스트 명령어를 실행해 확인한다

웹 챗봇과 달리, 직접 파일을 열고 수정하는 것이 핵심이다.

### 언제 Claude.ai를 쓰고 언제 Claude Code를 쓰나

**Claude.ai가 더 맞는 경우**
- 글 초안 작성, 번역, 요약
- 아이디어 대화, 설명 듣기
- 코드 개념 이해 (코드 파일 수정 필요 없을 때)

**Claude Code가 더 맞는 경우**
- 실제 코드 파일을 수정해야 할 때
- 버그 수정, 기능 추가, 리팩토링
- 여러 파일에 걸친 변경이 필요할 때
- 터미널 명령어 실행이 필요할 때

### 의사·비개발자도 쓸 수 있나

터미널 사용이 익숙하지 않으면 진입 장벽이 있다. 처음 쓰는 사람이라면 Claude.ai 웹사이트에서 먼저 대화해보고, 파일 직접 수정이 필요해지면 Claude Code를 알아보는 순서가 자연스럽다.

## 핵심 정리
- Claude.ai = 웹 브라우저, 대화 중심
- Claude Code = 터미널, 파일·명령어 직접 조작
- 코딩 작업에 특화되어 있어 개발자가 주 사용자
- 같은 AI 모델이지만 접근 방식이 완전히 다름

## 관련 글
- [Claude Code를 설치하려면 뭐가 필요한가요?](/blog/faq/claude-code-install) — 설치 전 준비사항
- [터미널에서 Claude Code를 어떻게 쓰나요?](/blog/faq/claude-code-terminal) — 첫 실행부터 기본 사용법
- [Claude Code 비용은 어떻게 되나요?](/blog/faq/claude-code-cost) — 무료인지, 얼마나 드는지

[← FAQ 전체 보기](/blog/category/faq)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
