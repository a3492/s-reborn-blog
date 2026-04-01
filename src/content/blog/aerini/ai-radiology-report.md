---
title: "영상 판독문, AI로 초안 잡기"
date: 2026-03-31
category: aerini
difficulty: beginner
tags: [영상의학, 판독문, CT, MRI, beginner-friendly]
reading-time: 4
description: "CT/MRI 소견을 텍스트로 설명하면 판독문 초안을 잡아주는 방법"
draft: false
---

## AI는 영상을 못 보지만, 소견을 들을 수 있습니다

AI는 CT 이미지를 직접 분석하지 못합니다. 하지만 내가 본 소견을 텍스트로 설명하면, 판독문 형식으로 정리해줍니다. 마치 받아쓰기 잘하는 조수처럼, 내가 말한 내용을 구조화된 문서로 만들어줍니다.

---

## 프롬프트 예시

```
다음 CT 소견을 바탕으로 판독문 초안을 작성해줘.
표준 판독문 형식(Findings, Impression)을 따르고,
영문으로 작성해줘.

소견:
- 흉부 CT, 조영 증강
- 우하엽에 3.2cm 불규칙한 경계의 결절
- 인접 림프절 비대 없음
- 흉수 없음
- 좌폐 이상 소견 없음
```

---

## 이 방법이 유용한 상황

✅ 영문 판독문 작성이 익숙하지 않을 때
✅ 야간 당직 중 빠른 초안이 필요할 때
✅ 전공의가 어텐딩 제출 전 초안을 준비할 때

---

## 주의 사항

❌ AI가 만든 판독문을 그대로 제출하지 마세요.
⚠️ 최종 판독은 반드시 영상의학과 전문의가 확인해야 합니다.
⚠️ AI는 이미지를 보지 않았으므로, 내가 놓친 소견은 반영되지 않습니다.

---

## 더 알고 싶다면

- [AI로 ECG 판독 보조하기](/blog/aerini/ai-ecg-interpretation)
- [AI로 내 진단에 반론 구하기](/blog/aerini/ai-second-opinion)
- [AI가 절대 못하는 게 뭔가요?](/blog/aerini/faq-ai-limitations)
