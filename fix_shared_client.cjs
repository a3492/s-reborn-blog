/**
 * Replace per-page createClient with window.__adminSupabase (shared from AdminLayout).
 * This eliminates ALL Web Lock contention from multiple Supabase clients.
 *
 * Per file:
 *  1. Replace `const supabase = createClient(...)` with `let supabase = null;`
 *     (inserted just before the if/else or the session-ready listener)
 *  2. In each `admin:session-ready` handler: add `supabase = window.__adminSupabase;`
 *     as the very first statement inside the handler body.
 */
const fs = require('fs');
const base = 'C:/dev/s-reborn-world/blog/src/pages/admin';

const files = [
  'index.astro',
  'posts/index.astro',
  'posts/new.astro',
  'posts/edit.astro',
  'jobs/index.astro',
  'jobs/detail.astro',
  'settings/index.astro',
  'settings/detail.astro',
  'media/index.astro',
  'media/detail.astro',
  'pipeline/index.astro',
];

// The createClient block comes in two indentation variants
const CREATE_CLIENT_PATTERNS = [
  `      const supabase = createClient(supabaseUrl, supabaseKey, {\n        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },\n      });`,
  `    const supabase = createClient(supabaseUrl, supabaseKey, {\n      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },\n    });`,
];

// Replacement: declare let supabase at module level (same indent as the removed const)
const LET_SUPABASE_6  = `      let supabase = null;`;
const LET_SUPABASE_4  = `    let supabase = null;`;

// Event handler opening patterns → add supabase assignment as first line
const HANDLER_PATTERNS = [
  // with detail destructuring
  [`document.addEventListener('admin:session-ready', async ({ detail }) => {\n`,
   `document.addEventListener('admin:session-ready', async ({ detail }) => {\n        supabase = window.__adminSupabase;\n`],
  // without detail (some files)
  [`document.addEventListener('admin:session-ready', async () => {\n`,
   `document.addEventListener('admin:session-ready', async () => {\n        supabase = window.__adminSupabase;\n`],
  // 4-space indent variants
  [`document.addEventListener('admin:session-ready', ({ detail }) => {\n`,
   `document.addEventListener('admin:session-ready', ({ detail }) => {\n        supabase = window.__adminSupabase;\n`],
];

function patch(file) {
  const path = `${base}/${file}`;
  let raw = fs.readFileSync(path, 'utf8');
  const hasCRLF = raw.includes('\r\n');
  let c = raw.replace(/\r\n/g, '\n');
  const orig = c;

  // Step 1: Replace createClient block with `let supabase = null;`
  let replaced = false;
  for (const pattern of CREATE_CLIENT_PATTERNS) {
    if (c.includes(pattern)) {
      const replacement = pattern.startsWith('      ') ? LET_SUPABASE_6 : LET_SUPABASE_4;
      c = c.replace(pattern, replacement);
      replaced = true;
      break;
    }
  }
  if (!replaced) {
    console.warn(`  ⚠ createClient pattern not found in ${file}`);
  }

  // Step 2: Add `supabase = window.__adminSupabase;` inside event handler
  // Make sure we don't double-add it
  if (!c.includes('supabase = window.__adminSupabase')) {
    let handlerReplaced = false;
    for (const [from, to] of HANDLER_PATTERNS) {
      if (c.includes(from)) {
        c = c.replace(from, to);
        handlerReplaced = true;
        break;
      }
    }
    if (!handlerReplaced) {
      console.warn(`  ⚠ admin:session-ready handler not found in ${file}`);
    }
  } else {
    console.log(`  ℹ supabase assignment already present in ${file}`);
  }

  if (c !== orig) {
    fs.writeFileSync(path, hasCRLF ? c.replace(/\n/g, '\r\n') : c, 'utf8');
    console.log(`PATCHED  ${file}`);
  } else {
    console.log(`SKIP     ${file}`);
  }
}

files.forEach(patch);

// Final validation
console.log('\n── Validation ──');
files.forEach(f => {
  const c = fs.readFileSync(`${base}/${f}`, 'utf8');
  const clients   = (c.match(/createClient\(/g) || []).length;
  const sharedRef = (c.match(/window\.__adminSupabase/g) || []).length;
  const letDecl   = (c.match(/let supabase/g) || []).length;
  const issues = [];
  if (clients > 0)    issues.push(`createClient:${clients}`);
  if (sharedRef === 0) issues.push('no __adminSupabase ref');
  console.log((issues.length ? '❌' : '✅'), f.padEnd(35), `shared:${sharedRef} let:${letDecl}`, issues.join(' '));
});
