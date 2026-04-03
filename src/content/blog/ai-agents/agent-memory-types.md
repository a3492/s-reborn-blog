---
title: "에이전트 메모리 — AI가 이전 대화를 기억하는 4가지 방법"
date: 2026-03-31
category: ai-agents
tags:
  - "cu2604021805"
  - "에이전트"
  - "의료AI"
  - "LLM"
  - "agent-memory-types"

description: "에이전트 메모리는 In-context, External, Episodic, Semantic 4가지 유형으로 나뉘며, 의료 에이전트는 이 중 External + Episodic 조합으로 환자별 연속성을 유지하되 HIPAA 준수가 필수다."
thumbnail: ""
draft: false
---


## 한줄 요약

에이전트 메모리는 In-context, External, Episodic, Semantic 4가지 유형으로 나뉘며, 의료 에이전트는 이 중 External + Episodic 조합으로 환자별 연속성을 유지하되 HIPAA 준수가 필수다.

---

## 왜 메모리가 필요한가

LLM은 기본적으로 상태가 없다(stateless). 대화가 끝나면 모든 것을 잊는다. 에이전트가 진정한 의미의 "어시스턴트"가 되려면 이전 상호작용을 기억하고 활용해야 한다.

의료 현장에서의 예:
- 3개월 전 외래에서 논의한 약 조정 내용
- 환자가 보고한 이전 부작용 경험
- 지난 입원 시의 치료 반응

---

## 메모리 유형 1 — In-context Memory

가장 단순한 형태. 현재 대화 컨텍스트 윈도우 내에 정보를 유지한다.

```python
# 대화 이력을 그대로 컨텍스트에 유지
messages = [
    {"role": "user", "content": "환자 김OO, 65세, 당뇨 진료 시작"},
    {"role": "assistant", "content": "네, 진료를 시작합니다..."},
    {"role": "user", "content": "HbA1c 8.2% 나왔습니다"},
    {"role": "assistant", "content": "목표치 대비 조정이 필요합니다..."},
    # ... 계속 누적
]
```

장점: 구현이 단순하다
단점: 컨텍스트 윈도우 한계(보통 200K 토큰)를 초과하면 앞부분이 잘린다. 단일 세션을 넘기면 유지되지 않는다.

---

## 메모리 유형 2 — External Memory (벡터 DB)

과거 정보를 벡터 DB에 저장하고, 필요할 때 의미 검색으로 불러온다.

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import anthropic

client = QdrantClient(":memory:")  # 프로덕션에서는 서버 URL 사용
embed_client = anthropic.Anthropic()

def store_patient_memory(patient_id: str, content: str, metadata: dict):
    """환자 관련 정보를 벡터 DB에 저장한다."""
    # 임베딩 생성 (실제로는 전용 임베딩 모델 사용)
    vector = get_embedding(content)

    client.upsert(
        collection_name="patient_memories",
        points=[
            PointStruct(
                id=generate_id(),
                vector=vector,
                payload={
                    "patient_id": patient_id,
                    "content": content,
                    "date": metadata["date"],
                    "type": metadata["type"]  # "lab", "visit", "medication"
                }
            )
        ]
    )

def retrieve_relevant_memories(patient_id: str, query: str, top_k: int = 5):
    """현재 질문과 관련된 과거 메모리를 검색한다."""
    query_vector = get_embedding(query)

    results = client.search(
        collection_name="patient_memories",
        query_vector=query_vector,
        query_filter={"must": [{"key": "patient_id", "match": {"value": patient_id}}]},
        limit=top_k
    )
    return [r.payload["content"] for r in results]
```

---

## 메모리 유형 3 — Episodic Memory

특정 에피소드(외래 방문, 입원 등)를 요약하여 저장한다.

```python
def summarize_visit_episode(visit_transcript: str, patient_id: str) -> dict:
    """외래 방문 전체 대화를 구조화된 에피소드로 요약한다."""

    response = anthropic.Anthropic().messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""다음 외래 방문 기록을 구조화된 에피소드로 요약하세요.

방문 기록:
{visit_transcript}

다음 형식으로 요약:
- 주요 호소증상
- 검사 결과 요약
- 진단 및 변경사항
- 처방 변경 내용
- 다음 방문까지 모니터링 사항"""
        }]
    )

    episode = {
        "patient_id": patient_id,
        "date": today(),
        "summary": response.content[0].text,
        "episode_type": "outpatient_visit"
    }

    # 저장
    save_episode(episode)
    return episode
```

---

## 메모리 유형 4 — Semantic Memory

의학 지식, 가이드라인, 프로토콜 등 일반적인 지식 베이스.

```python
# 병원 프로토콜, 가이드라인을 별도 컬렉션으로 관리
SEMANTIC_COLLECTIONS = {
    "clinical_guidelines": "ADA, ACC/AHA, KDA 가이드라인 문서",
    "drug_database": "식약처 허가 약물 정보 및 상호작용",
    "hospital_protocols": "원내 진료 프로토콜 및 임상 경로",
    "icd_codes": "ICD-10 진단 코드 데이터베이스"
}
```

---

## 의료 에이전트 메모리 설계 원칙

1. 환자 격리 (Patient Isolation)
```python
# 항상 patient_id로 필터링 — 다른 환자 메모리가 섞이면 안 됨
memories = retrieve_relevant_memories(
    patient_id=current_patient_id,  # 필수
    query=current_question
)
```

2. TTL (Time-to-Live) 정책
```python
MEMORY_TTL = {
    "lab_result": 365,      # 검사 결과: 1년
    "medication": 730,      # 약물 이력: 2년
    "visit_summary": 1825,  # 방문 요약: 5년
    "consent": None         # 동의서: 영구 보존
}
```

3. 암호화 및 접근 제어
```python
# HIPAA/개인정보보호법 준수
store_patient_memory(
    patient_id=hash_patient_id(raw_id),  # 해시로 비식별화
    content=encrypt(content),            # 저장 시 암호화
    access_roles=["attending_physician", "resident"]
)
```

---

## 핵심 정리

- In-context는 단순하지만 세션을 넘기면 사라진다. 외래 연속성에는 External이 필요하다
- 벡터 DB를 이용한 External Memory는 의미 검색으로 관련 과거 기록을 불러온다
- Episodic Memory는 방문별 요약으로 토큰 효율을 높인다
- 의료 에이전트는 환자 격리, TTL 정책, 암호화를 반드시 구현해야 한다
- 메모리 설계 실수는 환자 정보 혼용이라는 심각한 안전 문제로 이어진다

## 관련 글

- [RAG + 에이전트 — 의료 가이드라인 기반 AI 어시스턴트](/blog/ai-agents/rag-agent-medical)
- [의료 에이전트 안전 설계 — AI가 실수해도 괜찮은 시스템](/blog/ai-agents/agent-safety-medical)
- [AI 에이전트란 — 챗봇과 무엇이 다른가](/blog/ai-agents/what-is-ai-agent)
