// www.sreborn.net → https://sreborn.net (301).
// Pages 프로젝트의 SPA(없는 경로에 index.html을 200으로 주는 설정)가 켜져 있어도
// 없는 HTML 경로는 dist/404.html을 404로 돌려준다. 정적 파일과 _redirects는 context.next()에 맡긴다.
export async function onRequest(context) {
	const url = new URL(context.request.url);
	if (url.hostname === 'www.sreborn.net') {
		url.hostname = 'sreborn.net';
		url.protocol = 'https:';
		return Response.redirect(url.toString(), 301);
	}

	const response = await context.next();
	const path = url.pathname.replace(/\/+$/, '') || '/';
	// API의 404 JSON은 그대로 둔다. 그 외 404와, SPA가 홈 HTML을 200으로 준 경우만 커스텀 404로 바꾼다.
	if (!path.startsWith('/api/') && (response.status === 404 || (await isHomepageSpaFallback(context, url, response)))) {
		return notFoundResponse(context, url);
	}
	return response;
}

async function isHomepageSpaFallback(context, url, response) {
	if (response.status !== 200) return false;
	const method = context.request.method;
	if (method !== 'GET' && method !== 'HEAD') return false;
	if (!context.env?.ASSETS) return false;

	const path = url.pathname.replace(/\/+$/, '') || '/';
	if (path === '/' || path === '/index.html' || path === '/404' || path === '/404.html') return false;
	if (path.startsWith('/api/')) return false;

	const type = response.headers.get('content-type') || '';
	if (!type.includes('text/html')) return false;

	const indexResponse = await context.env.ASSETS.fetch(new Request(new URL('/', url.origin), { method: 'GET' }));
	if (!indexResponse.ok) return false;

	const indexLength = indexResponse.headers.get('content-length');
	const responseLength = response.headers.get('content-length');
	if (method === 'HEAD') {
		return Boolean(indexLength && responseLength && indexLength === responseLength);
	}
	if (indexLength && responseLength && indexLength !== responseLength) return false;

	const [pageText, indexText] = await Promise.all([response.clone().text(), indexResponse.text()]);
	return pageText === indexText;
}

async function notFoundResponse(context, url) {
	const assetUrl = new URL('/404.html', url.origin);
	const asset = await context.env.ASSETS.fetch(new Request(assetUrl, { method: 'GET' }));
	const headers = new Headers(asset.headers);
	headers.set('cache-control', 'no-store');
	headers.set('x-robots-tag', 'noindex');
	const body = context.request.method === 'HEAD' ? null : asset.body;
	return new Response(body, { status: 404, statusText: 'Not Found', headers });
}
