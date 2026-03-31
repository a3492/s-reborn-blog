---
title: "AI로 논문 쓰기 — 윤리 기준과 실전 가이드"
date: 2026-03-31
category: clinical-research
description: "이 글을 읽어보세요."
thumbnail: ""
draft: false
---

## 한줄 요약

모든 주요 저널은 AI를 공저자로 인정하지 않지만, 보조적 사용과 공시는 허용한다 — 어디에 써도 되는지, 어디는 안 되는지를 알아야 한다.

## 저널별 AI 사용 정책

2023년 초 ChatGPT가 등장한 직후 모든 주요 저널이 AI 사용 정책을 업데이트했다. 핵심은 AI를 공저자로 등재할 수 없다는 것이다 — 논문에 대한 책임(accountability)을 질 수 없기 때문이다.

| 저널 | AI 공저 허용 | AI 사용 공시 | 비고 |
|------|------------|------------|------|
| Nature | 불가 | 필요 | 2023년 1월 정책 발표 |
| NEJM | 불가 | 필요 | Methods 또는 Acknowledgments |
| JAMA | 불가 | 필요 | 명시적 공시 섹션 요구 |
| Lancet | 불가 | 필요 | 2023년 2월 사설로 입장 발표 |
| PLOS ONE | 불가 | 필요 | 2023년 3월 정책 개정 |

공시 위치는 저널마다 다르다. Acknowledgments 섹션에 포함하는 것이 가장 일반적이며, 일부 저널은 별도의 AI Disclosure 섹션을 요구한다.

## AI를 써도 되는 부분

### Introduction 배경 초안

연구 배경 서술, 기존 연구 동향 요약, 연구 의의 설명은 AI 초안이 유용하다. 단, AI가 인용한 논문은 반드시 PubMed에서 실제 존재 여부와 내용을 확인해야 한다. 없는 논문을 그대로 인용하는 것은 연구 부정행위(research misconduct)에 해당한다.

### Methods 통계 방법 설명

통계 방법 기술, 소프트웨어 버전 명시, 분석 흐름 서술은 AI가 정확하게 작성하는 부분이다. GPT-4나 Claude에 사용한 R/Stata/SAS 코드를 붙여넣고 "이 분석을 Methods 섹션 문체로 기술해줘"라고 요청하면 시간을 크게 절약할 수 있다.

### Table/Figure 캡션 초안

캡션 작성은 시간 대비 효과가 높은 AI 활용 영역이다. "이 table의 각 열 변수를 포함한 3-4줄 캡션을 영문으로 작성해줘. 통계 표기 방법(mean ± SD, IQR, n(%))을 명시해줘."

### 영어 교정

모국어가 한국어인 연구자의 영문 논문 교정은 AI가 가장 명확한 가치를 발휘하는 곳이다. Grammarly로 1차 문법 교정 후, ChatGPT에 "다음 문단을 academic English로 교정하되 의미는 바꾸지 말아줘"로 2차 교정하는 2단계 워크플로우가 효율적이다.

## AI를 쓰면 안 되는 부분

### 원본 데이터 해석 (Discussion의 핵심)

AI는 연구자가 직접 관찰한 데이터의 의미를 모른다. "우리 연구에서 예상과 달리 고령 환자군에서 효과가 더 컸다"는 해석은 연구자의 임상 경험과 데이터 맥락이 결합돼야 가능하다. AI가 이 부분을 대신 쓰면 연구자가 자신의 연구를 제대로 이해하지 못하는 결과를 낳는다.

### Conclusion의 새로운 기여 주장

"본 연구는 처음으로…"나 "이 결과는 임상 진료에…"와 같이 연구의 독창성과 기여를 주장하는 문장은 연구자 자신이 써야 한다. AI는 문헌을 학습했지만 해당 연구의 실제 맥락과 새로움을 판단하지 못한다.

### 존재하지 않는 참고문헌 인용

ChatGPT와 Claude는 실제로 존재하지 않는 논문을 인용하는 환각(hallucination)을 일으킨다. 인용한 모든 문헌은 PubMed에서 PMID로, 또는 DOI로 실제 접근해 내용을 확인해야 한다. AI가 제시한 인용을 그대로 사용하는 것은 논문 심사에서 즉시 발각되는 치명적인 오류다.

## 실전 워크플로우: 단계별 AI 활용

```
1단계: Methods 초안
   → ChatGPT에 분석 코드 + 연구 설계 요약 입력
   → "Methods 섹션 250단어로 draft 작성" 요청
   → 연구자가 검토 + 구체적 수치와 소프트웨어 버전 추가

2단계: Introduction 배경
   → Claude에 연구 PICO + 핵심 논문 3-5편 요약 입력
   → "논문 Introduction 배경 단락 초안 작성" 요청
   → PubMed에서 인용 논문 전부 실존 확인 + 내용 교차검증

3단계: Discussion 초안 구조
   → Claude에 결과 표 + 주요 발견 사항 입력
   → "Discussion 구조(주요 발견 → 기존 연구 비교 → 한계 → 임상적 의의)
      의 아웃라인과 각 단락 주제문" 요청
   → 실제 내용은 연구자가 직접 작성

4단계: 영어 교정
   → Grammarly로 1차 문법 교정
   → ChatGPT에 "영문법과 학술 문체 교정만, 의미 변경 금지" 요청
   → 교정 전후 비교하며 최종 확인

5단계: 투고 전 공시 문구 작성
   → Acknowledgments에 추가:
     "This study used AI language models (ChatGPT, Claude)
      for assistance with manuscript drafting and English editing.
      All scientific content and interpretations are the
      sole responsibility of the authors."
```

## ICMJE 가이드라인 (2023)

ICMJE(국제의학저널편집인위원회)는 2023년 저자 기준(authorship criteria)에 AI 관련 입장을 명시했다.

- AI/LLM은 저자 자격(authorship)을 충족하지 않는다
- AI를 사용한 경우 Methods 또는 Acknowledgments에 공시해야 한다
- 공시 내용: 사용한 AI 도구명, 사용 목적, 연구자가 결과를 검토했음을 명시

## 실수를 막는 체크리스트

투고 전 최종 점검 사항이다.

- [ ] AI가 인용한 모든 참고문헌을 PubMed/DOI로 실존 확인했는가
- [ ] AI 사용을 Acknowledgments에 명시했는가
- [ ] Discussion의 핵심 해석이 연구자가 직접 작성한 것인가
- [ ] 투고 저널의 AI 공시 요건을 확인했는가
- [ ] AI 교정 전후 의미 변경 여부를 검토했는가

## 핵심 정리

- 모든 주요 저널에서 AI는 공저자가 될 수 없으나 보조 사용 후 공시는 허용된다
- AI가 인용하는 논문은 반드시 실존 여부를 직접 확인해야 한다
- Discussion의 데이터 해석과 Conclusion의 기여 주장은 연구자가 직접 써야 한다
- Grammarly → ChatGPT 2단계 영어 교정이 비용 대비 효과가 높다
- ICMJE 가이드라인에 따라 AI 사용 도구명과 목적을 구체적으로 공시해야 한다

## 관련 글

- [AI로 문헌 검색하기 — PubMed에서 Perplexity까지](/blog/clinical-research/literature-search-ai)
- [체계적 문헌고찰 AI 자동화 — 6개월 작업을 2주로 줄이는 법](/blog/clinical-research/systematic-review-ai)
- [IRB와 AI 연구 — 동의서에 AI 사용을 어떻게 명시할까](/blog/clinical-research/irb-ai-research)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
