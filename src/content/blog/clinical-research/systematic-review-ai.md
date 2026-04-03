---
title: "체계적 문헌고찰 AI 자동화 — 6개월 작업을 2주로 줄이는 법"
date: 2026-03-31
category: clinical-research
tags:
  - "cu2604021805"
  - "임상연구"
  - "논문"
  - "EBM"
  - "systematic-review-ai"

description: "Rayyan, ASReview, Elicit을 조합하면 6개월짜리 체계적 문헌고찰(SR)을 2-3주로 단축할 수 있다."
thumbnail: ""
draft: false
---


## 한줄 요약

Rayyan, ASReview, Elicit을 조합하면 6개월짜리 체계적 문헌고찰(SR)을 2-3주로 단축할 수 있다.

## 전통적 SR의 단계별 소요 시간

체계적 문헌고찰은 근거중심의학(EBM)의 최상위 근거지만, 완성까지 평균 67주가 걸린다는 연구도 있다.

| 단계 | 전통적 소요 시간 | AI 활용 후 |
|------|----------------|-----------|
| 검색어 설계 | 1주 | 1-2일 |
| 논문 수집 | 1주 | 반나절 |
| 제목/초록 스크리닝 | 4-8주 | 3-5일 |
| 전문(Full-text) 검토 | 4-8주 | 1-2주 |
| 데이터 추출 | 4주 | 1-2주 |
| 합성 및 작성 | 2-4주 | 1주 |

## AI 도구별 역할과 선택법

### Rayyan (rayyan.ai)
ML 기반 스크리닝 도구로, 검토자의 "포함/제외" 패턴을 학습해 우선순위를 추천한다. 무료 플랜에서도 500편까지 스크리닝 가능하며, 2인 이상 팀 리뷰 시 의견 불일치를 시각화해준다. 코크란 리뷰(Cochrane Review) 준비에 가장 많이 쓰인다.

### ASReview (asreview.nl)
능동학습(Active Learning) 기반 오픈소스 스크리닝 툴이다. 검토자가 초반에 50-100편만 분류하면 이후 논문을 관련성 높은 순서대로 정렬해준다. 네덜란드 위트레흐트 대학 연구에서 수작업 대비 검토 시간 70% 절약을 확인했다. Python 기반이며 로컬 설치 가능해 데이터 보안이 필요한 의료 연구에 적합하다.

### Elicit (elicit.com)
논문 자동 요약 및 데이터 추출 보조 도구다. PICO 항목별 정보(샘플 크기, 개입, 결과 지표 등)를 논문에서 자동 추출해 표로 만들어준다. 데이터 추출 단계에서 연구자당 30-50% 시간을 절감할 수 있다.

### Consensus (consensus.app)
근거 합성에 특화된 AI 검색 엔진이다. "Does metformin reduce cardiovascular events?"처럼 질문하면 관련 연구들의 결론을 요약해준다. SR 배경 조사나 PICO 설계 전 예비 검색에 활용하면 효율적이다.

## ChatGPT/Claude로 PICO 기반 검색어 생성

```
다음 PICO에 맞는 PubMed 검색식과 MeSH 용어를 작성해줘.
P: 성인 제2형 당뇨병 환자
I: SGLT-2 억제제 (empagliflozin, dapagliflozin, canagliflozin)
C: 위약 또는 기존 혈당강하제
O: 주요 심혈관 사건(MACE), 입원율
검색 필터: RCT, 2015년 이후, 영문
```

이 프롬프트에 Claude나 GPT-4를 사용하면 MeSH 용어 조합, Boolean 연산자, 날짜 필터가 포함된 완성형 검색식을 5분 안에 받을 수 있다. 단, 전문 사서(librarian)의 검토를 거치는 것이 권고된다.

## PRISMA 흐름도 자동화

PRISMA(Preferred Reporting Items for Systematic Reviews and Meta-Analyses) 2020 흐름도는 Covidence 또는 DistillerSR에서 자동 생성된다. Covidence는 코크란 공식 플랫폼으로, 팀 리뷰와 흐름도 내보내기(PNG, Word)를 지원한다. 유료이지만 기관 구독이 있으면 무료로 사용 가능하다.

