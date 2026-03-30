---
title: "만성질환 관리: 당뇨병 환자의 혈당 조절에 AI 활용"
date: "2026-03-29"
category: "doctor-ai"
series: "cases"
series_order: 7
tags: ["케이스", "만성질환", "관리"]
description: "장기 질환 관리에서 AI의 지속적인 도움"
read_time: 9
difficulty: "intermediate"
type: "casestudy"
thumbnail: ""
draft: false
---

## 한줄 요약

62세 여성 Type 2 DM 환자에서 AI는 SGLT2 억제제 추가를 제안했지만, 의사는 eGFR 감소 추세를 고려해 GLP-1 수용체 작용제를 선택했다.

## 환자 정보

| 항목 | 내용 |
|------|------|
| 나이/성별 | 62세 여성 |
| 진단 | Type 2 DM (10년), 고혈압, 이상지질혈증 |
| 현재 약물 | Metformin 1000mg bid, Glimepiride 2mg qd |
| 체중/BMI | 72kg / 28.4 |

## 검사 결과

| 검사 | 현재 | 3개월 전 | 6개월 전 | 목표 |
|------|------|----------|----------|------|
| HbA1c | 8.2% | 7.8% | 7.5% | < 7.0% |
| 공복혈당 | 168 mg/dL | 152 mg/dL | 140 mg/dL | < 130 |
| eGFR | 52 mL/min | 58 mL/min | 63 mL/min | > 60 |
| UACR | 120 mg/g | 85 mg/g | 60 mg/g | < 30 |
| LDL | 128 mg/dL | 135 mg/dL | 130 mg/dL | < 100 |
| BP | 142/88 | 138/86 | 135/82 | < 130/80 |

## AI에 입력한 프롬프트

```
62세 여성, Type 2 DM 10년차.
현재 약물: Metformin 1000mg bid, Glimepiride 2mg qd
HbA1c 8.2% (3개월 전 7.8%, 6개월 전 7.5%) → 상승 추세
eGFR 52 (3개월 전 58, 6개월 전 63) → 하강 추세
UACR 120 mg/g (3개월 전 85) → 상승 추세
BMI 28.4, BP 142/88
동반질환: 고혈압, 이상지질혈증

약물 조정 방안을 제시하라.
신기능 보호, 혈당 조절, 심혈관 위험 감소를 모두 고려할 것.
```

## AI 분석 결과

### AI 제안 1순위: SGLT2 억제제 추가

- **Empagliflozin 10mg qd** 또는 Dapagliflozin 10mg qd
- 근거: EMPA-REG OUTCOME 연구, 심혈관 보호 + 신장 보호 + 혈당 강하
- 예상 HbA1c 감소: 0.5-0.8%

### AI 제안 2순위: GLP-1 수용체 작용제

- **Semaglutide 0.5mg SC weekly** 시작 후 1.0mg 증량
- 근거: SUSTAIN-6, 체중 감소 + 심혈관 보호
- 예상 HbA1c 감소: 1.0-1.5%

### AI 공통 제안

- Glimepiride 감량 또는 중단 (저혈당 위험)
- Statin 용량 증가 (LDL 목표 미달)
- ARB 추가 또는 증량 (UACR 상승)

## 의사의 판단

| 위험도 | AI 제안 | 의사 판단 | 근거 |
|--------|---------|-----------|------|
| :red_circle: | SGLT2 억제제 1순위 | eGFR 52이고 하강 추세 → SGLT2 효과 감소 | eGFR < 45 시 혈당 강하 효과 거의 없음 |
| :yellow_circle: | Glimepiride 감량 | 동의하되 즉시 중단은 아님 | GLP-1 효과 발현까지 2-4주 필요 |
| :green_circle: | Statin 증량 | 동의 | Atorvastatin 20mg → 40mg |
| :green_circle: | ARB 추가 | 동의 | Losartan 50mg 추가 |

### 의사의 최종 처방

의사는 eGFR의 **하강 속도**(6개월간 63 → 52, 연간 약 22 mL/min 감소)에 주목했다. 이 속도라면 3-6개월 내 eGFR 45 이하로 진입할 가능성이 높아 SGLT2 억제제의 혈당 강하 효과가 제한적이다.

**최종 처방 변경:**

1. **Semaglutide 0.25mg SC weekly** 시작 (4주 후 0.5mg 증량)
2. Glimepiride 2mg → 1mg 감량 (4주 후 재평가)
3. Metformin 유지 (eGFR > 30이면 사용 가능)
4. Atorvastatin 20mg → 40mg 증량
5. Losartan 50mg qd 추가
6. 신장내과 협진 의뢰

## 3개월 후 추적 결과

| 검사 | 변경 전 | 3개월 후 | 변화 |
|------|---------|----------|------|
| HbA1c | 8.2% | 7.1% | -1.1% |
| 공복혈당 | 168 | 132 | -36 |
| eGFR | 52 | 50 | -2 (안정화) |
| UACR | 120 | 78 | -42 |
| 체중 | 72kg | 68kg | -4kg |
| LDL | 128 | 92 | -36 |
| BP | 142/88 | 128/78 | 개선 |

Semaglutide의 체중 감소 효과와 Losartan의 신장 보호 효과가 복합적으로 작용하여 전반적인 지표가 개선되었다.

## 이 케이스의 교훈

1. **AI는 현재 수치만 본다** -- eGFR 52 자체는 SGLT2 적응증이지만, 하강 속도까지 고려하면 판단이 달라진다
2. **추세(trend)를 읽는 것은 의사의 역할** -- 6개월간의 변화 방향이 약물 선택에 결정적
3. **다장기 보호 전략**이 필요한 환자에서 AI는 좋은 옵션 목록을 주지만, 우선순위는 임상 판단에 달렸다

## 핵심 정리

- eGFR 하강 속도가 빠른 당뇨 환자에서는 SGLT2보다 GLP-1 RA가 우선될 수 있다
- AI 제안은 가이드라인 기반이므로 개별 환자의 궤적(trajectory)을 반영하지 못한다
- 다제약물 환자의 약물 변경 시 단계적 접근(한 번에 하나씩)이 원칙

## 관련 글

- [다제약물 복용 환자 AI 검토](/blog/doctor-ai/cases/polypharmacy-review-ai)
- [처방 검토 프롬프트](/blog/doctor-ai/prompts/prescription-review-prompt)
- [약물 상호작용 검사 AI](/blog/doctor-ai/tools/drug-interaction-ai)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
