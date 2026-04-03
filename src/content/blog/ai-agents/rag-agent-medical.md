---
title: "RAG + 에이전트 — 의료 가이드라인 기반 AI 어시스턴트"
date: 2026-03-31
category: ai-agents
tags:
  - "cu2604021805"
  - "에이전트"
  - "의료AI"
  - "LLM"
  - "rag-agent-medical"

description: "순수 에이전트는 학습 시점 이후 업데이트된 가이드라인을 알지 못한다. RAG-Agent는 벡터 DB에 최신 의료 문서를 저장하고 에이전트가 쿼리하는 구조로, 근거 기반 답변을 가능하게 한다."
thumbnail: ""
draft: false
---


## 한줄 요약

순수 에이전트는 학습 시점 이후 업데이트된 가이드라인을 알지 못한다. RAG-Agent는 벡터 DB에 최신 의료 문서를 저장하고 에이전트가 쿼리하는 구조로, 근거 기반 답변을 가능하게 한다.

---

## 순수 에이전트의 한계

LLM은 학습 시점까지의 의료 지식만 갖고 있다.

- ADA 당뇨 가이드라인은 매년 업데이트된다
- 식약처 허가사항은 수시로 변경된다
- 병원 내부 프로토콜은 LLM이 전혀 모른다

이런 "최신성 문제"와 "기관 특수 지식 문제"를 동시에 해결하는 것이 RAG-Agent다.

---

## RAG-Agent 아키텍처

```
[에이전트]
    ↓ 질문 수신
    ↓ "이 질문에 답하려면 가이드라인 검색이 필요하다"
    ↓ search_guideline_rag() 호출
    ↓
[RAG 레이어]
벡터 DB ──→ 의미 검색 ──→ 관련 청크 반환
    ↓
[에이전트]
청크를 컨텍스트로 받아 근거 기반 답변 생성
출처 인용 포함
```

---

## 의료 RAG 구축 — 문서 종류

```python
MEDICAL_KNOWLEDGE_SOURCES = {
    "clinical_guidelines": {
        "sources": ["ADA 2025", "ACC/AHA 2024", "KDA 2024", "KDIGO 2024"],
        "update_frequency": "연 1회",
        "chunk_strategy": "section"
    },
    "drug_label": {
        "sources": ["식약처 허가사항", "FDA label"],
        "update_frequency": "수시",
        "chunk_strategy": "paragraph"
    },
    "hospital_protocol": {
        "sources": ["원내 임상 경로", "수술 전 체크리스트"],
        "update_frequency": "분기",
        "chunk_strategy": "procedure_step"
    }
}
```

---

## 문서 청킹(Chunking) 전략

문서를 어떻게 나누느냐가 검색 품질을 결정한다.

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

def chunk_medical_document(text: str, doc_type: str) -> list[str]:
    """문서 유형에 따라 청킹 전략을 다르게 적용한다."""

    if doc_type == "guideline":
        # 가이드라인: 섹션 단위로 분리 (권고 등급 유지)
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150,       # 권고 맥락이 끊기지 않도록 오버랩
            separators=["\n## ", "\n### ", "\n\n", "\n"]
        )

    elif doc_type == "drug_label":
        # 약물 허가사항: 항목 단위 분리 (용법용량, 금기, 주의사항)
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            separators=["\n[", "\n용법", "\n금기", "\n주의"]
        )

    else:
        # 기본
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=600,
            chunk_overlap=100
        )

    return splitter.split_text(text)
