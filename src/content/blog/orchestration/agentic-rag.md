---
title: "에이전틱 RAG — 검색 전략을 AI가 스스로 결정하는 RAG"
date: 2026-04-01
category: orchestration
tags:
  - "cu2604021138"
  - "에이전틱RAG"
  - "Agentic RAG"
  - "동적검색"
  - "오케스트레이션"
description: "RoundPrep 제11화. 가이드라인·야간 기록·내부 문서를 근거로 붙일 때, 한 번 검색으로는 부족하고 루프·상한·로그가 필요한 이유."
read_time: 18
difficulty: "advanced"
draft: false
type: "guide"
series: "RoundPrep — 회진 브리핑을 만든다"
series_order: 11
thumbnail: ""
key_takeaways:
  - "내일 회의에서: \"에이전틱 RAG는 검색 루프에 max_steps·종료 조건·쿼리·문서 ID 로그를 먼저 박고 시작합시다.\""
  - "한 번 검색으로 끝나지 않는 질문만 루프로 올리고, 단순 RAG로 되는 건 굳이 에이전틱으로 키우지 않는다."
  - "태그 cu2604021138: Cursor 초안 — 프레임워크·API·병원 정책은 발행일 이후 바뀔 수 있으니 공식 문서를 본다."
---

## 수요일 밤, 자료실 앞 복도

김서진은 노트북을 들고 서 있다. 내일 오전 교육과 자료에 **“근거 출처”**가 빠졌다는 지적을 받았다. 가이드라인 PDF는 최신본이 있는데, 팀 채널에만 올라온 **내부 해석 메모**는 벡터 DB에 아직 안 들어갔다. 이혜준은 말한다. “한 번 검색해서 답하라고 하면, 모델은 **있는 조각만**으로 답을 완성해 버려요. 부족하다고 스스로 말하게 만들고, **다시 찾게** 만들어야 해요.”

그게 에이전틱 RAG가 RoundPrep 대화에서 떠오른 이유다. 회진 브리핑 한 줄을 쓰더라도, “야간 기록 + Lab + 가이드 + 병원 프로토콜”이 **한 번의 top-k**에 다 안 들어오는 날이 있다. 그날을 전제로 설계하는 것이 이 글의 목표다.

### 테제

**근거 없는 요약은 한 번이면 신뢰를 잃고, 에이전틱 RAG는 ‘부족하면 다시 찾는다’는 오케스트레이션이다.** 다만 루프는 **상한·종료 조건·로그** 없이 켜면 안 된다.

### 스테이크

내부 가이드라인이 갱신됐는데 인덱스가 옛 버전이면, 한 번 검색으로 **폐기된 문단**을 인용한다. 교수님은 그걸 한 번으로 잡는다. RoundPrep 팀에게는 **환자 안전**보다 먼저 **신뢰 자본**이 깨진다.

### 전환점 — RoundPrep 메모

샌드박스에서 검색 루프를 무한히 열어 두었다가 **야간 배치 비용**이 튀었다. 그날 박과장 메시지: “멈춤 조건이 없는 건 운영이 아니라 취미입니다.” **max_steps**, **비용 상한**, **종료 판정**이 없으면 에이전틱 RAG는 데모용이다.

---

## 한줄 요약

에이전틱 RAG는 "한 번 검색해서 답한다"가 아니라, **부족함을 스스로 진단하고** 검색·라우팅·분해를 **여러 번** 할 수 있게 설계한 RAG 오케스트레이션이다.

## 본문

### 단순 RAG의 한계

일반 RAG 파이프라인:

```
질문 → 한 번 검색 → 결과 넣고 답변 생성 → 끝
```

이게 실패하는 경우:

- 처음 검색이 관련 없는 문서를 가져왔다  
- 질문이 여러 단계의 정보를 필요로 한다  
- 첫 답변 과정에서 “이건 다른 소스를 봐야 한다”는 게 드러난다  
- 한 인덱스·한 컬렉션에 없어서 **다른 소스**를 봐야 한다  

**RoundPrep에 대입하면:** “이 환자 이번 주 전체 맥락”을 한 번의 임베딩 검색으로 끝내려 하면, 야간 수술 기록이나 간호 자유기술이 빠진 채 요약이 나올 수 있다. 그 빈칸을 **사람이 메우게 두지 말고**, 시스템이 “부족”을 말하게 만드는 쪽이 에이전틱 쪽의 사고다.

---

### 에이전틱 RAG 패턴 3가지

#### 패턴 1: 반복 검색 (Iterative Retrieval)

검색 결과를 보고 부족하면 **다시 검색**한다. 핵심은 “다시”의 기준이 LLM이 아니라 **정책**과 **로그**에도 남는다는 점이다.

```python
async def iterative_rag(question: str, max_rounds: int = 3) -> str:
    context = []
    current_question = question

    for round in range(max_rounds):
        docs = await retriever.search(current_question, top_k=3)
        context.extend(docs)

        response = await llm.invoke(
            f"질문: {question}\n\n컨텍스트: {context}\n\n"
            f"충분한 정보가 있으면 답하고, 없으면 추가로 필요한 정보를 명시하세요."
        )

        if response.is_complete:
            return response.answer

        current_question = response.missing_info

    return response.best_effort_answer
```

