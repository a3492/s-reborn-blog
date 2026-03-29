const fs = require('fs');
const path = require('path');

// 메타데이터 로드
const metadata = JSON.parse(fs.readFileSync('./content-metadata.json', 'utf-8'));

// 콘텐츠 디렉토리 생성
const baseDir = './public/content';

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 템플릿별 마크다운 생성 함수
function generateMarkdown(article) {
  const frontmatter = `---
title: "${article.title}"
slug: "${article.slug}"
date: "${article.date}"
category: "${article.category}"
series: "${article.series || 'N/A'}"
${article.series_order ? `series_order: ${article.series_order}` : ''}
tags: [${article.tags.map(t => `"${t}"`).join(', ')}]
description: "${article.description}"
read_time: ${article.read_time}
difficulty: "${article.difficulty}"
type: "${article.type}"
---`;

  let content = '';

  // 형식별로 다른 콘텐츠 생성
  switch (article.type) {
    case 'guide':
      content = generateGuideContent(article);
      break;
    case 'educational':
      content = generateEducationalContent(article);
      break;
    case 'technical':
      content = generateTechnicalContent(article);
      break;
    case 'analytical':
      content = generateAnalyticalContent(article);
      break;
    case 'opinion':
      content = generateOpinionContent(article);
      break;
    case 'template':
      content = generateTemplateContent(article);
      break;
    case 'casestudy':
      content = generateCaseStudyContent(article);
      break;
    case 'review':
      content = generateReviewContent(article);
      break;
    case 'comparison':
      content = generateComparisonContent(article);
      break;
    case 'ranking':
      content = generateRankingContent(article);
      break;
    case 'news':
      content = generateNewsContent(article);
      break;
    case 'faq':
      content = generateFAQContent(article);
      break;
    case 'howto':
      content = generateHowToContent(article);
      break;
    case 'legal':
      content = generateLegalContent(article);
      break;
    case 'warning':
      content = generateWarningContent(article);
      break;
    default:
      content = generateDefaultContent(article);
  }

  return `${frontmatter}\n\n${content}`;
}

// 각 형식별 콘텐츠 생성 함수들
function generateGuideContent(article) {
  return `# ${article.title}

## 서론

${article.description}

## 주요 내용

### 1. ${article.title.split(':')[1] || '핵심 개념'}

의료 현장에서 중요한 실제 사례와 활용 방법을 설명합니다.

- 기본 개념 이해
- 실제 적용 방법
- 주의해야 할 사항

### 2. 실제 적용

구체적인 사용 사례를 통해 어떻게 활용할 수 있는지 알아봅니다.

\`\`\`
실제 예시 또는 코드 블록
\`\`\`

### 3. 주의사항

- 주의사항 1
- 주의사항 2
- 주의사항 3

## 결론

${article.title}은(는) 의료 현장에서 중요한 역할을 합니다.

---

**참고 자료**
- [의료법](https://example.com)
- [관련 가이드라인](https://example.com)
`;
}

function generateEducationalContent(article) {
  return `# ${article.title}

## 배경

${article.description}

## 기본 개념

### 정의

이 개념의 명확한 정의와 의료에서의 의미를 설명합니다.

### 역사

어떻게 발전해왔는지 간단히 설명합니다.

## 의료에서의 중요성

### 영향

실제 의료 현장에서 어떤 영향을 미치는지 설명합니다.

- 진단 개선
- 환자 안전성
- 의료 비용

### 구체적 사례

실제 임상 사례를 통해 이해해봅시다.

## 미래 전망

이 개념이 의료의 미래에 어떻게 영향을 미칠 것인가.

---

**더 알아보기**
- [심화 학습 자료](https://example.com)
- [관련 논문](https://example.com)
`;
}

function generateTechnicalContent(article) {
  return `# ${article.title}

## 개요

${article.description}

## 기술 배경

### 기본 원리

기술적인 배경 설명을 간단명료하게 설명합니다.

\`\`\`
기술 설명 또는 공식
\`\`\`

### 의료에서의 적용

기술이 의료에서 어떻게 적용되는지 설명합니다.

## 구현 방법

### 단계별 가이드

1. 첫 번째 단계
2. 두 번째 단계
3. 세 번째 단계

### 코드 예시

\`\`\`python
# 예시 코드
\`\`\`

## 장점과 한계

### 장점

- 장점 1
- 장점 2
- 장점 3

### 한계

- 한계 1
- 한계 2
- 한계 3

## 결론

---

**참고**
- [논문](https://example.com)
- [기술 가이드](https://example.com)
`;
}

