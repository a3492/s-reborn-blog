const fs = require('fs');
const path = require('path');

// 메타데이터 로드
const metadata = JSON.parse(fs.readFileSync('./content-metadata.json', 'utf-8'));

// 디렉토리 생성
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 카테고리별 그룹화
function groupByCategory(articles) {
  const grouped = {};
  articles.forEach(article => {
    if (!grouped[article.category]) {
      grouped[article.category] = [];
    }
    grouped[article.category].push(article);
  });
  return grouped;
}

// 카테고리 표시명
const categoryNames = {
  'doctor-ai': 'Doctor AI',
  'ai-news': 'AI 뉴스',
  'ai-tools': 'AI 도구',
  'faq': 'FAQ',
  'tips': '의료진 팁',
  'regulations': '규제 & 법률'
};

const categoryDescriptions = {
  'doctor-ai': '의료진을 위한 AI 활용 완벽 가이드',
  'ai-news': '최신 의료 AI 뉴스와 트렌드',
  'ai-tools': '의료용 AI 도구 리뷰 및 비교',
  'faq': '의료 AI에 대한 자주 묻는 질문',
  'tips': '의료 현장에서 바로 써먹는 AI 팁',
  'regulations': '의료 AI 법규 및 규제 정보'
};

const categoryIcons = {
  'doctor-ai': '🏥',
  'ai-news': '📰',
  'ai-tools': '🛠️',
  'faq': '❓',
  'tips': '💡',
  'regulations': '⚖️'
};

