# S-Reborn theme contract and CRM library release policy

This repository treats theme consistency as a release requirement.

## Canonical shared runtime
- `public/assets/sreborn-theme-init.js`: read `localStorage['sreborn-theme']` (`system` default), set `html[data-theme]` and `html[data-theme-preference]`, handle system preference changes and cross-tab changes.
- `public/assets/sreborn-theme-tokens.css`: light/dark palette and semantic colors. New pages must inherit this palette rather than adding an independent white/dark theme.
- `src/components/BaseHead.astro` and `src/pages/index.astro`: load both assets before rendering page content.
- `src/components/SiteHeader.astro`: the selector calls `window.SrebornTheme.save()`.
- `src/styles/design.css`, `src/styles/brand-home.css`, and standalone tutorials bind their surface/text variables to `--site-*` tokens.
- For standalone HTML include both assets synchronously in `<head>` before local CSS.

## Visual acceptance criteria
- Light, dark, system all behave the same across homepage, lecture hub, PP guides, CRM library, and legacy CRM first-analysis tutorial.
- Dark background must not contain light/white child panels with pale text. Apply tokens to **all** containers: groups, cards, filters, results, prompts, textareas, tables, details, menus, overlays.
- Text contrast >=4.5:1 and visible focus states. Test at 320, 390, 768, and 1440 pixel widths. Check copy, download, anchor navigation.
- Theme switch persists across navigation, reload and browser tabs. In system mode it should follow OS changes.

## Content contract
- Canonical learner-facing title is `CRM AI 실습 라이브러리`, not a number-dependent title.
- PP01~PP08 categories (at least), with room to add PP09+.
- Baseline 82 scenarios; totals and per-category counts are derived from actual content, not hardcoded.
- No stale `70개`, `PP01~PP05` or `5가지 페인 포인트` on CRM-related user-facing pages.
- Preserve stable scenario IDs, existing anchors A~J/Pxx-yy and old download locations; new synthetic scenarios use PPxx-yy.
- Real patient data must not be uploaded into public tutorials or external AI. Clinical judgment and outbound messaging need human authorization.

## Enforcement
- `npm run qa:site-theme`: canonical file presence, runtime and palette usage, category content, stale strings, background/text AA contrast, standalone tutorial coverage.
- `npm run qa:crm`: 82+ IDs, 8 categories, navigation, synthetic source files, old aliases.
- `npm run build`: runs both via `prebuild` before Astro build. Do not bypass these to force production deploy.
- `.github/workflows/crm-scenario-qa.yml`: CI for changed site/theme/tutorial files.
- Cloudflare Pages: verify deployment `success` and independently verify production URL. Build success alone is not browser QA.

## Failed release response
1. Keep the most recent known-good deployment.
2. Inspect build logs and identify file/line and failing invariant.
3. Fix the underlying token or data contract, not a one-off dark CSS patch.
4. Re-run QA + build, then verify actual browser behavior.
5. Log failure case, tested modes and resolution in second brain/Notion where appropriate.

The matching reusable ChatGPT skill is `sreborn-site-theme`. It provides working instructions, but becomes an available installed skill only after the user installs the skill package. This repo's prebuild/CI checks are independently enforced.
