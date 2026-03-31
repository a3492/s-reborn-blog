---
title: "Claude API 첫 호출 — 10줄 코드로 의료 AI 만들기"
date: 2026-03-31
category: doctor-dev
description: "이 글을 읽어보세요."
thumbnail: ""
draft: false
---

## 한줄 요약

API key 하나와 Python 10줄이면 감별진단 AI가 당신의 컴퓨터에서 돌아간다.

---

## API란 무엇인가

병원 원무과 창구처럼, API는 "요청을 넣으면 응답을 돌려주는 창구"다. Claude API에 환자 증상을 보내면 AI가 분석 결과를 돌려준다. 직접 AI 모델을 학습시킬 필요가 없다.

---

## 1단계: API Key 발급

1. [console.anthropic.com](https://console.anthropic.com) 접속
2. 회원가입 후 "API Keys" → "Create Key"
3. 키를 복사해 안전한 곳에 저장 (한 번만 보임)

---

## 2단계: 패키지 설치

터미널(또는 VS Code 터미널)에서:

```bash
pip install anthropic
```

---

## 3단계: 첫 번째 코드 실행

```python
import anthropic

client = anthropic.Anthropic(api_key="sk-ant-여기에-키-붙여넣기")

message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    messages=[
        {
            "role": "user",
            "content": "감별진단 5가지 제시해줘: 37세 여성, 우하복부 통증, 발열 38.2도"
        }
    ]
)

print(message.content[0].text)
```

실행하면 Claude가 감별진단 목록을 출력한다.

---

## 응답 구조 이해하기

```python
# message 객체의 구조
print(message.model)          # 사용된 모델명
print(message.usage.input_tokens)   # 입력 토큰 수
print(message.usage.output_tokens)  # 출력 토큰 수
print(message.content[0].text)      # 실제 텍스트 응답
```

---

## 토큰 = 비용

토큰은 텍스트의 단위다. 영어 단어 하나가 대략 1토큰, 한국어는 글자당 약 1-2토큰이다. 1,000 input 토큰 + 1,000 output 토큰 처리 비용은 Claude Sonnet 기준 약 $0.005 (약 7원)이다. 짧은 쿼리 수백 건을 돌려도 커피 한 잔 값이 안 된다.

---

## System Prompt 추가 — 전문의 역할 부여

```python
message = client.messages.create(
    model="claude-opus-4-6",
    max_tokens=1024,
    system="""당신은 10년 경력의 응급의학과 전문의입니다.
환자 증상을 듣고 감별진단을 가능성 높은 순서대로 제시하고,
각각에 대해 필요한 추가 검사를 함께 제안해주세요.
답변은 항상 한국어로 작성하세요.""",
    messages=[
        {
            "role": "user",
            "content": "37세 여성, 우하복부 통증 12시간, 발열 38.2도, WBC 13,500"
        }
    ]
)

print(message.content[0].text)
```

System prompt는 AI의 역할과 행동 방식을 고정한다. 진료과, 응답 형식, 언어를 지정할 수 있다.

---

## 모델 선택 기준

| 모델 | 특징 | 추천 용도 |
|------|------|-----------|
| `claude-opus-4-6` | 가장 강력, 비용 높음 | 복잡한 감별진단, 논문 요약 |
| `claude-sonnet-4-5` | 균형, 권장 | 대부분의 의료 쿼리 |
| `claude-haiku-3-5` | 빠르고 저렴 | 단순 분류, 대량 처리 |

---

## API Key 보안 처리

키를 코드에 직접 쓰지 말고 환경 변수로 관리한다.

```python
import os
import anthropic

# 터미널에서: export ANTHROPIC_API_KEY="sk-ant-..."
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
```

---

## 핵심 정리

- API = 원무과 창구, 요청을 넣으면 응답이 나온다
- `pip install anthropic` 한 줄로 SDK 설치 완료
- `system` 파라미터로 전문의 역할을 부여하면 답변 품질이 크게 올라간다
- 토큰은 비용 단위 — 일상적 사용은 매우 저렴하다
- API key는 절대 코드에 하드코딩하지 말 것, 환경 변수로 관리

## 관련 글

- [Python 기초 — 의사를 위한 첫 번째 코딩 수업](/blog/doctor-dev/python-basics-for-doctors)
- [Python으로 프롬프트 엔지니어링 — 반복 작업 자동화](/blog/doctor-dev/prompt-engineering-python)
- [Streamlit으로 의료 도구 만들기 — 코딩 없이 UI 구현](/blog/doctor-dev/streamlit-medical-tool)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