// HTML 헤더 생성
function generateHeader(categoryKey) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${categoryNames[categoryKey]} | S-Reborn Medical AI</title>
  <meta name="description" content="${categoryDescriptions[categoryKey]}">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', sans-serif;
      background: #fbf7f1;
      color: #1d2328;
      line-height: 1.6;
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
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .page-title {
      font-size: 36px;
      margin-bottom: 10px;
      color: #155d4b;
    }

    .page-description {
      font-size: 16px;
      color: #666;
      margin-bottom: 40px;
    }

    .filters {
      background: white;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 30px;
      border: 1px solid #e0d5c8;
    }

    .filter-group {
      margin-bottom: 15px;
    }

    .filter-group label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-bottom: 8px;
    }

    .filter-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .filter-btn {
      padding: 6px 14px;
      border: 1px solid #d0c5b9;
      background: white;
      border-radius: 20px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      border-color: #155d4b;
      color: #155d4b;
      background: #f0f8f6;
    }

    .filter-btn.active {
      background: #155d4b;
      color: white;
      border-color: #155d4b;
    }

    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
      margin-bottom: 40px;
    }

    .article-card {
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
    }

    .article-card:hover {
      border-color: #155d4b;
      box-shadow: 0 8px 24px rgba(21, 93, 75, 0.12);
      transform: translateY(-4px);
    }

    .article-header {
      padding: 24px 20px;
      flex-grow: 1;
    }

    .article-title {
      font-size: 16px;
      font-weight: 600;
      color: #1d2328;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .article-description {
      font-size: 13px;
      color: #666;
      line-height: 1.5;
      margin-bottom: 16px;
    }

    .article-meta {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 12px;
      color: #999;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .difficulty-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .difficulty-beginner {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .difficulty-intermediate {
      background: #fff3e0;
      color: #f57c00;
    }

    .difficulty-advanced {
      background: #fce4ec;
      color: #c2185b;
    }

    .article-tags {
      padding: 0 20px 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag {
      font-size: 12px;
      background: #f0ebe2;
      color: #155d4b;
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tag:hover {
      background: #155d4b;
      color: white;
    }

    .no-results {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .no-results-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    footer {
      background: #f5f0e8;
      padding: 40px 20px;
      text-align: center;
      color: #666;
      border-top: 1px solid #e0d5c8;
      margin-top: 60px;
    }

    @media (max-width: 768px) {
      header nav ul {
        flex-direction: column;
        gap: 12px;
      }

      .page-title {
        font-size: 28px;
      }

      .articles-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <nav>
      <a href="/s-reborn-blog/">S-Reborn Medical AI</a>
      <ul>
        <li><a href="/s-reborn-blog/">홈</a></li>
        <li><a href="/s-reborn-blog/category/doctor-ai.html">Doctor AI</a></li>
        <li><a href="/s-reborn-blog/category/ai-news.html">뉴스</a></li>
        <li><a href="/s-reborn-blog/category/ai-tools.html">도구</a></li>
        <li><a href="/s-reborn-blog/category/faq.html">FAQ</a></li>
        <li><a href="/s-reborn-blog/category/tips.html">팁</a></li>
        <li><a href="/s-reborn-blog/category/regulations.html">규제</a></li>
        <li><a href="/s-reborn-blog/search.html">🔍 검색</a></li>
      </ul>
    </nav>
  </header>

  <div class="container">
    <h1 class="page-title">${categoryIcons[categoryKey]} ${categoryNames[categoryKey]}</h1>
    <p class="page-description">${categoryDescriptions[categoryKey]}</p>

    <div class="filters">
      <div class="filter-group">
        <label>난이도</label>
        <div class="filter-buttons">
          <button class="filter-btn" onclick="filterByDifficulty('beginner')">초급</button>
          <button class="filter-btn" onclick="filterByDifficulty('intermediate')">중급</button>
          <button class="filter-btn" onclick="filterByDifficulty('advanced')">고급</button>
        </div>
      </div>
      <div class="filter-group">
        <label>읽기 시간</label>
        <div class="filter-buttons">
          <button class="filter-btn" onclick="filterByReadTime(5)">5분 이하</button>
          <button class="filter-btn" onclick="filterByReadTime(10)">10분 이하</button>
          <button class="filter-btn" onclick="filterByReadTime(999)">전체</button>
        </div>
      </div>
    </div>

    <div class="articles-grid" id="articlesContainer">
      <!-- 글 목록이 여기에 생성됨 -->
    </div>
  </div>

  <footer>
    <p>© 2026 S-Reborn · Medical AI Content Platform</p>
    <p style="font-size: 12px; margin-top: 10px; color: #999;">
      <a href="https://github.com/a3492/s-reborn-blog" style="color: #999; text-decoration: none;">GitHub</a>
    </p>
  </footer>

  <script>
    const articles = ARTICLES_JSON;
    let currentDifficulty = null;
    let currentReadTime = null;

    function renderArticles() {
      let filtered = articles;

      if (currentDifficulty) {
        filtered = filtered.filter(a => a.difficulty === currentDifficulty);
      }

      if (currentReadTime) {
        filtered = filtered.filter(a => a.read_time <= currentReadTime);
      }

      const container = document.getElementById('articlesContainer');

      if (filtered.length === 0) {
        container.innerHTML = \`
          <div class="no-results">
            <div class="no-results-icon">📭</div>
            <p>일치하는 글이 없습니다.</p>
          </div>
        \`;
        return;
      }

      container.innerHTML = filtered.map(article => \`
        <a href="/s-reborn-blog/article/\${article.slug}.html" class="article-card">
          <div class="article-header">
            <h2 class="article-title">\${article.title}</h2>
            <p class="article-description">\${article.description}</p>
          </div>
          <div class="article-meta">
            <span class="meta-item">📕 \${article.read_time}분</span>
            <span class="difficulty-badge difficulty-\${article.difficulty}">
              \${article.difficulty === 'beginner' ? '초급' : article.difficulty === 'intermediate' ? '중급' : '고급'}
            </span>
          </div>
          <div class="article-tags">
            \${article.tags.map(tag => \`<span class="tag">#\${tag}</span>\`).join('')}
          </div>
        </a>
      \`).join('');
    }

    function filterByDifficulty(level) {
      currentDifficulty = currentDifficulty === level ? null : level;
      renderArticles();
    }

    function filterByReadTime(time) {
      currentReadTime = currentReadTime === time ? null : time;
      renderArticles();
    }

    renderArticles();
  </script>
</body>
</html>`;
}

// 카테고리 페이지 생성 함수
function generateCategoryPage(categoryKey, articles) {
  const sortedArticles = articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  const articlesJson = JSON.stringify(sortedArticles, null, 2);

  let html = generateHeader(categoryKey);

  // JavaScript에 JSON 데이터 삽입
  html = html.replace('const articles = ARTICLES_JSON;', `const articles = ${articlesJson};`);

  return html;
}

// 메인 함수
function buildStaticPages() {
  console.log('🚀 정적 페이지 생성 시작...\n');

  ensureDirectoryExists('./public/category');

  const grouped = groupByCategory(metadata.content);
  let successCount = 0;
  let errorCount = 0;

  // 각 카테고리별 페이지 생성
  Object.entries(grouped).forEach(([categoryKey, articles]) => {
    try {
      const html = generateCategoryPage(categoryKey, articles);
      const filePath = path.join('./public/category', `${categoryKey}.html`);

      fs.writeFileSync(filePath, html, 'utf-8');

      console.log(`✅ ${categoryNames[categoryKey]}: ${articles.length}개 글`);
      successCount++;
    } catch (error) {
      console.error(`❌ ${categoryKey}: ${error.message}`);
      errorCount++;
    }
  });

  // 검색 페이지 생성
  try {
    const searchHtml = generateSearchPage();
    fs.writeFileSync('./public/search.html', searchHtml, 'utf-8');
    console.log(`✅ 검색 페이지 생성`);
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
  console.log(`📁 저장 위치: ./public/category/`);
  console.log('='.repeat(50));
}

// 검색 페이지 생성 함수
function generateSearchPage() {
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
      <a href="/s-reborn-blog/">S-Reborn Medical AI</a>
      <ul>
        <li><a href="/s-reborn-blog/">홈</a></li>
        <li><a href="/s-reborn-blog/category/doctor-ai.html">Doctor AI</a></li>
        <li><a href="/s-reborn-blog/category/ai-news.html">뉴스</a></li>
        <li><a href="/s-reborn-blog/category/ai-tools.html">도구</a></li>
        <li><a href="/s-reborn-blog/category/faq.html">FAQ</a></li>
        <li><a href="/s-reborn-blog/category/tips.html">팁</a></li>
        <li><a href="/s-reborn-blog/category/regulations.html">규제</a></li>
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
    const allArticles = ARTICLES_JSON;
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
          <a href="/s-reborn-blog/article/\${article.slug}.html" class="result-card">
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

// 실행
buildStaticPages();
