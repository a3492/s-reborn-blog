---
title: "슈퍼바이저 패턴 — 관리자 AI가 팀을 지휘하는 구조"
date: 2026-04-01
category: orchestration
tags: ["cu", "슈퍼바이저", "계층구조", "멀티에이전트", "오케스트레이션"]
description: "슈퍼바이저 패턴은 하나의 AI가 여러 전문 에이전트를 관리하고 작업을 위임하는 계층적 오케스트레이션 구조다."
read_time: 7
difficulty: "intermediate"
draft: false
type: "guide"
series: "RoundPrep — 회진 브리핑을 만든다"
series_order: 8
thumbnail: ""
key_takeaways:
  - "슈퍼바이저 패턴은 하나의 AI가 여러 전문 에이전트를 관리하고 작업을 위임하는 계층적 오케스트레이션 구조다."
  - "이 글은 설계 관점 정리이며, 프로덕션 도입 전 보안·비용·감사 요구를 별도 검토한다."
  - "태그 cu: Cursor 초안 — 프레임워크·API·병원 정책은 공식 문서를 본다."
---
> RoundPrep 제8화. 역할을 쪼갰더니 아무도 “종료”를 선언하지 않는다. 한 명이 위에서 끊어 주는 그림이 필요해졌다.



## 한줄 요약
슈퍼바이저 AI는 목표를 이해하고 적절한 전문 에이전트에게 위임하며, 각 에이전트의 결과를 통합해서 최종 응답을 만든다.

## 본문

### 슈퍼바이저 패턴이란

병원 레지던트 팀을 생각해보자. 주임 레지던트(슈퍼바이저)가 있고, 내과·외과·영상의학과 전공의들(전문 에이전트)이 있다.

환자 케이스가 들어오면:
1. 주임 레지던트가 케이스를 파악한다
2. 어떤 전공의가 필요한지 결정한다
3. 각 전공의에게 구체적인 태스크를 위임한다
4. 결과를 받아서 종합한다
5. 최종 판단을 내린다

이 구조가 슈퍼바이저 패턴이다.

---

### 구현 방식

```python
from langgraph.graph import StateGraph, END
from typing import Literal

# 슈퍼바이저가 선택할 수 있는 전문 에이전트 목록
AGENTS = ["내과전문가", "약사", "영상전문가", "케이스매니저", "FINISH"]

def supervisor(state: dict) -> dict:
    """슈퍼바이저: 다음에 어떤 에이전트를 호출할지 결정"""

    system_prompt = """당신은 의료팀 슈퍼바이저입니다.
    현재 작업 상태를 보고 다음에 누구에게 일을 시킬지 결정하세요.

    가능한 선택지: {agents}

    현재 상태:
    {state}

    다음 행동을 선택하세요:"""

    response = llm.invoke(
        system_prompt.format(agents=AGENTS, state=state)
    )

    return {"next": response.next_agent}


def route(state: dict) -> str:
    """슈퍼바이저의 결정에 따라 다음 노드 선택"""
    return state["next"]


# 워크플로우 구성
workflow = StateGraph(dict)

# 슈퍼바이저 노드
workflow.add_node("supervisor", supervisor)

# 전문 에이전트 노드들
workflow.add_node("내과전문가", internist_agent)
workflow.add_node("약사", pharmacist_agent)
workflow.add_node("영상전문가", radiologist_agent)
workflow.add_node("케이스매니저", case_manager_agent)

# 슈퍼바이저 → 선택된 에이전트
workflow.add_conditional_edges(
    "supervisor",
    route,
    {
        "내과전문가": "내과전문가",
        "약사": "약사",
        "영상전문가": "영상전문가",
        "케이스매니저": "케이스매니저",
        "FINISH": END
    }
)

# 모든 에이전트 완료 후 슈퍼바이저로 귀환
for agent in ["내과전문가", "약사", "영상전문가", "케이스매니저"]:
    workflow.add_edge(agent, "supervisor")

workflow.set_entry_point("supervisor")
```

---

### 슈퍼바이저의 역할

1. 태스크 라우팅
"이 요청은 내과전문가에게", "이 검사 결과는 영상전문가에게" 등 어떤 에이전트가 현재 필요한지 판단.

2. 완료 판단
모든 필요한 정보가 모였고 최종 답변을 낼 수 있는지 판단. "FINISH"를 선택하는 시점.

3. 재시도 결정
에이전트가 불충분한 결과를 냈을 때 같은 에이전트를 다시 호출하거나 다른 에이전트에게 검토를 요청.

4. 결과 통합
각 에이전트의 결과를 종합해서 최종 보고서 생성.

---

### 슈퍼바이저 프롬프트 설계

슈퍼바이저의 품질이 전체 시스템 품질을 결정한다. 슈퍼바이저 프롬프트를 잘 써야 한다.

```
당신은 의료팀 슈퍼바이저 AI입니다.

## 팀 구성
- 내과전문가: 내과 질환 진단, 치료 계획
- 약사: 약물 검토, 상호작용 확인, 용량 계산
- 영상전문가: X-ray, CT, MRI 판독
- 케이스매니저: 입퇴원 계획, 보험, 사회적 지원

## 의사결정 원칙
1. 응급 상황이 의심되면 즉시 '응급에스컬레이션' 선택
2. 약물 변경이 있으면 반드시 약사 검토
3. 영상 결과가 있으면 영상전문가 먼저
4. 모든 정보가 모이면 FINISH

## 현재 완료된 태스크
{completed_tasks}

## 현재 미완료된 태스크
{pending_tasks}

다음에 누구에게 일을 시킬지 결정하세요.
반드시 JSON으로 응답: {"next": "에이전트이름", "reason": "이유"}
```

---

### 슈퍼바이저 패턴의 장단점

장점
- 중앙 집중 제어: 전체 흐름이 명확
- 유연성: 슈퍼바이저가 상황에 따라 다른 에이전트를 선택
- 확장성: 에이전트 추가가 쉬움

단점
- 병목: 슈퍼바이저가 모든 결정을 내려야 해서 느려질 수 있음
- 슈퍼바이저 실패: 슈퍼바이저가 잘못 판단하면 전체 시스템이 잘못됨
- 비용: 슈퍼바이저 호출이 매번 추가됨

대안: 슈퍼바이저 없는 피어 투 피어

에이전트들이 서로 직접 대화하고 결과를 넘긴다. 슈퍼바이저 병목은 없지만 흐름 제어가 어렵다. 소규모 팀(2~3명)에 적합.

의료처럼 명확한 책임 구조가 필요한 도메인에서는 슈퍼바이저 패턴이 더 적합하다. "누가 최종 결정을 내렸는가"가 분명해야 하기 때문이다.


---

### 이야기 속에서 이어서

다음 화: [에이전트 간 통신 — AI들이 서로 이야기하는 방법](/blog/orchestration/multi-agent-communication/) — 같은 팀이 막혔던 지점에서 이어진다.


*편집 초안(cu). 프레임워크·API·임상 규정은 발행일 이후 바뀔 수 있으니 공식 문서와 병원 정책을 기준으로 확인한다.*
