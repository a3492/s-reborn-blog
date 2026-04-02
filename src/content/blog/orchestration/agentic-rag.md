---
title: "에이전틱 RAG — 검색 전략을 AI가 스스로 결정하는 RAG"
date: 2026-04-01
category: orchestration
tags: ["cu", "에이전틱RAG", "Agentic RAG", "동적검색", "오케스트레이션"]
description: "단순 RAG는 한 번 검색하고 끝낸다. 에이전틱 RAG는 검색 결과를 보고 부족하면 다시 검색하고, 전략도 바꾼다. 오케스트레이션과 RAG의 결합이다."
read_time: 8
difficulty: "advanced"
draft: false
type: "guide"
series: "RoundPrep — 회진 브리핑을 만든다"
series_order: 11
thumbnail: ""
key_takeaways:
  - "단순 RAG는 한 번 검색하고 끝낸다. 에이전틱 RAG는 검색 결과를 보고 부족하면 다시 검색하고, 전략도 바꾼다. 오케스트레이션과 RAG의 결합이다."
  - "이 글은 설계 관점 정리이며, 프로덕션 도입 전 보안·비용·감사 요구를 별도 검토한다."
  - "태그 cu: Cursor 초안 — 프레임워크·API·병원 정책은 공식 문서를 본다."
---
> RoundPrep 제11화. 가이드라인 한 번만 붙잡고 답하라고 했더니 조직 내 전문가 의견이 빠졌다는 지적이 나왔다. 검색을 루프에 넣는 압박이 여기서 온다.



## 한줄 요약
에이전틱 RAG는 "한 번 검색해서 답한다"가 아니라 "필요한 만큼 검색하고, 전략도 바꾸면서 최선의 답을 찾는다"는 방식이다.

## 본문

### 단순 RAG의 한계

일반 RAG 파이프라인:
```
질문 → 한 번 검색 → 결과 넣고 답변 생성 → 끝
```

이게 실패하는 경우:
- 처음 검색이 관련 없는 문서를 가져왔다
- 질문이 여러 단계의 정보를 필요로 한다
- 첫 번째 답변에서 새로운 정보가 필요하다는 걸 알게 됐다
- 한 DB에 없어서 다른 DB도 봐야 한다

---

### 에이전틱 RAG 패턴 3가지

패턴 1: 반복 검색 (Iterative Retrieval)

검색 결과를 보고 부족하면 다시 검색한다.

```python
async def iterative_rag(question: str, max_rounds: int = 3) -> str:
    context = []
    current_question = question

    for round in range(max_rounds):
        # 현재 질문으로 검색
        docs = await retriever.search(current_question, top_k=3)
        context.extend(docs)

        # AI가 현재 컨텍스트로 답변 시도
        response = await llm.invoke(
            f"질문: {question}\n\n컨텍스트: {context}\n\n"
            f"충분한 정보가 있으면 답하고, 없으면 추가로 필요한 정보를 명시하세요."
        )

        # 충분한 정보가 있으면 종료
        if response.is_complete:
            return response.answer

        # 부족한 정보로 다음 검색 쿼리 생성
        current_question = response.missing_info

    return response.best_effort_answer
```

패턴 2: 쿼리 분해 (Query Decomposition)

복잡한 질문을 여러 하위 질문으로 나누어 각각 검색한다.

```python
async def decomposed_rag(complex_question: str) -> str:
    # AI가 질문을 하위 질문으로 분해
    sub_questions = await llm.invoke(
        f"다음 질문을 독립적으로 검색 가능한 하위 질문 3개로 분해하세요: {complex_question}"
    )

    # 하위 질문들을 병렬로 검색
    sub_results = await asyncio.gather(*[
        retriever.search(q) for q in sub_questions
    ])

    # 결과를 통합해서 최종 답변
    final_answer = await llm.invoke(
        f"원래 질문: {complex_question}\n\n"
        f"각 하위 질문 답변:\n{format_results(sub_results)}\n\n"
        f"위 정보를 통합해서 원래 질문에 답하세요."
    )

    return final_answer
```

의료 예시:
```
원래 질문: "고혈압과 당뇨가 있는 CKD 환자에게 ACE 억제제가 적합한가?"

분해된 하위 질문:
1. "CKD 환자에서 ACE 억제제의 신보호 효과"
2. "당뇨성 신증에서 ACE 억제제 권고 사항"
3. "고혈압 + CKD에서 ACE 억제제 금기 조건"
```

패턴 3: 멀티 소스 라우팅 (Multi-Source Routing)

질문 유형에 따라 다른 DB나 검색 엔진을 선택한다.

```python
class MultiSourceRetriever:
    def __init__(self):
        self.sources = {
            "guidelines": clinical_guideline_db,
            "drugs": drug_interaction_db,
            "papers": pubmed_api,
            "protocols": hospital_protocol_db,
            "cases": clinical_case_db
        }

    async def smart_retrieve(self, question: str) -> list[str]:
        # AI가 어떤 소스가 필요한지 결정
        sources_needed = await llm.invoke(
            f"질문: {question}\n"
            f"필요한 정보 소스: {list(self.sources.keys())}\n"
            f"어떤 소스를 검색해야 하나? JSON 배열로 답하세요."
        )

        # 필요한 소스들을 병렬 검색
        results = await asyncio.gather(*[
            self.sources[s].search(question)
            for s in sources_needed
        ])

        return flatten(results)
```

---

### 의료 에이전틱 RAG 전체 구현

```python
class MedicalAgenticRAG:
    def __init__(self):
        self.retriever = MultiSourceRetriever()
        self.llm = medical_llm

    async def answer(self, clinical_question: str, patient_context: dict) -> dict:
        """
        임상 질문에 대해 에이전틱하게 검색하고 답변
        """

        step = 1
        accumulated_context = []
        max_steps = 5

        while step <= max_steps:
            # 현재까지 수집된 정보 평가
            assessment = await self.llm.invoke(
                f"임상 질문: {clinical_question}\n"
                f"환자 맥락: {patient_context}\n"
                f"현재까지 수집된 정보: {accumulated_context}\n\n"
                f"답변하기에 충분한가? 부족하다면 무엇이 필요한가?"
            )

            if assessment.sufficient:
                break

            # 부족한 정보에 맞는 검색 실행
            new_docs = await self.retriever.smart_retrieve(
                assessment.missing_info
            )
            accumulated_context.extend(new_docs)
            step += 1

        # 최종 답변 생성
        return await self.generate_final_answer(
            clinical_question,
            patient_context,
            accumulated_context
        )
```

---

### 에이전틱 RAG의 비용

반복 검색은 강력하지만 비용이 증가한다.

| 방식 | LLM 호출 | 검색 쿼리 | 비용 (상대) |
|------|---------|---------|-----------|
| 단순 RAG | 1 | 1 | 1x |
| 반복 RAG (3회) | 4 | 3 | 4x |
| 쿼리 분해 (3개) | 2 | 3 | 2.5x |
| 멀티 소스 (3소스) | 2 | 3 | 2.5x |

비용 대비 효과를 측정하고, 단순 RAG로 충분한 경우에는 에이전틱 RAG를 쓰지 않는다.


---

### 이야기 속에서 이어서

다음 화: [컨텍스트 윈도우 관리 — 긴 대화에서 AI가 기억을 잃지 않게 하는 법](/blog/orchestration/context-window-management/) — 같은 팀이 막혔던 지점에서 이어진다.


*편집 초안(cu). 프레임워크·API·임상 규정은 발행일 이후 바뀔 수 있으니 공식 문서와 병원 정책을 기준으로 확인한다.*
