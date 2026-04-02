---
title: "System Prompt가 뭐예요?"
date: 2026-03-31
category: aerini
difficulty: beginner
tags: [system-prompt, prompt-engineering, llm, ai-basics]
reading-time: 4
description: AI에게 역할과 규칙을 미리 설정하는 숨겨진 지시문
draft: false
---

## 한줄 요약

System Prompt는 AI가 대화를 시작하기 전에 받는 '역할 지침서'예요. 사용자 눈에는 안 보이지만 AI의 모든 답변 방식을 결정해요.

---

## 왜 알아야 할까?

- 💡 ChatGPT와 의료용 AI가 왜 다르게 행동하는지 이해할 수 있어요
- 💡 업무용 AI 챗봇을 만들 때 System Prompt가 핵심이에요
- 💡 AI가 항상 일관된 페르소나를 유지하도록 설정할 수 있어요
- 💡 프롬프트 엔지니어링의 가장 강력한 도구예요

## 이게 뭐예요?

System Prompt는 사용자가 첫 메시지를 보내기 전에 AI에게 전달되는 특별한 지시문이에요. 보통 서비스를 만드는 개발자나 관리자가 설정해요. 사용자에게는 보이지 않지만 AI의 모든 응답에 영향을 줘요.

ChatGPT, Claude, Gemini 모두 기본적으로 System Prompt가 설정돼 있어요. 서비스마다 다른 이유가 이것 때문이에요.

🏥 비유 1: 새 직원 오리엔테이션

신규 간호사가 첫 출근하면 "이 병동에서는 이렇게 행동해요. 환자에게는 항상 존댓말을 써요. 응급 상황엔 이 번호로 연락해요." 같은 교육을 받아요. System Prompt는 AI에게 주는 이 오리엔테이션 자료예요. 매 대화마다 다시 설명하지 않아도 AI가 규칙을 알고 있어요.

🏥 비유 2: 전공의에게 미리 알려주는 병동 규칙

새로운 전공의가 병동에 오면 선배가 먼저 알려줘요. "이 병동 주치의는 오전 8시에 라운딩해요. 처방은 꼭 시스템으로 넣고, 구두 처방은 안 해요." 이렇게 미리 알려주면 전공의가 매번 물어보지 않아도 됩니다. System Prompt가 정확히 이 역할이에요.

한줄 정리: System Prompt = AI에게 주는 오리엔테이션 자료. 역할, 규칙, 말투, 제한 사항을 미리 설정해요.

## 예시를 들어볼게

예시 1 — 기본 System Prompt

```
당신은 친절한 고객 서비스 직원입니다.
항상 한국어로 답변하세요.
개인정보는 절대 요청하지 마세요.
```

이 System Prompt가 있으면 AI는 항상 한국어로, 친절하게 답해요.

예시 2 — 의료용 System Prompt

```
당신은 내과 전문의를 보조하는 AI입니다.
진단은 제안만 하고, 최종 판단은 의사에게 맡겨야 한다고 명시하세요.
항상 근거 기반 의학(EBM) 원칙을 따르세요.
의료법과 환자 개인정보 보호를 최우선으로 하세요.
```

예시 3 — 역할 부여 System Prompt

```
당신은 EMR 데이터 분석 전문가입니다.
항상 구조화된 형식으로 답변하세요.
수치 데이터는 반드시 표 형식으로 보여주세요.
불확실한 정보에는 반드시 "확인 필요" 라고 표시하세요.
```

## 의료에서는 이렇게 써요

활용 1: 의료 AI의 안전한 기본 설정

❌ System Prompt 없는 AI: "이 증상이면 암일 수도 있어요" 처럼 불필요한 불안 유발

✅ System Prompt 있는 AI: "이 증상은 의사와 상담이 필요합니다. 제 답변은 참고용이에요"

의료용 AI는 책임 범위와 한계를 System Prompt로 명확히 해야 해요.

활용 2: 전문과별 맞춤 AI

❌ 일반 AI에게 매번 "당신은 소화기내과 전문의야"라고 설명

✅ System Prompt로 고정: 소화기내과 챗봇은 항상 그 전문과 맥락에서 답변

한 번 설정하면 모든 대화에서 일관성이 유지돼요.

활용 3: 법적·윤리적 가이드라인 준수

❌ System Prompt 없음: AI가 처방 추천, 진단 확정 같은 위험한 답변을 할 수 있음

✅ System Prompt에 명시: "처방 권한은 의사에게만 있습니다. 권고안만 제시하세요"

의료법 준수를 AI 레벨에서 강제할 수 있어요.

## 주의할 점 ⚠️

⚠️ System Prompt도 우회될 수 있어요

교묘한 프롬프트로 AI가 System Prompt 지시를 무시하게 만드는 공격(Prompt Injection)이 있어요. 민감한 의료 AI는 추가적인 보안 레이어가 필요해요.

⚠️ 너무 긴 System Prompt는 효과가 줄어요

System Prompt도 Context Window를 차지해요. 수백 줄짜리 규칙은 AI가 다 따르지 못할 수 있어요. 핵심 규칙 5-10개에 집중하는 게 더 효과적이에요.

⚠️ System Prompt가 만능은 아니에요

잘 설계된 System Prompt도 AI의 근본적인 한계를 없애진 못해요. 모델 자체의 능력 범위 안에서만 작동해요.

## 더 알고 싶다면

- [Prompt Engineering이 뭐예요?](/blog/aerini/what-is-prompt-engineering)
- [AI 안전성이 뭐예요?](/blog/aerini/what-is-ai-safety)
- [Chain of Thought가 뭐예요?](/blog/aerini/what-is-chain-of-thought)

[🩺 모든 애린이 글 보기](/blog/category/aerini)
