const fs = require('fs');
const path = require('path');

// 메타데이터 로드
const metadata = JSON.parse(fs.readFileSync('./content-metadata.json', 'utf-8'));
const allArticles = metadata.content;

// 디렉토리 생성
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 카테고리 정보
const categoryIcons = {
  'doctor-ai': '🏥',
  'ai-news': '📰',
  'ai-tools': '🛠️',
  'faq': '❓',
  'tips': '💡',
  'regulations': '⚖️'
};

// 개별 글 상세 페이지 생성
function generateArticlePage(article) {
  const nextArticle = allArticles.find(a =>
    a.category === article.category &&
    a.series === article.series &&
    a.series_order === article.series_order + 1
  );

  const prevArticle = allArticles.find(a =>
    a.category === article.category &&
    a.series === article.series &&
    a.series_order === article.series_order - 1
  );

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} | S-Reborn Medical AI</title>
  <meta name="description" content="${article.description}">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif;
      background: #fbf7f1;
      color: #1d2328;
      line-height: 1.8;
    }

    header {
      background: white;
      border-bottom: 1px solid #e0d5c8;
      padding: 20px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    header nav {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    header a {
      text-decoration: none;
      color: #155d4b;
      font-weight: 600;
      font-size: 18px;
    }

    header nav ul {
      list-style: none;
      display: flex;
      gap: 30px;
    }

    header nav a {
      font-size: 14px;
      color: #666;
      font-weight: 500;
      transition: color 0.2s;
    }

    header nav a:hover {
      color: #155d4b;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .article-header {
      margin-bottom: 40px;
    }

    .article-meta {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
      font-size: 14px;
      color: #666;
    }

    .category-badge {
      display: inline-block;
      background: #155d4b;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }

    .article-title {
      font-size: 36px;
      line-height: 1.3;
      margin-bottom: 20px;
      color: #1d2328;
    }

    .article-description {
      font-size: 18px;
      color: #666;
      margin-bottom: 20px;
    }

    .article-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 30px;
    }

    .tag {
      background: #f0ebe2;
      color: #155d4b;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      text-decoration: none;
    }

    .article-content {
      background: white;
      padding: 40px;
      border-radius: 12px;
      border: 1px solid #e0d5c8;
      margin-bottom: 40px;
    }

    .article-content h2 {
      font-size: 24px;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #155d4b;
    }

    .article-content h2:first-child {
      margin-top: 0;
    }

    .article-content p {
      margin-bottom: 15px;
    }

    .article-content ul, .article-content ol {
      margin: 15px 0 15px 30px;
    }

    .article-content li {
      margin-bottom: 8px;
    }

    .article-content code {
      background: #f5f0e8;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
    }

    .article-content pre {
      background: #f5f0e8;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 20px 0;
    }

    .article-footer {
      background: white;
      padding: 30px;
      border-radius: 12px;
      border: 1px solid #e0d5c8;
      margin-bottom: 40px;
    }

    .navigation {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }

    .nav-link {
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e0d5c8;
      text-decoration: none;
      color: inherit;
      transition: all 0.2s;
    }

    .nav-link:hover {
      border-color: #155d4b;
      box-shadow: 0 4px 12px rgba(21, 93, 75, 0.1);
    }

    .nav-link.empty {
      visibility: hidden;
    }

    .nav-label {
      display: block;
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .nav-title {
      font-size: 16px;
      font-weight: 600;
      color: #155d4b;
    }

    footer {
      background: #f5f0e8;
      padding: 40px 20px;
      text-align: center;
      color: #666;
      border-top: 1px solid #e0d5c8;
    }

    footer a {
      color: #666;
      text-decoration: none;
    }

    @media (max-width: 768px) {
      .article-title {
        font-size: 28px;
      }

      .navigation {
        grid-template-columns: 1fr;
      }

      .article-content {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <header>
    <nav>
      <a href="/">S-Reborn Medical AI</a>
      <ul>
        <li><a href="/">홈</a></li>
        <li><a href="/category/doctor-ai.html">Doctor AI</a></li>
        <li><a href="/category/ai-news.html">뉴스</a></li>
        <li><a href="/category/ai-tools.html">도구</a></li>
        <li><a href="/category/faq.html">FAQ</a></li>
        <li><a href="/category/tips.html">팁</a></li>
        <li><a href="/category/regulations.html">규제</a></li>
        <li><a href="/search.html">🔍 검색</a></li>
      </ul>
    </nav>
  </header>

  <div class="container">
    <article class="article-header">
      <div class="article-meta">
        <span class="category-badge">${article.category}</span>
        <span>📕 ${article.read_time}분 읽기</span>
        <span>📅 ${article.date}</span>
      </div>

      <h1 class="article-title">${article.title}</h1>
      <p class="article-description">${article.description}</p>

      <div class="article-tags">
        ${article.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
      </div>
    </article>

    <div class="article-content">
      <h2>서론</h2>
      <p>${article.description}</p>

      <h2>주요 내용</h2>
      <h3>1. 기본 개념</h3>
      <p>${article.title}에 대한 기본적인 개념을 설명합니다.</p>

      <h3>2. 실제 적용</h3>
      <p>구체적인 사용 사례를 통해 어떻게 활용할 수 있는지 알아봅니다.</p>

      <h3>3. 주의사항</h3>
      <ul>
        <li>주의사항 1</li>
        <li>주의사항 2</li>
        <li>주의사항 3</li>
      </ul>

      <h2>결론</h2>
      <p>${article.title}은(는) 의료 현장에서 중요한 역할을 합니다.</p>

      <hr style="margin: 40px 0; border: none; border-top: 1px solid #e0d5c8;">

      <h3>참고 자료</h3>
      <ul>
        <li><a href="https://example.com" style="color: #155d4b;">의료법 관련 가이드</a></li>
        <li><a href="https://example.com" style="color: #155d4b;">관련 논문 및 연구</a></li>
      </ul>
    </div>

    <div class="article-footer">
      <h3>이전 및 다음 글</h3>
      <div class="navigation">
        ${prevArticle ? `
          <a href="/article/${prevArticle.slug}.html" class="nav-link">
            <span class="nav-label">← 이전 글</span>
            <span class="nav-title">${prevArticle.title}</span>
          </a>
        ` : '<div class="nav-link empty"></div>'}

        ${nextArticle ? `
          <a href="/article/${nextArticle.slug}.html" class="nav-link" style="text-align: right;">
            <span class="nav-label">다음 글 →</span>
            <span class="nav-title">${nextArticle.title}</span>
          </a>
        ` : '<div class="nav-link empty"></div>'}
      </div>
    </div>
  </div>

  <footer>
    <p>© 2026 S-Reborn · Medical AI Content Platform</p>
    <p style="font-size: 12px; margin-top: 10px;">
      <a href="https://github.com/a3492/s-reborn-blog">GitHub 저장소</a>
    </p>
  </footer>
</body>
</html>`;
}

// 수정된 검색 페이지 생성 (데이터 임베딩 포함)
function generateSearchPageWithData() {
  const articlesJson = JSON.stringify(allArticles, null, 2);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>검색 | S-Reborn Medical AI</title>
  <script src="https://cdn.jsdelivr.net/npm/fuse.js@6.6.2"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif;
      background: #fbf7f1;
      color: #1d2328;
    }

    header {
      background: white;
      border-bottom: 1px solid #e0d5c8;
      padding: 20px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    header nav {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    header a {
      text-decoration: none;
      color: #155d4b;
      font-weight: 600;
      font-size: 18px;
    }

    header nav ul {
      list-style: none;
      display: flex;
      gap: 30px;
    }

    header nav a {
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .search-box {
      background: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      border: 1px solid #e0d5c8;
    }

    .search-input {
      width: 100%;
      padding: 16px;
      font-size: 16px;
      border: 1px solid #d0c5b9;
      border-radius: 8px;
      font-family: inherit;
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #155d4b;
      box-shadow: 0 0 0 3px rgba(21, 93, 75, 0.1);
    }

    .results {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .result-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e0d5c8;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      padding: 20px;
    }

    .result-card:hover {
      border-color: #155d4b;
      box-shadow: 0 8px 24px rgba(21, 93, 75, 0.12);
    }

    .result-title {
      font-size: 16px;
      font-weight: 600;
      color: #155d4b;
      margin-bottom: 10px;
    }

    .result-description {
      font-size: 13px;
      color: #666;
      margin-bottom: 10px;
      line-height: 1.5;
    }

    .result-meta {
      font-size: 12px;
      color: #999;
    }

    .result-category {
      display: inline-block;
      background: #f0f8f6;
      color: #155d4b;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .no-results {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    footer {
      background: #f5f0e8;
      padding: 40px 20px;
      text-align: center;
      color: #666;
      border-top: 1px solid #e0d5c8;
      margin-top: 60px;
    }
  </style>
</head>
<body>
  <header>
    <nav>
      <a href="/">S-Reborn Medical AI</a>
      <ul>
        <li><a href="/">홈</a></li>
        <li><a href="/category/doctor-ai.html">Doctor AI</a></li>
        <li><a href="/category/ai-news.html">뉴스</a></li>
        <li><a href="/category/ai-tools.html">도구</a></li>
        <li><a href="/category/faq.html">FAQ</a></li>
        <li><a href="/category/tips.html">팁</a></li>
        <li><a href="/category/regulations.html">규제</a></li>
      </ul>
    </nav>
  </header>

  <div class="container">
    <div class="search-box">
      <input type="text" class="search-input" id="searchInput" placeholder="🔍 의료 AI에 관해 검색하세요...">
    </div>
    <div class="results" id="resultsContainer"></div>
  </div>

  <footer>
    <p>© 2026 S-Reborn · Medical AI Content Platform</p>
  </footer>

  <script>
    const allArticles = ${articlesJson};
    const fuse = new Fuse(allArticles, {
      keys: ['title', 'description', 'tags'],
      threshold: 0.3
    });

    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('resultsContainer');

    function renderResults(results) {
      if (results.length === 0) {
        resultsContainer.innerHTML = \`
          <div class="no-results">
            <p style="font-size: 48px; margin-bottom: 10px;">🔍</p>
            <p>일치하는 글이 없습니다. 다른 검색어를 시도해주세요.</p>
          </div>
        \`;
        return;
      }

      resultsContainer.innerHTML = results.map(result => {
        const article = result.item;
        return \`
          <a href="/article/\${article.slug}.html" class="result-card">
            <div class="result-category">\${article.category}</div>
            <h3 class="result-title">\${article.title}</h3>
            <p class="result-description">\${article.description}</p>
            <div class="result-meta">
              📕 \${article.read_time}분 · 📅 \${article.date}
            </div>
          </a>
        \`;
      }).join('');
    }

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length < 1) {
        resultsContainer.innerHTML = '';
        return;
      }
      const results = fuse.search(query);
      renderResults(results);
    });
  </script>
</body>
</html>`;
}

// 메인 빌드 함수
function buildArticlePages() {
  console.log('🚀 글 상세 페이지 생성 시작...\n');

  ensureDirectoryExists('./public/article');

  let successCount = 0;
  let errorCount = 0;

  // 개별 글 페이지 생성
  allArticles.forEach(article => {
    try {
      const html = generateArticlePage(article);
      const filePath = path.join('./public/article', `${article.slug}.html`);
      fs.writeFileSync(filePath, html, 'utf-8');
      successCount++;
    } catch (error) {
      console.error(`❌ ${article.slug}: ${error.message}`);
      errorCount++;
    }
  });

  console.log(`✅ 글 상세 페이지: ${successCount}개 생성`);

  // 수정된 검색 페이지 생성
  try {
    const searchHtml = generateSearchPageWithData();
    fs.writeFileSync('./public/search.html', searchHtml, 'utf-8');
    console.log(`✅ 검색 페이지: 데이터 임베딩 완료`);
    successCount++;
  } catch (error) {
    console.error(`❌ 검색 페이지: ${error.message}`);
    errorCount++;
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 빌드 완료 보고서');
  console.log('='.repeat(50));
  console.log(`✅ 생성 성공: ${successCount}개`);
  console.log(`❌ 생성 실패: ${errorCount}개`);
  console.log(`📁 글 저장 위치: ./public/article/`);
  console.log('='.repeat(50));
}

// 실행
buildArticlePages();
