---
title: "에이전트 계획 패턴 — ReAct, CoT, Tree-of-Thought"
date: 2026-03-31
category: ai-agents
description: "에이전트 계획 패턴은 LLM이 복잡한 목표를 달성하는 방식을 결정하며, 의료 진단처럼 불확실성이 높은 분야에서는 여러 경로를 탐색하는 Tree-of-Thought와 근거를 추적하는 ReAct의 조합이 가장 안전하다."
thumbnail: ""
draft: false
---

## 한줄 요약

에이전트 계획 패턴은 LLM이 복잡한 목표를 달성하는 방식을 결정하며, 의료 진단처럼 불확실성이 높은 분야에서는 여러 경로를 탐색하는 Tree-of-Thought와 근거를 추적하는 ReAct의 조합이 가장 안전하다.

---

## 왜 계획 패턴이 중요한가

"환자의 흉통 원인을 감별하라"는 요청을 받은 에이전트가 어떻게 추론하느냐에 따라 결과가 크게 달라진다. 즉흥적으로 답하는 것과 단계별로 추론하는 것 사이에는 상당한 차이가 있다.

---

## 패턴 1 — Chain-of-Thought (CoT)

단계별로 추론을 명시적으로 전개한다. 2022년 Google 연구팀이 발표하여 복잡한 추론 능력을 크게 향상시켰다.

```python
# CoT를 유도하는 프롬프트
system_prompt = """
복잡한 의학적 판단을 할 때는 항상 단계별로 생각하세요.

예시:
문제: 65세 남성, 흉통, 발한, 좌측 팔 방사통

단계 1: 가장 위험한 진단부터 고려한다
- ACS (급성 관상동맥 증후군) — 즉시 배제해야 함
- 대동맥 박리 — 위험도 높음

단계 2: 각 진단의 근거와 반하는 증거를 나열한다
- ACS 찬성: 좌측 방사통, 발한, 나이
- ACS 반대: 현재 없음 → ACS 우선 처리

단계 3: 다음 필요한 검사를 결정한다
- 즉시 ECG, 트로포닌

결론을 먼저 내리지 말고, 반드시 이 순서를 따르세요.
"""
```

**장점:** 추론 과정 추적 가능, 오류 발생 시 어느 단계에서 틀렸는지 확인 가능
**단점:** 하나의 경로만 탐색 — 초기 방향이 틀리면 전체가 틀릴 수 있다

---

## 패턴 2 — ReAct (Reasoning + Acting)

생각과 행동을 번갈아 수행하며 외부 정보를 실시간으로 반영한다.

```python
# ReAct 루프 구현
def react_loop(question: str, tools: list, max_steps: int = 10) -> str:
    messages = [{
        "role": "user",
        "content": f"""다음 형식으로 단계별 추론을 진행하세요:

Thought: [현재 상황 분석 및 다음 행동 결정]
Action: [사용할 도구와 파라미터]
Observation: [도구 실행 결과]
... (반복)
Final Answer: [최종 답변]

질문: {question}"""
    }]

    for step in range(max_steps):
        response = call_llm(messages, tools)

        if "Final Answer:" in response.text:
            return extract_final_answer(response.text)

        # 도구 호출 처리
        if response.stop_reason == "tool_use":
            tool_result = execute_tools(response)
            messages.extend([
                {"role": "assistant", "content": response.content},
                {"role": "user", "content": tool_result}
            ])

    return "최대 스텝 초과 — 의사 에스컬레이션 필요"
```

**의료 ReAct 예시:**
```
Thought: 환자의 흉통이 ACS인지 확인하려면 ECG 결과가 필요하다.
Action:  get_test_result(patient_id="P001", test="ECG")
Observation: ST 분절 상승 없음, 비특이적 T파 변화

Thought: ECG는 음성이지만 트로포닌을 확인해야 한다.
Action:  get_test_result(patient_id="P001", test="troponin_T")
Observation: 트로포닌 T = 0.08 ng/mL (기준치 0.04 초과)

Thought: 트로포닌 양성. NSTEMI 가능성 높다. 가이드라인을 확인한다.
Action:  search_guideline("NSTEMI 초기 치료")
Observation: 항혈소판제 + 항응고제 + 조기 침습적 전략 권고

Final Answer: NSTEMI 의심. 즉시 심장내과 협진 및 항혈소판 요법 시작 권고.
```