function generateAnalyticalContent(article) {
  return `# ${article.title}

## 문제 정의

${article.description}

## 분석

### 현황

현재 상황에 대한 객관적인 분석입니다.

| 항목 | 현황 | 영향 |
|------|------|------|
| 항목1 | 설명 | 영향 |
| 항목2 | 설명 | 영향 |

### 근본 원인

이 문제가 발생하는 원인들입니다.

- 원인 1
- 원인 2
- 원인 3

## 해결 방안

### 단기 대책

즉시 실행 가능한 해결책입니다.

### 장기 전략

지속 가능한 해결책입니다.

## 결론 및 제언

---

**참고 자료**
- [관련 연구](https://example.com)
`;
}

function generateOpinionContent(article) {
  return `# ${article.title}

## 현재 상황

${article.description}

## 주요 주장

### 첫 번째 관점

의료 AI와 인간 의사의 관계에 대한 첫 번째 관점입니다.

### 두 번째 관점

다른 관점에서 본 이 문제입니다.

## 실제 사례

### 사례 1

구체적인 임상 사례를 통해 설명합니다.

### 사례 2

또 다른 관점의 사례입니다.

## 결론

결국 중요한 것은 AI와 의료진의 효과적인 협력입니다.

---

**당신의 의견은?**
댓글로 당신의 생각을 공유해주세요.
`;
}

function generateTemplateContent(article) {
  return `# ${article.title}

## 개요

${article.description}

## 프롬프트 템플릿

### 기본 템플릿

\`\`\`
[여기에 프롬프트 템플릿을 입력하세요]
\`\`\`

### 사용 방법

1. 위의 템플릿을 복사
2. 대괄호 안의 내용을 수정
3. AI에 입력
4. 결과 검토

## 실제 예시

### 입력

\`\`\`
프롬프트 입력 예시
\`\`\`

### 출력

\`\`\`
AI의 응답 예시
\`\`\`

## 팁과 주의사항

- 팁 1: 구체적으로 작성하기
- 팁 2: 컨텍스트 제공하기
- 주의: 민감한 정보 포함 금지

## 다른 버전들

### 간단한 버전

단순한 버전의 템플릿입니다.

### 상세한 버전

더 자세한 버전의 템플릿입니다.

---

**이 템플릿을 다운로드하기**
- [템플릿 파일](https://example.com)
`;
}

function generateCaseStudyContent(article) {
  return `# ${article.title}

## 케이스 소개

${article.description}

## 환자 정보

| 항목 | 내용 |
|------|------|
| 나이 | 예시 |
| 성별 | 예시 |
| 주증상 | 예시 |

## 임상 과정

### Step 1: 초기 평가

첫 진료에서의 평가 과정입니다.

### Step 2: 진단 과정

AI를 활용한 감별진단 과정입니다.

### Step 3: 치료 계획

치료 계획 수립 과정입니다.

### Step 4: 결과

최종 결과 및 예후입니다.

## AI의 역할

AI가 어떻게 도움이 되었는지 설명합니다.

### 진단 보조

- AI 판정
- 의사의 판정
- 최종 결과

## 배운 점

이 케이스에서 얻을 수 있는 교훈입니다.

---

**더 알아보기**
- [관련 논문](https://example.com)
- [비슷한 케이스](https://example.com)
`;
}

function generateReviewContent(article) {
  return `# ${article.title}

## 개요

${article.description}

## 도구 소개

### 기본 정보

| 항목 | 설명 |
|------|------|
| 개발사 | 정보 |
| 출시일 | 정보 |
| 가격 | 정보 |

## 주요 기능

### 기능 1

설명

### 기능 2

설명

### 기능 3

설명

## 의료에서의 활용

### 장점

- 장점 1
- 장점 2
- 장점 3

### 단점

- 단점 1
- 단점 2
- 단점 3

## 실제 사용 후기

실제 의료진의 경험과 평가입니다.

## 추천 대상

어떤 의료 전문가에게 추천하는지 설명합니다.

## 최종 평가

| 항목 | 평점 |
|------|------|
| 정확도 | ★★★★☆ |
| 사용 편의성 | ★★★★☆ |
| 가성비 | ★★★★☆ |

---

**관심 있으신가요?**
[도구 홈페이지 방문](https://example.com)
`;
}

