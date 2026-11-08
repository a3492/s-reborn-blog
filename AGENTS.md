# Site-wide instructions for S-Reborn coding agents

Before editing any public page, tutorial, lecture hub or CSS:

1. Read `docs/sreborn-theme-contract.md`.
2. Do not create a separate theme system. Use `public/assets/sreborn-theme-init.js` and `public/assets/sreborn-theme-tokens.css`. For Astro use shared Layout/BaseHead; for standalone HTML include both assets in the head.
3. Default to system theme. The user preference key is `sreborn-theme`; all surfaces must have coherent light/dark foreground and background.
4. Use `CRM AI 실습 라이브러리` as the durable title. Do not hardcode totals such as `70개`; obtain counts from content. The current taxonomy includes PP01-PP08 and has 82 baseline scenarios.
5. Preserve old deep links and download URLs; patient training data must be synthetic.
6. Run `npm run qa:site-theme && npm run qa:crm && npm run build`. Stop when any step fails.
7. For a deployment, inspect Cloudflare build status AND manually check live routes and the user-facing view. Do not report completion based only on a commit.
8. Record new regressions and successful fixes in the documentation. Avoid unrelated changes.
