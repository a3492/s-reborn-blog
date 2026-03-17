# 📋 블로그 파이프라인 문제 해결 계획서

**작성일:** 2026-03-17
**예상 소요시간:** 15분
**복잡도:** 🟢 **낮음** (토큰 재발급 + 시크릿 업데이트만)

---

## 🎯 목표

GitHub Personal Access Token의 권한을 올바르게 설정하여 `repository_dispatch` 이벤트가 정상적으로 전송되도록 복구

---

## 🔴 근본 원인 (Root Cause)

```
사용자가 추가한 "workflow" 권한 ≠ repository_dispatch 권한

필요한 권한:
- Classic PAT: repo (전체)
- Fine-grained: Contents: read/write
```

---

## 🛠️ 해결 방안

### Phase 1: 새 Personal Access Token 발급 (5분)

#### Step 1.1: GitHub Token 페이지 접속
👉 **https://github.com/settings/tokens/new**

#### Step 1.2: Classic PAT 생성
- **Token name:** `blog-sync-token`
- **Expiration:** `90 days` (또는 `1 year`)
- **Description:** Blog auto-sync pipeline trigger token

#### Step 1.3: 권한 선택 (중요!)

**다음 두 항목 반드시 체크:**

```
✅ repo
   └─ Full control of private repositories

✅ workflow
   └─ Update GitHub Actions workflows
```

**불필요한 항목 (체크 해제):**
- admin:* (제거)
- delete_repo (제거)
- gist (제거)

#### Step 1.4: 토큰 생성 및 복사
- `Generate token` 클릭
- **⚠️ 중요: 토큰 값을 즉시 복사하여 저장**
  (다시 볼 수 없음!)

```
예: ghp_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r
```

---

### Phase 2: 두 레포 시크릿 업데이트 (8분)

#### Step 2.1: s-reborn-blog 시크릿 업데이트

**URL:** https://github.com/a3492/s-reborn-blog/settings/secrets/actions

**작업:**
1. `BLOG_SYNC_TOKEN` 클릭
2. `Update` 버튼 클릭
3. 새 토큰값 붙여넣기
4. `Update secret` 클릭

**확인:** "Secret updated" 메시지 표시

#### Step 2.2: S_Reborn_and_AI 시크릿 업데이트

**URL:** https://github.com/a3492/S_Reborn_and_AI/settings/secrets/actions

**작업:** Step 2.1과 동일
1. `BLOG_SYNC_TOKEN` 클릭
2. `Update` 버튼 클릭
3. **동일한 토큰값** 붙여넣기
4. `Update secret` 클릭

**확인:** "Secret updated" 메시지 표시

---

### Phase 3: 파이프라인 재테스트 (2분)

#### Step 3.1: 테스트 파일 수정

```bash
cd /c/dev/S_Reborn_and_AI

# 테스트 파일 수정 (아무거나)
echo "## 재테스트 2026-03-17" >> _BLOG/ai/test-pipeline.md

git add _BLOG/ai/test-pipeline.md
git commit -m "test: 파이프라인 재테스트 (토큰 권한 수정 후)"
git push origin main
```

#### Step 3.2: Actions 모니터링

**순서대로 확인:**

1. **S_Reborn_and_AI Actions (1분 대기)**
   - URL: `https://github.com/a3492/S_Reborn_and_AI/actions`
   - 확인: "Trigger Blog Sync" 워크플로우 ✅ 초록색
   - 로그: 성공 메시지 확인

2. **s-reborn-blog Actions (추가 1분 대기)**
   - URL: `https://github.com/a3492/s-reborn-blog/actions`
   - 확인: "Sync Blog Posts" 워크플로우 ✅ 초록색 (처음 나타남!)
   - 로그: "rsync -av --delete" 성공 메시지

3. **웹사이트 확인 (Cloudflare Pages 빌드 대기)**
   - URL: `https://s-reborn-blog.pages.dev/blog/ai/test-pipeline`
   - 확인: 블로그 글이 보이면 ✅ 완전 성공!

---

## ✅ 검증 체크리스트

