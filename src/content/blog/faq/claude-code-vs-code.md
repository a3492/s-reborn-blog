---
title: "VS Code에서 Claude Code를 쓰려면 어떻게 하나요?"
date: "2026-04-05"
category: "faq"
draft: false
tags: ["FAQ", "ClaudeCode", "VSCode", "IDE", "cl2604021900"]
description: "VS Code에서 Claude Code를 연동하는 방법, 터미널 패널 활용, 에디터 안에서 AI와 협업하는 방식"
read_time: 5
difficulty: "beginner"
type: "faq"
---

## 한줄 요약
VS Code의 내장 터미널 패널에서 `claude`를 실행하면 된다. 별도의 플러그인 없이도 에디터에서 파일을 보면서 Claude Code와 동시에 작업할 수 있다.

## Q: VS Code에서 Claude Code를 쓰려면 어떻게 하나요?

## A: 간단 답변
VS Code 자체에 Claude Code 전용 버튼은 없다. 대신 VS Code 하단의 터미널 패널(Terminal)을 열어서 거기에 `claude`를 입력하면 된다. 왼쪽에 파일을, 오른쪽 터미널에 Claude Code를 띄워놓고 함께 작업한다.

## 상세 설명

### VS Code에서 Claude Code 실행하기

**1단계: 터미널 패널 열기**

VS Code 상단 메뉴에서 `Terminal → New Terminal`을 클릭하거나, 단축키 `` Ctrl + ` `` (백틱)을 누른다. 화면 하단에 터미널 패널이 열린다.

**2단계: 프로젝트 폴더 확인**

VS Code에서 폴더를 열면 터미널도 자동으로 그 폴더에서 시작된다. 확인:

```
pwd
# /Users/이름/내프로젝트 — VS Code에서 연 폴더와 같아야 함
```

**3단계: Claude Code 실행**

```
claude
```

이렇게만 입력하면 된다.

### 실용적인 작업 방식

```
[VS Code 화면 구성]
┌──────────────────┬──────────────────┐
│   파일 탐색기     │   코드 에디터     │
│                  │                  │
│  - app.py        │  def hello():    │
│  - utils.py      │      pass        │
│  - test.py       │                  │
├──────────────────┴──────────────────┤
│  터미널 패널                          │
│  > claude                            │
│  > 이 함수의 테스트 코드를 작성해줘   │
└─────────────────────────────────────┘
```

Claude Code가 파일을 수정하면, VS Code 에디터 화면에 변경 내용이 즉시 반영된다. 에디터에서 결과를 보면서 추가 수정을 요청할 수 있다.

### VS Code Extension과의 차이

VS Code Marketplace에는 Claude 관련 확장이 있다. 공식 Anthropic의 Claude Code Extension과 서드파티 확장들이 있다.

| 방식 | 특징 | 추천 상황 |
|------|------|-----------|
| 터미널에서 `claude` | 공식 Claude Code 전체 기능 사용 | 코드 전반 수정, 복잡한 작업 |
| VS Code Extension | 에디터 UI에 통합, 클릭 기반 | 간단한 코드 설명, 자동완성 보조 |

복잡한 코딩 작업은 터미널의 Claude Code가, 간단한 인라인 도움말은 Extension이 적합하다.

### 유용한 VS Code 단축키

터미널과 에디터를 오가며 쓸 때 유용한 단축키:

- `` Ctrl + ` `` : 터미널 패널 열기/닫기
- `Ctrl + \` : 터미널 분할 (여러 터미널 동시에)
- `Ctrl + P` : 파일 빠른 검색
- `Ctrl + Shift + E` : 파일 탐색기 포커스

## 핵심 정리
- VS Code 내장 터미널에서 `claude` 입력으로 바로 사용
- 별도 플러그인 없어도 동작
- 파일 에디터와 Claude Code 터미널을 동시에 보면서 작업
- VS Code Extension은 인라인 도움말 용도로 병행 가능

## 관련 글
- [터미널에서 Claude Code를 어떻게 쓰나요?](/blog/faq/claude-code-terminal) — CLI 기본 사용법 먼저 익히기
- [Cursor와 Claude Code는 어떻게 다른가요?](/blog/faq/claude-code-cursor) — Cursor를 쓰면 더 편할 수 있음
- [CLI와 IDE 연동 중 어떤 게 좋을까요?](/blog/faq/claude-code-cli-vs-ide) — 어떤 방식이 내 상황에 맞는지

[← FAQ 전체 보기](/blog/category/faq)
