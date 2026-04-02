---
title: "컨텍스트 윈도우 관리 — 긴 대화에서 AI가 기억을 잃지 않게 하는 법"
date: 2026-04-01
category: orchestration
tags: ["cu", "컨텍스트윈도우", "메모리", "오케스트레이션", "토큰관리"]
description: "멀티 에이전트 시스템에서 컨텍스트가 길어지면 AI가 초기 정보를 잊거나 느려진다. 컨텍스트를 효율적으로 관리하는 전략을 다룬다."
read_time: 7
difficulty: "intermediate"
draft: false
type: "guide"
series: "RoundPrep — 회진 브리핑을 만든다"
series_order: 12
thumbnail: ""
key_takeaways:
  - "멀티 에이전트 시스템에서 컨텍스트가 길어지면 AI가 초기 정보를 잊거나 느려진다. 컨텍스트를 효율적으로 관리하는 전략을 다룬다."
  - "이 글은 설계 관점 정리이며, 프로덕션 도입 전 보안·비용·감사 요구를 별도 검토한다."
  - "태그 cu: Cursor 초안 — 프레임워크·API·병원 정책은 공식 문서를 본다."
---
> RoundPrep 제12화. “병동 전체 스무명을 한 프롬프트에 넣자”는 아이디어가 토큰 한도에서 폭발했다. 긴 흐름은 기억 설계가 본문이다.



## 한줄 요약
컨텍스트 윈도우는 AI의 작업 기억이다 — 넘치면 정보를 잃고, 비효율적으로 채우면 비용이 낭비된다.

## 본문

### 컨텍스트 윈도우란

LLM은 한 번에 처리할 수 있는 텍스트 양에 한계가 있다. 이 한계를 컨텍스트 윈도우라고 한다.

- GPT-4o: 128,000 토큰
- Claude 3.5 Sonnet: 200,000 토큰
- Gemini 1.5 Pro: 1,000,000 토큰

한국어 기준 토큰 환산: 한 글자 ≈ 1.5~2 토큰. 200,000 토큰 ≈ 약 10만 글자 ≈ 200쪽 분량.

충분해 보이지만, 오케스트레이션에서는 생각보다 빠르게 소진된다:
- 시스템 프롬프트: 1,000~5,000 토큰
- 이전 대화 기록: 누적됨
- 각 에이전트의 출력: 수천 토큰씩
- RAG로 가져온 문서들: 수천 토큰씩
- 툴 호출 결과: 수천 토큰씩

---

### 컨텍스트가 길어질 때 생기는 문제

잃어버림 현상 (Lost in the Middle)

2023년 연구에서 발견된 현상. LLM은 컨텍스트의 시작과 끝에 있는 정보는 잘 기억하지만, 중간에 있는 정보는 상대적으로 덜 참고한다.

긴 컨텍스트에서 중요한 정보가 중간에 묻히면 AI가 그걸 무시하거나 잊어버린다.

성능 저하

컨텍스트가 길어질수록 처리 시간이 늘어난다. 128K 토큰을 처리하는 건 8K 토큰보다 훨씬 느리고 비싸다.

환각 증가

매우 긴 컨텍스트에서는 AI가 초기에 제공된 정보를 잘못 기억하는 경우가 늘어난다.

---

### 컨텍스트 관리 전략

전략 1: 컨텍스트 압축

긴 이전 대화를 AI가 요약해서 짧게 만든다.

```python
def compress_conversation_history(history: list[dict]) -> str:
    """긴 대화 기록을 핵심 요약으로 압축"""

    if count_tokens(history) < 10000:
        return history  # 짧으면 그냥 씀

    # AI에게 요약 요청
    summary = llm.invoke(
        f"""다음 대화 기록을 의사결정에 필요한 핵심 정보만 담아 500 토큰 이내로 요약하세요:

        {history}

        포함할 것: 확정된 진단, 결정된 치료 계획, 주의사항
        제외할 것: 반복된 논의, 결국 채택되지 않은 옵션"""
    )

    return [{"role": "system", "content": f"이전 대화 요약: {summary}"}]
```

전략 2: 슬라이딩 윈도우

최근 N개의 메시지만 유지하고 오래된 것은 제거한다.

```python
def sliding_window(messages: list, max_tokens: int = 50000) -> list:
    """토큰 한도 내에서 최근 메시지만 유지"""

    result = []
    total = 0

    # 가장 최근 메시지부터 역순으로 추가
    for msg in reversed(messages):
        tokens = count_tokens(msg)
        if total + tokens > max_tokens:
            break
        result.insert(0, msg)
        total += tokens

    return result
```

전략 3: 에이전트별 컨텍스트 분리

각 에이전트가 자신의 작업에 필요한 정보만 받는다. 전체 대화 기록을 모든 에이전트에게 주지 않는다.

```python
def build_agent_context(full_state: dict, agent_role: str) -> dict:
    """각 에이전트에게 필요한 정보만 제공"""

    base = {
        "patient_id": full_state["patient_id"],
        "task": full_state["current_task"]
    }

    if agent_role == "pharmacist":
        return {
            base,
            "current_meds": full_state["medications"],
            "proposed_changes": full_state["proposed_treatment"],
            "renal_function": full_state["lab_results"]["creatinine"]
            # 영상 결과, 사회적 기록 등은 제외
        }

    elif agent_role == "radiologist":
        return {
            base,
            "imaging_files": full_state["imaging"],
            "clinical_question": full_state["imaging_question"]
            # 약물 기록, 사회적 기록 등은 제외
        }
```

전략 4: 외부 메모리

컨텍스트 윈도우에 넣지 않고 외부 DB에 저장하고, 필요할 때 검색해서 가져온다. RAG와 같은 원리.

```python
class ExternalMemory:
    def __init__(self, vector_db):
        self.db = vector_db

    def save(self, key: str, content: str):
        """중요한 정보를 외부에 저장"""
        self.db.upsert(key, embed(content), {"content": content})

    def recall(self, query: str, top_k: int = 3) -> list[str]:
        """필요할 때 관련 정보 검색"""
        results = self.db.search(embed(query), top_k)
        return [r["content"] for r in results]

# 사용
memory = ExternalMemory(vector_db)

# 중요 결정 저장
memory.save("진단_결정", "2026-04-01: 급성 신부전 진단 확정")

# 나중에 관련 정보 검색
relevant = memory.recall("신부전 환자 약물 조정")
```

---

### 실용적인 가이드라인

- 시스템 프롬프트는 가능한 짧게 (핵심만)
- 툴 결과는 사용 후 요약해서 보관
- 중간 단계 출력은 핵심 데이터만 다음 에이전트에게 전달
- 긴 문서는 청킹 후 RAG로 검색 (컨텍스트에 전부 넣지 않음)
- 컨텍스트 사용량을 주기적으로 모니터링


---

### 이야기 속에서 이어서

다음 화: [LangGraph — AI 흐름이 꼬이지 않으려면 그래프가 필요하다](/blog/orchestration/langgraph-intro/) — 같은 팀이 막혔던 지점에서 이어진다.


*편집 초안(cu). 프레임워크·API·임상 규정은 발행일 이후 바뀔 수 있으니 공식 문서와 병원 정책을 기준으로 확인한다.*
