---
title: "벡터 데이터베이스 — 의미를 검색하는 새로운 DB"
date: 2026-04-01
category: rag-finetuning
tags: ["벡터DB", "Pinecone", "pgvector", "RAG", "의미검색"]
description: "수백만 개의 벡터 중에서 가장 가까운 것을 밀리초 안에 찾는 기술. 벡터 데이터베이스가 어떻게 동작하고 어떤 걸 선택해야 하는지 정리한다."
read_time: 7
difficulty: "intermediate"
draft: false
thumbnail: ""
---

## 한줄 요약
벡터 DB는 "의미가 비슷한 것"을 찾는 검색 엔진이다 — 일반 DB가 "정확히 같은 것"을 찾는 것과 다르다.

## 본문

### 일반 DB와 무엇이 다른가

일반 관계형 DB(PostgreSQL, MySQL)에서 검색은 이런 식이다:

```sql
SELECT * FROM documents WHERE title = '당뇨 입원 기준';
```

정확히 "당뇨 입원 기준"이라는 제목이 있는 문서만 반환한다. "혈당 관리 입원 프로토콜"은 찾지 못한다.

벡터 DB는 다르다:

```
검색: "당뇨 환자 입원 언제 시키나요?"
→ 벡터로 변환
→ 가장 가까운 벡터를 가진 문서 반환:
   1. "혈당 관리 입원 프로토콜" (유사도 0.91)
   2. "당뇨 입원 기준 지침" (유사도 0.89)
   3. "고혈당 응급 처치" (유사도 0.82)
```

키워드가 다르더라도 의미가 비슷하면 찾아낸다.

---

### 벡터 DB 내부에서 일어나는 일

수백만 개의 벡터 중 가장 가까운 것을 찾으려면 모든 벡터와 거리를 계산해야 한다. 벡터 1개당 1,536번의 계산, 벡터 100만 개면 15억 번의 계산이다. 실시간으로 불가능하다.

그래서 벡터 DB는 근사 최근접 이웃(ANN, Approximate Nearest Neighbor) 알고리즘을 사용한다. 정확히 가장 가까운 것 대신, 매우 가까운 것을 매우 빠르게 찾는다.

주요 알고리즘:

HNSW (Hierarchical Navigable Small World)
- 계층적 그래프 구조
- 빠른 검색 속도 (밀리초 단위)
- 메모리 사용량 높음
- Pinecone, Weaviate, pgvector 등에서 사용

IVF (Inverted File Index)
- 벡터들을 클러스터로 나눔
- 메모리 효율적
- HNSW보다 약간 느림
- Faiss에서 주로 사용

---

### 주요 벡터 DB 비교

| | Pinecone | Weaviate | pgvector | Chroma |
|-|----------|----------|----------|--------|
| 타입 | 관리형 SaaS | 오픈소스/SaaS | PostgreSQL 확장 | 오픈소스 |
| 운영 난이도 | 쉬움 | 중간 | 쉬움 (PG 이미 있으면) | 쉬움 |
| 비용 | 유료 | 무료~유료 | 무료 (PG 비용만) | 무료 |
| 확장성 | 높음 | 높음 | 중간 | 낮음 |
| 적합 사례 | 프로덕션 대규모 | 멀티모달, 그래프 | 기존 PG 사용 중 | 개발·프로토타입 |

의료 시스템에 이미 PostgreSQL을 쓰고 있다면 pgvector 확장을 추가하는 게 가장 간단하다. 별도 인프라 없이 기존 DB에 벡터 검색 기능을 붙일 수 있다.

---

### pgvector 실제 사용 예시

```sql
-- 확장 설치
CREATE EXTENSION vector;

-- 테이블 생성
CREATE TABLE clinical_documents (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT,
    category TEXT,
    embedding vector(1536),  -- OpenAI 임베딩 차원
    updated_at TIMESTAMP
);

-- 인덱스 생성 (HNSW)
CREATE INDEX ON clinical_documents
USING hnsw (embedding vector_cosine_ops);

-- 유사 문서 검색
SELECT title, content,
       1 - (embedding <=> '[0.123, -0.456, ...]'::vector) AS similarity
FROM clinical_documents
ORDER BY embedding <=> '[0.123, -0.456, ...]'::vector
LIMIT 5;
```

---

### 벡터 DB만으로는 부족한 경우

순수 의미 검색의 한계:
- "2025년 3월에 개정된 당뇨 지침" → 날짜 필터가 필요
- "삼성서울병원 내과 프로토콜" → 병원·과 필터가 필요
- 정확한 약품명, 수치 → 키워드 검색이 더 정확

그래서 현대 RAG 시스템은 하이브리드 검색을 쓴다:

```
질문
  ↓
의미 검색 (벡터) + 키워드 검색 (BM25)
  ↓
두 결과를 결합 (RRF, Reciprocal Rank Fusion)
  ↓
메타데이터 필터 적용 (날짜, 카테고리 등)
  ↓
최종 문서 Top 5
```

의미는 벡터가 잡고, 정확한 키워드·날짜·카테고리는 일반 필터가 잡는다. 둘을 합치면 훨씬 정확해진다.

---

### 벡터 DB 도입 체크리스트

도입 전 확인해야 할 것들:

- [ ] 문서 수가 얼마나 되는가? (수천 개면 Chroma로 충분, 수백만 개면 Pinecone/Weaviate)
- [ ] 기존 DB가 PostgreSQL인가? (pgvector 먼저 고려)
- [ ] 실시간 업데이트가 필요한가? (문서가 자주 바뀌면 관리형 서비스가 편함)
- [ ] 온프레미스여야 하는가? (병원 내부망이면 Weaviate 또는 pgvector)
- [ ] 멀티모달(이미지, 표)이 필요한가? (Weaviate가 강점)

벡터 DB는 RAG의 기억 장치다. 잘 설계된 벡터 DB가 있어야 RAG가 빠르고 정확하게 작동한다.
