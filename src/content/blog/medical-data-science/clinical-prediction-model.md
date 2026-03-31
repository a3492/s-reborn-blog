---
title: "임상 예측 모델 만들기 — AUROC 0.8이 의미하는 것"
date: 2026-03-31
category: medical-data-science
description: "AUROC 0.8은 임의로 뽑은 양성 환자가 음성 환자보다 높은 점수를 받을 확률이 80%라는 뜻이다 — 좋은 모델이지만 완벽하지 않다."
thumbnail: ""
draft: false
---

## 한줄 요약

AUROC 0.8은 임의로 뽑은 양성 환자가 음성 환자보다 높은 점수를 받을 확률이 80%라는 뜻이다 — 좋은 모델이지만 완벽하지 않다.

---

## 예측 모델의 목적부터 명확히

같은 "예측 모델"이라도 목적이 다르다.

| 목적 | 예시 | 요구 성능 |
|------|------|----------|
| 스크리닝 | 당뇨병 고위험군 탐색 | 높은 sensitivity |
| 진단 | 폐렴 여부 판별 | 높은 specificity |
| 예후 | 5년 생존율 예측 | calibration 중요 |
| 치료 반응 | 항암제 반응 예측 | NNT, DCA |

AUROC가 높다고 해서 모든 목적에 좋은 모델은 아니다.

---

## 데이터 분할 전략

```python
from sklearn.model_selection import train_test_split

# 전체 데이터를 train/validation/test로 분리
X_train_val, X_test, y_train_val, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
X_train, X_val, y_train, y_val = train_test_split(
    X_train_val, y_train_val, test_size=0.2,
    random_state=42, stratify=y_train_val
)

print(f"Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")
```

- **Training set (60%):** 모델 학습
- **Validation set (20%):** 하이퍼파라미터 튜닝, 모델 선택
- **Test set (20%):** 최종 성능 보고 (딱 한 번만 사용)

Test set을 여러 번 보면 낙관적 편향이 생긴다.

---

## Feature Engineering — 의료 예시

원시 데이터를 그대로 쓰지 않는다.

```python
# 나이 구간화
df['age_group'] = pd.cut(df['age'], bins=[0,40,60,75,100],
                          labels=['<40','40-60','60-75','>75'])

# 검사 이상 여부 (의학적 기준 적용)
df['ckd'] = (df['egfr'] < 60).astype(int)
df['anemia'] = ((df['sex']=='M') & (df['hgb'] < 13) |
                (df['sex']=='F') & (df['hgb'] < 12)).astype(int)

# 복합 점수
df['frailty_score'] = df[['weight_loss','exhaustion','weakness',
                           'slow_gait','low_activity']].sum(axis=1)
```

임상 지식 없이 데이터만 보면 이런 변수를 만들 수 없다. 의사가 데이터 과학에 강점을 갖는 이유다.

---

## AUROC 해석

AUROC(Area Under ROC Curve) = C-statistic이라고도 한다.

```python
from sklearn.metrics import roc_auc_score, roc_curve
import matplotlib.pyplot as plt

y_prob = model.predict_proba(X_test)[:, 1]
auroc = roc_auc_score(y_test, y_prob)
fpr, tpr, thresholds = roc_curve(y_test, y_prob)

plt.plot(fpr, tpr, label=f'AUROC = {auroc:.3f}')
plt.plot([0,1],[0,1], 'k--')
plt.xlabel('1 - Specificity (FPR)')
plt.ylabel('Sensitivity (TPR)')
plt.legend()
```

| AUROC | 해석 |
|-------|------|
| 0.5 | 동전 던지기 (무의미) |
| 0.6–0.7 | 보통 |
| 0.7–0.8 | 사용 가능 |
| 0.8–0.9 | 좋음 |
| > 0.9 | 매우 좋음 (과적합 의심) |

---

## Calibration — 예측값과 실제값의 일치

AUROC가 높아도 calibration이 나쁘면 임상에서 쓸 수 없다.

"30% 확률"이라고 했는데 실제로 50%가 사건을 겪는다면, 이 모델은 잘못된 의사결정을 유도한다.

```python
from sklearn.calibration import calibration_curve, CalibratedClassifierCV

# Calibration curve
prob_true, prob_pred = calibration_curve(y_test, y_prob, n_bins=10)
plt.plot(prob_pred, prob_true, 's-', label='Model')
plt.plot([0,1],[0,1], 'k--', label='Perfect calibration')
```

Calibration이 나쁘면 `CalibratedClassifierCV`로 보정 가능.

---

## 외부 검증의 중요성

내부 검증(같은 병원 데이터 분할)만으로는 충분하지 않다.

- 단일 병원 모델 → 타 병원 적용 시 AUROC가 0.1~0.2 떨어지는 것은 흔함
- 시간적 검증: 2020년 데이터로 학습 → 2023년 데이터로 검증
- 지리적 검증: 서울 병원 데이터 → 지방 병원 적용

NEJM에서 AI 모델 논문을 채택하는 기준 중 하나가 외부 검증 여부다.

---

## TRIPOD 보고 가이드라인

예측 모델 논문 투고 전 TRIPOD (Transparent Reporting of a multivariable prediction model) 체크리스트 확인.

핵심 항목:
- 연구 설계 및 데이터 출처 명시
- 결과 정의 및 추적 기간
- 결측 데이터 처리 방법
- 모델 개발 및 내부 검증 방법
- 성능 지표 (discrimination + calibration 모두)
- 외부 검증 또는 한계 명시

---

## 핵심 정리

- AUROC 0.8: 양성이 음성보다 높은 점수를 받을 확률 80%
- Calibration: AUROC만큼 중요한 임상 적용 가능성 지표
- 데이터 분할: train/validation/test, test는 딱 한 번
- 외부 검증 없는 모델은 학술적 가치는 있지만 임상 적용 불가
- TRIPOD 체크리스트: 예측 모델 논문의 필수 보고 기준

## 관련 글

- [로지스틱 회귀 — 입원 예측 모델 만드는 법](/blog/medical-data-science/logistic-regression-medical)
- [AI 연구의 통계 — 의료 AI 논문을 비판적으로 읽는 법](/blog/clinical-research/statistical-methods-ai-studies)
- [결측 데이터 처리 — 의료 데이터에서 가장 흔한 문제](/blog/medical-data-science/missing-data-handling)

---
*© S-Reborn clinic | s-reborn-blog.pages.dev*
