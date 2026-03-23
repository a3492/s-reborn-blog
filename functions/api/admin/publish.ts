const encoder = new TextEncoder();

function toBase64(input: string) {
  const bytes = encoder.encode(input);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function isoNow() {
  return new Date().toISOString();
}

function buildFrontmatter(post: any) {
  const tags = Array.isArray(post.tags) ? `[${post.tags.map((tag: string) => `"${tag}"`).join(', ')}]` : '[]';
  const parts = [
    '---',
    `title: "${String(post.title ?? '').replaceAll('"', '\\"')}"`,
    `description: "${String(post.description ?? '').replaceAll('"', '\\"')}"`,
    `date: ${post.published_at ?? isoNow()}`,
    `category: "${String(post.category ?? '').replaceAll('"', '\\"')}"`,
    post.subcategory ? `subcategory: "${String(post.subcategory).replaceAll('"', '\\"')}"` : '',
    `tags: ${tags}`,
    `draft: ${post.status !== 'published'}`,
    post.thumbnail_url ? `thumbnail: "${String(post.thumbnail_url).replaceAll('"', '\\"')}"` : '',
    '---',
    '',
  ].filter(Boolean);
  return parts.join('\n');
}

function buildTargetPath(post: any) {
  const segments = ['src', 'content', 'blog'];
  segments.push(post.category || 'uncategorized');
  if (post.subcategory) segments.push(post.subcategory);
  segments.push(`${post.slug}.md`);
  return segments.join('/');
}

async function supabaseFetch(env: any, path: string, init?: RequestInit) {
  return fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
}

async function createPublishJob(env: any, payload: any) {
  const res = await supabaseFetch(env, 'publish_jobs', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return Array.isArray(data) ? data[0] : data;
}

async function patchPublishJob(env: any, id: string, payload: any) {
  await supabaseFetch(env, `publish_jobs?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export const onRequestPost = async (context: any) => {
  const { request, env } = context;

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return Response.json({ error: 'Missing required env bindings for publish pipeline.' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const slug = body?.slug;
  const dryRun = Boolean(body?.dryRun);
  const requestedBy = body?.requestedBy ?? null;

  if (!slug) {
    return Response.json({ error: 'slug is required.' }, { status: 400 });
  }

  const postRes = await supabaseFetch(env, `posts?slug=eq.${encodeURIComponent(slug)}&select=*`);
  const posts = await postRes.json();
  const post = Array.isArray(posts) ? posts[0] : null;

  if (!post) {
    return Response.json({ error: 'Post not found.' }, { status: 404 });
  }

  const frontmatter = buildFrontmatter(post);
  const markdown = `${frontmatter}${post.body_markdown ?? ''}`;
  const targetPath = buildTargetPath(post);
  const branch = env.GITHUB_BRANCH || 'main';
  const commitMessage = `publish: ${post.slug}`;

  if (dryRun) {
    return Response.json({
      dryRun: true,
      targetPath,
      branch,
      commitMessage,
      markdownPreview: markdown.slice(0, 1200),
    });
  }

  const job = await createPublishJob(env, {
    post_id: post.id,
    job_type: 'publish',
    status: 'processing',
    target_repo: env.GITHUB_REPO,
    target_branch: branch,
    target_path: targetPath,
    requested_by: requestedBy,
  });

  try {
    const headers = {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 's-reborn-blog-admin',
    };

    const contentUrl = `https://api.github.com/repos/${env.GITHUB_REPO}/contents/${targetPath}`;
    let sha: string | undefined;

    const existing = await fetch(`${contentUrl}?ref=${encodeURIComponent(branch)}`, { headers });
    if (existing.ok) {
      const existingJson = await existing.json();
      sha = existingJson.sha;
    }

    const githubRes = await fetch(contentUrl, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: toBase64(markdown),
        branch,
        sha,
      }),
    });

    const githubJson = await githubRes.json();
    if (!githubRes.ok) {
      throw new Error(githubJson?.message || 'GitHub publish failed.');
    }

    await patchPublishJob(env, job.id, {
      status: 'success',
      commit_sha: githubJson?.commit?.sha ?? null,
      completed_at: isoNow(),
    });

    return Response.json({
      ok: true,
      jobId: job.id,
      targetPath,
      commitSha: githubJson?.commit?.sha ?? null,
    });
  } catch (error: any) {
    await patchPublishJob(env, job.id, {
      status: 'failed',
      error_message: error?.message || 'Unknown publish error',
      completed_at: isoNow(),
    });

    return Response.json({ error: error?.message || 'Unknown publish error' }, { status: 500 });
  }
};
