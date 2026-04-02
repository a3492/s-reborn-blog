---
title: "AutoGen — AI들이 서로 대화하며 문제를 푸는 방식"
date: 2026-04-01
category: orchestration
tags: ["cu2604021138", "AutoGen", "Microsoft", "멀티에이전트", "대화형에이전트"]
description: "RoundPrep 제14화. 대화형 멀티에이전트를 PoC에 얹을지 말지."
read_time: 12
difficulty: "intermediate"
draft: false
type: "guide"
series: "RoundPrep — 회진 브리핑을 만든다"
series_order: 14
thumbnail: ""
key_takeaways:
  - "Microsoft가 만든 AutoGen은 에이전트들이 자연어로 서로 대화하면서 협력하는 프레임워크다. 어떻게 동작하고 어떤 상황에 맞는지 살펴본다."
  - "이 글은 설계 관점 정리이며, 프로덕션 도입 전 보안·비용·감사 요구를 별도 검토한다."
  - "태그 cu2604021138: Cursor 초안 — 프레임워크·API·병원 정책은 공식 문서를 본다."
---
> RoundPrep 제14화. “그냥 애들한테 서로 토론시키면 알아서 되지 않을까?”라는 근거 없는 낙관. 대화형 멀티에이전트를 실험해 보는 밤.



## 한줄 요약
AutoGen은 AI 에이전트들이 사람처럼 대화를 주고받으면서 문제를 해결하게 하는 프레임워크다 — 코드 실행, 검색, 검토가 대화 형태로 이루어진다.

### 테제

**에이전트 대화는 유연하지만, 종료 조건과 사람 개입 없으면 영원히 떠든다.**

### 스테이크

RoundPrep 회의에서 “멀티에이전트 멋지다”가 **일정**을 잡아먹는 걸 막아야 한다.

### 전환점 — RoundPrep 메모

두 에이전트가 서로 동의만 하다 **실제 툴 호출은 안 함** — 가짜 진전.


## 본문

### AutoGen의 핵심 철학

LangGraph는 그래프로 흐름을 설계한다. CrewAI는 역할을 정해주면 팀이 일한다. AutoGen은 다르다.

AutoGen에서 에이전트들은 대화(conversation)를 통해 협력한다. 사람이 동료와 슬랙으로 일하는 것처럼, AI 에이전트들이 메시지를 주고받으면서 문제를 함께 푼다.

```
사용자: "이 환자의 약물 최적화 방안을 검토해줘"

내과 에이전트: "현재 복약 목록을 보니 리시노프릴 10mg와 스피로노락톤이 함께 있네요.
               고칼륨혈증 위험이 있습니다. 약사에게 검토 요청합니다."

약사 에이전트: "맞습니다. 최근 K+ 수치를 확인해봐야 합니다.
               K+ > 5.5이면 스피로노락톤 감량 또는 중단을 고려해야 합니다.
               Lab 에이전트에게 최신 수치 요청합니다."

Lab 에이전트: "최근 K+ = 5.2 mEq/L (2일 전). 현재 정상 범위이지만 모니터링 필요합니다."

약사 에이전트: "K+ 5.2이므로 당장 변경은 불필요합니다.
               1주 후 재확인을 권고합니다."
```

---

### AutoGen의 주요 에이전트 타입

AssistantAgent
LLM 기반 에이전트. 대화에 참여하고 코드를 작성하거나 답변한다.

```python
from autogen import AssistantAgent

internist = AssistantAgent(
    name="내과전문가",
    llm_config={
        "model": "gpt-4o",
        "temperature": 0.1
    },
    system_message="""
    당신은 내과 전문의입니다.
    약사, Lab 에이전트와 협력해서 약물 최적화를 검토합니다.
    의학적 판단을 내리되, 최종 처방은 사람 의사의 승인이 필요합니다.
    """
)
```

UserProxyAgent
사람(또는 자동 실행)을 대신하는 에이전트. 코드를 실제로 실행하거나 사람의 입력을 받는다.

```python
from autogen import UserProxyAgent

human_physician = UserProxyAgent(
    name="담당의사",
    human_input_mode="TERMINATE",  # "끝"이라는 메시지를 보내면 대화 종료
    max_consecutive_auto_reply=0,  # 항상 사람 입력 대기
    code_execution_config=False
)
```

