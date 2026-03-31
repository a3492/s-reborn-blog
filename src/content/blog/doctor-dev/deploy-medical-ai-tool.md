---
title: "의료 AI 도구 배포 — 개인 사용부터 병원 도입까지"
date: 2026-03-31
category: doctor-dev
thumbnail: ""
draft: false
---

## 한줄 요약

의료 AI 도구 배포는 개인 → 팀 → 병원 → 외부 순으로 단계를 밟아야 한다 — 첫 단계는 오늘 당장 5분이면 된다.

---

## 배포 단계: 작게 시작해서 검증 후 확장

의료 AI 도구를 처음 만들었다고 해서 바로 병원 전체에 적용할 필요는 없다. 오히려 단계적 접근이 필수다.

```
개인 사용 → 팀 내부 → 병원 전체 → 외부 사용자
   (검증)      (피드백)    (안전성)     (규제)
```

각 단계마다 요구사항, 비용, 리스크가 다르다. 처음부터 완벽한 시스템을 목표로 하면 아무것도 출시하지 못한다. 실제로 임상 AI 프로젝트의 상당수가 "완벽한 시스템"을 만들려다 사용도 못 해본 채 종료된다.

## 1단계: 개인 사용 — Streamlit Cloud로 5분 배포

개인 사용 단계에서는 기능 검증이 목표다. 멋진 UI나 완벽한 보안보다, "이 도구가 실제로 유용한가"를 먼저 확인하는 것이 중요하다.

**Streamlit Cloud** (무료, 권장):

```python
# app.py — 기본 Streamlit 앱 예시
import streamlit as st
import openai

st.title("당뇨 환자 HbA1c 해석 도우미")

hba1c = st.number_input("HbA1c 값 입력 (%)", min_value=4.0, max_value=20.0)
if st.button("해석 요청"):
    # LLM 호출 로직
    st.write(f"HbA1c {hba1c}%: 해석 결과 표시")
```