## AI 스크리닝 품질 검증

AI 스크리닝 결과를 무조건 신뢰하면 안 된다. 검증 방법은 다음과 같다.

- Recall(재현율) ≥ 0.95 목표: 실제 포함 논문 중 95% 이상을 AI가 포함 추천해야 한다.
- 무작위 10% 수동 검토: AI가 제외한 논문의 무작위 표본을 사람이 재검토한다.
- Seed set 품질 관리: ASReview의 경우 초기 훈련 데이터(seed set)에 핵심 논문이 반드시 포함돼야 한다.

검증 결과를 PRISMA 흐름도에 명시하거나, Methods 섹션에 "AI 스크리닝 도구명, 버전, 검증 방법, recall 값"을 기술하면 동료 심사자의 신뢰를 얻을 수 있다. BMJ Open이나 Systematic Reviews 저널에서 AI 스크리닝을 사용한 SR 논문들을 보면 이 정보를 Methods에 포함한 것을 확인할 수 있다.

## 비용과 접근성 요약

SR 워크플로우를 구성할 때 예산에 따라 도구를 선택해야 한다.

| 도구 | 비용 | 권장 사용 단계 |
|------|------|--------------|
| ASReview | 무료 (오픈소스) | 스크리닝 |
| Rayyan | 무료(개인)/유료(팀) | 팀 스크리닝 |
| Elicit | 월 $10-20 | 데이터 추출 |
| Covidence | 기관 구독 또는 Cochrane 회원 | PRISMA + 팀 관리 |
| DistillerSR | 유료 (기업용) | 대규모 SR |

예산이 없는 경우 ASReview + Zotero + R(메타분석)의 완전 무료 조합으로 SR 전 과정을 수행할 수 있다.

## AI 활용의 한계

AI 스크리닝이 단축하는 것은 양적 처리 시간이다. AI가 판단하지 못하는 것들이 있다.

- 임상적 맥락: 통계적으로 유의하지 않아도 임상적으로 중요한 연구 판별
- 방법론적 뉘앙스: 동일 RCT가 여러 보조 논문으로 분리 출판된 경우 인식
- 연구 편향 평가: Cochrane RoB 2.0 도구로 수행하는 비뚤림 위험 평가

결국 AI는 검토자의 시간을 절약하는 도구이지, 검토자를 대체하지 않는다.

## 실전 워크플로우 타임라인 (2주 목표)

- 1-2일차: Claude로 PICO 정의 + 검색식 생성 → PubMed/Embase/CENTRAL 검색 → Covidence에 업로드
- 3-5일차: Rayyan 또는 ASReview로 제목/초록 스크리닝
- 6-8일차: 전문 검토 (AI 추천 우선순위 순서대로)
- 9-11일차: Elicit으로 데이터 추출 + 수동 검증
- 12-14일차: 메타분석 또는 서술적 합성 + PRISMA 흐름도 완성

## 핵심 정리

- Rayyan은 팀 스크리닝, ASReview는 1-2인 스크리닝에 최적화돼 있다
- AI 스크리닝 후 recall ≥ 0.95를 반드시 검증해야 한다
- Elicit으로 데이터 추출 시간을 절반 이하로 줄일 수 있다
- AI는 임상적 판단력을 대체하지 않으므로, 반드시 사람이 최종 결정한다
- PRISMA 2020 흐름도는 Covidence에서 자동 생성된다

## 관련 글

- [AI로 문헌 검색하기 — PubMed에서 Perplexity까지](/blog/clinical-research/literature-search-ai)
- [메타분석 기초 — Forest Plot 직접 만들고 해석하기](/blog/clinical-research/meta-analysis-basics)
- [의료 AI 논문을 비판적으로 읽는 법 — TRIPOD-AI 체크리스트](/blog/clinical-research/statistical-methods-ai-studies)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
