---
title: "AI로 문헌 검토 계획 세우기"
date: 2026-04-01
category: aerini
difficulty: beginner
tags: [문헌검토, howto, beginner-friendly, 실전팁]
reading-time: 5
description: "연구 주제를 입력하면 AI가 검색 전략과 포함 기준 초안을 잡아줍니다"
draft: false
---

## 한줄 요약
PICO 형식의 연구 질문을 AI에 주면 PubMed 검색 전략, MeSH 용어, 포함·제외 기준 초안을 받을 수 있습니다.
AI 제안 키워드는 사서나 전문가와 최종 검토를 권장합니다.

---

## 당신의 상황
🎯 체계적 문헌 고찰이나 서론 작성을 위해 문헌 검토를 해야 하는데, 검색 키워드가 너무 많이 나오거나 너무 적게 나와서 갈피를 잡기 어렵습니다.

💡 AI에 연구 주제를 주면 검색 전략 초안을 만들어 줍니다. 막막한 시작을 빠르게 뚫을 수 있습니다.

## 이렇게 하면 됩니다

### Step 1: PICO 형식으로 연구 질문 정리하기
문헌 검토의 범위를 PICO로 정리합니다. 처음에 막연해도 괜찮습니다.

```
PICO 예시:
P (대상): 성인 2형 당뇨병 환자
I (중재): SGLT-2 억제제
C (비교): DPP-4 억제제
O (결과): 심혈관 사건 발생률, 입원율
```

### Step 2: AI에 프롬프트 입력하기
체계적 문헌 고찰 목적임을 명시하면 더 정확한 검색 전략이 나옵니다.

```
다음 PICO 형식의 연구 질문으로 체계적 문헌 고찰을 하려고 합니다.
PubMed 검색 전략과 MeSH 용어를 제안해줘.
다음을 포함해줘:
1. 주요 MeSH 용어 목록
2. 자유어(Free text) 키워드 목록
3. Boolean 연산자를 사용한 검색식 예시
4. 포함 기준과 제외 기준 초안

PICO:
P: 성인 2형 당뇨병 환자 (18세 이상)
I: SGLT-2 억제제 (empagliflozin, dapagliflozin, canagliflozin)
C: DPP-4 억제제 (sitagliptin, saxagliptin, alogliptin)
O: 주요 심혈관 사건 (MACE), 심부전 입원
```

### Step 3: 검색 전략 결과 확인하기
AI가 생성하는 검색 전략 예시입니다.

```
MeSH 용어:
- "Diabetes Mellitus, Type 2"[MeSH]
- "Sodium-Glucose Transporter 2 Inhibitors"[MeSH]
- "Dipeptidyl-Peptidase IV Inhibitors"[MeSH]
- "Cardiovascular Diseases"[MeSH]
- "Heart Failure"[MeSH]

자유어 키워드:
- SGLT2 inhibitor, gliflozin, empagliflozin, dapagliflozin
- DPP-4 inhibitor, gliptin, sitagliptin
- MACE, major adverse cardiovascular events
- heart failure hospitalization

검색식 예시:
("Diabetes Mellitus, Type 2"[MeSH] OR "type 2 diabetes"[tiab])
AND ("Sodium-Glucose Transporter 2 Inhibitors"[MeSH] OR "SGLT2 inhibitor"[tiab] OR "gliflozin"[tiab])
AND ("Cardiovascular Diseases"[MeSH] OR "MACE"[tiab] OR "heart failure"[tiab])

포함 기준 초안:
- 성인 (18세 이상) 2형 당뇨병 환자 대상 RCT 또는 코호트 연구
- SGLT-2 억제제와 DPP-4 억제제를 직접 비교한 연구
- 심혈관 결과를 1차 또는 2차 결과로 보고한 연구

제외 기준 초안:
- 1형 당뇨병 환자 대상 연구
- 추적 기간 6개월 미만
- 증례 보고, 사설, 리뷰 논문
```

### Step 4 (선택): 검색 범위 조정하기
검색 결과가 너무 많거나 적으면 범위를 조정하세요.

```
검색 결과가 너무 많이 나올 것 같아.
검색식을 좁히는 방법을 2가지 제안해줘.
```

## 더 잘 쓰는 팁
💡 팁 1: AI가 제안한 검색식을 PubMed에 바로 넣어보고 결과 수를 확인하세요. 너무 많으면 필터를 추가하고 너무 적으면 자유어를 늘리세요.
💡 팁 2: Embase나 Cochrane 검색이 필요하다면 프롬프트에 "Embase 검색식도 포함해줘"라고 추가하세요.
💡 팁 3: 검색 전략을 최종 확정하기 전에 의학 사서에게 검토를 부탁하면 완성도가 높아집니다.

## 실수하기 쉬운 부분
⚠️ 실수 1: AI가 존재하지 않는 MeSH 용어를 만들어 냄 → 해결: MeSH 브라우저(meshb.nlm.nih.gov)에서 제안된 용어를 직접 확인하세요.
⚠️ 실수 2: 자유어 없이 MeSH만 쓰다가 최신 논문을 놓침 → 해결: MeSH와 자유어를 OR로 묶은 검색식을 사용하세요.

## 다른 방법도 있어요
- Rayyan: AI 기반 문헌 스크리닝 도구입니다. 검색된 논문 목록을 업로드하면 관련성을 자동으로 분류해 줍니다.
- Elicit: AI로 연구 질문에 맞는 논문을 요약하고 비교해 주는 무료 도구입니다.

## 더 나아가기
👉 [AI로 임상 연구 아이디어 찾기](/blog/aerini/ai-research-idea)
👉 [AI로 연구비 신청서 초안 빠르게 쓰기](/blog/aerini/ai-grant-abstract)
👉 [AI로 케이스 발표 준비하기](/blog/aerini/ai-case-presentation)
👉 [모든 애린이 글 보기](/blog/?category=aerini)
