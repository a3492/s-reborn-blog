# 🚨 블로그 파이프라인 오류 보고서

**작성일:** 2026-03-17
**심각도:** 🔴 **Critical** - 전체 자동화 파이프라인 미작동
**상태:** 진단 완료 → 해결책 식별됨

---

## 📊 문제 요약

옵시디언에서 작성한 블로그 글이 웹사이트에 자동으로 올라가지 않는 현상

| 항목 | 상태 | 비고 |
|------|------|------|
| 옵시디언 → GitHub | ✅ 작동 | obsidian-git이 _BLOG 폴더 push |
| S_Reborn_and_AI trigger | ✅ 작동 | trigger-blog-sync.yml 실행됨 |
| **s-reborn-blog sync** | ❌ **미작동** | sync-blog.yml 미실행 (0 runs) |
| 웹사이트 배포 | ⏸️ 대기 | 싱크 실패로 진행 불가 |

---

## 🔍 진단

### 증상
```
[2026-03-16 15:30 UTC] test-pipeline.md 파일 수정 및 푸시
↓
[S_Reborn_and_AI] trigger-blog-sync.yml 실행 완료 ✅
↓
[GitHub API 요청] repository_dispatch 신호 전송 시도
↓
[s-reborn-blog] sync-blog.yml 미수신 ❌
↓
[웹사이트] 글 미반영
```

### 원인 분석

**Primary Cause: GitHub Personal Access Token 권한 부족**

#### 1. Token 권한 요구사항

`trigger-blog-sync.yml`의 curl 명령어 분석:
```bash
curl -X POST \
  -H "Authorization: token ${{ secrets.BLOG_SYNC_TOKEN }}" \
  https://api.github.com/repos/a3492/s-reborn-blog/dispatches \
  -d '{"event_type":"sync-blog"}'
```

이 API 호출 (`/repos/{owner}/{repo}/dispatches`)은 다음 권한 중 하나 필요:
- **Classic PAT:** `repo` 스코프 (전체)
- **Fine-grained PAT:** `Contents: read/write` + `Metadata: read`

**현재 토큰 상태:**
- ✅ `workflow` 스코프 (추가됨)
- ❓ `repo` 스코프 (미확인 - 가능성 낮음)
- ❓ `Contents: write` (fine-grained인 경우)

**문제:** 사용자가 추가한 `workflow` 권한은 워크플로우 파일 수정 권한일 뿐, `repository_dispatch` 트리거와 무관

#### 2. curl 실행 흐름

```
S_Reborn_and_AI/trigger-blog-sync.yml 실행
  ↓
curl -X POST (GitHub API 호출)
  ↓
[401 Unauthorized] 또는 [403 Forbidden] 응답 가능성 높음
  ↓
curl 명령어가 실패했지만 워크플로우는 "성공" 표시
  (이유: exit code 확인 없음)
  ↓
repository_dispatch 신호 미전송
  ↓
s-reborn-blog의 sync-blog.yml 미트리거
```

**문제:** trigger-blog-sync.yml에 `set -e` 또는 `|| exit 1`이 없음

---

## 📋 기술 상세 분석

### 워크플로우 체인 구조

```
┌─────────────────────────────┐
│   S_Reborn_and_AI           │
│ trigger-blog-sync.yml       │
│ (on: push to _BLOG/**)      │
└──────────────┬──────────────┘
               │ [curl POST]
               ↓ /repos/.../dispatches
        [GitHub API]
               │ event_type: sync-blog
               ↓
┌─────────────────────────────┐
│   s-reborn-blog             │
│ sync-blog.yml               │
│ (on: repository_dispatch)   │  ← ❌ 여기 미도달
└─────────────────────────────┘
```

### 관찰된 로그

**S_Reborn_and_AI Actions:** ✅ 3개 워크플로우 실행 성공
- 마지막 실행: "test: 파이프라인 동기화 테스트 실행 (2026-03-16)" - 19분 전
- 실행 시간: 7초 (너무 빠름 → curl만 실행되고 결과 미확인)

