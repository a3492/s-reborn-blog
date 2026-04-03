---
title: "터미널에서 Claude Code를 어떻게 쓰나요?"
date: "2026-04-05"
category: "faq"
draft: false
tags: ["FAQ", "ClaudeCode", "터미널", "CLI", "cl2604021900"]
description: "Claude Code CLI의 기본 사용법, 자주 쓰는 명령어, 터미널 초보자도 이해할 수 있는 설명"
read_time: 5
difficulty: "beginner"
type: "faq"
---

## 한줄 요약
터미널에서 프로젝트 폴더로 이동한 뒤 `claude`를 입력하면 시작된다. 그 다음은 Claude.ai와 대화하듯 한국어로 무엇을 해달라고 말하면 된다.

## Q: 터미널에서 Claude Code를 어떻게 쓰나요?

## A: 간단 답변
`claude` 명령어 하나로 시작한다. 실행하면 대화 화면이 열리고, 원하는 작업을 자연어로 입력하면 Claude가 파일을 직접 읽고 수정해준다. 매번 파일 내용을 복사해서 붙여넣을 필요가 없다.

## 상세 설명

### 기본 사용 흐름

```
# 1. 작업할 프로젝트 폴더로 이동
cd /Users/이름/프로젝트폴더

# 2. Claude Code 실행
claude

# 3. 대화 화면에서 작업 요청
> 이 폴더에 있는 파일 구조를 파악하고 README.md를 작성해줘
```

Claude가 폴더 안의 파일들을 읽고, 분석한 뒤, README.md를 만들어준다.

### 자주 쓰는 실행 방법

**대화 모드 (기본)**
```
claude
```
터미널 안에 대화 인터페이스가 열린다. 여러 번 주고받을 수 있다.

**한 번만 실행하고 끝내기**
```
claude -p "이 코드의 버그를 찾아줘"
```
단발성 질문에 쓴다. 대화 없이 결과만 출력하고 종료된다.

**특정 파일을 직접 넘기기**
```
claude "이 파일을 분석해줘" < main.py
```

### 터미널 초보자를 위한 설명

"터미널"이 낯설다면: Mac은 Spotlight에서 "터미널"을 검색해 열면 된다. Windows는 WSL Ubuntu를 쓴다.

폴더 이동은 `cd 폴더이름` 이다. 현재 위치 확인은 `pwd`다.

```
pwd
# /Users/이름/Desktop 같은 경로가 나옴

cd Desktop/내프로젝트
pwd
# /Users/이름/Desktop/내프로젝트
```

여기서 `claude`를 치면 이 폴더 기준으로 Claude Code가 작동한다.

### Claude Code가 실행되면 뭘 볼 수 있나

```
╭─────────────────────────────╮
│ Claude Code v1.x.x          │
│ 현재 폴더: /Users/이름/프로젝트 │
╰─────────────────────────────╯

>
```

이 `>` 프롬프트에 원하는 작업을 입력한다.

**실제 요청 예시**
- `이 프로젝트에 어떤 파일들이 있어?`
- `app.py에서 오류가 나고 있어. 원인 찾아줘`
- `함수명을 모두 영어에서 한국어로 바꿔줘`
- `테스트 코드 작성해줘`

### 종료 방법

`/exit` 입력하거나 `Ctrl + C`를 누르면 종료된다.

## 핵심 정리
- 프로젝트 폴더에서 `claude` 입력으로 시작
- 한국어로 자연스럽게 작업 요청 가능
- `-p "질문"` 옵션으로 단발성 실행 가능
- `/exit` 또는 `Ctrl+C`로 종료

## 관련 글
- [Claude Code를 설치하려면 뭐가 필요한가요?](/blog/faq/claude-code-install) — 아직 설치 전이라면 여기서 시작
- [VS Code에서 Claude Code를 쓰려면?](/blog/faq/claude-code-vs-code) — 터미널 없이 에디터 안에서 쓰는 방법
- [CLI와 IDE 연동 중 어떤 게 좋을까요?](/blog/faq/claude-code-cli-vs-ide) — 두 방식의 장단점 비교

[← FAQ 전체 보기](/blog/category/faq)
