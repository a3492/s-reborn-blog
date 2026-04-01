---
title: '왜 "신경망"이라고 부를까 — 뇌 구조에서 온 이름'
date: 2026-04-01
category: aerini
difficulty: beginner
tags: [역사, 신경망, 딥러닝, 뉴런, 뇌과학, beginner-friendly]
reading-time: 5
description: "1943년 뉴런 수학 모델에서 딥러닝까지 신경망이라는 이름의 유래와 진화"
draft: false
---

딥러닝을 설명할 때 꼭 나오는 단어가 "신경망"입니다. 이름만 들으면 뇌와 관련이 있을 것 같습니다. 실제로 뇌에서 이름을 따왔습니다. 의사라면 더 친근하게 이해할 수 있는 이야기입니다.

## 신경망 탄생 타임라인

| 연도 | 사건 | 핵심 인물 |
|------|------|----------|
| **1943** | 맥컬럭-피츠 모델: 뉴런을 수학 함수로 표현 | Warren McCulloch, Walter Pitts |
| **1958** | 퍼셉트론(Perceptron) 발명: 단순 학습 가능한 인공 뉴런 | Frank Rosenblatt |
| **1969** | 퍼셉트론의 한계(XOR 문제) 발견 → 1차 AI 겨울 | Minsky & Papert |
| **1986** | 다층 신경망 + 역전파 알고리즘으로 부활 | Hinton, Rumelhart |
| **2006** | "Deep" 신경망 개념 제안 → 딥러닝 시대 시작 | Geoffrey Hinton |
| **2012** | AlexNet — 8층 딥러닝으로 이미지 인식 혁명 | Alex Krizhevsky |
| **2017** | Transformer — 신경망의 최신 진화형 | Google Brain 팀 |

## 실제 뇌랑 얼마나 비슷한가?

| 구분 | 생물학적 뇌 | 인공 신경망 |
|------|-----------|-----------|
| 기본 단위 | 뉴런 (100억 개) | 노드(Node) |
| 연결 | 시냅스 (수십조 개) | 가중치(Weight) |
| 학습 | 시냅스 강도 변화 (LTP/LTD) | 역전파로 가중치 업데이트 |
| 층 구조 | 피질 6층 구조 | 입력층·은닉층·출력층 |
| 활성화 | 활동전위 발생 여부 | 활성화 함수 (ReLU 등) |

## 의사 시각에서 흥미로운 포인트

해부학을 배운 의사라면 신경망이 더 직관적으로 이해됩니다. 뇌의 시각 피질이 단순 형태 → 복잡한 형태 순서로 처리하는 것처럼, 딥러닝도 낮은 층에서 선·곡선을 인식하고 높은 층에서 얼굴이나 병변을 인식합니다.

✅ 신경망의 "깊이(Depth)" = 뇌의 피질 처리 단계와 유사합니다.

❌ 하지만 실제 뇌처럼 에너지 효율적이지는 않습니다. 뇌는 20W, 대형 AI 학습은 수백만W입니다.

⚠️ 이름이 비슷해도 작동 원리는 다릅니다. AI가 뇌를 완전히 모방한 것은 아닙니다.

---

## 더 알고 싶다면

- [ChatGPT 탄생까지 — AI 70년 역사를 5분에](/blog/aerini/history-chatgpt-birth)
- ["딥러닝"이라는 이름은 누가 지었나](/blog/aerini/history-deep-learning-name)
- ["Attention is All You Need" — 8페이지짜리 논문이 세상을 바꿨다](/blog/aerini/history-attention-paper)
