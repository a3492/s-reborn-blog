---
title: "감염병 진단: 발열 환자의 신속한 감별진단"
date: "2026-03-29"
category: "doctor-ai"
series: "cases"
series_order: 9
tags: ["케이스", "감염", "진단"]
description: "응급 상황에서 빠른 감별진단을 위한 AI 활용"
read_time: 8
difficulty: "intermediate"
type: "casestudy"
thumbnail: ""
draft: false
---

## 한줄 요약

28세 남성의 2주간 불명열에서 AI는 림프종을 1순위로 추정했지만, 의사는 여행력 문진을 추가하여 결핵을 먼저 배제하기로 판단했다.

## 환자 정보

| 항목 | 내용 |
|------|------|
| 나이/성별 | 28세 남성 |
| 주증상 | 38.5°C 이상 발열 2주, 체중 5kg 감소 (1개월간) |
| 활력징후 | BP 118/72, HR 96, BT 38.7°C, RR 18 |
| 사회력 | 건축 현장 근로자, 6개월 전 동남아 여행 |

## 신체 검진 소견

- 양측 경부 림프절 종대 (1.5-2cm, 단단, 무통)
- 좌측 액와 림프절 1개 촉지
- 비장 촉지 안됨
- 인후 발적 없음
- 피부 발진 없음
- 관절 부종 없음

## 검사 결과

| 검사 | 결과 | 정상 범위 | 해석 |
|------|------|-----------|------|
| WBC | 11,200/uL | 4,000-10,000 | 경도 상승 |
| Hb | 11.8 g/dL | 13-17 | 경도 빈혈 |
| ESR | 68 mm/hr | < 20 | 현저히 상승 |
| CRP | 5.4 mg/dL | < 0.5 | 상승 |
| LDH | 380 U/L | 140-280 | 상승 |
| AST/ALT | 52/48 | < 40 | 경도 상승 |
| Ferritin | 820 ng/mL | 20-300 | 현저히 상승 |
| HIV Ab | 음성 | - | - |
| Blood culture | 보류 중 | - | - |

## AI 감별진단 입력

```
28세 남성, 2주간 38.5°C 이상 발열, 체중 5kg 감소 (1개월).
양측 경부 림프절 종대 (1.5-2cm, firm, non-tender), 좌측 액와 LN 1개.
Lab: WBC 11,200, Hb 11.8, ESR 68, CRP 5.4, LDH 380,
     AST 52, ALT 48, Ferritin 820, HIV Ab (-).
감별진단 목록과 각각의 추가 검사를 제시하라.
```

## AI 감별진단 결과

| 순위 | 진단 | AI 추정 확률 | 핵심 근거 |
|------|------|-------------|-----------|
| 1 | 림프종 (호지킨/비호지킨) | 35% | 무통성 림프절 종대, LDH 상승, B증상 |
| 2 | 결핵 (폐외 결핵 포함) | 25% | 발열, 체중 감소, 림프절 종대 |
| 3 | 성인형 Still's disease | 20% | 발열, Ferritin 820, 간기능 이상 |
| 4 | 전신성 감염 (EBV/CMV) | 12% | 연령, 림프절 종대, 간기능 이상 |
| 5 | 자가면역 질환 (SLE 등) | 8% | 발열, 빈혈, ESR 상승 |

### AI 추천 검사

- 림프절 조직검사 (excisional biopsy)
- Chest CT
- PET-CT
- ANA, Anti-dsDNA
- EBV VCA IgM, CMV IgM
- Peripheral blood smear

## 의사가 추가로 잡아낸 점

| 위험도 | 포인트 | 의사 판단 |
|--------|--------|-----------|
| :red_circle: | 동남아 여행력 (6개월 전) | 결핵 노출 위험 높음 -- AI 입력에 여행력 누락 |
| :red_circle: | 건축 현장 근로자 | 분진 노출 + 밀집 환경 → 결핵 감염 가능성 |
| :yellow_circle: | Ferritin 820 | Still's disease도 가능하지만, 결핵에서도 상승 가능 |
| :yellow_circle: | 림프절 biopsy 전에 비침습 검사 먼저 | 결핵이면 IGRA/객담 검사로 확인 가능 |

### 의사의 수정된 검사 전략

```
[1단계 — 즉시 시행]
- QuantiFERON-TB Gold (IGRA)
- 객담 AFB 도말/배양 3회
- Chest CT
- EBV/CMV IgM/IgG
- ANA, Anti-dsDNA, Complement (C3/C4)
- Peripheral blood smear

[2단계 — 1단계 결과에 따라]
- IGRA 양성 → 림프절 FNA (AFB 염색 + TB PCR)
- IGRA 음성 + 영상 이상 → Excisional biopsy (림프종 배제)
- 모두 음성 → PET-CT + 골수 검사 고려
```

## 경과

### 1단계 결과

- **QuantiFERON-TB Gold: 양성**
- Chest CT: 우상엽 미세 결절 2개, 종격동 림프절 경도 비대
- 객담 AFB 도말: 1회차 음성, 2회차 음성
- EBV/CMV: 모두 IgG(+), IgM(-)
- ANA: 음성

### 2단계

- 경부 림프절 FNA 시행
- AFB 염색: 양성
- TB PCR: Mycobacterium tuberculosis 검출
- **최종 진단: 폐외 결핵 (경부 림프절 결핵 + 폐결핵 의심)**

### 치료

- HREZ 요법 시작 (Isoniazid + Rifampicin + Ethambutol + Pyrazinamide)
- 4개월 후 2제 유지 요법 (HR) 전환 예정
- 접촉자 조사 시행

## 이 케이스의 교훈

1. **AI에 입력하지 않은 정보는 AI가 고려하지 못한다** -- 여행력, 직업력 같은 사회력이 감별진단을 바꾼다
2. **한국에서 결핵은 항상 감별 목록에 포함해야 한다** -- 인구 10만 명당 발생률이 OECD 1위 수준
3. **단계적 검사 전략**이 불필요한 침습적 검사를 줄인다 -- IGRA 먼저, biopsy는 그 다음

## 핵심 정리

- 불명열 + 림프절 종대에서는 감염(결핵), 종양(림프종), 자가면역(Still's) 3가지를 체계적으로 배제
- AI 프롬프트에 여행력, 직업력, 접촉력 등 사회력을 반드시 포함할 것
- Ferritin 극상승은 Still's disease만의 소견이 아니다 -- 결핵, 림프종에서도 나타남

## 관련 글

- [응급실 급성 복통 케이스](/blog/doctor-ai/cases/acute-abdominal-pain-case)
- [진단서 작성 프롬프트](/blog/doctor-ai/prompts/diagnostic-report-prompt)
- [의료 영상 AI 도구](/blog/doctor-ai/tools/medical-imaging-ai)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
