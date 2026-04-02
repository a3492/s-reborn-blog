/**
 * orchestration/*.md 에 cu 태그·key_takeaways·푸터를 보강한다.
 * cu 식별자는 cu + YYMMDDHHmm (로컬 시각). 환경변수 CU_TS 로 고정 가능.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "../src/content/blog/orchestration");

function getCuId() {
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
	return `cu${ts}`;
}

const cuId = getCuId();

function parseFrontmatter(raw) {
	const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	if (!m) return { fm: null, body: raw, end: 0 };
	return {
		fm: m[1],
		body: raw.slice(m[0].length),
		fullMatch: m[0],
	};
}

function getDescription(fm) {
	const dm = fm.match(/^description:\s*"(.*)"\s*$/m);
	return dm ? dm[1] : "";
}

function hasKeyTakeaways(fm) {
	return /^key_takeaways:/m.test(fm);
}

function injectKeyTakeaways(fm, description) {
	const thumb = fm.match(/^thumbnail:\s*".*"\s*$/m);
	const safe = description.replace(/"/g, "'").slice(0, 180);
	const block = `key_takeaways:
  - "${safe}${description.length > 180 ? "…" : ""}"
  - "이 글은 설계 관점 정리이며, 프로덕션 도입 전 보안·비용·감사 요구를 별도 검토한다."
  - "태그 ${cuId}: Cursor 초안 — 프레임워크·API·병원 정책은 공식 문서를 본다."`;
	if (!thumb) {
		return fm.replace(/^draft:\s*(\S+)\s*$/m, `draft: $1\n${block}`);
	}
	return fm.replace(/^thumbnail:\s*".*"\s*$/m, (t) => `${t}\n${block}`);
}

function ensureCuFirstTag(fm) {
	if (/tags:\s*\[\s*"cu\d{10}"/m.test(fm)) return fm;
	if (/^tags:\s*\n\s*-\s*"cu\d{10}"/m.test(fm)) return fm;
	if (/^tags:\s*\[\s*"cu"\s*,/m.test(fm)) {
		return fm.replace(/^tags:\s*\[\s*"cu"\s*,/m, `tags: ["${cuId}",`);
	}
	if (/^tags:\s*\[\s*"cu"\s*\]/m.test(fm)) {
		return fm.replace(/^tags:\s*\[\s*"cu"\s*\]/m, `tags: ["${cuId}"]`);
	}
	if (/^tags:\s*\n\s*-\s*"cu"\s*$/m.test(fm)) {
		return fm.replace(/^(\s*)-\s*"cu"\s*$/m, `$1- "${cuId}"`);
	}
	if (/^tags:\s*\[/m.test(fm)) {
		return fm.replace(/^tags:\s*\[\s*/m, `tags: ["${cuId}", `);
	}
	if (/^tags:\s*$/m.test(fm)) {
		return fm.replace(/^tags:\s*$/m, `tags:\n  - "${cuId}"`);
	}
	return fm;
}

function addTypeGuide(fm) {
	if (/^type:\s/m.test(fm)) return fm;
	return fm.replace(/^thumbnail:\s*"/m, 'type: "guide"\nthumbnail: "');
}

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".md"))) {
	const fp = path.join(dir, f);
	let raw = fs.readFileSync(fp, "utf8");
	const { fm, body, fullMatch } = parseFrontmatter(raw);
	if (!fm) continue;

	let newFm = fm;
	newFm = ensureCuFirstTag(newFm);
	if (!hasKeyTakeaways(newFm)) {
		const desc = getDescription(newFm);
		newFm = injectKeyTakeaways(newFm, desc || "오케스트레이션 설계 관점 정리.");
	}
	newFm = addTypeGuide(newFm);

	let newBody = body;
	if (!/\*편집 초안\(cu\d{10}\)\./.test(newBody) && !/\*편집 초안\(cu\)\./.test(newBody)) {
		const footer = `\n\n*편집 초안(${cuId}). 프레임워크·API·임상 규정은 발행일 이후 바뀔 수 있으니 공식 문서와 병원 정책을 기준으로 확인한다.*\n`;
		newBody = newBody.replace(/\s*$/, "") + footer;
	}

	const out = `---\n${newFm}\n---${newBody}`;
	if (out !== raw) {
		fs.writeFileSync(fp, out, "utf8");
		console.log("updated", f, cuId);
	}
}
