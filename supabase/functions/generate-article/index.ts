/**
 * generate-article
 * Supabase Edge Function — article_requests INSERT 웹훅 수신 시
 * Claude API로 실제 블로그 글을 생성하여 draft post로 저장합니다.
 *
 * 환경변수:
 *   ANTHROPIC_API_KEY         (Supabase Secrets에 수동 설정, 필수)
 *   WEBHOOK_SECRET            (Supabase Secrets에 수동 설정, 선택)
 *   SUPABASE_URL              (Supabase 런타임 자동 주입)
 *   SUPABASE_SERVICE_ROLE_KEY (Supabase 런타임 자동 주입)
 */

const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANTHROPIC_KEY   = Deno.env.get('ANTHROPIC_API_KEY');
const WEBHOOK_SECRET  = Deno.env.get('WEBHOOK_SECRET');

// ─── Supabase REST 헬퍼 ──────────────────────────────────────────────────────

async function sbFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init?.headers ?? {}),
    },
  });
}

async function safeJson(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

// ─── 슬러그 생성 ─────────────────────────────────────────────────────────────

async function resolveSlug(base: string): Promise<string> {
  return `draft-${base.replace(/[^a-z0-9가-힣]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 30)}-${Date.now()}`;
}

// ─── 중복 처리 방지 ──────────────────────────────────────────────────────────

async function isAlreadyProcessed(requestId: string): Promise<boolean> {
  const res = await sbFetch(`posts?source_request_id=eq.${requestId}&select=id`);
  const data = await safeJson(res);
  return Array.isArray(data) && data.length > 0;
}

// ─── Claude API 호출 ─────────────────────────────────────────────────────────

const CATEGORY_CONTEXT: Record<string, string> = {
  'ai':                 '인공지능 기초·입문 — 비전문가도 이해할 수 있도록 쉽게',
  'aerini':             'AI 일상 활용 — 누구나 써볼 수 있는 실용적인 내용',
  'ai-terminology':     'AI 용어 설명 — 개념 정의와 예시 중심',
  'prompt-engineering': '프롬프트 엔지니어링 — 실제 프롬프트 예시 포함',
  'context-engineering':'컨텍스트 엔지니어링 — 컨텍스트 설계 방법론',
  'ai-agents':          'AI 에이전트 — 자율 시스템 원리와 활용',
  'rag-finetuning':     'RAG·파인튜닝 — 데이터 활용 AI 개선 기법',
  'doctor-ai':          '의사를 위한 AI — 임상 현장 실무 적용 관점',
  'medical-data-science':'의료 데이터 사이언스 — 임상 데이터 분석',
  'ai-tools-medical':   '의료 AI 도구 — 실제 의료 현장 도구 리뷰',
  'ai-tools-general':   'AI 도구 리뷰 — 실제 사용 경험 기반 추천',
  'ai-news':            'AI 최신 동향 — 최근 연구·서비스 소식',
  'tips':               '실전 팁 — 바로 적용 가능한 워크플로우',
  'faq':                'FAQ — 자주 묻는 질문에 명쾌한 답변',
};

function inferCategory(query: string): string {
  const q = query.toLowerCase();
  if (/의사|의료|병원|임상|환자|진료/.test(q)) return 'doctor-ai';
  if (/프롬프트|prompt/.test(q)) return 'prompt-engineering';
  if (/에이전트|agent/.test(q)) return 'ai-agents';
  if (/rag|파인튜닝|fine.?tun/.test(q)) return 'rag-finetuning';
  if (/도구|툴|tool|앱|app|서비스/.test(q)) return 'ai-tools-general';
  if (/뉴스|소식|발표|출시|최신/.test(q)) return 'ai-news';
  if (/faq|자주|질문/.test(q)) return 'faq';
  if (/팁|tip|방법|어떻게|활용/.test(q)) return 'tips';
  if (/용어|개념|정의|뜻/.test(q)) return 'ai-terminology';
  if (/일상|생활|누구|쉽게|입문/.test(q)) return 'aerini';
  return 'ai-tools-general';
}

async function generateWithClaude(query: string, category: string): Promise<{
  title: string;
  description: string;
  body: string;
  tags: string[];
}> {
  const catContext = CATEGORY_CONTEXT[category] ?? 'AI 전반';

  const prompt = `당신은 'S-Reborn Blog'의 AI 전문 에디터입니다. 독자가 "${query}"로 검색했으나 관련 글이 없어 직접 요청했습니다.

카테고리: ${catContext}

아래 형식의 JSON만 출력하세요 (마크다운 코드블록 없이 순수 JSON):

{
  "title": "SEO 최적화된 한국어 제목 (40자 이내)",
  "description": "검색 결과에 표시될 요약문 (80-120자)",
  "tags": ["태그1", "태그2", "태그3"],
  "body": "마크다운 본문 (1500-2500자, 소제목·예시·실용적 내용 포함)"
}

규칙:
- 독자는 의사, 의료인, AI에 관심 있는 일반인
- 실용적·구체적 내용 위주, 과장 없이
- 본문에 ## 소제목 2~4개 사용
- 본문 마지막에 ## 마치며 섹션 포함
- 태그는 한국어 또는 영어 단어, 3~5개`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text ?? '';

  // JSON 파싱 시도 — Claude가 코드블록을 붙이는 경우 제거
  const jsonStr = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  try {
    const parsed = JSON.parse(jsonStr);
    return {
      title:       String(parsed.title ?? `[초안] ${query}`).slice(0, 60),
      description: String(parsed.description ?? '').slice(0, 200),
      body:        String(parsed.body ?? ''),
      tags:        Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5).map(String) : [],
    };
  } catch {
    // JSON 파싱 실패 시 raw text를 body로 사용
    console.warn('[generate-article] JSON parse failed, using raw text as body');
    return {
      title:       `[초안] ${query}`,
      description: '',
      body:        text,
      tags:        [],
    };
  }
}

