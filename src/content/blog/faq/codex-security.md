---
title: "Codex를 쓸 때 내 코드가 OpenAI에 저장되나요?"
date: "2026-04-05"
category: "faq"
draft: false
tags: ["FAQ", "Codex", "OpenAI", "보안", "개인정보", "cl2604021900"]
description: "Codex CLI 사용 시 코드 전송 여부, OpenAI 데이터 정책, 민감 정보 처리 방법"
read_time: 4
difficulty: "beginner"
type: "faq"
---

## 한줄 요약
Codex가 읽은 파일 내용은 OpenAI API 서버로 전송된다. API 이용 시 모델 학습에 사용되지 않는다고 명시되어 있지만, 비밀번호·환자 데이터·시크릿 키는 절대 포함하지 않아야 한다.

## Q: Codex를 쓸 때 내 코드가 OpenAI에 저장되나요?

## A: 간단 답변
Codex가 파일을 읽으면 그 내용이 OpenAI 서버로 전송된다. API 정책상 학습에는 쓰이지 않지만, 전송된다는 사실 자체는 변하지 않는다. 민감한 정보가 포함된 파일은 넣지 않는 것이 원칙이다.

## 상세 설명

### 데이터 전송 구조

```
[내 컴퓨터 파일] → [Codex가 파일 내용을 읽음]
                 → [OpenAI API 서버로 전송]
                 → [GPT 모델 처리]
                 → [응답 반환]
```

파일을 프롬프트에 포함해서 보내는 방식이다.

### OpenAI API 데이터 정책

**API 사용 시 (기본)**
- API를 통해 전송된 데이터는 모델 학습에 사용하지 않음
- 서버에 일정 기간(30일) 보관 후 삭제
- 콘텐츠 안전 모니터링은 진행될 수 있음

**ChatGPT 웹사이트와 다른 점**
ChatGPT 웹 대화는 기본적으로 학습에 쓰일 수 있다(설정에서 끌 수 있음). Codex CLI는 API를 사용하므로 이 규칙이 다르게 적용된다.

**Enterprise 계약 시**
별도 데이터 보호 계약 체결 가능. 제로 데이터 보존(Zero Data Retention) 옵션도 있다.

### 넣으면 안 되는 것

| 항목 | 이유 |
|------|------|
| `.env` 파일 (API 키, DB 비밀번호) | 유출 시 심각한 피해 |
| 환자 이름·진단명 등 개인정보 | 개인정보보호법 위반 가능 |
| AWS·GCP 인증 파일 | 유출 시 무단 과금 |
| 사내 기밀 알고리즘 | 영업 비밀 유출 |
| 미발표 연구 데이터 | 지적재산 위험 |

### Claude Code와 비교

| 항목 | Codex (OpenAI) | Claude Code (Anthropic) |
|------|----------------|-------------------------|
| 전송 대상 | OpenAI 서버 | Anthropic 서버 |
| 학습 사용 여부 | API 기본: 안 씀 | API 기본: 안 씀 |
| 보관 기간 | ~30일 | 정책에 따름 |
| Enterprise 옵션 | 있음 (ZDR 포함) | 있음 |

둘 다 API를 통한 전송이라는 구조는 동일하다. 회사·기관 수준의 보안이 필요하다면 둘 다 Enterprise 계약이 필요하다.

### Codex 샌드박스와 보안의 관계

Codex의 `--sandbox` 옵션은 코드 실행을 격리된 환경에서 하는 것이다. **데이터 전송 자체를 막는 건 아니다.** 파일 내용은 여전히 OpenAI 서버로 전송된다. 샌드박스는 "코드 실행이 내 시스템을 건드리지 않도록" 하는 것이지, 데이터 프라이버시와는 별개다.

### 실제로 안전하게 쓰는 방법

```
# 나쁜 예 — 민감 파일이 포함된 폴더에서 실행
cd 회사프로젝트
codex "이 프로젝트 전체를 분석해줘"
# → .env, 비밀번호 파일도 전송될 수 있음

# 좋은 예 — 특정 파일만 지정
codex "src/utils.py 파일의 로직을 분석해줘"
```

또는 `.codexignore` 파일을 만들어 제외할 경로를 지정하는 방법도 있다.

## 핵심 정리
- 파일 내용은 OpenAI 서버로 전송됨
- API 기본 정책: 학습에 사용 안 함, 30일 보관
- 샌드박스 = 코드 실행 격리, 데이터 전송 차단 아님
- `.env`·환자 정보·시크릿 키는 절대 포함 금지

## 관련 글
- [Codex CLI 설치 방법은?](/blog/faq/codex-install) — API 키 설정 방법
- [Codex를 언제 쓰면 좋을까요?](/blog/faq/codex-when-to-use) — 적합한 사용 상황
- [Claude Code 보안 FAQ](/blog/faq/claude-code-security) — Anthropic쪽 동일 이슈 비교

[← FAQ 전체 보기](/blog/category/faq)