### Pre-fix 검증
- [ ] 현재 BLOG_SYNC_TOKEN 확인 (https://github.com/settings/tokens)
- [ ] 권한 부족 확인 (repo 스코프 없음)

### Post-fix 검증

#### 토큰 생성 후
- [ ] 새 토큰값 복사 및 저장
- [ ] 토큰이 `repo` 스코프 가짐
- [ ] 토큰이 `workflow` 스코프 가짐

#### 시크릿 업데이트 후
- [ ] s-reborn-blog BLOG_SYNC_TOKEN 업데이트됨
- [ ] S_Reborn_and_AI BLOG_SYNC_TOKEN 업데이트됨
- [ ] "Secret updated" 메시지 확인

#### 테스트 후
- [ ] trigger-blog-sync.yml ✅ 실행
- [ ] sync-blog.yml ✅ 실행 (처음 나타남!)
- [ ] Cloudflare Pages 빌드 시작
- [ ] 웹사이트에 글 반영됨

---

## 🔍 상세 검증 방법 (선택사항)

### 방법 1: curl 테스트 (권장)

```bash
# 새 토큰으로 직접 API 호출 테스트
curl -X POST \
  -H "Authorization: token ghp_YOUR_NEW_TOKEN_HERE" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/a3492/s-reborn-blog/dispatches \
  -d '{"event_type":"sync-blog"}'

# 성공 응답
# (아무 출력 없음) + HTTP 204

# 실패 응답
# {"message":"Bad credentials","documentation_url":"..."}
```

### 방법 2: GitHub Token 정보 확인

```bash
# 새 토큰의 권한 정보 조회
curl -H "Authorization: token ghp_YOUR_NEW_TOKEN_HERE" \
  https://api.github.com/user

# 응답에서 "scopes" 확인
# "scopes": ["repo", "workflow", ...]
```

---

## ⚠️ 주의사항

| 항목 | 설명 |
|------|------|
| **토큰 노출** | 토큰을 GitHub 외부에서 노출시키지 말 것 |
| **Fine-grained PAT** | 호환성 문제 가능 → Classic PAT 권장 |
| **토큰 재사용** | 같은 토큰을 두 레포 시크릿에 사용 (O) |
| **기존 토큰** | 새 토큰 설정 후 기존 토큰 삭제 가능 (선택) |
| **권한 변경** | Classic PAT의 권한을 변경해도 값은 유지됨 |

---

## 📊 예상 결과

### 해결 전
```
옵시디언 수정
  ↓ ✅
GitHub 푸시
  ↓ ✅
trigger-blog-sync.yml 실행
  ↓ ✅
curl 요청 실패 (401/403)
  ↓ ❌ (감지 안 됨)
sync-blog.yml 미작동
  ↓ ❌
웹사이트 미반영
```

### 해결 후
```
옵시디언 수정
  ↓ ✅
GitHub 푸시
  ↓ ✅
trigger-blog-sync.yml 실행
  ↓ ✅
curl 요청 성공 (204)
  ↓ ✅
repository_dispatch 신호 전송
  ↓ ✅
sync-blog.yml 실행
  ↓ ✅
rsync로 _BLOG/* 복사
  ↓ ✅
Commit & Push
  ↓ ✅
Cloudflare Pages 빌드
  ↓ ✅
웹사이트 반영 ✨
```

---

## 🎯 성공 지표

| 지표 | 성공 기준 |
|------|---------|
| **S_Reborn_and_AI Actions** | "Trigger Blog Sync" ✅ 초록색 |
| **s-reborn-blog Actions** | "Sync Blog Posts" ✅ 초록색 (새로 나타남) |
| **GitHub 커밋** | s-reborn-blog에 "sync: blog posts updated" 커밋 |
| **파일 존재** | `src/content/blog/ai/test-pipeline.md` 파일 생성됨 |
| **웹사이트** | https://s-reborn-blog.pages.dev/blog/ai/test-pipeline 접속 가능 |

---

## 🆘 트러블슈팅

### 증상: s-reborn-blog Actions가 여전히 안 실행됨

**확인:**
1. 시크릿 업데이트가 완료됐나? (메시지 확인)
2. 새 토큰에 `repo` 스코프가 있나? (https://github.com/settings/tokens 확인)
3. 테스트 파일을 정말 푸시했나? (`git log` 확인)

**해결:**
```bash
# 시크릿 재업데이트
# → https://github.com/a3492/s-reborn-blog/settings/secrets/actions
# → BLOG_SYNC_TOKEN → Update

# 테스트 다시 실행
cd /c/dev/S_Reborn_and_AI
echo "## 재테스트 $(date)" >> _BLOG/ai/test-pipeline.md
git add _BLOG/ai/test-pipeline.md
git commit -m "test: retry"
git push origin main
```

### 증상: curl 테스트에서 401 Unauthorized

**원인:** 토큰 형식 오류 또는 토큰 복사 실수

**해결:**
1. 새 토큰 재확인 (https://github.com/settings/tokens)
2. 공백 문자 없이 정확히 복사
3. 시크릿 재업데이트

### 증상: sync-blog.yml 실행 중 "Permission denied" 에러

**원인:** 토큰에 S_Reborn_and_AI 프라이빗 레포 접근 권한 없음

**확인:**
- 토큰이 `repo` (전체) 스코프를 가지고 있나?
- Fine-grained PAT이면 S_Reborn_and_AI 레포 접근 권한이 있나?

**해결:** Classic PAT로 재발급

---

## 📝 작업 체크리스트

```
Phase 1: 토큰 발급
- [ ] https://github.com/settings/tokens/new 접속
- [ ] Token name: blog-sync-token 입력
- [ ] ✅ repo 체크
- [ ] ✅ workflow 체크
- [ ] Generate token 클릭
- [ ] 토큰값 복사 및 저장

Phase 2: 시크릿 업데이트
- [ ] s-reborn-blog 시크릿 업데이트
- [ ] S_Reborn_and_AI 시크릿 업데이트
- [ ] 각 레포에서 "Secret updated" 메시지 확인

Phase 3: 테스트
- [ ] 테스트 파일 수정
- [ ] git push 실행
- [ ] S_Reborn_and_AI Actions 확인 (1분)
- [ ] s-reborn-blog Actions 확인 (1분)
- [ ] 웹사이트 확인 (2-5분)
- [ ] 성공 확인! ✨
```

---

## ⏱️ 예상 소요시간

| 단계 | 시간 |
|------|------|
| 토큰 생성 | 3분 |
| 시크릿 업데이트 (2개 레포) | 5분 |
| 테스트 파일 푸시 | 2분 |
| Actions 모니터링 | 2분 |
| 웹사이트 배포 대기 | 5분 |
| **총 소요시간** | **15분** |

---

**다음: `ERROR_REPORT.md`로 돌아가 문제 이해하기**
