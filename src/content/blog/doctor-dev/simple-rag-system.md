---
title: "RAG 시스템 만들기 — 내 병원 프로토콜을 AI에 연결하는 법"
date: 2026-03-31
category: doctor-dev
description: "RAG는 AI에게 우리 병원 교과서를 쥐여주는 기술이다 — Claude는 우리 병원 항생제 가이드라인을 모르지만, RAG를 쓰면 알게 된다."
thumbnail: ""
draft: false
---

## 한줄 요약

RAG는 AI에게 우리 병원 교과서를 쥐여주는 기술이다 — Claude는 우리 병원 항생제 가이드라인을 모르지만, RAG를 쓰면 알게 된다.

---

## 왜 RAG가 필요한가

Claude는 공개된 의학 지식을 방대하게 알고 있지만, 우리 병원의 내부 프로토콜은 모른다.

- 항생제 스튜어드십 가이드라인
- 수술 전 처치 체크리스트
- 원내 감염관리 지침

이런 문서를 AI와 연결하는 기술이 RAG(Retrieval-Augmented Generation)다.

---

## 작동 원리 (비유)

인턴이 처음 왔을 때 병원 매뉴얼을 주는 것과 같다.
1. 매뉴얼을 잘게 자른다 (청킹)
2. 색인을 만든다 (임베딩 → 벡터 DB)
3. 질문이 들어오면 관련 페이지를 찾는다 (검색)
4. 관련 내용을 AI에게 넘겨서 답변하게 한다 (생성)

---

## 패키지 설치

```bash
pip install anthropic chromadb langchain langchain-community
```

---

## 전체 구현 코드

```python
import anthropic
import chromadb
from chromadb.utils import embedding_functions

# 1) 병원 프로토콜 문서 (실제로는 PDF/텍스트 파일에서 읽어옴)
documents = [
    "페니실린 알레르기 환자에게는 세파계 항생제를 1차 선택한다. 심한 알레르기 반응이 있었던 경우에는 카바페넴 계열도 주의한다.",
    "커뮤니티 획득 폐렴(CAP) 경증: 아목시실린 500mg TID 7일. 비정형 감염 의심 시 아지스로마이신 추가.",
    "요로감염 단순방광염: 여성의 경우 트리메토프림-설파메톡사졸 3일 처방. 임산부는 세파렉신으로 대체.",
    "패혈증 초기 항생제: 광범위 항생제(타조박탐/피페라실린) 1시간 이내 투여. 혈액 배양 먼저 채취.",
    "수술 전 예방적 항생제: 피부절개 60분 전 세파졸린 1g IV. 수술 4시간 이상 시 추가 투여 고려."
]

# 2) ChromaDB 설정
chroma_client = chromadb.Client()
embedding_fn = embedding_functions.DefaultEmbeddingFunction()

collection = chroma_client.get_or_create_collection(
    name="hospital_antibiotic_guide",
    embedding_function=embedding_fn
)

# 3) 문서를 벡터 DB에 저장
collection.add(
    documents=documents,
    ids=[f"protocol_{i}" for i in range(len(documents))]
)

# 4) RAG 쿼리 함수
def ask_with_rag(question: str, n_results: int = 2) -> str:
    # 유사한 프로토콜 검색
    results = collection.query(
        query_texts=[question],
        n_results=n_results
    )
    context = "\n".join(results["documents"][0])

    # Claude에게 컨텍스트와 함께 질문
    client = anthropic.Anthropic()
    message = client.messages.create(
        model="claude-sonnet-4-5",
        max_tokens=512,
        system=f"""당신은 항생제 처방을 돕는 임상 보조 AI입니다.
아래 병원 가이드라인을 참고하여 답변하세요.

[병원 가이드라인]
{context}

가이드라인에 없는 내용은 '가이드라인에 명시되지 않았습니다'라고 답하세요.""",
        messages=[{"role": "user", "content": question}]
    )
    return message.content[0].text

# 5) 실제 사용
answer = ask_with_rag("페니실린 알레르기 환자 폐렴 치료 항생제는?")
print(answer)
```

---

## 실행 결과 예시

```
페니실린 알레르기 환자의 경우 병원 가이드라인에 따라:
- 세파계 항생제를 1차로 선택합니다
- 심한 알레르기 반응 이력이 있다면 카바페넴 계열도 주의가 필요합니다
- CAP 경증이라면 아지스로마이신 단독 처방을 고려할 수 있습니다
```

---

## 실제 PDF 문서 불러오기

```python
# PDF에서 텍스트 추출
import PyMuPDF  # pip install pymupdf

def load_pdf_chunks(pdf_path: str, chunk_size: int = 500) -> list[str]:
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()

    # 청크 분할
    chunks = [full_text[i:i+chunk_size]
              for i in range(0, len(full_text), chunk_size)]
    return chunks
```

---

## 핵심 정리

- RAG = AI에게 우리 병원 매뉴얼을 쥐여주는 기술
- 문서를 청크로 자르고 → 임베딩 → 벡터 DB 저장 → 검색 → AI 전달
- ChromaDB는 로컬에서 무료로 실행 가능
- 프로토콜 문서가 많을수록 AI 답변의 정확도가 올라간다
- 민감한 환자 데이터를 넣지 말 것 — 프로토콜/가이드라인만

## 관련 글

- [벡터 DB 입문 — 의료 지식 검색 엔진 만들기](/blog/doctor-dev/vector-db-basics)
- [Claude API 첫 호출 — 10줄 코드로 의료 AI 만들기](/blog/doctor-dev/api-first-call)
- [Streamlit으로 의료 도구 만들기 — 코딩 없이 UI 구현](/blog/doctor-dev/streamlit-medical-tool)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
