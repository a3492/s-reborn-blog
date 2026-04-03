---
title: "AI로 문헌 검색하기 — PubMed에서 Perplexity까지"
date: 2026-03-31
category: clinical-research
tags:
  - "cu2604021805"
  - "임상연구"
  - "논문"
  - "EBM"
  - "literature-search-ai"

description: "전통적인 PubMed MeSH 검색에 AI 도구를 보조로 결합하면 검색 재현율을 높이면서 탐색 시간을 대폭 단축할 수 있다."
thumbnail: ""
draft: false
---


## 한줄 요약

전통적인 PubMed MeSH 검색에 AI 도구를 보조로 결합하면 검색 재현율을 높이면서 탐색 시간을 대폭 단축할 수 있다.

## 전통적 PubMed 검색의 한계

PubMed는 전 세계 3,700만 편 이상의 생의학 논문을 보유한 최대 무료 의학 데이터베이스다. 그러나 최적의 검색을 위해서는 MeSH(Medical Subject Headings) 용어 체계 이해가 필요하고, 신조어나 최신 개념은 MeSH에 등록되지 않아 누락되기 쉽다.

또한 PubMed는 제목/초록 텍스트 검색이 기본이라 개념적 유사성(semantic similarity)을 반영하지 못한다. "같은 내용, 다른 표현"으로 쓰인 논문들이 검색에서 누락되는 이유다.

## AI 기반 검색 도구 비교

| 도구 | 강점 | 약점 | 무료 여부 |
|------|------|------|-----------|
| Consensus | 근거 합성, 질문 형태 검색 | 최신성 제한 (2024년 이전 강세) | 부분 무료 |
| Elicit | 데이터 추출 보조, PICO 구조 | 속도 느림, 커버리지 제한 | 부분 무료 |
| Semantic Scholar | 인용 네트워크, 영향력 지표 | UI 복잡, 학습 필요 | 무료 |
| Research Rabbit | 연관 논문 시각화, 컬렉션 관리 | 좁은 커버리지, 소규모 분야 취약 | 무료 |
| Perplexity | 최신 정보, 뉴스 + 논문 통합 | 환각(hallucination) 주의 | 부분 무료 |
| Connected Papers | 논문 계보 시각화 | 탐색용, 체계적 검색 부적합 | 부분 무료 |

## 도구별 활용 전략

### Consensus — 근거 기반 질문 검색

"Does statin therapy reduce all-cause mortality in primary prevention?"처럼 임상 질문을 그대로 입력하면, 관련 RCT와 메타분석의 결론을 요약해준다. 개별 논문 선별보다는 특정 주제의 근거 현황을 빠르게 파악하는 데 최적이다.

### Semantic Scholar — 인용 네트워크 탐색

특정 핵심 논문(seed paper)을 입력하면 해당 논문을 인용한 최신 연구와 참고문헌을 그래프로 보여준다. 분야의 이론적 계보를 파악하거나, 핵심 논문이 이후 연구에 어떻게 영향을 미쳤는지 추적할 때 활용한다.

### Research Rabbit — 관련 논문 군집 시각화

Zotero와 연동되며, 내 컬렉션에 추가한 논문들과 개념적으로 연관된 논문들을 클러스터 형태로 보여준다. 새 연구 주제를 탐색하거나 놓친 관련 연구를 발굴하는 데 유용하다.

### Perplexity — 최신 정보 탐색 (검증 필수)

2024년 이후 발표된 최신 가이드라인, 뉴스, 프리프린트 정보를 포함한다. 그러나 존재하지 않는 논문을 인용하는 환각이 빈번하므로, Perplexity에서 얻은 논문은 반드시 PubMed에서 PMID로 재확인해야 한다.

## PubMed 검색어 생성 프롬프트

AI로 PubMed 검색식을 생성하는 실전 프롬프트 예시다.

```
다음 PICO에 맞는 PubMed 검색식을 작성해줘.
MeSH 용어와 자유어를 모두 포함하고,
Boolean 연산자(AND, OR, NOT)와 필드 태그([MeSH], [tiab])를 사용해줘.

P: 성인 제2형 당뇨병 환자
I: GLP-1 수용체 작용제 (semaglutide, liraglutide, dulaglutide 포함)
C: SGLT-2 억제제 또는 위약
O: 주요 심혈관 사건(MACE) 감소 또는 심혈관 사망

필터: RCT 또는 체계적 문헌고찰, 2018년 이후, 영문
```

