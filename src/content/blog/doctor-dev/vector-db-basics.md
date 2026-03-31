---
title: "벡터 DB 입문 — 의료 지식 검색 엔진 만들기"
date: 2026-03-31
category: doctor-dev
thumbnail: ""
draft: false
---

## 한줄 요약

벡터 DB는 의미로 검색하는 데이터베이스다 — "패혈증 치료"를 검색하면 그 단어가 없어도 관련 프로토콜을 찾아준다.

---

## 일반 검색 vs 벡터 검색

일반 DB 검색은 키워드가 정확히 일치해야 찾아준다. 마치 색인집에서 단어를 찾는 것처럼. 반면 벡터 검색은 의미가 비슷한 것을 찾는다.

- 일반 검색: "패혈증" → "패혈증"이 포함된 문서만
- 벡터 검색: "패혈증" → "sepsis", "혈액감염", "균혈증"도 함께 검색

의료 문서는 같은 개념을 다양한 용어로 표현한다. 벡터 검색이 훨씬 유용하다.

---

## 임베딩이란

텍스트를 숫자 배열로 변환하는 것이다. 의미가 비슷한 텍스트는 숫자 공간에서도 가까이 위치한다.

```
"패혈증 치료" → [0.12, -0.34, 0.89, ...]  (1536차원)
"sepsis management" → [0.11, -0.36, 0.87, ...]  # 비슷!
"당뇨 식이요법" → [-0.78, 0.45, -0.23, ...]  # 멀리 있음
```

---

## 설치

```bash
pip install chromadb sentence-transformers
```

---

## ChromaDB 기본 사용법

```python
import chromadb
from chromadb.utils import embedding_functions

# 로컬 DB 생성 (파일로 저장)
client = chromadb.PersistentClient(path="./medical_db")

# 한국어 지원 임베딩 모델 사용
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="jhgan/ko-sroberta-multitask"
)

collection = client.get_or_create_collection(
    name="hospital_protocols",
    embedding_function=embedding_fn
)
```

---

## 의료 문서 추가

```python
protocols = [
    "패혈증 초기 대응: 혈액 배양 후 1시간 이내 광범위 항생제 투여, 30mL/kg 수액 소생",
    "급성 심근경색 STEMI: 첫 의료 접촉에서 90분 이내 PCI 목표, 아스피린 300mg 즉시 투여",
    "뇌졸중 tPA 투여 기준: 증상 발현 4.5시간 이내, NIHSS 4-25, 출혈 없음 확인",
    "아나필락시스: 에피네프린 0.3mg IM 허벅지 외측, 5-15분 후 반응 없으면 반복",
    "고혈압 응급: 수축기 180 이상, 1시간 내 25% 이내로 점진적 감압",
    "당뇨 케톤산증: 0.9% 생리식염수 1L/h, 인슐린 0.1unit/kg/h, K+ 모니터링",
]

ids = [f"protocol_{i:03d}" for i in range(len(protocols))]
collection.add(documents=protocols, ids=ids)

print(f"저장된 프로토콜: {collection.count()}개")
```

---

## 의미 검색

```python
def search_protocol(query: str, n: int = 3) -> list[dict]:
    results = collection.query(
        query_texts=[query],
        n_results=n,
        include=["documents", "distances"]
    )

    output = []
    for doc, dist in zip(results["documents"][0], results["distances"][0]):
        similarity = 1 - dist  # 거리 → 유사도
        output.append({"content": doc, "similarity": round(similarity, 3)})
    return output

# 검색 예시
results = search_protocol("혈압이 너무 높을 때 어떻게 해야 하나")
for r in results:
    print(f"[유사도 {r['similarity']}] {r['content'][:60]}...")
```

---

## 벡터 DB 비교

| 도구 | 특징 | 추천 상황 |
|------|------|-----------|
| ChromaDB | 로컬, 무료, 설치 쉬움 | 개인/팀 내부용 |
| Pinecone | 클라우드, 관리형 | 대용량, 운영 환경 |
| Weaviate | 오픈소스, 강력한 필터 | 복잡한 메타데이터 검색 |
| FAISS | Facebook, 매우 빠름 | 대규모 검색 최적화 |

시작은 ChromaDB로 충분하다.

---

## 청킹 전략 — 의료 문서 특성에 맞게

```python
def chunk_medical_document(text: str, chunk_size: int = 300,
                            overlap: int = 50) -> list[str]:
    """오버랩이 있는 청킹 — 문맥 단절 방지"""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap  # 50자 겹침
    return chunks
```

의료 문서는 문단 단위 청킹을 권장한다. 용량 계산 공식, 투여 기준처럼 맥락이 끊기면 위험한 정보가 많기 때문이다.

---

## 핵심 정리

- 벡터 DB는 의미 기반 검색 — 키워드가 없어도 관련 문서를 찾는다
- `chromadb.PersistentClient()`로 로컬에 영구 저장할 수 있다
- 한국어는 `jhgan/ko-sroberta-multitask` 임베딩 모델이 효과적이다
- 의료 문서 청킹은 문맥이 끊기지 않도록 오버랩을 두자
- RAG 시스템의 핵심 인프라 — 먼저 이해하면 RAG 구현이 쉬워진다

## 관련 글

- [RAG 시스템 만들기 — 내 병원 프로토콜을 AI에 연결하는 법](/blog/doctor-dev/simple-rag-system)
- [Claude API 첫 호출 — 10줄 코드로 의료 AI 만들기](/blog/doctor-dev/api-first-call)
- [Pandas로 임상 데이터 분석 — Excel을 Python으로 대체하는 법](/blog/doctor-dev/pandas-for-clinical-data)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