// ─── DB 조작 ─────────────────────────────────────────────────────────────────

async function insertPost(params: {
  query: string;
  referrer: string | null;
  requestId: string;
  title: string;
  description: string;
  body: string;
  tags: string[];
  category: string;
  isAiGenerated: boolean;
}): Promise<any> {
  const slug = await resolveSlug(params.query);

  const bodyWithNote = params.isAiGenerated
    ? params.body
    : `<!-- AI 생성 실패 — Claude.ai에서 직접 작성하세요 -->\n\n## 독자 요청 주제\n"${params.query}"${params.referrer ? `\n\n출처: ${params.referrer}` : ''}\n\n---\n\n*관리자 대시보드에서 "Claude.ai로 작성" 버튼을 눌러 글을 작성하세요.*`;

  const res = await sbFetch('posts', {
    method: 'POST',
    body: JSON.stringify({
      title: params.title,
      description: params.description,
      slug,
      category: params.category,
      tags: params.tags,
      body_markdown: bodyWithNote,
      status: 'draft',
      source_request_id: params.requestId,
    }),
  });

  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(`posts insert failed: ${err?.message ?? JSON.stringify(err)}`);
  }

  const data = await safeJson(res);
  return Array.isArray(data) ? data[0] : data;
}

async function markReviewing(requestId: string): Promise<void> {
  const res = await sbFetch(`article_requests?id=eq.${requestId}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'reviewing' }),
  });
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(`article_requests patch failed: ${err?.message ?? JSON.stringify(err)}`);
  }
}

async function writeAuditLog(postId: string, requestId: string, slug: string, mode: string): Promise<void> {
  try {
    await sbFetch('audit_logs', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        actor_id: null,
        action: 'post_auto_generated',
        resource_type: 'post',
        resource_id: postId,
        after_json: {
          slug,
          source: 'generate-article-edge-fn',
          article_request_id: requestId,
          mode,
        },
      }),
    });
  } catch (e) {
    console.warn('audit_logs insert skipped:', e);
  }
}

async function markError(requestId: string, message: string): Promise<void> {
  try {
    await sbFetch(`article_requests?id=eq.${requestId}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ note: `Error: ${message}` }),
    });
  } catch { /* 무시 */ }
}

// ─── 메인 핸들러 ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  if (WEBHOOK_SECRET) {
    const incoming = req.headers.get('x-webhook-secret');
    if (incoming !== WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (payload?.type !== 'INSERT' || payload?.table !== 'article_requests' || !payload?.record) {
    return Response.json({ skipped: true, reason: 'not a relevant INSERT' });
  }

  const record = payload.record;

  if (record.status !== 'pending') {
    return Response.json({ skipped: true, reason: `status is '${record.status}', not 'pending'` });
  }

  const { id: requestId, query, referrer } = record;

  if (!query?.trim()) {
    return Response.json({ skipped: true, reason: 'empty query' });
  }

  if (await isAlreadyProcessed(requestId)) {
    return Response.json({ skipped: true, reason: 'already processed' });
  }

  console.log(`[generate-article] processing request ${requestId}: "${query}"`);

  const category = inferCategory(query);
  let generated: { title: string; description: string; body: string; tags: string[] } | null = null;
  let mode = 'stub';

  // Claude API 키가 있으면 실제 글 생성 시도
  if (ANTHROPIC_KEY) {
    try {
      console.log(`[generate-article] calling Claude API (category: ${category})...`);
      generated = await generateWithClaude(query, category);
      mode = 'ai-generated';
      console.log(`[generate-article] Claude generation success — title: "${generated.title}"`);
    } catch (e: any) {
      console.error('[generate-article] Claude API failed, falling back to stub:', e?.message);
    }
  } else {
    console.warn('[generate-article] ANTHROPIC_API_KEY not set — creating stub draft');
  }

  try {
    const post = await insertPost({
      query,
      referrer: referrer ?? null,
      requestId,
      title:       generated?.title       ?? `[초안] ${query}`,
      description: generated?.description ?? '',
      body:        generated?.body        ?? '',
      tags:        generated?.tags        ?? [],
      category,
      isAiGenerated: !!generated,
    });

    await markReviewing(requestId);
    await writeAuditLog(post.id, requestId, post.slug, mode);

    console.log(`[generate-article] done — slug: ${post.slug}, mode: ${mode}`);
    return Response.json({ ok: true, postId: post.id, slug: post.slug, mode });

  } catch (err: any) {
    console.error('[generate-article] error:', err);
    await markError(requestId, err?.message ?? 'unknown error');
    return Response.json({ ok: false, error: err?.message }, { status: 500 });
  }
});