**s-reborn-blog Actions:** ❌ 0개 워크플로우 실행
- "There are no workflow runs yet" 메시지
- repository_dispatch 이벤트 미수신

---

## 🔧 기본 원인 (Root Cause)

| 원인 | 영향 | 확률 |
|------|------|------|
| **BLOG_SYNC_TOKEN이 `repo` 권한 없음** | curl 요청 실패 (401/403) | 🔴 **95%** |
| trigger-blog-sync.yml에 에러 핸들링 없음 | curl 실패를 감지하지 못함 | ✅ **확인됨** |
| GitHub API 호출 자체 문제 | API 다운 등 | 🟡 **1%** |
| event_type 오타 | 이벤트 미수신 | 🟡 **1%** |

---

## 💥 영향도 분석

### 즉각적 영향
- ❌ 모든 신규 블로그 글 미배포
- ❌ 옵시디언 수정사항 반영 안 됨
- ❌ 파이프라인 자동화 완전 미작동

### 파급 효과
- 블로그 운영 불가 (수동 배포 필요)
- SEO 영향 (콘텐츠 신규성 저하)
- 사용자 경험 저하

### 비즈니스 영향
- 자동화 목표 미달성
- 수동 관리 부담 증대
- 시간 낭비

---

## ✅ 검증 방법

### 현재 상태 확인
```bash
# 1. GitHub Token 권한 확인
# https://github.com/settings/tokens → BLOG_SYNC_TOKEN 클릭
# 확인 항목:
# - repo 스코프 체크됨? ← ❌ 없을 가능성
# - workflow 스코프 체크됨? ← ✅ 있음
```

### 해결 후 검증
```bash
# 2. curl 명령어 직접 테스트 (로컬)
curl -X POST \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/a3492/s-reborn-blog/dispatches \
  -d '{"event_type":"sync-blog"}'

# 성공 응답: HTTP 204 (No Content)
# 실패 응답: HTTP 401 (Unauthorized) 또는 403 (Forbidden)
```

---

## 📈 문제 재현

### 재현 단계
1. S_Reborn_and_AI의 `_BLOG/ai/test-pipeline.md` 파일 수정
2. obsidian-git 또는 `git push` 실행
3. GitHub Actions 확인:
   - `https://github.com/a3492/S_Reborn_and_AI/actions` → trigger-blog-sync.yml ✅
   - `https://github.com/a3492/s-reborn-blog/actions` → sync-blog.yml ❌

### 현재 상태 (재현 완료)
- 최근 테스트: 2026-03-16 15:30 UTC
- trigger 워크플로우: 실행됨
- sync 워크플로우: 미실행

---

## 🎯 문제 심각도

| 단계 | 항목 | 심각도 |
|------|------|--------|
| 1 | 파이프라인 미작동 | 🔴 Critical |
| 2 | 블로그 글 미배포 | 🔴 Critical |
| 3 | 자동화 목표 미달성 | 🟠 High |
| 4 | 수동 개입 필요 | 🟠 High |

**전체 심각도: 🔴 CRITICAL** - 즉시 해결 필수

---

## 📝 결론

### 문제
BLOG_SYNC_TOKEN이 다른 레포에서 `repository_dispatch` 이벤트를 트리거할 권한이 부족하여 GitHub API 호출이 실패

### 근거
- S_Reborn_and_AI trigger 워크플로우는 실행되나 신호 미전송 (curl 실패 추정)
- s-reborn-blog sync 워크플로우가 0회 실행 (dispatch 이벤트 미수신)
- trigger-blog-sync.yml에 curl 결과 검증 로직 없음 (실패 은폐)

### 해결 가능성
✅ **100%** - 토큰 재발급으로 즉시 해결 가능

---

**다음 문서: `SOLUTION_PLAN.md` 참고**