GroupChat
여러 에이전트가 하나의 대화방에서 토론한다.

```python
from autogen import GroupChat, GroupChatManager

# 대화 참여자
participants = [internist, pharmacist, lab_agent, human_physician]

# 그룹 채팅 설정
group_chat = GroupChat(
    agents=participants,
    messages=[],
    max_round=20,  # 최대 20번 대화
    speaker_selection_method="auto"  # AI가 다음 발언자 결정
)

# 대화 매니저 (누가 다음에 말할지 조율)
manager = GroupChatManager(
    groupchat=group_chat,
    llm_config={"model": "gpt-4o"}
)

# 대화 시작
human_physician.initiate_chat(
    manager,
    message="환자 P12345의 약물 최적화 방안을 검토해주세요."
)
```

---

### AutoGen vs LangGraph vs CrewAI

| | AutoGen | LangGraph | CrewAI |
|--|---------|----------|--------|
| 핵심 추상화 | 대화 | 그래프 | 역할·태스크 |
| 흐름 제어 | 대화로 자연스럽게 | 명시적 그래프 | 프로세스 설정 |
| 코드 실행 | 강점 | 가능 | 제한적 |
| 예측 가능성 | 낮음 (대화가 자유로움) | 높음 | 중간 |
| 디버깅 | 어려움 | 쉬움 | 중간 |
| 적합 사례 | 탐색적 문제 해결 | 정형화된 워크플로우 | 역할 기반 팀 작업 |

---

### AutoGen이 빛나는 순간: 코드 실행 협업

AutoGen의 가장 강력한 사용 사례는 코드를 작성하고 실행하는 협업이다.

```
사용자: "이 환자 데이터로 HbA1c 추이 그래프 그려줘"

코딩 에이전트:
"파이썬 코드를 작성하겠습니다:
```python
import pandas as pd
import matplotlib.pyplot as plt

data = {
    'date': ['2025-01', '2025-04', '2025-07', '2025-10', '2026-01'],
    'hba1c': [9.2, 8.5, 7.8, 7.2, 6.9]
}
df = pd.DataFrame(data)
plt.plot(df['date'], df['hba1c'], marker='o')
plt.axhline(y=7.0, color='red', linestyle='--', label='목표치')
plt.title('HbA1c 추이')
plt.savefig('hba1c_trend.png')
```
"

실행 에이전트:
"코드 실행 완료. 그래프 저장됨.
 주목할 점: 6개월째부터 목표치(7.0) 도달. 치료 효과 양호."

해석 에이전트:
"HbA1c가 9.2에서 6.9로 2.3포인트 개선됐습니다.
 목표치 달성까지 약 12개월 소요됐습니다.
 현재 처방 유지를 권고하며, 다음 검사는 3개월 후를 제안합니다."
```

---

### 실제 사용 시 주의점

대화 비용: 그룹 채팅에서 에이전트들이 대화를 길게 이어가면 토큰 비용이 기하급수적으로 늘어난다. `max_round` 설정과 비용 모니터링이 필수다.

루프 방지: "누가 다음에 말할지"를 AI가 결정하다 보면 같은 에이전트가 계속 발언하거나 대화가 핵심에서 벗어날 수 있다.

예측 불가능성: 대화가 자유롭기 때문에 같은 입력에도 다른 대화 흐름이 생긴다. 정형화된 워크플로우에는 LangGraph가 더 적합하다.

의료 AI처럼 결과의 일관성이 중요한 경우에는 AutoGen보다 LangGraph나 CrewAI가 더 안전한 선택일 수 있다.


---

### 다음 회의 한 줄

**박과장:** “대화 로그도 **감사 대상**입니다. 저장 정책부터.”

### 다음 화

역할·크루 단위로 나누는 또 다른 접근 — [CrewAI 입문](/blog/orchestration/crewai-intro/)


*편집 초안(cu2604021138). 프레임워크·API·임상 규정은 발행일 이후 바뀔 수 있으니 공식 문서와 병원 정책을 기준으로 확인한다.*
