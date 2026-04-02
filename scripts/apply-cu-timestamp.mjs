/**
 * 편집 추적용: tags / key_takeaways / 푸터의 bare "cu"를 cu+YYMMDDHHmm 으로 치환.
 * 사용: node scripts/apply-cu-timestamp.mjs
 * 타임스탬프: 실행 시 로컬 시각(기본). 고정: PowerShell
 *   $env:CU_TS='2604011702'; node scripts/apply-cu-timestamp.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../src/content/blog");

let ts = process.env.CU_TS?.trim();
if (!ts) {
	try {
		ts = execSync('powershell -NoProfile -Command "Get-Date -Format \'yyMMddHHmm\'"', {
			encoding: "utf8",
		}).trim();
	} catch {
		ts = "0000000000";
	}
}

const cuId = `cu${ts}`;

function patchContent(raw) {
	let s = raw;
	// tags: ["cu", ...]
	s = s.replace(/tags:\s*\[\s*"cu"\s*,/g, `tags: ["${cuId}",`);
	// YAML list: - "cu" (tag list)
	s = s.replace(/^(\s*)-\s*"cu"\s*$/gm, `$1- "${cuId}"`);
	// key_takeaways line
	s = s.replace(/태그 cu:/g, `태그 ${cuId}:`);
	// footer / body
	s = s.replace(/\*편집 초안\(cu\)\./g, `*편집 초안(${cuId}).`);
	s = s.replace(/편집 초안\(cu\)/g, `편집 초안(${cuId})`);
	return s;
}

let count = 0;
function walk(dir) {
	for (const name of fs.readdirSync(dir)) {
		const p = path.join(dir, name);
		const st = fs.statSync(p);
		if (st.isDirectory()) walk(p);
		else if (name.endsWith(".md")) {
			const raw = fs.readFileSync(p, "utf8");
			if (!raw.includes('"cu"') && !raw.includes("태그 cu:") && !raw.includes("편집 초안(cu)"))
				continue;
			const next = patchContent(raw);
			if (next !== raw) {
				fs.writeFileSync(p, next, "utf8");
				count++;
				console.log(cuId, path.relative(path.join(__dirname, ".."), p));
			}
		}
	}
}

walk(root);
console.log("patched files:", count, "id:", cuId);