function generateComparisonContent(article) {
  return `# ${article.title}

## 비교 개요

${article.description}

## 주요 도구 비교

| 항목 | 도구 A | 도구 B | 도구 C |
|------|--------|--------|--------|
| 정확도 | 높음 | 중간 | 높음 |
| 가격 | $$ | $ | $$$ |
| 사용 편의성 | 쉬움 | 중간 | 어려움 |

## 상세 분석

### 도구 A

자세한 설명

### 도구 B

자세한 설명

### 도구 C

자세한 설명

## 의료 현장에서의 성능

### 정확도 비교

각 도구의 정확도 데이터입니다.

### 속도 비교

처리 속도 비교입니다.

## 추천

### 어떤 도구를 선택할까?

상황별 추천 가이드입니다.

- 예산이 적으면: 도구 B
- 정확도가 중요하면: 도구 A 또는 C
- 사용 편의성: 도구 A

---

**더 비교하기**
- [다른 도구 리뷰](https://example.com)
`;
}

function generateRankingContent(article) {
  return `# ${article.title}

## 순위 개요

${article.description}

## TOP 5 순위

### 🥇 1위: 도구 A

이유: 정확도와 신뢰성

### 🥈 2위: 도구 B

이유: 가성비

### 🥉 3위: 도구 C

이유: 사용 편의성

### 4위: 도구 D

이유: 특화 기능

### 5위: 도구 E

이유: 신규 진입

## 평가 기준

- 정확도: 40%
- 가격: 30%
- 사용성: 30%

## 세부 점수

| 도구 | 정확도 | 가격 | 사용성 | 합계 |
|------|--------|------|--------|------|
| A | 9/10 | 8/10 | 9/10 | 8.7 |
| B | 8/10 | 9/10 | 8/10 | 8.3 |
| C | 8/10 | 7/10 | 9/10 | 8.0 |

## 결론

---

**당신은 어떤 도구를 사용하시나요?**
`;
}

function generateNewsContent(article) {
  return `# ${article.title}

## 뉴스 개요

${article.description}

## 주요 내용

### 핵심

무엇이 발표되었는가:

- 포인트 1
- 포인트 2
- 포인트 3

### 배경

왜 이 뉴스가 중요한가:

이 발표의 배경과 의미를 설명합니다.

## 의료 현장에 미치는 영향

### 긍정적 영향

- 영향 1
- 영향 2
- 영향 3

### 주의할 점

- 주의 1
- 주의 2

## 의료진이 알아야 할 점

이 뉴스와 관련해 의료진이 준비해야 할 것들입니다.

## 향후 전망

다음 단계와 예상되는 발전입니다.

---

**원문 보기**
- [공식 발표](https://example.com)
`;
}

function generateFAQContent(article) {
  return `# Q: ${article.title}

## 질문

${article.title.replace(/^Q: /, '')}

## 답변

### 간단한 답변

${article.description}

### 상세 설명

더 자세한 설명입니다.

#### 법적 관점

법적으로는 어떻게 되나요?

#### 실무 관점

실제 의료 현장에서는 어떻게 하나요?

#### 미래 관점

향후 어떻게 변할까요?

## 추가 질문

### 관련 질문

다른 사람들이 자주 묻는 관련 질문들입니다.

- [다른 관련 FAQ](https://example.com)

## 참고 자료

더 알아보기 위한 자료들입니다.

---

**더 궁금한 점이 있으신가요?**
댓글로 질문해주세요.
`;
}

function generateHowToContent(article) {
  return `# ${article.title}

## 목표

${article.description}

## 준비물

- 필요한 도구 1
- 필요한 도구 2
- 기본 지식

## 단계별 가이드

### 1단계: 준비

먼저 할 일입니다.

\`\`\`
초기 설정
\`\`\`

### 2단계: 실행

실제 작업입니다.

1. 첫 번째 액션
2. 두 번째 액션
3. 세 번째 액션

### 3단계: 검증

올바르게 되었는지 확인합니다.

## 팁과 트릭

### 빠르게 하는 방법

- 팁 1
- 팁 2

### 실수하기 쉬운 부분

- 주의 1
- 주의 2

## 자주 묻는 질문

Q: 어려우면 어떻게 하나요?
A: 처음부터 다시 시작하세요.

## 다음 단계

이제 더 심화된 것들을 배울 수 있습니다.

---

**성공했나요?**
당신의 경험을 댓글로 공유해주세요.
`;
}

