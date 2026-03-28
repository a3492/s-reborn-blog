/* ── Doctor AI Global Navigation — dai-nav.js ────────────────────────────── */
(function () {
  'use strict';

  // ── 사이트맵 데이터 ──────────────────────────────────────────────────────
  var SITEMAP = [
    {
      id: 'fundamentals',
      icon: '📖',
      label: 'Fundamentals',
      home: '/doctor-ai/fundamentals/home.html',
      pages: [
        { href: '/doctor-ai/fundamentals/home.html',                                   label: '시리즈 홈' },
        { href: '/doctor-ai/fundamentals/01-doctor-ai-series-landing.html',            label: '시리즈 소개' },
        { href: '/doctor-ai/fundamentals/11-doctors-learning-ai-intro.html',           label: '1편 · 의사가 AI를 배워야 하는 이유' },
        { href: '/doctor-ai/fundamentals/12-ai-strengths-and-limits.html',             label: '2편 · AI가 잘하는 일과 못하는 일' },
        { href: '/doctor-ai/fundamentals/13-ai-in-outpatient-workflow.html',           label: '3편 · 외래 전후 AI 활용 5가지 장면' },
        { href: '/doctor-ai/fundamentals/14-safe-medical-prompting.html',              label: '4편 · 안전하게 프롬프트 쓰는 법' },
        { href: '/doctor-ai/fundamentals/15-ai-for-resident-education-and-research.html', label: '5편 · 전공의 교육과 연구에 AI 붙이기' },
        { href: '/doctor-ai/fundamentals/16-ai-tool-comparison.html',                 label: '6편 · ChatGPT·Claude·Gemini 비교' },
        { href: '/doctor-ai/fundamentals/17-ai-for-medical-records.html',             label: '7편 · AI로 의무기록 효율 높이기' },
        { href: '/doctor-ai/fundamentals/18-ai-and-medical-ethics.html',              label: '8편 · 의료 AI와 윤리' },
        { href: '/doctor-ai/fundamentals/19-ai-in-radiology-and-pathology.html',      label: '9편 · 영상의학·병리에서 AI가 하는 일' },
        { href: '/doctor-ai/fundamentals/20-doctors-role-in-ai-era.html',             label: '10편 · AI 시대 의사의 역할' }
      ]
    },
    {
      id: 'prompts',
      icon: '🖊️',
      label: 'Prompts',
      home: '/doctor-ai/prompts/home.html',
      pages: [
        { href: '/doctor-ai/prompts/home.html',                             label: '시리즈 홈' },
        { href: '/doctor-ai/prompts/01-clinical-prompts-intro.html',        label: '1편 · 상황별 기본 프롬프트 5가지' },
        { href: '/doctor-ai/prompts/02-medical-record-prompts.html',        label: '2편 · 진료기록 자동 정리' },
        { href: '/doctor-ai/prompts/03-patient-explanation-prompts.html',   label: '3편 · 환자 설명문 초안 생성' },
        { href: '/doctor-ai/prompts/04-differential-diagnosis-prompts.html',label: '4편 · 감별진단 목록 생성' }
      ]
    },
    {
      id: 'cases',
      icon: '🔬',
      label: 'Cases',
      home: '/doctor-ai/cases/home.html',
      pages: [
        { href: '/doctor-ai/cases/home.html',                      label: '시리즈 홈' },
        { href: '/doctor-ai/cases/01-dm-glucose-control.html',     label: '1편 · 혈당 조절 안 되는 2형 당뇨' },
        { href: '/doctor-ai/cases/02-er-chest-pain.html',          label: '2편 · 응급실 흉통 환자 초기 평가' },
        { href: '/doctor-ai/cases/03-discharge-followup.html',     label: '3편 · 퇴원 후 추적관찰 지침 생성' },
        { href: '/doctor-ai/cases/04-polypharmacy-elderly.html',   label: '4편 · 다약제 복용 고령 환자' }
      ]
    },
    {
      id: 'tools',
      icon: '🛠️',
      label: 'Tools',
      home: '/doctor-ai/tools/home.html',
      pages: [
        { href: '/doctor-ai/tools/home.html',                        label: '시리즈 홈' },
        { href: '/doctor-ai/tools/01-chatgpt-vs-claude.html',        label: '1편 · ChatGPT vs Claude 비교' },
        { href: '/doctor-ai/tools/02-gemini-medical-search.html',    label: '2편 · Gemini와 의료 검색 AI 비교' },
        { href: '/doctor-ai/tools/03-korean-ai-tools.html',          label: '3편 · 국내 AI 도구 현황' },
        { href: '/doctor-ai/tools/04-ai-security-checklist.html',    label: '4편 · 보안·개인정보 체크리스트' }
      ]
    }
  ];

  // ── 현재 페이지 감지 ─────────────────────────────────────────────────────
  var path = window.location.pathname;
  var currentSection = null;
  var currentPage = null;

  SITEMAP.forEach(function (sec) {
    sec.pages.forEach(function (page) {
      // 정규화: 경로 끝부분 비교
      var normalized = page.href.replace(/^\/doctor-ai/, '');
      if (path.endsWith(normalized) || path.endsWith(page.href)) {
        currentSection = sec.id;
        currentPage = page.href;
      }
    });
  });

  // 폴백: URL 세그먼트로 섹션 감지
  if (!currentSection) {
    ['fundamentals', 'prompts', 'cases', 'tools'].forEach(function (s) {
      if (path.indexOf('/' + s + '/') !== -1) currentSection = s;
    });
  }

  // ── HTML 빌더 헬퍼 ───────────────────────────────────────────────────────
  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── 글로벌 내비게이션 바 HTML ────────────────────────────────────────────
  var navLinksHtml = SITEMAP.map(function (sec) {
    var isActive = sec.id === currentSection;
    var current = isActive ? ' aria-current="section"' : '';
    return '<li><a href="' + esc(sec.home) + '" data-section="' + esc(sec.id) + '"' + current + '>'
      + esc(sec.label) + '</a></li>';
  }).join('');

  // ── 드로어 섹션 HTML ────────────────────────────────────────────────────
  var drawerBodyHtml = SITEMAP.map(function (sec, i) {
    var linksHtml = sec.pages.map(function (page) {
      var isCurrent = page.href === currentPage ? ' aria-current="page"' : '';
      return '<li><a href="' + esc(page.href) + '"' + isCurrent + '>' + esc(page.label) + '</a></li>';
    }).join('');

    var divider = i > 0 ? '<div class="dai-drawer-divider"></div>' : '';
    return divider
      + '<div class="dai-drawer-section" data-section="' + esc(sec.id) + '">'
      + '<div class="dai-drawer-section-head">'
      + '<span class="dai-drawer-section-icon">' + sec.icon + '</span>'
      + esc(sec.label)
      + '</div>'
      + '<ul class="dai-drawer-links">' + linksHtml + '</ul>'
      + '</div>';
  }).join('');

  // ── 전체 HTML 조립 ──────────────────────────────────────────────────────
  var injectHtml = ''
    + '<nav class="dai-global-nav" role="navigation" aria-label="Doctor AI 내비게이션">'
    +   '<div class="dai-nav-inner">'
    +     '<div class="dai-nav-brand">'
    +       '<a class="dai-nav-badge" href="/doctor-ai/">Doctor AI</a>'
    +       '<span class="dai-nav-sep">/</span>'
    +       '<a class="dai-nav-site" href="/">S-Reborn</a>'
    +     '</div>'
    +     '<ul class="dai-nav-links" role="list">' + navLinksHtml + '</ul>'
    +     '<div class="dai-nav-right">'
    +       '<button class="dai-hamburger" id="dai-hamburger"'
    +         ' aria-label="전체 목차 열기" aria-expanded="false" aria-controls="dai-drawer">'
    +         '<span></span><span></span><span></span>'
    +       '</button>'
    +     '</div>'
    +   '</div>'
    + '</nav>'
    + '<div class="dai-overlay" id="dai-overlay" aria-hidden="true"></div>'
    + '<aside class="dai-drawer" id="dai-drawer"'
    +   ' role="dialog" aria-modal="true" aria-label="Doctor AI 전체 목차">'
    +   '<div class="dai-drawer-head">'
    +     '<span class="dai-drawer-title">전체 목차</span>'
    +     '<button class="dai-drawer-close" id="dai-drawer-close" aria-label="닫기">✕</button>'
    +   '</div>'
    +   '<a href="/doctor-ai/" class="dai-drawer-hub">'
    +     '<span class="dai-drawer-hub-icon">🏠</span>'
    +     'Doctor AI 허브로 이동'
    +   '</a>'
    +   '<div class="dai-drawer-body">' + drawerBodyHtml + '</div>'
    + '</aside>';

  // ── DOM 삽입 ─────────────────────────────────────────────────────────────
  document.body.insertAdjacentHTML('afterbegin', injectHtml);

  // 기존 topnav 숨김 (새 글로벌 nav로 대체)
  // 주입된 nav 다음에 오는 첫 번째 nav/div.topnav를 숨김
  var allNavs = document.querySelectorAll('nav.topnav, div.topnav, .topnav');
  allNavs.forEach(function (n) {
    if (!n.classList.contains('dai-global-nav') && !n.closest('.dai-global-nav')) {
      n.classList.add('dai-replaced');
    }
  });

  // ── 드로어 인터랙션 ──────────────────────────────────────────────────────
  var hamburger   = document.getElementById('dai-hamburger');
  var drawer      = document.getElementById('dai-drawer');
  var overlay     = document.getElementById('dai-overlay');
  var closeBtn    = document.getElementById('dai-drawer-close');

  function openDrawer() {
    drawer.classList.add('dai-drawer--open');
    overlay.classList.add('dai-overlay--visible');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    // 포커스를 닫기 버튼으로 이동
    setTimeout(function () { closeBtn.focus(); }, 30);
  }

  function closeDrawer() {
    drawer.classList.remove('dai-drawer--open');
    overlay.classList.remove('dai-overlay--visible');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // 트리거로 포커스 복귀
    hamburger.focus();
  }

  hamburger.addEventListener('click', function () {
    drawer.classList.contains('dai-drawer--open') ? closeDrawer() : openDrawer();
  });
  overlay.addEventListener('click', closeDrawer);
  closeBtn.addEventListener('click', closeDrawer);

  // ESC 키 닫기
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('dai-drawer--open')) {
      closeDrawer();
    }
  });

  // 포커스 트랩 (Tab 키 순환)
  drawer.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var focusable = Array.prototype.slice.call(
      drawer.querySelectorAll('a[href], button:not([disabled])')
    );
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });

  // 현재 페이지 링크 클릭 시 드로어 닫기 (이미 해당 페이지이므로 새로고침 방지)
  var currentLinks = drawer.querySelectorAll('a[aria-current="page"]');
  currentLinks.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      closeDrawer();
    });
  });

})();