배포 방법:
1. GitHub에 코드 업로드 (Private 저장소)
2. [share.streamlit.io](https://share.streamlit.io) 접속
3. GitHub 저장소 연결
4. "Deploy" 클릭 → URL 생성 완료

5분이면 인터넷 어디서나 접근 가능한 웹 앱이 만들어진다. 무료다.

**Gradio** (Hugging Face Spaces와 연동 용이):

```python
import gradio as gr

def analyze_symptom(symptom_text):
    # 분석 로직
    return f"입력된 증상: {symptom_text}"

demo = gr.Interface(fn=analyze_symptom,
                    inputs="text",
                    outputs="text")
demo.launch()
```

**Google Colab**: 코드 공유와 재현 가능성이 목적일 때 적합하다. 배포보다는 동료와 분석 코드를 공유하는 용도로 활용한다.

## 2단계: 팀 내부 — Docker + 병원 내부 서버

개인 사용에서 검증이 끝나면 팀으로 확장한다. 이 단계부터는 보안 요건이 달라진다. 외부 클라우드(Streamlit Cloud)에 환자 관련 데이터가 올라가면 안 된다.

**Docker 컨테이너**는 "내 컴퓨터에서 됐으니 어디서든 된다"를 보장한다.

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8501
CMD ["streamlit", "run", "app.py", "--server.address=0.0.0.0"]
```

```bash
# 빌드 및 실행
docker build -t medical-ai-tool .
docker run -p 8501:8501 medical-ai-tool
```

병원 내부 서버에 Docker를 설치하고 이 이미지를 실행하면, 병원 내부 네트워크에서만 접근 가능한 서비스가 된다. 외부 인터넷으로 데이터가 나가지 않는다.

이 단계에서 추가해야 할 것들:
- 사용자 로그인 기능 (누가 사용했는지 추적)
- 입력/출력 로그 기록 (추후 감사를 위해)
- 기본 오류 처리 및 알림

## 3단계: 병원 전체 배포 — 보안 필수 요건

병원 전체 배포는 정보보안팀, 의무기록팀, 법무팀과 협력이 필요하다.

**보안 필수 3요소:**

**HTTPS (암호화 통신)**: 모든 데이터 전송은 암호화되어야 한다. HTTP로 서비스하면 안 된다. Let's Encrypt를 사용하면 무료 SSL 인증서를 발급받을 수 있다.

**사용자 인증 (OAuth/SSO)**: 병원 Active Directory나 SSO(Single Sign-On)와 연동하면 별도 계정 관리 없이 병원 계정으로 로그인할 수 있다. 누가 언제 사용했는지 자동으로 기록된다.

**입력 로그 기록**: 의료 AI가 어떤 입력을 받고 어떤 출력을 냈는지 로그로 남겨야 한다. 문제 발생 시 원인 추적과 법적 책임 소재 확인을 위해 필수다.

```python
import logging
from datetime import datetime

def log_ai_interaction(user_id, input_text, output_text):
    logging.info({
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "input_hash": hash(input_text),  # 개인정보 포함 시 해시 처리
        "output_length": len(output_text)
    })
```

## 의료기기 소프트웨어(SaMD) 판단: 허가가 필요한가

이것이 가장 중요한 판단이다. 잘못 판단하면 법적 문제가 생긴다.

**식약처 허가가 필요한 경우 (SaMD)**:
- 진단에 직접 영향: "이 병변은 악성입니다" 같은 진단 제시
- 치료 결정에 직접 영향: "이 약을 이 용량으로 처방하세요" 같은 치료 지시
- 예후 예측을 임상 결정에 직접 활용

**식약처 허가가 불필요한 경우 (내부 업무 보조)**:
- 의사의 판단을 돕는 정보 제공 (최종 결정은 의사)
- 행정 업무 자동화 (의무기록 초안, 보험 청구 코드 추천)
- 교육 및 훈련 목적
- 연구 목적 (임상 적용 아님)

불확실할 때는 식약처에 사전 상담을 신청하거나, 의료기기법 전문 법무팀에 자문을 구하는 것이 안전하다.

## 클라우드 배포: 의료 특화 인프라

외부 사용자에게까지 배포하려면 의료 데이터 처리를 지원하는 클라우드 서비스가 필요하다.

**AWS HealthLake**: FHIR 형식의 의료 데이터를 저장·쿼리할 수 있는 HIPAA 적합 서비스.

**Azure Healthcare APIs**: Microsoft의 의료 특화 클라우드. Azure AD와의 통합이 쉬워 병원 IT 환경과 연동이 원활하다.

**한국 환경**: 국내에서는 개인정보보호법과 의료법이 적용된다. 해외 클라우드에 환자 식별 정보(이름, 주민번호, 진단명 등)를 저장하는 것은 추가 검토가 필요하다. 비식별화 처리 후 저장하거나, 국내 데이터센터를 사용하는 방법을 고려해야 한다.

## 환자 데이터 처리 시 추가 요건

**개인정보 영향평가 (PIA)**: 개인정보보호법 제33조에 따라, 5만 명 이상의 민감정보(진단명, 처방 등)를 처리하는 시스템은 영향평가가 의무다.

**보안 감사**: 병원 정보보안팀의 취약점 점검 및 모의해킹(침투 테스트)을 통과해야 한다.

**동의 확인**: 환자 데이터를 AI 학습이나 분석에 사용할 때는 정보 제공 동의 또는 IRB 승인이 필요하다. 진료 목적 외 사용은 별도 동의를 받아야 한다.

## 현실적 조언: 작게 시작해서 검증 후 확장

가장 흔한 실패 패턴은 처음부터 "완전한 시스템"을 만들려는 것이다.

현실적 로드맵:

- **1주차**: Streamlit으로 개인용 프로토타입 완성, 직접 사용하며 유용성 검증
- **1개월차**: 같은 과 동료 2~3명과 팀 내부 테스트, 피드백 수집
- **3개월차**: IT팀·보안팀과 협력해 병원 내부 배포, 100명 이하 소규모 테스트
- **6개월차**: 데이터 수집, 효과 측정, 개선 후 확장 여부 결정

---

## 핵심 정리

- 배포는 개인 → 팀 → 병원 → 외부 순으로 단계를 밟아야 한다
- Streamlit Cloud로 5분 만에 개인용 웹 앱을 무료로 배포할 수 있다
- 팀 내부 배포부터는 Docker + 내부 서버로 데이터를 외부에 노출하지 않는다
- 진단·치료에 직접 영향을 주는 AI는 식약처 허가(SaMD)가 필요하다
- 환자 데이터 처리 시 개인정보 영향평가와 IRB 승인 여부를 반드시 확인해야 한다

## 관련 글

- [Git — 의사가 코드를 관리하는 법](/blog/doctor-dev/git-for-doctors)
- [의료 에이전트 평가 — 안전성 측정이 정확도보다 중요한 이유](/blog/ai-agents/agent-evaluation-medical)
- [RAG — Retrieval-Augmented Generation이라는 이름에 담긴 아이디어](/blog/ai-terminology/term-rag)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