```

---

## 벡터 DB 구축 및 검색

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import hashlib

qdrant = QdrantClient(url="http://localhost:6333")

def index_medical_document(text: str, metadata: dict):
    """의료 문서를 벡터 DB에 색인한다."""
    chunks = chunk_medical_document(text, metadata["doc_type"])

    points = []
    for i, chunk in enumerate(chunks):
        vector = embed_text(chunk)  # 임베딩 모델 호출
        point_id = int(hashlib.md5(f"{metadata['source']}_{i}".encode()).hexdigest()[:8], 16)

        points.append(PointStruct(
            id=point_id,
            vector=vector,
            payload={
                "content": chunk,
                "source": metadata["source"],
                "doc_type": metadata["doc_type"],
                "updated_at": metadata["updated_at"],
                "page": metadata.get("page")
            }
        ))

    qdrant.upsert(collection_name="medical_knowledge", points=points)
    print(f"{metadata['source']}: {len(chunks)}개 청크 색인 완료")


def search_medical_knowledge(query: str, doc_type: str = None,
                              top_k: int = 5) -> list[dict]:
    """의미 검색으로 관련 의료 문서를 검색한다."""
    query_vector = embed_text(query)

    filter_condition = None
    if doc_type:
        filter_condition = {"must": [{"key": "doc_type", "match": {"value": doc_type}}]}

    results = qdrant.search(
        collection_name="medical_knowledge",
        query_vector=query_vector,
        query_filter=filter_condition,
        limit=top_k,
        with_payload=True
    )

    return [
        {
            "content": r.payload["content"],
            "source": r.payload["source"],
            "score": r.score,
            "updated_at": r.payload["updated_at"]
        }
        for r in results
    ]
```

---

## RAG 도구를 에이전트에 연결

```python
import anthropic
import json

client = anthropic.Anthropic()

rag_tool = {
    "name": "search_guideline_rag",
    "description": "벡터 DB에서 최신 의료 가이드라인을 의미 검색한다. "
                   "일반적인 의학 지식보다 최신 공식 가이드라인이 필요할 때 사용한다.",
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {"type": "string", "description": "검색할 임상 질문"},
            "doc_type": {
                "type": "string",
                "enum": ["guideline", "drug_label", "hospital_protocol"],
                "description": "검색 대상 문서 유형"
            }
        },
        "required": ["query"]
    }
}

def rag_agent(clinical_question: str) -> str:
    messages = [{"role": "user", "content": clinical_question}]

    while True:
        response = client.messages.create(
            model="claude-opus-4-5",
            max_tokens=4096,
            tools=[rag_tool],
            messages=messages,
            system="임상 질문에 답할 때 반드시 search_guideline_rag 도구로 "
                   "최신 가이드라인을 확인하고, 출처를 명시하여 답변하라."
        )

        if response.stop_reason == "end_turn":
            return response.content[0].text

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                # RAG 검색 실행
                search_results = search_medical_knowledge(
                    query=block.input["query"],
                    doc_type=block.input.get("doc_type")
                )
                # 검색 결과를 LLM이 읽을 수 있는 텍스트로 변환
                formatted = "\n\n".join([
                    f"[출처: {r['source']} ({r['updated_at']})]\n{r['content']}"
                    for r in search_results
                ])
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": formatted
                })

        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})
```

---

## Semantic Search vs Keyword Search

| 방식 | 특징 | 의료 적합성 |
|------|------|-------------|
| Keyword | 정확한 단어 일치 | 약물명 검색에 유리 |
| Semantic | 의미 기반 유사도 | 임상 질문 이해에 유리 |
| Hybrid | 두 방식 결합 | 가장 높은 검색 품질 |

의료 RAG에서는 "당뇨 신합병증 치료"와 "당뇨병성 신증 관리"가 같은 의미임을 이해해야 하므로 Semantic 또는 Hybrid 방식을 권장한다.

---

## 핵심 정리

- RAG-Agent는 에이전트가 벡터 DB에 저장된 최신 문서를 쿼리하여 근거 기반 답변을 생성한다
- 청킹 전략은 가이드라인에는 섹션 단위(800자), 약물 허가사항에는 항목 단위(500자)가 적합하다
- 검색 결과에 출처와 업데이트 날짜를 포함하면 의사가 원문을 확인할 수 있다
- Hybrid 검색(키워드 + 의미)이 의료 문서에서 가장 높은 검색 품질을 보인다
- RAG DB는 가이드라인 업데이트 주기에 맞춰 정기적으로 재색인해야 한다

## 관련 글

- [에이전트 메모리 — AI가 이전 대화를 기억하는 4가지 방법](/blog/ai-agents/agent-memory-types)
- [Claude Agent SDK — Anthropic의 에이전트 프레임워크 시작하기](/blog/ai-agents/claude-agent-sdk-intro)
- [의료 에이전트 평가 — 정확도보다 중요한 안전성 측정법](/blog/ai-agents/agent-evaluation-medical)