이 프롬프트로 생성된 검색식을 PubMed Advanced Search에 직접 붙여넣고 결과를 확인한다. 결과가 너무 많으면(>500) 검색어를 좁히고, 너무 적으면(<20) OR 연산자로 동의어를 추가한다.

## AI 검색 결과를 PubMed로 교차검증하는 워크플로우

1. 1단계: Consensus 또는 Elicit로 주제 탐색 + 핵심 논문 5-10편 식별
2. 2단계: Claude/GPT-4로 PubMed 검색식 생성
3. 3단계: PubMed Advanced Search에서 검색 실행 + 결과 저장(PMID 목록)
4. 4단계: Semantic Scholar로 핵심 논문의 최신 인용 논문 추가 탐색
5. 5단계: Research Rabbit으로 관련 클러스터 시각화 → 누락 논문 보완
6. 6단계: 최종 목록을 Zotero 또는 Rayyan에 통합

## 한국 의학 문헌 데이터베이스

국내 연구를 포함한 검색은 아래 데이터베이스를 반드시 추가해야 한다.

- KMbase (kmbase.medric.or.kr): 한국의학논문데이터베이스. 국내 의학저널 220여 종 수록. 무료 접근.
- RISS (riss.kr): 학위논문 포함 국내 학술자료 통합 검색. 대학원 연구자에게 필수.
- DBpia: 국내 학술지 원문 서비스. 기관 구독이 있으면 전문 열람 가능.
- KoreaMed (koreamed.org): 국내 영문 의학저널 전문 데이터베이스. PubMed에 색인되지 않은 국내 영문 논문 포함.

체계적 문헌고찰에서는 국내 데이터베이스 검색을 PRISMA 흐름도에 명시적으로 포함해야 한다.

## 문헌 관리: Zotero 활용

검색한 논문을 체계적으로 관리하려면 Zotero가 현재 가장 완성도 높은 무료 레퍼런스 매니저다. Chrome 확장 프로그램으로 PubMed, Google Scholar, Elicit에서 원클릭 저장이 가능하며, Word/Docs 플러그인으로 인용 삽입도 자동화된다. Zotero 6.0부터 PDF 내 AI 기반 주석 기능도 제공한다.

## 그레이 문헌(Grey Literature) 검색

체계적 문헌고찰에서는 학술지에 출판되지 않은 그레이 문헌도 포함해야 한다. 검색 대상은 다음과 같다.

- ClinicalTrials.gov: 진행 중이거나 완료된 임상시험 결과 (출판 전 데이터 포함)
- WHO ICTRP: 국제 임상시험 등록 데이터베이스
- 식약처 의약품 심사 보고서: 국내 시판 의약품의 임상 근거 자료
- 학회 초록집: ASCO, ESC, ADA 등 주요 학회의 미출판 결과

그레이 문헌을 제외하면 긍정적 결과 연구만 포함돼 효과 크기가 과대 추정될 수 있다. PRISMA 흐름도에 그레이 문헌 검색 경로를 별도로 기재해야 한다.

## 핵심 정리

- PubMed MeSH 검색과 AI 도구는 상호 보완적이며 대체 관계가 아니다
- Perplexity에서 얻은 논문은 PubMed에서 PMID로 반드시 재확인해야 한다
- 국내 연구 포함 SR에는 KMbase와 KoreaMed 검색이 필수다
- AI로 생성한 PubMed 검색식은 직접 실행해 결과 수와 관련성을 검증해야 한다
- Zotero + Research Rabbit + Semantic Scholar 조합이 현재 가장 효율적인 문헌 관리 워크플로우다

## 관련 글

- [체계적 문헌고찰 AI 자동화 — 6개월 작업을 2주로 줄이는 법](/blog/clinical-research/systematic-review-ai)
- [메타분석 기초 — Forest Plot 직접 만들고 해석하기](/blog/clinical-research/meta-analysis-basics)
- [AI로 논문 쓰기 — 윤리 기준과 실전 가이드](/blog/clinical-research/ai-paper-writing)
