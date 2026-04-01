---
title: "AI 오류 처리 — 모델이 틀렸을 때 시스템이 해야 할 일"
date: 2026-04-01
category: harness-engineering
tags: ["오류처리", "Fallback", "AI안정성", "하네스"]
description: "AI는 반드시 실패한다. 언제, 어떻게 실패할지 미리 설계해두는 것이 하네스 엔지니어링의 핵심이다."
read_time: 6
difficulty: "intermediate"
draft: false
thumbnail: ""
---

## 한줄 요약
AI 시스템의 품질은 "잘 될 때"가 아니라 "실패할 때" 어떻게 행동하느냐로 결정된다.

## 본문

### AI는 반드시 실패한다

이것은 비관론이 아니다. 현실이다.

AI 시스템이 실패하는 방식은 크게 세 가지다:

**모델 실패**: 틀린 답을 자신 있게 준다 (할루시네이션)
**시스템 실패**: API 타임아웃, rate limit 초과, 서버 오류
**설계 실패**: 예상 못한 입력에 예상 못한 출력

이 세 가지 실패에 대한 대응이 설계되어 있지 않으면, AI 시스템은 실패할 때 최악의 방식으로 실패한다 — 아무 경고 없이, 틀린 정보를 사실처럼 출력하면서.

---

### 실패 유형별 대응 전략

**1. 할루시네이션 감지와 대응**

모델이 없는 정보를 만들어내는 것. 특히 숫자, 인명, 약물명, 연구 인용에서 많이 발생한다.

```
탐지 방법:
- 신뢰도 점수 확인 (모델이 "불확실하다"고 신호를 보낼 때)
- 응답의 특정 패턴 감지 ("~에 따르면", "~라고 알려져 있습니다")
- 외부 데이터베이스와 교차 검증

대응:
- 신뢰도가 낮으면 응답에 명시적으로 표시
- "이 정보는 검증이 필요합니다" 자동 추가
- 중요한 수치는 반드시 출처 요구
```

**2. API 실패와 재시도**

```python
import time
from typing import Optional

def call_ai_with_retry(
    prompt: str,
    max_retries: int = 3,
    timeout: float = 10.0
) -> Optional[str]:

    for attempt in range(max_retries):
        try:
            response = ai_api.call(prompt, timeout=timeout)
            return response

        except TimeoutError:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # 지수 백오프: 1초, 2초, 4초
                time.sleep(wait_time)
                continue
            return None  # 최종 실패

        except RateLimitError:
            # Rate limit은 더 오래 기다려야 함
            time.sleep(60)
            continue

        except APIError as e:
            log_error(e)
            return None  # 즉시 실패

    return None
```

**3. 파싱 실패**

JSON을 기대했는데 일반 텍스트가 왔을 때.

```python
def safe_parse(response: str) -> dict:
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        # 재시도: "JSON 형식으로만 답해줘"
        retry = ask_for_json_retry(response)
        try:
            return json.loads(retry)
        except:
            # 최종 실패: 빈 구조 반환
            return {"error": "parse_failed", "raw": response}
```

---

### Graceful Degradation (우아한 저하)

항공기 설계에서 나온 개념이다. 엔진 하나가 꺼져도 비행기는 날 수 있어야 한다. AI 시스템도 마찬가지다.

AI 기반 감별진단 시스템이 있다고 하자. AI가 실패했을 때:

| 실패 수준 | 대응 |
|-----------|------|
| AI 응답이 느림 | 캐시된 이전 결과 먼저 보여주고, 새 결과로 갱신 |
| AI 응답 파싱 실패 | 원문 텍스트라도 보여주고 "구조화 실패" 표시 |
| AI API 완전 다운 | "AI 기능 일시 중단, 표준 참고자료 링크" 제공 |
| 심각한 오류 탐지 | 응답 숨기고 담당자 에스컬레이션 |

아무것도 안 보여주는 것보다, 불완전하더라도 뭔가를 보여주는 게 낫다. 단, 불완전하다는 걸 명확히 알려야 한다.

---

### 의료 AI에서의 특수한 오류 처리

의료 도메인은 오류의 비용이 높다. 일반 오류 처리로는 부족하다.

**응급 상황 탐지 실패**

AI가 자살 위험 신호를 담은 텍스트를 일반 질문으로 처리한 경우:
→ 별도 위기 감지 레이어를 AI와 병렬로 실행한다. AI가 실패해도 위기 감지는 독립적으로 동작.

**약물 용량 이상치**

AI가 "500mg 이상의 metformin"을 권고한 경우 (실제 상한은 2550mg/day지만 단회 투여로 500mg은 비정상):
→ 수치 범위 체크 레이어가 AI 응답을 검증. 이상치 발견 시 자동 플래그.

**과거 기록과의 불일치**

AI가 알레르기가 있는 약을 권고한 경우:
→ EMR 연동 가드레일이 환자 알레르기 목록과 대조.

---

### 오류 로깅과 개선 루프

```
오류 발생
    ↓
자동 로그 저장 (입력, 출력, 오류 유형, 타임스탬프)
    ↓
심각도 분류 (critical/high/medium/low)
    ↓
critical: 즉시 알림 → 담당자 확인
high: 일일 리뷰
medium/low: 주간 리뷰
    ↓
패턴 분석: 특정 상황에서 반복되는 오류인가?
    ↓
프롬프트 개선 또는 가드레일 추가
    ↓
Eval 테스트 추가 (같은 오류 재발 방지)
```

오류 처리는 일회성이 아니다. 오류를 수집하고 분석해서 시스템을 계속 개선하는 루프가 하네스 엔지니어링의 핵심 사이클이다.
