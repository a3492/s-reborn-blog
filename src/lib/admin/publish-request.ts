/** 브라우저 sessionStorage 키. Cloudflare 비밀 `PUBLISH_API_TOKEN`과 같은 값을 관리자가 직접 넣는다. */
export const PUBLISH_API_TOKEN_STORAGE_KEY = 'PUBLISH_API_TOKEN';

export function publishApiHeaders(): Record<string, string> {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};
	if (typeof sessionStorage === 'undefined') return headers;
	const token = sessionStorage.getItem(PUBLISH_API_TOKEN_STORAGE_KEY)?.trim() ?? '';
	if (token) headers.Authorization = `Bearer ${token}`;
	return headers;
}