function generateLegalContent(article) {
  return `# ${article.title}

## 개요

${article.description}

## 법적 근거

### 관련 법규

- 법규 1: 설명
- 법규 2: 설명
- 법규 3: 설명

### 주요 조항

관련 법조문입니다.

\`\`\`
제00조 (의료 AI 사용)
...
\`\`\`

## 해석

### 일반적 해석

법원과 당국의 일반적 해석입니다.

### 의료진이 알아야 할 점

실무에서 중요한 포인트입니다.

- 포인트 1
- 포인트 2
- 포인트 3

## 준수 방법

### 체크리스트

- [ ] 항목 1
- [ ] 항목 2
- [ ] 항목 3

### 문서 준비

필요한 문서와 기록입니다.

## 위반 시 후과

### 민사 책임

### 행정 책임

### 형사 책임

## 최근 판례

### 주요 판례

최근 관련 판례입니다.

## 문의처

법적 문제는 전문가와 상담하세요.

---

**법적 조언**
본 글은 정보 제공만을 위한 것이며, 법적 조언은 아닙니다.
`;
}

function generateWarningContent(article) {
  return `# ⚠️ ${article.title}

## 경고

${article.description}

## 주의사항

### 위험 1

구체적인 위험과 그 이유입니다.

**해결책**: 이렇게 대처하세요.

### 위험 2

또 다른 위험입니다.

**해결책**: 이렇게 예방하세요.

### 위험 3

세 번째 위험입니다.

**해결책**: 이렇게 대응하세요.

## 실제 사례

### 사례 1

실제 발생한 문제입니다.

### 사례 2

또 다른 사례입니다.

## 체크리스트

이것들을 확인했나요?

- [ ] 확인 항목 1
- [ ] 확인 항목 2
- [ ] 확인 항목 3

## 안전한 사용법

### 기본 원칙

안전하게 사용하는 방법입니다.

1. 원칙 1
2. 원칙 2
3. 원칙 3

## 문제 발생 시

### 긴급 연락처

즉시 연락할 곳입니다.

---

**안전이 최우선입니다.**
`;
}

function generateDefaultContent(article) {
  return `# ${article.title}

## 개요

${article.description}

## 주요 내용

### 섹션 1

내용입니다.

### 섹션 2

내용입니다.

### 섹션 3

내용입니다.

## 중요 포인트

- 포인트 1
- 포인트 2
- 포인트 3

## 결론

결론입니다.

---

**더 알아보기**
- [관련 자료](https://example.com)
`;
}

// 메인 생성 함수
function generateAllContent() {
  console.log('🚀 콘텐츠 생성 시작...\n');

  let successCount = 0;
  let errorCount = 0;

  metadata.content.forEach((article, index) => {
    try {
      // 카테고리별 디렉토리 구조 생성
      let dirPath = baseDir;

      if (article.series) {
        dirPath = path.join(baseDir, article.category, article.series);
      } else {
        dirPath = path.join(baseDir, article.category);
      }

      ensureDirectoryExists(dirPath);

      // 파일명 생성
      const fileName = `${article.slug}.md`;
      const filePath = path.join(dirPath, fileName);

      // 마크다운 생성
      const markdown = generateMarkdown(article);

      // 파일 저장
      fs.writeFileSync(filePath, markdown, 'utf-8');

      console.log(`✅ [${index + 1}/100] ${article.slug}.md`);
      successCount++;
    } catch (error) {
      console.error(`❌ [${index + 1}/100] ${article.slug}: ${error.message}`);
      errorCount++;
    }
  });

  // 인덱스 파일 생성
  console.log('\n📋 인덱스 파일 생성 중...');
  const indexPath = path.join(baseDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log('✅ index.json 생성됨');

  // 요약 보고서
  console.log('\n' + '='.repeat(50));
  console.log('📊 생성 완료 보고서');
  console.log('='.repeat(50));
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${errorCount}개`);
  console.log(`📁 저장 위치: ${baseDir}`);
  console.log(`🏷️  카테고리 분포:`);
  Object.entries(metadata.meta.categories).forEach(([cat, count]) => {
    console.log(`   - ${cat}: ${count}개`);
  });
  console.log('='.repeat(50));
}

// 실행
generateAllContent();
