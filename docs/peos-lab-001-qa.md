# PEOS Lab 001 — QA & Promotion Gate
Status: DRAFT / not approved / not deployed

## Purpose
Validate the experimental web-native lecture without altering existing production content. Keep the Lab source and approved public content independently versioned.

## Test route
- Home hero -> Lab `/lab/` -> pilot `/lab/peos/`
- Home menu -> Lab `/lab/`
- Lab Academy and Clinic links must remain functional.
- Existing blog and lectures routes must remain unchanged.

## Build and test
1. Update the feature branch with the current default branch only after reviewing the six newer commits and resolving conflicts; never force-update or overwrite production work.
2. Execute `npm ci` then `npm run build` in CI or an authorized checkout. Record command output and commit SHA.
3. Open the preview deployment. Test 1440px desktop, 768px tablet, 390px mobile, keyboard-only interaction, and each of the three modes.
4. Verify fullscreen and Escape, presenter notes, text overflow, scroll, internal links, meta noindex, mobile menu and home navigation.
5. Compare the CRM example with a documented synthetic fixture. Do not insert patient or real CRM data.
6. Check with the site owner and record explicit approval. Only then promote an approved content snapshot to the proper `/blog/` or `/lectures/` path.

## Critical correctness test
For one visit containing two treatments and two payments, a naive join by visit ID produces four joined records. Demonstrate why aggregation before joining or appropriate relational keys are required. The scenario is illustrative and is **not** evidence of actual CRM corruption.

## Promotion contract (proposed)
- Input: immutable source version, reviewed claims/sources, selected target and owner approval.
- Output: new canonical public route with source metadata and prior Lab version retained.
- Block promotion if any required gate is NOT_TESTED/FAIL or approval is absent.
- Publish is a separate explicit step. A link or a button alone must not silently publish.
- Rollback should revert the release commit and restore the prior public page; preserve audit history.

## Release ledger (fill only after verified execution)
| Check | Status | Evidence |
| --- | --- | --- |
| Astro build | NOT_TESTED | No confirmed CI/build output |
| Desktop | NOT_TESTED | No browser screenshot verified |
| Mobile | NOT_TESTED | No browser screenshot verified |
| Accessibility | NOT_TESTED | No keyboard screen reader pass |
| Navigation regression | NOT_TESTED | Pending preview deployment |
| Privacy/copyright | CONDITIONAL | Illustrative data; final reviewer needed |
| User approval | NOT_APPROVED | No approval requested or recorded |
| Public deployment | NOT_DEPLOYED | Feature branch and draft PR only |

## Future phases
- Extract a structured content master to avoid divergence between read/present/review copy.
- Add presenter time/scene navigation, video transcript and sequential episodes.
- Generate channel-specific drafts under explicit review; do not equate drafts with cross-platform API publishing.
