---
title: "응급실 케이스: 급성 복통 환자, AI는 어떻게 도와줄까?"
date: "2026-03-29"
category: "doctor-ai"
series: "cases"
series_order: 6
tags: ["케이스", "응급", "진단"]
description: "응급실 상황에서 AI를 활용한 감별진단"
read_time: 10
difficulty: "intermediate"
type: "casestudy"
thumbnail: ""
draft: false
---

## 한줄 요약

45세 남성의 우하복부 통증 케이스에서 AI는 충수염을 1순위로 올렸지만, 의사는 장간막 허혈의 위험 신호를 먼저 잡아냈다.

## 환자 정보

| 항목 | 내용 |
|------|------|
| 나이/성별 | 45세 남성 |
| 주증상 | 우하복부 통증 (RLQ pain), 12시간 전 발생 |
| 활력징후 | BP 138/88, HR 102, BT 38.3°C, RR 20 |
| 과거력 | 고혈압 (amlodipine 5mg), 심방세동 (warfarin) |

## 초기 평가

환자는 응급실 도착 시 우하복부 압통과 반발통(rebound tenderness)을 호소했다. 오심이 동반되었고, 마지막 식사는 8시간 전이었다.

### 신체 검진 소견

- McBurney point 압통 양성
- Rovsing sign 양성
- 장음 감소
- 복부 전체적 경직(guarding)은 없음

### 검사 결과

| 검사 | 결과 | 정상 범위 |
|------|------|-----------|
| WBC | 14,200/uL | 4,000-10,000 |
| CRP | 8.7 mg/dL | < 0.5 |
| Lactate | 3.8 mmol/L | 0.5-2.0 |
| PT/INR | 2.4 | 0.8-1.2 (비투약 시) |
| Cr | 1.0 mg/dL | 0.7-1.3 |
| UA | RBC 0-2/HPF | 정상 |

## AI 감별진단 입력

```
45세 남성. 12시간 전 발생한 우하복부 통증.
V/S: BP 138/88, HR 102, BT 38.3°C
PE: McBurney point tenderness (+), Rovsing sign (+),
    rebound tenderness (+), bowel sound decreased
Lab: WBC 14,200, CRP 8.7, Lactate 3.8, INR 2.4
PMH: HTN, Afib on warfarin
감별진단 목록과 각 질환의 확률, 추가 검사 추천을 제시하라.
```

## AI 분석 결과

AI는 다음과 같은 감별진단 목록을 제시했다.

| 순위 | 진단명 | AI 추정 확률 | 근거 |
|------|--------|-------------|------|
| 1 | 급성 충수염 | 65% | McBurney 압통, Rovsing sign, WBC/CRP 상승 |
| 2 | 대장 게실염 | 15% | 연령대, RLQ 통증, 염증 수치 |
| 3 | 요관결석 | 10% | 우측 통증, 남성 |
| 4 | 장간막 허혈 | 8% | Lactate 상승 |
| 5 | 기타 | 2% | Meckel 게실, 크론병 등 |

### AI 추천 추가 검사

- 복부 CT (조영 증강)
- 혈액 배양
- Lipase (췌장염 배제)

## 의사가 잡아낸 점

담당 응급의학과 전문의는 AI 결과를 검토한 후 다음을 지적했다.

### AI가 놓친 핵심 포인트

| 위험도 | 상황 | 대응 |
|--------|------|------|
| :red_circle: | Lactate 3.8은 단순 충수염으로 설명 불가 | 장간막 허혈 우선 배제 필요 |
| :red_circle: | Warfarin 복용 중 (INR 2.4) | 수술 전 응고 교정, 출혈 위험 평가 |
| :yellow_circle: | 심방세동 환자의 복통 | 상장간막동맥(SMA) 색전 가능성 |
| :green_circle: | 요관결석은 UA 정상으로 사실상 배제 | 추가 검사 불필요 |

의사의 판단: **"Lactate 3.8 + Afib 병력 = 장간막 허혈부터 배제해야 한다."**

AI는 McBurney 압통이라는 전형적 소견에 가중치를 과도하게 부여했고, 심방세동 환자에서 동맥 색전에 의한 장간막 허혈의 위험을 충분히 반영하지 못했다.

## 최종 경과

### CT 결과

복부 CT 조영 증강 검사에서 급성 충수염 소견이 확인되었다. 다만 SMA에 부분 혈전이 동반되어 있었고, 이는 소장 일부 구간의 조영 감소로 나타났다.

### 치료

1. **Warfarin 중단**, FFP 투여하여 INR 교정
2. 혈관외과 협진 하에 **SMA 혈전에 대한 항응고 치료** 우선 시행
3. 충수 절제는 INR 교정 후 시행 (수술 지연 24시간)
4. 헤파린 브릿지 요법 적용

### 결과

수술 후 7일째 퇴원. 소장 괴사 없이 회복. 만약 단순 충수염으로만 판단하고 즉시 수술에 들어갔다면, SMA 혈전 진행으로 소장 괴사 위험이 있었다.

## 이 케이스의 교훈

1. **AI는 전형적 소견에 편향된다** -- McBurney 압통 같은 교과서적 소견이 있으면 확률을 과도하게 높인다
2. **맥락(context)은 의사의 영역이다** -- Afib + Lactate 상승이라는 조합을 위험 신호로 읽는 것은 임상 경험에 기반한 판단
3. **AI는 보조 도구로 활용하되, 최종 의사결정은 의사가 내려야 한다**

## 핵심 정리

- 급성 복통에서 AI 감별진단은 빠른 목록 생성에 유용하지만, 환자별 위험 요인 통합은 부족하다
- Lactate 상승 + 심방세동 병력이 있으면 장간막 허혈을 반드시 우선 배제할 것
- Warfarin 복용 환자의 수술 전 INR 교정은 필수 단계

## 관련 글

- [다제약물 복용 환자 AI 검토](/blog/doctor-ai/cases/polypharmacy-review-ai)
- [약물 상호작용 검사 AI 도구](/blog/doctor-ai/tools/drug-interaction-ai)
- [처방 검토 프롬프트](/blog/doctor-ai/prompts/prescription-review-prompt)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
