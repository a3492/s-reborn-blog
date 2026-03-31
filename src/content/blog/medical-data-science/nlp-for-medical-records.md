---
title: "의무기록 텍스트 분석 — NLP로 비구조화 데이터 다루기"
date: 2026-03-31
category: medical-data-science
description: "이 글을 읽어보세요."
thumbnail: ""
draft: false
---

## 한줄 요약

의무기록의 80%는 텍스트다. 이 데이터를 쓰지 않으면 EMR 데이터의 절반만 활용하는 것이다.

---

## 왜 텍스트가 중요한가

ICD 코드는 단순화된 라벨이다. 실제 임상 정보는 의사 노트에 있다.

- **ICD 코드 J18.9 (폐렴):** 원인균? 중증도? 치료 반응?
- **의사 노트:** "우하엽 폐렴. 혈압 88/60. 패혈증 징후 있음. 광범위 항생제 시작."

패혈증 동반 여부, 중증도 — 이런 정보는 코드에 없고 텍스트에 있다.

---

## 한국어 의료 텍스트 전처리

```python
import re

def clean_medical_text(text: str) -> str:
    # 날짜·시간 제거
    text = re.sub(r'\d{4}[-./]\d{2}[-./]\d{2}', '', text)
    # 반복 공백 정리
    text = re.sub(r'\s+', ' ', text)
    # 특수문자 (의학 기호 일부 유지)
    text = re.sub(r'[^\w\s\-/+%<>()]', '', text)
    return text.strip()

sample = "2024-03-15 외래. HbA1c 8.2%. 인슐린 10U→12U 증량. f/u 3개월."
print(clean_medical_text(sample))
```

주의: 의학 약어는 제거하면 안 된다. `f/u`, `s/p`, `r/o`, `SBP`는 의미 있는 정보다.

---

## KoNLPy — 한국어 형태소 분석

```python
from konlpy.tag import Okt, Kkma

okt = Okt()

text = "당뇨병 환자에서 인슐린 저항성이 증가하였다"
tokens = okt.morphs(text)
print(tokens)
# ['당뇨병', '환자', '에서', '인슐린', '저항성', '이', '증가', '하였다']

nouns = okt.nouns(text)
print(nouns)
# ['당뇨병', '환자', '인슐린', '저항성']
```

의료 텍스트에는 Okt보다 **Kkma**가 의학 용어 분리에 더 좋은 경우가 있다. 두 가지를 비교해서 선택한다.

---

## 의료 개체명 인식 (NER)

의무기록에서 질환명, 약물명, 검사명을 자동으로 추출한다.

```python
from transformers import pipeline

# KoElectra 기반 의료 NER 모델
ner = pipeline(
    "ner",
    model="snunlp/KR-ELECTRA-discriminator",
    tokenizer="snunlp/KR-ELECTRA-discriminator",
    aggregation_strategy="simple"
)

text = "메트포르민 500mg을 하루 두 번 복용 중인 제2형 당뇨 환자"
entities = ner(text)
for e in entities:
    print(f"{e['word']} → {e['entity_group']} ({e['score']:.2f})")
```

---

## 한국 의료 NLP 데이터셋

| 데이터셋 | 기관 | 내용 |
|---------|------|------|
| SNUH-NLP | 서울대병원 | 의무기록 NER 어노테이션 |
| ETRI 의료 | 한국전자통신연구원 | 의료 도메인 말뭉치 |
| NIKL 의료 | 국립국어원 | 의료 용어 표준화 |
| KOSAC | 연세대 | 의료 감정 분석 |

대부분 연구 협약 후 접근 가능. 일부는 AI-hub에서 신청 가능.

---

## GPT-4를 이용한 의무기록 구조화

```python
import openai

def structure_clinical_note(note: str) -> dict:
    prompt = f"""다음 의무기록에서 정보를 추출하여 JSON으로 반환하세요:
- 주요 진단 (diagnosis)
- 현재 약물 (medications: 약물명, 용량)
- 검사 결과 (labs: 항목명, 수치, 단위)
- 다음 방문 계획 (follow_up)

의무기록:
{note}

JSON만 반환:"""

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return response.choices[0].message.content
```

GPT-4는 Few-shot 예시만 주면 비교적 정확하게 구조화한다. 단, 환자 정보 외부 전송 전 익명화 필수.

---

## 한계와 주의사항

- 의학 약어의 다의성: `MS` = Multiple Sclerosis? Mitral Stenosis? Mental Status?
- 부정 표현: "흉통 없음" → NER이 "흉통"을 질환으로 잘못 분류 가능
- 의사마다 다른 표기: "DM", "T2DM", "제2형 당뇨", "인슐린 비의존성 당뇨"
- IRB 필요: 의무기록 텍스트 분석은 반드시 IRB 승인 후

---

## 핵심 정리

- 의무기록의 80%는 텍스트 — NLP 없이는 대부분 데이터를 못 쓴다
- KoNLPy: 한국어 형태소 분석, Okt와 Kkma 비교 사용
- NER: transformers 기반 모델로 질환명·약물명 자동 추출
- GPT-4: Few-shot으로 의무기록 구조화, 익명화 선행 필수
- 부정 표현과 약어 모호성: NLP의 의료 분야 핵심 난제

## 관련 글

- [EMR 데이터 이해하기 — 구조화·비구조화 데이터의 차이](/blog/medical-data-science/emr-data-basics)
- [재현 가능한 연구 — R Markdown과 Quarto로 분석 보고서 만들기](/blog/medical-data-science/reproducible-research)
- [IRB와 AI 연구 — AI를 쓰는 임상 연구에서 동의서를 어떻게 쓸까](/blog/clinical-research/irb-ai-research)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
