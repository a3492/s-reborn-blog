/**
 * Cloudflare Pages 등 배포 후에도 클리닉 정적 HTML이 빌드에 포함되는지 확인합니다.
 * `npm run build` 끝에 자동 실행(postbuild).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, '..', 'dist');

const checks = [
	{
		rel: path.join('clinic', 'corner', 'why-how', 'ultrasound-smas', 'index.html'),
		mustInclude: '초음파 리프팅과 SMAS',
	},
	{
		rel: path.join('clinic', 'hub', 'index.html'),
		mustInclude: '클리닉 허브',
	},
];

let failed = false;
for (const { rel, mustInclude } of checks) {
	const file = path.join(dist, rel);
	if (!fs.existsSync(file)) {
		console.error(`[verify-clinic-routes] 없음: ${rel}`);
		failed = true;
		continue;
	}
	const html = fs.readFileSync(file, 'utf8');
	if (!html.includes(mustInclude)) {
		console.error(`[verify-clinic-routes] 내용 불일치: ${rel} ("${mustInclude}" 없음)`);
		failed = true;
	}
}

if (failed) {
	console.error('[verify-clinic-routes] 실패 — dist를 Pages에 그대로 올렸는지, 빌드 캐시·출력 디렉터리를 확인하세요.');
	process.exit(1);
}
console.log('[verify-clinic-routes] 클리닉 정적 경로 OK');
