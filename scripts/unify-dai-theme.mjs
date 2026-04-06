/**
 * Unifies Doctor AI Academy static HTML under public/doctor-ai-academy (all .html).
 * Run: node scripts/unify-dai-theme.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../public/doctor-ai-academy");

const GREEN_HERO =
	"linear-gradient(135deg, #0f4235 0%, #155d4b 50%, #1a7a62 100%)";
const GREEN_HERO_COMPACT =
	"linear-gradient(135deg,#0f4235 0%,#155d4b 50%,#1a7a62 100%)";

/** @type { [string, string][] } — order: longer / specific first */
const REPLACEMENTS = [
	[
		"linear-gradient(135deg, #451a03 0%, #7c2d12 55%, #D97706 100%)",
		GREEN_HERO,
	],
	["linear-gradient(135deg,#451a03 0%,#7c2d12 55%,#D97706 100%)", GREEN_HERO_COMPACT],
	[
		"linear-gradient(135deg, #1a3050 0%, #1e4080 55%, #2563EB 100%)",
		GREEN_HERO,
	],
	[
		"linear-gradient(135deg, #2d1b5e 0%, #4c2a8a 55%, #7C3AED 100%)",
		GREEN_HERO,
	],
	[
		"linear-gradient(135deg, #2d1b5e 0%, #4c2a8a 55%, #7c3aed 100%)",
		GREEN_HERO,
	],
	["#fde68a", "#d4f0e6"],
	["#2563eb", "#155d4b"],
	["#2563EB", "#155d4b"],
	["#eff6ff", "#eef4f2"],
	["#1e3a5f", "#1a3d2e"],
	["#d97706", "#155d4b"],
	["#D97706", "#155d4b"],
	["#92400e", "#0f4235"],
	["#92400E", "#0f4235"],
	["#fef3c7", "#e8f2ee"],
	["#fef9c3", "#e8f2ee"],
	["rgba(217,119,6,", "rgba(21,93,75,"],
	["rgba(217, 119, 6,", "rgba(21, 93, 75,"],
	["#f2ede6", "#f3f3f1"],
	["#f0ece7", "#f3f3f1"],
	["#f0ebe2", "#f3f3f1"],
	["#c4bab0", "#d0d0cb"],
	["#b0a89a", "#9a9a96"],
	["rgba(255,253,249,0.85)", "rgba(255,255,255,0.92)"],
	["rgba(251,247,241,0.92)", "rgba(247,247,245,0.96)"],
	["#fbf1ea", "#eef4f2"],
	["#e6d8c8", "#d6e3da"],
	["#f5efe6", "#f3f3f1"],
	["#bf5f2f", "#155d4b"],
	[
		`    :root {
      --bg: #fbf7f1;
      --ink: #1d2328;
      --muted: #5f6870;
      --brand: #155d4b;
      --line: #ddd4c6;
      --card: #fffdf9;
      --accent: #bf5f2f;
    }`,
		`    :root {
      --bg: #f7f7f5;
      --ink: #1a1f1e;
      --muted: #5c6360;
      --brand: #155d4b;
      --line: #e4e4e0;
      --card: #ffffff;
      --accent: #155d4b;
      --soft: #eef4f2;
    }`,
	],
	[
		`  :root {
    --bg: #fbf7f1;
    --ink: #1d2328;
    --muted: #5f6870;
    --brand: #155d4b;
    --line: #ddd4c6;
    --card: #fffdf9;
    --accent: #bf5f2f;
  }`,
		`  :root {
    --bg: #f7f7f5;
    --ink: #1a1f1e;
    --muted: #5c6360;
    --brand: #155d4b;
    --line: #e4e4e0;
    --card: #ffffff;
    --accent: #155d4b;
    --soft: #eef4f2;
  }`,
	],
	[
		`      --bg: #fbf7f1;
      --ink: #1d2328;
      --muted: #5f6870;
      --brand: #155d4b;
      --line: #ddd4c6;
      --card: #fffdf9;
      --accent: #bf5f2f;`,
		`      --bg: #f7f7f5;
      --ink: #1a1f1e;
      --muted: #5c6360;
      --brand: #155d4b;
      --line: #e4e4e0;
      --card: #ffffff;
      --accent: #155d4b;
      --soft: #eef4f2;`,
	],
	[
		`    body {
      margin: 0;
      background:
        radial-gradient(circle at left top, #f3ead8 0, transparent 20%),
        linear-gradient(180deg, #fbf7f1 0%, #f4ede2 100%);
      color: var(--ink);`,
		`    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);`,
	],
	[
		`    body {
      background:
        radial-gradient(circle at left top, #f3ead8 0, transparent 20%),
        linear-gradient(180deg, #fbf7f1 0%, #f4ede2 100%);
      color: var(--ink);`,
		`    body {
      background: var(--bg);
      color: var(--ink);`,
	],
	[
		`    body {
      font-family: "Segoe UI", "Malgun Gothic", sans-serif;
      background:
        radial-gradient(circle at left top, #f3ead8 0, transparent 20%),
        linear-gradient(180deg, #fbf7f1 0%, #f4ede2 100%);
      color: var(--ink);
      min-height: 100vh;
    }`,
		`    body {
      font-family: "Segoe UI", "Malgun Gothic", sans-serif;
      background: var(--bg);
      color: var(--ink);
      min-height: 100vh;
    }`,
	],
	[
		`  body {
    background:
      radial-gradient(circle at left top, #f3ead8 0, transparent 20%),
      linear-gradient(180deg, #fbf7f1 0%, #f4ede2 100%);
    background-attachment: fixed;
    color: var(--ink);`,
		`  body {
    background: var(--bg);
    color: var(--ink);`,
	],
	[
		`    :root {
      --bg: #fbf7f1;
      --ink: #1d2328;
      --muted: #5f6870;
      --brand: #155d4b;
      --line: #ddd4c6;
      --card: #fffdf9;
      --accent: #155d4b;
    }`,
		`    :root {
      --bg: #f7f7f5;
      --ink: #1a1f1e;
      --muted: #5c6360;
      --brand: #155d4b;
      --line: #e4e4e0;
      --card: #ffffff;
      --accent: #155d4b;
      --soft: #eef4f2;
    }`,
	],
	[
		`  :root {
    --bg: #fbf7f1;
    --ink: #1d2328;
    --muted: #5f6870;
    --brand: #155d4b;
    --line: #ddd4c6;
    --card: #fffdf9;
    --accent: #155d4b;
  }`,
		`  :root {
    --bg: #f7f7f5;
    --ink: #1a1f1e;
    --muted: #5c6360;
    --brand: #155d4b;
    --line: #e4e4e0;
    --card: #ffffff;
    --accent: #155d4b;
    --soft: #eef4f2;
  }`,
	],
	[
		`    body {
      background:
        radial-gradient(circle at left top, #f3ead8 0, transparent 20%),
        linear-gradient(180deg, #fbf7f1 0%, #f4ede2 100%);
      color: var(--ink);
      font-family: "Segoe UI", "Malgun Gothic", sans-serif;
      min-height: 100vh;
    }`,
		`    body {
      background: var(--bg);
      color: var(--ink);
      font-family: "Segoe UI", "Malgun Gothic", sans-serif;
      min-height: 100vh;
    }`,
	],
	[
		`    body {
      font-family: "Segoe UI", "Malgun Gothic", sans-serif;
      background:
        radial-gradient(circle at left top, #f3ead8 0, transparent 20%),
        linear-gradient(180deg, #fbf7f1 0%, #f4ede2 100%);
      color: var(--ink);
      min-height: 100vh;
    }`,
		`    body {
      font-family: "Segoe UI", "Malgun Gothic", sans-serif;
      background: var(--bg);
      color: var(--ink);
      min-height: 100vh;
    }`,
	],
];

function walkHtml(dir, out = []) {
	for (const n of fs.readdirSync(dir, { withFileTypes: true })) {
		const fp = path.join(dir, n.name);
		if (n.isDirectory()) walkHtml(fp, out);
		else if (n.isFile() && n.name.endsWith(".html")) out.push(fp);
	}
	return out;
}

let files = 0;
let changed = 0;
for (const fp of walkHtml(root)) {
	let s = fs.readFileSync(fp, "utf8").replace(/\r\n/g, "\n");
	const orig = s;
	for (const [a, b] of REPLACEMENTS) {
		if (a === b) continue;
		s = s.split(a).join(b);
	}
	if (s !== orig) {
		fs.writeFileSync(fp, s, "utf8");
		changed++;
	}
	files++;
}
console.log(`dai-theme: scanned ${files} html, updated ${changed}`);
