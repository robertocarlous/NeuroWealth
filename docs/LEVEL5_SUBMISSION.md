# Level 5 — Blue Belt Submission

Status board for the Level 5 (Blue Belt) checklist. Update the **Status** column as items
are completed and re-verify before submitting.

## Submission checklist

| # | Requirement | Status | Where it lives / what's needed |
|---|---|---|---|
| 1 | Public GitHub repository | ✅ Done | https://github.com/robertocarlous/NeuroWealth (visibility: public) |
| 2 | Minimum 20+ meaningful commits | ✅ Done | 51 commits on `main` (`git rev-list --count HEAD`) |
| 3 | Live deployed application | ⚠️ Blocked | Deploy workflow exists (`.github/workflows/deploy-production.yml`) but fails on missing secrets — see "Deployment secrets" below |
| 4 | PPT / pitch deck link | ⚠️ Link ready | [Pitch deck](https://docs.google.com/presentation/d/1ySdYMYBaBYLbkfV6_cg2oQUag4v9XZyS-jcuj-5rLPQ/edit?slide=id.p#slide=id.p) — verify it covers the sections in [`pitch-deck-outline.md`](pitch-deck-outline.md) |
| 5 | Demo video link | ⚠️ To record | Level 4 walkthrough: https://www.loom.com/share/d0239815a130431db112515f0e8e18b4 — record the Level 5 walkthrough using [`demo-video-script.md`](demo-video-script.md) and replace the link |
| 6 | Proof of 50+ testnet users | ❌ **Milestone** | 10 onboarded (see `README.md` "Users onboarded"). Need 40 more with real wallet interactions + Google Form responses |
| 7 | Real transaction activity | ⚠️ In progress | 18 verified txs at Level 4 (`LEVEL4_SUBMISSION.md`). Will grow with the 50-user milestone |
| 8 | Screenshots of analytics / transaction activity | ⚠️ Partial | `docs/screenshots/` has landing/login (desktop + mobile). Add: dashboard, portfolio/earnings, transaction history, `GET /metrics` |
| 9 | Updated README and documentation | ✅ Done | README updated with shipped-feature commits, next-phase plan, pitch/demo/export links |
| 10 | User feedback iteration summary | ✅ Done | README "Improvement summary" + "Next-phase improvement plan" (with git commit links) |

## User onboarding requirements

| Requirement | Status | Notes |
|---|---|---|
| Google Form to collect wallet, email, name, rating | ✅ Done | [Neurowealth User Survey](https://docs.google.com/forms/d/1CuVCJkxVhg72_XLZGV1sMq1qgmU6lwK4XifkUDAK0JE/edit) |
| Export responses to Excel and link in README | ✅ Done | [`docs/level5-responses.csv`](level5-responses.csv) (exported from the [live sheet](https://docs.google.com/spreadsheets/d/1TjDw22Uc8FoKMTYjHIS5PbB0lfybo0_-PGAcJHOVHOs/edit?resourcekey=&gid=796105991#gid=796105991)). **Re-export after the 50-user milestone** |
| README improvement plan w/ git commit link | ✅ Done | README → "Next-phase improvement plan (based on feedback + roadmap)" |

## Product improvements (from feedback)

| Feedback theme | Shipment | Commit |
|---|---|---|
| Google sign-in (6 of 10 users) | Full Google sign-in — backend ID-token verification, `googleId` + nullable wallet, migration, button + auth context, tests | [`b7d9d71`](https://github.com/robertocarlous/NeuroWealth/commit/b7d9d71) |
| UI polish (3 of 10 users) | Design-token UI polish across profile, settings, security, preferences, audit trail | [`b7d9d71`](https://github.com/robertocarlous/NeuroWealth/commit/b7d9d71), [`5eb005c`](https://github.com/robertocarlous/NeuroWealth/commit/5eb005c) |
| Yield transparency | Yield-visibility card + agent status always "Active" once funds are held | [`b7d9d71`](https://github.com/robertocarlous/NeuroWealth/commit/b7d9d71), [`b008dbf`](https://github.com/robertocarlous/NeuroWealth/commit/b008dbf) |
| Reliability | Backend Jest suite repaired — 186 tests green | [`6fa7c7a`](https://github.com/robertocarlous/NeuroWealth/commit/6fa7c7a) |

## Deployment secrets (blocker for #3)

The deploy workflow needs these GitHub Actions secrets (repo → Settings → Secrets →
Actions). Without them, `yarn validate:env` fails and nothing reaches Vercel:

- `PROD_APP_URL`, `PROD_WHATSAPP_APP_SECRET`, `PROD_WHATSAPP_VERIFY_TOKEN`,
  `PROD_WHATSAPP_ACCESS_TOKEN`, `PROD_WHATSAPP_PHONE_NUMBER_ID`, `PROD_WHATSAPP_WABA_ID`
- `PROD_DB_HOST`, `PROD_DB_PORT`, `PROD_DB_NAME`, `PROD_DB_USER`, `PROD_DB_PASSWORD`
- `PROD_WALLET_ENCRYPTION_KEY`
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

Verify with: `gh secret list`

## Required links (one place for the submission form)

| Item | Link |
|---|---|
| GitHub repository | https://github.com/robertocarlous/NeuroWealth |
| Live app | https://neurowealth-frontend.vercel.app (⚠️ re-verify once secrets are set) |
| Backend API | https://neurowealth-production.up.railway.app |
| Vault contract (testnet) | [`CC2A56NEH35Z2VJ5TALSULYUICPCJXU3KLBHOTMU3OSRSOCCDJN5A42O`](https://stellar.expert/explorer/testnet/contract/CC2A56NEH35Z2VJ5TALSULYUICPCJXU3KLBHOTMU3OSRSOCCDJN5A42O) |
| Pitch deck | https://docs.google.com/presentation/d/1ySdYMYBaBYLbkfV6_cg2oQUag4v9XZyS-jcuj-5rLPQ/edit |
| Demo video | https://www.loom.com/share/d0239815a130431db112515f0e8e18b4 (Level 4 — replace with Level 5 walkthrough) |
| Feedback form | https://docs.google.com/forms/d/1CuVCJkxVhg72_XLZGV1sMq1qgmU6lwK4XifkUDAK0JE/edit |
| Responses (public sheet) | https://docs.google.com/spreadsheets/d/1TjDw22Uc8FoKMTYjHIS5PbB0lfybo0_-PGAcJHOVHOs/edit |
| Responses export (Excel/CSV) | [`level5-responses.csv`](level5-responses.csv) |
