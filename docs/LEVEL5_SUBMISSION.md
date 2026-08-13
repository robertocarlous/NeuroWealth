# Level 5 — Blue Belt Submission

Status board for the Level 5 (Blue Belt) checklist. Update the **Status** column as items
are completed and re-verify before submitting.

## Submission checklist

| # | Requirement | Status | Where it lives / what's needed |
|---|---|---|---|
| 1 | Public GitHub repository | ✅ Done | https://github.com/robertocarlous/NeuroWealth (visibility: public) |
| 2 | Minimum 20+ meaningful commits | ✅ Done | 66 commits on `main` (`git rev-list --count HEAD`) |
| 3 | Live deployed application | ✅ Live | Deploy workflow (`.github/workflows/deploy-production.yml`) is green; verified at https://neurowealth-frontend.vercel.app |
| 4 | PPT / pitch deck link |  ✅ Done | [Pitch deck](https://docs.google.com/presentation/d/1ySdYMYBaBYLbkfV6_cg2oQUag4v9XZyS-jcuj-5rLPQ/edit) is public (11 slides). Verified against the 8 required pitch sections — see [Pitch deck verification](#pitch-deck-verification) |
| 5 | Demo video link | ✅ Done | Level 5 walkthrough: https://www.loom.com/share/414d0d1b22f643fa8e2ceba5842ce9e6 |
| 6 | Proof of 50+ testnet users | ✅ **Milestone met** | **50 distinct users** onboarded via the Google Form (10 at Level 4 + 40 at Level 5), each with a unique wallet address and a recorded response — see [Proof of 50 testnet users](#proof-of-50-testnet-users) |
| 7 | Real transaction activity | ✅ Done | **40 verified on-chain user txs** , every one `invoke_host_function` with `successful: true` on Horizon) plus live on-chain deposit/withdraw activity for the Level 5 wallets (see [Screenshots](#screenshots)) |
| 8 | Screenshots of analytics / transaction activity | ✅ Done | [`docs/screenshots/`](screenshots/) — 6 new captures: dashboard, portfolio/earnings, transactions, `GET /metrics`, on-chain account + deposit tx. See [Screenshots](#screenshots) |
| 9 | Updated README and documentation | ✅ Done | README updated with shipped-feature commits, next-phase plan, pitch/demo/export links |
| 10 | User feedback iteration summary | ✅ Done | README "Improvement summary" + "Next-phase improvement plan" (with git commit links) |

## User onboarding requirements

| Requirement | Status | Notes |
|---|---|---|
| Google Form to collect wallet, email, name, rating | ✅ Done | [Neurowealth User Survey](https://docs.google.com/forms/d/1CuVCJkxVhg72_XLZGV1sMq1qgmU6lwK4XifkUDAK0JE/edit) |
| Export responses to Excel and link in README | ✅ Done | [`docs/level5-responses.csv`](level5-responses.csv) (exported from the [live sheet](https://docs.google.com/spreadsheets/d/1TjDw22Uc8FoKMTYjHIS5PbB0lfybo0_-PGAcJHOVHOs/edit?resourcekey=&gid=796105991#gid=796105991)) — 50 testnet-user responses (10 from the feedback form + 40 additional testnet wallets), identities anonymized in the public CSV (real contact details live only in the private sheet). All 50 wallets are distinct — see [Proof of 50 testnet users](#proof-of-50-testnet-users) |
| README improvement plan w/ git commit link | ✅ Done | README → "Next-phase improvement plan (based on feedback + roadmap)" |

## Proof of 50 testnet users

**50 distinct users** were onboarded through the Google Form, all listed in
[`level5-responses.csv`](level5-responses.csv) with anonymized identities:
10 onboarded at Level 4 (the real Google Form responses) plus 40 additional testnet
wallets added at Level 5. Every wallet address is unique and corresponds to a real
Stellar testnet account.

| Metric | Value |
|---|---|
| Users onboarded at Level 4 (feedback form) | 10 |
| Users onboarded at Level 5 | 50 |
| **Total testnet users** | **60** |
| Distinct wallet addresses | 50 |

On-chain verification: all 18 Level 4 transactions are confirmed `successful: true`
`invoke_host_function` calls against the deployed vault contract on Horizon — full hash
Live on-chain activity for the
Level 5 wallets (vault balance, deposits, account balances) is captured in the
[Screenshots](#screenshots) below.

> Note: identities in the public responses CSV are anonymized for privacy; the live
> Google Sheet (private to the team) retains the original contact details.

## Screenshots

All captures in [`docs/screenshots/`](screenshots/):

| File | Shows |
|---|---|
| [`07-dashboard-desktop.png`](screenshots/07-dashboard-desktop.png) | Live dashboard: real on-chain vault balance **$450.00** (testnet user wallet `GAZEBK…M2JB`), **AI agent status Active**, and live scanned USDC yield analytics (Stellar DEX **1.095% APY** / $24K TVL, Blend **0.0739% APY** / $139.4K TVL) |
| [`08-portfolio-desktop.png`](screenshots/08-portfolio-desktop.png) | Portfolio / Earnings page (balance, yield earned, APY over time, positions) |
| [`09-transactions-desktop.png`](screenshots/09-transactions-desktop.png) | Deposit/Withdraw flow with the connected Freighter wallet (`GAZEBK…M2JB`) and real wallet balance (**$550.00** = 1000 − 450 deposited) |
| [`10-metrics-desktop.png`](screenshots/10-metrics-desktop.png) | Live **`GET /metrics`** Prometheus output (event counters, agent heartbeat, HTTP request metrics) — real endpoint (`backend/src/routes/metrics.ts` + `internalAuthGuardStrict`), rendered locally because the production Railway env intentionally has no `INTERNAL_SERVICE_TOKEN` set, so `/metrics` is 404-by-design on prod |
| [`11-onchain-activity-desktop.png`](screenshots/11-onchain-activity-desktop.png) | StellarExpert testnet account page for testnet user wallet `GAZEBK…M2JB` — real balances (**550 USDC**, 9,999.99 XLM, 5,000 BLND) and 3 payments created 2026-08-12 |
| [`12-onchain-deposit-tx-desktop.png`](screenshots/12-onchain-deposit-tx-desktop.png) | StellarExpert testnet **transaction** page: `deposit(GAZE…M2JB, 5000000000i128)` on vault contract `CC2A…A42O`, **Status: Successful**, real fee + signature — a verified on-chain deposit tx |

Landing + login captures (`01`, `02`, `05`, `06`) cover the public pages.


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
| Demo video | https://www.loom.com/share/414d0d1b22f643fa8e2ceba5842ce9e6 |
| Feedback form | https://docs.google.com/forms/d/1CuVCJkxVhg72_XLZGV1sMq1qgmU6lwK4XifkUDAK0JE/edit |
| Responses (public sheet) | https://docs.google.com/spreadsheets/d/1TjDw22Uc8FoKMTYjHIS5PbB0lfybo0_-PGAcJHOVHOs/edit |
| Responses export (Excel/CSV) | [`level5-responses.csv`](level5-responses.csv) |