**RoundPrep에 대입하면:** 각 라운드마다 **어떤 쿼리로 무엇이 들어왔는지** trace에 남겨야, 교수님이 “왜 그 문단을 썼지?”라고 물었을 때 되갚을 수 있다.

#### 패턴 2: 쿼리 분해 (Query Decomposition)

복잡한 질문을 **독립 검색 가능한 하위 질문**으로 나누고, 병렬로 긁은 뒤 합친다.

의료 예시:

```
원래 질문: "고혈압과 당뇨가 있는 CKD 환자에게 ACE 억제제가 적합한가?"

분해된 하위 질문:
1. "CKD 환자에서 ACE 억제제의 신보호 효과"
2. "당뇨성 신증에서 ACE 억제제 권고 사항"
3. "고혈압 + CKD에서 ACE 억제제 금기 조건"
```

**RoundPrep에 대입하면:** 브리핑 문장 하나가 사실 여러 근거 축(약물·신기능·가이드)을 묶고 있을 때, **한 쿼리로 때우지 않는다**는 선택이 분해 패턴이다.

#### 패턴 3: 멀티 소스 라우팅 (Multi-Source Routing)

질문 유형에 따라 **다른 인덱스·DB·API**를 고른다.

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
        sources_needed = await llm.invoke(
            f"질문: {question}\n"
            f"필요한 정보 소스: {list(self.sources.keys())}\n"
            f"어떤 소스를 검색해야 하나? JSON 배열로 답하세요."
        )

        results = await asyncio.gather(*[
            self.sources[s].search(question)
            for s in sources_needed
        ])

        return flatten(results)
```

**RoundPrep에 대입하면:** “가이드만”이 아니라 **당직 기록·프로토콜·약물 DB**를 섞어야 하는 순간이 온다. 라우팅은 **권한**(누가 어떤 소스를 부를 수 있는지)과 같이 설계해야 한다.

---

### 의료 에이전틱 RAG 전체 구현 (개념 코드)

아래는 **루프 + 상한 + 평가 단계**를 한눈에 보이게 한 예시다. 프로덕션에서는 타입·에러·감사 로그·익명화를 더 얹어야 한다.

```python
class MedicalAgenticRAG:
    def __init__(self):
        self.retriever = MultiSourceRetriever()
        self.llm = medical_llm

    async def answer(self, clinical_question: str, patient_context: dict) -> dict:
        step = 1
        accumulated_context = []
        max_steps = 5

        while step <= max_steps:
            assessment = await self.llm.invoke(
                f"임상 질문: {clinical_question}\n"
                f"환자 맥락: {patient_context}\n"
                f"현재까지 수집된 정보: {accumulated_context}\n\n"
                f"답변하기에 충분한가? 부족하다면 무엇이 필요한가?"
            )

            if assessment.sufficient:
                break

            new_docs = await self.retriever.smart_retrieve(
                assessment.missing_info
            )
            accumulated_context.extend(new_docs)
            step += 1

        return await self.generate_final_answer(
            clinical_question,
            patient_context,
            accumulated_context
        )
```

**RoundPrep에 대입하면:** `max_steps`는 **비용·지연**의 안전벨트이고, `assessment` 출력은 **감사 가능한 중간 판단**으로 남길지 팀이 정한다. “충분하다”는 말을 **출처 인용과 함께** 강제하는 편이 임상 쪽 요구와 맞는다.

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

**RoundPrep에 대입하면:** “브리핑 한 줄” 수준의 질문이면 굳이 루프를 돌리지 말고, **질문 분류기**로 단순 RAG 경로를 태우는 편이 박과장 설득에 유리하다.

---

### 반례 — 에이전틱이 과한 경우

- 질문이 **항상 단일 문서 한 절**로 끝난다  
- 인덱스 품질이 이미 높고, 실패율이 낮다  
- 지연·비용 예산이 빡빡한데 **루프 이득이 측정되지 않았다**  

이때는 반복·분해·라우팅을 **단계적으로** 열고, 메트릭(정답률·출처 적합률·지연)을 본 뒤 확장한다.

---

### 실무 체크리스트

- [ ] `max_steps`·타임아웃·토큰 상한을 정했는가?  
- [ ] 매 검색마다 **쿼리·소스·문서 ID(또는 해시)** 를 로그에 남기는가?  
- [ ] “충분함” 판정을 **인용 필수** 같은 정책으로 묶을 수 있는가?  
- [ ] 단순 RAG 경로와 에이전틱 경로를 **라우팅**으로 나눴는가?  
- [ ] 외부·내부 LLM을 쓸 때 **식별 정보·약관**을 지키는가?  

---

### 다음 회의 한 줄

**혜준:** “검색은 **로그에 쿼리와 문서 ID**를 남깁니다. 루프는 **max_steps** 밖에서 안 돕니다.”

### 다음 화

문서가 길어지면 창이 터진다 — [컨텍스트 윈도우 관리](/blog/orchestration/context-window-management/)

*편집 초안(cu2604021138). 프레임워크·API·임상 규정은 발행일 이후 바뀔 수 있으니 공식 문서와 병원 정책을 기준으로 확인한다.*
