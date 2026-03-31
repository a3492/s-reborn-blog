---
title: "Streamlit으로 의료 도구 만들기 — 코딩 없이 UI 구현"
date: 2026-03-31
category: doctor-dev
thumbnail: ""
draft: false
---

## 한줄 요약

Streamlit은 Python 코드 몇 줄로 웹 앱을 만들어준다 — 버튼, 입력창, 차트 모두 코드 한 줄씩이다.

---

## Streamlit이란

프론트엔드(HTML/CSS/JavaScript)를 전혀 몰라도, Python만으로 웹 앱을 만들 수 있게 해주는 라이브러리다. 의사가 직접 사용할 감별진단 보조 도구, 약용량 계산기, 데이터 시각화 대시보드를 빠르게 만들 수 있다.

---

## 설치

```bash
pip install streamlit anthropic
```

---

## 기본 구조

```python
import streamlit as st

st.title("나의 첫 번째 의료 앱")
st.write("환자 정보를 입력하세요.")

name = st.text_input("환자 이름")
age = st.number_input("나이", min_value=0, max_value=120, value=40)

if st.button("확인"):
    st.success(f"{name}님 ({age}세) 정보가 입력되었습니다.")
```

저장 후 터미널에서 실행:
```bash
streamlit run app.py
```
브라우저가 자동으로 열린다.

---

## 감별진단 보조 앱 — 전체 코드

```python
import streamlit as st
import anthropic
import os

st.set_page_config(page_title="감별진단 보조", page_icon="🩺")
st.title("감별진단 보조 도구")
st.caption("Claude AI 기반 — 진단 보조 목적, 최종 판단은 의사가 합니다")

# 환자 정보 입력
col1, col2 = st.columns(2)
with col1:
    age = st.number_input("나이", 1, 100, 40)
with col2:
    sex = st.selectbox("성별", ["남성", "여성"])

symptoms = st.text_area("주요 증상 (증상, 기간, 정도를 상세히)", height=100)
vitals = st.text_input("활력징후 (예: BP 130/85, HR 92, T 37.8)")
labs = st.text_input("주요 검사 결과 (예: WBC 13,500, CRP 4.2)")

if st.button("감별진단 생성", type="primary"):
    if not symptoms:
        st.warning("증상을 입력해주세요.")
    else:
        with st.spinner("분석 중..."):
            client = anthropic.Anthropic(
                api_key=os.environ.get("ANTHROPIC_API_KEY")
            )
            prompt = f"""환자: {age}세 {sex}
증상: {symptoms}
활력징후: {vitals}
검사: {labs}

감별진단 5가지를 가능성 높은 순서로 제시하고,
각각에 대해 필요한 추가 검사를 제안해주세요."""

            message = client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=1024,
                system="당신은 10년 경력의 내과 전문의입니다. 체계적인 감별진단을 제시하세요.",
                messages=[{"role": "user", "content": prompt}]
            )

        st.subheader("감별진단 결과")
        st.markdown(message.content[0].text)
        st.divider()
        st.caption(f"토큰 사용: 입력 {message.usage.input_tokens} / 출력 {message.usage.output_tokens}")
```

---

## 주요 UI 컴포넌트

```python
# 슬라이더
score = st.slider("통증 점수 (NRS)", 0, 10, 5)

# 체크박스
has_fever = st.checkbox("발열 있음")

# 라디오 버튼
duration = st.radio("증상 기간", ["1일 미만", "1-7일", "1개월 이상"])

# 파일 업로드 (검사 결과지 PDF 등)
uploaded_file = st.file_uploader("파일 업로드", type=["pdf", "txt", "csv"])

# 차트
import pandas as pd
df = pd.DataFrame({"날짜": ["1월", "2월", "3월"], "HbA1c": [7.2, 6.9, 6.5]})
st.line_chart(df.set_index("날짜"))
```

---

## 배포: Streamlit Cloud (무료)

1. GitHub에 코드 push
2. [share.streamlit.io](https://share.streamlit.io) 접속
3. GitHub 연동 후 앱 URL 생성

개인 사용은 무료. API key는 Streamlit Cloud의 Secrets 기능으로 안전하게 관리한다.

---

## 개인 사용 vs 병원 배포

| 구분 | 개인/팀 내부 | 병원 공식 배포 |
|------|-------------|---------------|
| 인증 | 불필요 | 필요 (직원 로그인) |
| 환자 데이터 | 넣지 않음 | HTTPS + 암호화 필수 |
| 규제 | 없음 | SaMD 해당 여부 검토 |
| 비용 | 무료 | 서버 비용 발생 |

처음에는 개인 사용부터 시작하는 것을 권장한다.

---

## 핵심 정리

- Streamlit = Python 코드 한 줄이 UI 컴포넌트 하나
- `streamlit run app.py` 한 줄로 로컬 웹 앱 실행
- Streamlit Cloud에서 GitHub 연동만으로 무료 배포 가능
- 환자 개인정보는 앱에 절대 입력하지 말 것 (개인 사용 시)
- `st.columns()`로 2열 레이아웃, `st.spinner()`로 로딩 표시

## 관련 글

- [Claude API 첫 호출 — 10줄 코드로 의료 AI 만들기](/blog/doctor-dev/api-first-call)
- [의료 AI 도구 배포 — 병원에서 쓸 수 있게 만드는 법](/blog/doctor-dev/deploy-medical-ai-tool)
- [Python으로 프롬프트 엔지니어링 — 반복 작업 자동화](/blog/doctor-dev/prompt-engineering-python)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
