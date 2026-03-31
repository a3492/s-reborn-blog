---
title: "Python으로 반복 업무 자동화 — 의사의 일상을 코드로"
date: 2026-03-31
category: doctor-dev
description: "이 글을 읽어보세요."
thumbnail: ""
draft: false
---

## 한줄 요약

매주 같은 Excel 보고서를 손으로 만들고 있다면, 그 30분을 되찾을 수 있다.

---

## 자동화 대상 식별법

다음 질문에 "예"가 나오면 자동화 후보다.

- 매주/매월 같은 작업을 반복하는가?
- 특정 조건을 만족하면 누군가에게 알려야 하는가?
- 데이터를 특정 형식으로 변환하는 작업인가?
- 여러 파일을 취합해서 하나로 만드는가?

---

## 설치

```bash
pip install openpyxl schedule pandas PyMuPDF
```

---

## Excel 보고서 자동 생성

```python
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.chart import BarChart, Reference
import pandas as pd
from datetime import datetime

def generate_monthly_report(data_csv: str, output_path: str):
    # 데이터 불러오기
    df = pd.read_csv(data_csv, encoding="utf-8-sig")

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "월별 외래 통계"

    # 헤더 스타일
    header_fill = PatternFill("solid", fgColor="1F4E79")
    header_font = Font(color="FFFFFF", bold=True)

    headers = ["날짜", "총 환자수", "신환", "재진", "평균 대기시간(분)"]
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center")

    # 데이터 입력
    for row_idx, (_, row) in enumerate(df.iterrows(), 2):
        for col_idx, value in enumerate(row, 1):
            ws.cell(row=row_idx, column=col_idx, value=value)

    # 차트 추가
    chart = BarChart()
    chart.title = "일별 환자수"
    data_ref = Reference(ws, min_col=2, min_row=1, max_row=ws.max_row)
    chart.add_data(data_ref, titles_from_data=True)
    ws.add_chart(chart, "G2")

    wb.save(output_path)
    print(f"보고서 생성 완료: {output_path}")

# 사용
generate_monthly_report("march_data.csv",
                        f"report_{datetime.now().strftime('%Y%m')}.xlsx")
```

---

## 이메일 자동 발송

```python
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email import encoders

def send_report_email(recipient: str, subject: str,
                      body: str, attachment_path: str = None):
    msg = MIMEMultipart()
    msg["From"] = "your_email@gmail.com"
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    if attachment_path:
        with open(attachment_path, "rb") as f:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header("Content-Disposition",
                        f"attachment; filename={attachment_path}")
        msg.attach(part)

    # Gmail: 앱 비밀번호 사용 필요
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login("your_email@gmail.com", "앱_비밀번호")
        server.send_message(msg)
    print(f"이메일 발송 완료: {recipient}")
```

---

## 혈당 이상값 알림 자동화

```python
import pandas as pd

def check_abnormal_glucose(csv_path: str, threshold_high: float = 200):
    df = pd.read_csv(csv_path, encoding="utf-8-sig")

    # 이상값 필터링
    abnormal = df[df["glucose"] > threshold_high]

    if abnormal.empty:
        print("이상값 없음")
        return

    alert_lines = []
    for _, row in abnormal.iterrows():
        alert_lines.append(
            f"- {row['patient_id']} ({row['name']}): "
            f"혈당 {row['glucose']} mg/dL (측정: {row['measured_at']})"
        )

    body = f"혈당 이상값 알림 ({len(abnormal)}건)\n\n" + "\n".join(alert_lines)
    send_report_email("duty_nurse@hospital.com",
                      f"[자동알림] 혈당 이상값 {len(abnormal)}건", body)
```

---

## 정기 실행 스케줄러

```python
import schedule
import time

def daily_job():
    print("일일 보고서 생성 중...")
    generate_monthly_report("today_data.csv", "daily_report.xlsx")
    send_report_email("chief@hospital.com", "일일 외래 통계",
                      "오늘의 외래 통계 보고서입니다.", "daily_report.xlsx")

def glucose_check_job():
    check_abnormal_glucose("glucose_log.csv")

# 매일 오후 6시 보고서 발송
schedule.every().day.at("18:00").do(daily_job)

# 매 2시간마다 혈당 체크
schedule.every(2).hours.do(glucose_check_job)

print("스케줄러 시작...")
while True:
    schedule.run_pending()
    time.sleep(60)
```

---

## 보안 주의사항

환자 데이터 자동화 시 반드시 확인해야 할 사항:

- CSV/Excel 파일은 암호화 폴더에 저장 (BitLocker, FileVault)
- 이메일 전송 시 개인정보 식별 정보 제외 (이름 대신 번호)
- 자동화 스크립트에 API key, 비밀번호를 하드코딩하지 말 것
- 로그 파일에 환자 정보가 기록되지 않도록 주의

---

## 핵심 정리

- 매주 반복하는 작업이 자동화 1순위 후보다
- `openpyxl`로 Excel 보고서를 서식까지 포함해 생성할 수 있다
- `schedule` 라이브러리로 매일/매시간 정기 실행이 가능하다
- `smtplib`로 이메일 자동 발송 — Gmail 앱 비밀번호 필요
- 환자 데이터가 포함된 자동화는 보안 설계를 먼저 해야 한다

## 관련 글

- [Pandas로 임상 데이터 분석 — Excel을 Python으로 대체하는 법](/blog/doctor-dev/pandas-for-clinical-data)
- [Git — 의사가 코드를 관리하는 법](/blog/doctor-dev/git-for-doctors)
- [의료 AI 도구 배포 — 병원에서 쓸 수 있게 만드는 법](/blog/doctor-dev/deploy-medical-ai-tool)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
