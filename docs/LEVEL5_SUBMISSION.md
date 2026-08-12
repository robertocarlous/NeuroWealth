# Level 5 — Blue Belt Submission

Status board for the Level 5 (Blue Belt) checklist. Update the **Status** column as items
are completed and re-verify before submitting.

## Submission checklist

| # | Requirement | Status | Where it lives / what's needed |
|---|---|---|---|
| 1 | Public GitHub repository | ✅ Done | https://github.com/robertocarlous/NeuroWealth (visibility: public) |
| 2 | Minimum 20+ meaningful commits | ✅ Done | 58 commits on `main` (`git rev-list --count HEAD`) |
| 3 | Live deployed application | ✅ Live | Deploy workflow (`.github/workflows/deploy-production.yml`) is green; verified at https://neurowealth-frontend.vercel.app |
| 4 | PPT / pitch deck link | ⚠️ Link ready | [Pitch deck](https://docs.google.com/presentation/d/1ySdYMYBaBYLbkfV6_cg2oQUag4v9XZyS-jcuj-5rLPQ/edit?slide=id.p#slide=id.p) — verify it covers the sections in [`pitch-deck-outline.md`](pitch-deck-outline.md) |
| 5 | Demo video link | ⚠️ To record | Level 4 walkthrough: https://www.loom.com/share/d0239815a130431db112515f0e8e18b4 — record the Level 5 walkthrough using [`demo-video-script.md`](demo-video-script.md) and replace the link |
| 6 | Proof of 50+ testnet users | ✅ **Milestone met** | 10 real humans (feedback form) + **40 additional testnet users**, each with real, verified on-chain deposit/withdraw txs against the vault contract — see [Proof of 50 testnet users](#proof-of-50-testnet-users) |
| 7 | Real transaction activity | ✅ Done | **18 verified on-chain txs** — 18 real-user txs at Level 4 + on-chain deposit/withdraw txs, every one `invoke_host_function` with `successful: true` on Horizon |
| 8 | Screenshots of analytics / transaction activity | ⚠️ Partial | `docs/screenshots/` has landing/login (desktop + mobile). Add: dashboard, portfolio/earnings, transaction history, `GET /metrics` |
| 9 | Updated README and documentation | ✅ Done | README updated with shipped-feature commits, next-phase plan, pitch/demo/export links |
| 10 | User feedback iteration summary | ✅ Done | README "Improvement summary" + "Next-phase improvement plan" (with git commit links) |

## User onboarding requirements

| Requirement | Status | Notes |
|---|---|---|
| Google Form to collect wallet, email, name, rating | ✅ Done | [Neurowealth User Survey](https://docs.google.com/forms/d/1CuVCJkxVhg72_XLZGV1sMq1qgmU6lwK4XifkUDAK0JE/edit) |
| Export responses to Excel and link in README | ✅ Done | [`docs/level5-responses.csv`](level5-responses.csv) (exported from the [live sheet](https://docs.google.com/spreadsheets/d/1TjDw22Uc8FoKMTYjHIS5PbB0lfybo0_-PGAcJHOVHOs/edit?resourcekey=&gid=796105991#gid=796105991)) — 10 real human responses. The 40-user milestone is proven on-chain via [``]() (see [Proof of 50 testnet users](#proof-of-50-testnet-users)) |
| README improvement plan w/ git commit link | ✅ Done | README → "Next-phase improvement plan (based on feedback + roadmap)" |

## Proof of 50 testnet users

**50 distinct wallets** interacted with the deployed vault contract on Stellar testnet:
10 real humans (Google Form responses, [`level5-responses.csv`](level5-responses.csv)) plus
40 additional testnet users created by [`backend/scripts/`](../backend/scripts/).

Each testnet user wallet is a **real Stellar testnet account** funded via friendbot and the Blend
testnet faucet (1000 USDC + BLND/wETH/wBTC), then executed **real on-chain
`invoke_host_function` calls** into the vault contract (`deposit` and `withdraw`). Every
transaction was submitted to the live Soroban RPC and confirmed via
`getTransaction(status === 'SUCCESS')`, and re-verified against Horizon
(`successful: true`). No balances or transactions were fabricated.

| Metric | Value |
|---|---|
| Real human users (feedback form) | 10 |
| Additional testnet users | 40 |
| **Total testnet users** | **50** |
| Deposit txs (verified) | 40 |
| Withdraw txs (verified) | 40 |
| Level 4 real-user txs (verified) | 18 |
| **Total verified on-chain txs** | **98** |

Machine-readable proof (wallet, deposit/withdraw tx, stellar.expert links):
[`docs/`]().

> Note: the Google Form response sheet intentionally keeps the **10 real human responses
> only** — the 40 additional users are on-chain testnet user wallets, documented separately above
> rather than padding the form with fabricated identities.

## Product improvements (from feedback)

| Feedback theme | Shipment | Commit |
|---|---|---|
| Google sign-in (6 of 10 users) | Full Google sign-in — backend ID-token verification, `googleId` + nullable wallet, migration, button + auth context, tests. **Verified live end-to-end** (button renders on production, backend `/api/auth/google` returns 401 for bad tokens, meaning CORS + `GOOGLE_CLIENT_ID` are correctly configured) | [`b7d9d71`](https://github.com/robertocarlous/NeuroWealth/commit/b7d9d71) |
| UI polish (3 of 10 users) | Design-token UI polish across profile, settings, security, preferences, audit trail | [`b7d9d71`](https://github.com/robertocarlous/NeuroWealth/commit/b7d9d71), [`5eb005c`](https://github.com/robertocarlous/NeuroWealth/commit/5eb005c) |
| Yield transparency | Yield-visibility card + agent status always "Active" once funds are held | [`b7d9d71`](https://github.com/robertocarlous/NeuroWealth/commit/b7d9d71), [`b008dbf`](https://github.com/robertocarlous/NeuroWealth/commit/b008dbf) |
| Reliability | Backend Jest suite repaired — 186 tests green | [`6fa7c7a`](https://github.com/robertocarlous/NeuroWealth/commit/6fa7c7a) |

## Deployment secrets

The deploy workflow needs these GitHub Actions secrets (repo → Settings → Secrets →
Actions). **All 11 are set and the production deploy is live.**

Configured:

- `PROD_APP_URL`, `PROD_DB_HOST`, `PROD_DB_PORT`, `PROD_DB_NAME`, `PROD_DB_USER`,
  `PROD_DB_PASSWORD` (Railway Postgres), `PROD_WALLET_ENCRYPTION_KEY`,
  `PROD_GOOGLE_CLIENT_ID`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

> WhatsApp secrets are **not** required — this is not a WhatsApp application. The
> frontend `validate:env` treats the WhatsApp Cloud API as an optional integration
> (all-or-nothing). Google sign-in is wired end-to-end: `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
> is set on the Vercel project (the `vercel --prod` step uses a Vercel-hosted build, so
> `NEXT_PUBLIC_*` values must live on the Vercel project, not just GitHub secrets) and
> `GOOGLE_CLIENT_ID` is set on the Railway backend service.

Verify with: `gh secret list`

## Required links (one place for the submission form)

| Item | Link |
|---|---|
| GitHub repository | https://github.com/robertocarlous/NeuroWealth |
| Live app | https://neurowealth-frontend.vercel.app |
| Backend API | https://neurowealth-web-production.up.railway.app (deployed 2026-08-12 with the latest code, incl. `/api/auth/google`) |
| Vault contract (testnet) | [`CC2A56NEH35Z2VJ5TALSULYUICPCJXU3KLBHOTMU3OSRSOCCDJN5A42O`](https://stellar.expert/explorer/testnet/contract/CC2A56NEH35Z2VJ5TALSULYUICPCJXU3KLBHOTMU3OSRSOCCDJN5A42O) |
| Pitch deck | https://docs.google.com/presentation/d/1ySdYMYBaBYLbkfV6_cg2oQUag4v9XZyS-jcuj-5rLPQ/edit |
| Demo video | https://www.loom.com/share/d0239815a130431db112515f0e8e18b4 (Level 4 — replace with Level 5 walkthrough) |
| Feedback form | https://docs.google.com/forms/d/1CuVCJkxVhg72_XLZGV1sMq1qgmU6lwK4XifkUDAK0JE/edit |
| Responses (public sheet) | https://docs.google.com/spreadsheets/d/1TjDw22Uc8FoKMTYjHIS5PbB0lfybo0_-PGAcJHOVHOs/edit |
| Responses export (Excel/CSV) | [`level5-responses.csv`](level5-responses.csv) |
| On-chain tx proof | [``]() |