---

## 패턴 3 — Tree-of-Thought (ToT)

여러 가능한 경로를 동시에 탐색하고, 각 경로를 평가하여 최적 경로를 선택한다.

```python
def tree_of_thought_diagnose(patient_data: dict) -> dict:
    """
    여러 진단 경로를 병렬로 탐색하고 가장 근거 있는 경로를 선택한다.
    """
    # Step 1: 초기 가설 생성 (3~5개 경로)
    hypotheses = generate_initial_hypotheses(patient_data, n=4)
    # ["ACS", "대동맥 박리", "폐색전증", "위식도역류"]

    # Step 2: 각 경로에서 증거 수집
    evaluated_paths = []
    for hypothesis in hypotheses:
        evidence_for = collect_supporting_evidence(patient_data, hypothesis)
        evidence_against = collect_refuting_evidence(patient_data, hypothesis)
        score = evaluate_path(evidence_for, evidence_against)

        evaluated_paths.append({
            "hypothesis": hypothesis,
            "score": score,
            "evidence_for": evidence_for,
            "evidence_against": evidence_against
        })

    # Step 3: 점수가 가장 높은 경로 선택
    evaluated_paths.sort(key=lambda x: x["score"], reverse=True)
    top_diagnosis = evaluated_paths[0]

    # 2위와 점수 차가 적으면 경고
    if evaluated_paths[1]["score"] > top_diagnosis["score"] * 0.8:
        top_diagnosis["warning"] = "감별진단 불확실 — 추가 검사 권고"

    return top_diagnosis
```

**장점:** 여러 경로를 탐색하므로 중요한 진단을 놓칠 가능성이 낮다
**단점:** API 호출 횟수가 많아 비용과 지연이 증가한다

---

## 패턴 4 — Plan-and-Execute

먼저 전체 계획을 수립하고, 그 다음에 단계별로 실행한다.

```python
def plan_and_execute(goal: str) -> str:
    # Phase 1: 실행 전 전체 계획 수립
    plan = create_plan(goal)
    # ["1. 검사 결과 수집", "2. 감별진단 생성", "3. 가이드라인 검색", "4. SOAP 작성"]

    # Phase 2: 계획 단계별 실행
    results = {}
    for step in plan:
        results[step] = execute_step(step, context=results)

    return synthesize_results(results)
```

**의료 적합성:** 절차가 명확히 정해진 경우(수술 전 체크리스트, 스크리닝 프로토콜)에 적합하다.

---

## 계획 패턴 비교

| 패턴 | 탐색 방식 | 도구 사용 | 비용 | 의료 적합성 |
|------|-----------|-----------|------|-------------|
| CoT | 단일 경로, 선형 | 불필요 | 낮음 | 간단한 추론 |
| ReAct | 단일 경로, 반복 | 필수 | 중간 | 정보 수집이 필요한 진단 |
| ToT | 다중 경로, 병렬 | 선택적 | 높음 | 복잡한 감별진단 |
| Plan-and-Execute | 단일 경로, 계획 우선 | 필수 | 중간 | 절차 기반 워크플로우 |

---

## 핵심 정리

- CoT는 단계별 추론을 명시적으로 전개하며, 추론 과정 추적에 유리하다
- ReAct는 생각과 도구 사용을 번갈아 수행하여 실시간 정보를 반영한다
- Tree-of-Thought는 여러 경로를 탐색해 중요한 감별진단을 놓칠 위험을 줄인다
- 의료 진단에서는 ToT로 감별 범위를 넓히고 ReAct로 증거를 수집하는 조합이 효과적이다
- 패턴 선택은 정확성 요구 수준, 비용, 지연 허용 범위를 함께 고려해야 한다

## 관련 글

- [AI 에이전트란 — 챗봇과 무엇이 다른가](/blog/ai-agents/what-is-ai-agent)
- [멀티에이전트 시스템 — 여러 AI가 협력하는 의료 팀](/blog/ai-agents/multi-agent-system)
- [의료 에이전트 평가 — 정확도보다 중요한 안전성 측정법](/blog/ai-agents/agent-evaluation-medical)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
