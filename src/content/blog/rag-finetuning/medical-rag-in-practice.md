---
title: "의료 RAG 실전 — 진료 가이드라인을 AI에 연결하기"
date: 2026-04-01
category: rag-finetuning
tags: ["의료RAG", "진료가이드라인", "병원AI", "RAG실전"]
description: "이론이 아닌 실제 병원에서 RAG를 구축한다면 어떤 과정을 거치는가. 문서 수집부터 응답 생성까지 전체 파이프라인을 그려본다."
read_time: 9
difficulty: "intermediate"
draft: false
thumbnail: ""
---

## 한줄 요약
의료 RAG는 "가이드라인 DB + 벡터 검색 + LLM"의 조합이지만, 실제로는 데이터 준비와 신뢰 설계에 전체 공수의 80%가 들어간다.

## 본문

### 의료 RAG 파이프라인 전체 구조

```
[문서 수집 레이어]
ACC/AHA 가이드라인 PDF
KSSO 진료 지침
병원 내부 프로토콜
약물 상호작용 DB
            ↓
[문서 처리 레이어]
OCR (스캔 PDF 처리)
텍스트 정제
청킹 (섹션 단위)
메타데이터 추출 (출처, 버전, 날짜)
            ↓
[임베딩 레이어]
텍스트 → 벡터 변환
벡터 DB 저장
인덱스 구축
            ↓
[검색 레이어]
질문 → 벡터 변환
유사도 검색
메타데이터 필터 (날짜, 기관, 과)
관련 청크 Top 5 선택
            ↓
[생성 레이어]
청크 + 질문 → 프롬프트 구성
LLM 생성
출처 추적
            ↓
[신뢰 레이어]
출처 문서 링크 표시
신뢰도 점수 계산
면책 문구 자동 추가
이상값 탐지
```

---

### 1단계: 문서 수집과 정제

이게 가장 고통스러운 단계다. 현실의 의료 문서는:
- 스캔된 PDF라 텍스트 추출이 안 된다
- 표, 그림, 알고리즘이 많다
- 문서마다 형식이 다르다
- 여러 버전이 혼재한다

실용적인 접근:

```python
import pdfplumber
import re

def extract_medical_document(pdf_path: str) -> dict:
    """진료 가이드라인 PDF에서 텍스트와 구조 추출"""

    chunks = []

    with pdfplumber.open(pdf_path) as pdf:
        current_section = ""
        current_text = ""

        for page in pdf.pages:
            text = page.extract_text()

            # 섹션 제목 감지 (굵은 글씨 패턴)
            lines = text.split('\n')
            for line in lines:
                if is_section_header(line):  # 커스텀 로직
                    # 이전 섹션 저장
                    if current_text.strip():
                        chunks.append({
                            "section": current_section,
                            "content": current_text.strip(),
                            "page": page.page_number
                        })
                    current_section = line
                    current_text = ""
                else:
                    current_text += line + " "

            # 표 추출 (별도 처리)
            tables = page.extract_tables()
            for table in tables:
                chunks.append({
                    "section": current_section,
                    "content": format_table(table),
                    "type": "table",
                    "page": page.page_number
                })

    return chunks
```

---

### 2단계: 메타데이터 설계

청크마다 검색 필터링에 쓸 메타데이터를 설계한다.

```json
{
  "chunk_id": "aha_hf_2022_section_3_2_chunk_4",
  "content": "심부전 환자에서 ACE 억제제 또는 ARB는...",
  "metadata": {
    "source": "AHA Heart Failure Guidelines 2022",
    "guideline_type": "international",
    "specialty": "cardiology",
    "version": "2022",
    "effective_date": "2022-04-01",
    "expiry_date": null,
    "section": "3.2 약물 치료",
    "page": 45,
    "evidence_level": "Class I, Level A",
    "language": "en"
  }
}
```

메타데이터가 잘 설계되면 "2022년 이후 최신 심장학 가이드라인에서만 검색"이 가능해진다.

---

### 3단계: 검색 쿼리 최적화

사용자 질문을 그대로 검색 쿼리로 쓰면 성능이 떨어진다.

HyDE (Hypothetical Document Embedding)
가상의 이상적인 답변을 먼저 생성하고, 그 답변의 벡터로 검색한다.

```python
def search_with_hyde(user_question: str, vector_db) -> list[str]:
    # 1단계: 가상 답변 생성
    hypothetical = llm.generate(
        f"다음 질문에 대한 이상적인 진료 가이드라인 발췌문을 작성하세요: {user_question}"
    )

    # 2단계: 가상 답변으로 검색
    results = vector_db.search(embed(hypothetical), top_k=5)

    return results
```

실제 답변처럼 생긴 텍스트의 벡터가 관련 문서를 더 잘 찾는다.

쿼리 확장
한 질문을 여러 표현으로 만들어 각각 검색하고 결합한다.

```
원래 질문: "와파린 용량 조절"

확장:
- "warfarin dose adjustment"
- "항응고제 INR 목표"
- "쿠마딘 용량 변경"

→ 세 버전으로 검색 → 결과 합치기
```

---

### 4단계: 신뢰 레이어 설계

의료 RAG에서 가장 중요한 단계이지만 종종 생략된다.

출처 투명성
```
AI 응답:
"...ACE 억제제는 심부전 환자에서 사망률을 25% 감소시킵니다.

[출처]
📄 AHA Heart Failure Guidelines 2022
   섹션 3.2 약물 치료 (45페이지)
   Evidence Level: Class I, Level A
   [원문 보기]"
```

신뢰도 표시
```
높은 신뢰: 검색된 문서와 질문의 유사도 > 0.85
           → 정상 응답

중간 신뢰: 유사도 0.65-0.85
           → "관련 문서를 찾았으나 완전히 일치하지 않을 수 있습니다"

낮은 신뢰: 유사도 < 0.65
           → "이 질문에 대한 관련 가이드라인을 찾지 못했습니다.
              직접 가이드라인을 확인하세요."
```

가이드라인 유효성 확인
```python
def check_guideline_validity(metadata: dict) -> str:
    if metadata.get("expiry_date"):
        if datetime.now() > metadata["expiry_date"]:
            return "⚠️ 이 가이드라인은 만료되었습니다. 최신 버전을 확인하세요."

    guideline_age = (datetime.now() - metadata["effective_date"]).days / 365
    if guideline_age > 5:
        return "ℹ️ 이 가이드라인은 5년 이상 경과했습니다. 갱신 여부를 확인하세요."

    return ""
```

---

### 실제 구현 시 마주치는 현실 문제

한국어 의료 임베딩 성능: 영어로 학습된 임베딩 모델은 한국어 의료 용어에서 성능이 떨어진다. 한국어 의료 코퍼스로 파인튜닝된 임베딩 모델을 쓰거나, 영어와 한국어를 병렬로 색인한다.

PDF 스캔 품질: 오래된 병원 문서는 스캔 품질이 나쁘다. OCR 정확도가 낮으면 검색도 나빠진다. 수동 검수가 필요한 문서가 생각보다 많다.

문서 버전 관리: 가이드라인이 개정되면 구버전을 어떻게 할 것인가? 그냥 덮으면 과거 버전을 참조할 수 없다. 버전별로 관리하고, 기본적으로 최신 버전을 우선하는 전략이 필요하다.

의사의 신뢰: 기술보다 어려운 문제. "AI가 틀리면 누가 책임지는가?" 출처 투명성과 면책 구조를 명확히 설계해야 실제 임상에서 쓸 수 있다.

RAG 기술보다 이 마지막 문제가 의료 AI 도입의 진짜 병목이다.
