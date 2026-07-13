# NeuroWealth 💰

**AI-Powered DeFi Yield Platform on Stellar**

NeuroWealth is an autonomous AI investment agent that automatically manages and grows your
crypto assets on the Stellar blockchain. Deposit once, let the AI find the best yield
opportunities across Stellar's DeFi ecosystem — and withdraw anytime with no lock-ups.

Traditional savings accounts offer near-zero interest. Traditional DeFi is too complex for
most users. NeuroWealth bridges the gap with a simple web (and eventually WhatsApp) interface,
backed by an AI agent that autonomously deploys funds into the highest-yielding, safest
opportunities on Stellar, and a non-custodial Soroban vault that always keeps users in control
of their own funds.

## Why Stellar?

- Transaction fees of fractions of a penny — perfect for frequent AI-driven rebalancing
- 3–5 second finality — the AI can act on market changes instantly
- Native DEX + Soroban smart contracts — composable, programmable yield strategies
- Native USDC + XLM — borderless capital movement with no friction
- Growing DeFi ecosystem — Blend (lending), Templar (borrowing), RWA protocols

## Features

| Feature | Description |
|---|---|
| 🤖 AI Agent | Autonomous 24/7 yield optimization across Stellar DeFi |
| 💬 Natural Language | Chat to deposit, withdraw, and check balances |
| 📈 Auto-Rebalancing | Agent shifts funds to best opportunities automatically |
| 🔐 Non-Custodial | Your funds live in audited Soroban smart contracts |
| ⚡ Instant Withdrawals | No lock-ups, no penalties, withdraw anytime |
| 📱 WhatsApp Ready | Full functionality through WhatsApp chat interface |
| 🌍 Global Access | No geographic restrictions, no bank account required |
| 🛡️ Security First | Soroban contracts protected by strict CEI ordering and access controls |

## How it works

1. User deposits USDC via the web app
2. The Soroban vault contract receives and records the deposit
3. The contract emits a deposit event
4. The AI agent detects the event and deploys funds to the best protocol (e.g. Blend)
5. Yield accumulates 24/7 — the agent rebalances hourly if a better opportunity exists
6. User requests a withdrawal anytime — the agent pulls funds and sends them back in seconds

**Three investment strategies**: Conservative (stablecoin lending on Blend, ~3–6% APY),
Balanced (lending + DEX liquidity, ~6–10% APY), Growth (aggressive multi-protocol, ~10–15% APY).

## Repo layout

This is a monorepo containing the three NeuroWealth projects, each independently runnable
with its own dependencies and tooling:

```
NeuroWealth/
├── frontend/       # Next.js web app (Yarn, TypeScript)
├── backend/        # Express REST API (npm, TypeScript, Prisma)
├── smartcontract/  # Soroban vault contracts (Rust) + generated TS client
└── .github/        # Repo-wide CI workflows (currently scoped to frontend/)
```

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Stellar Wallets Kit / Freighter |
| Backend | Node.js, Express, TypeScript, Prisma, PostgreSQL |
| Smart contracts | Rust, Soroban SDK, ERC-4626-inspired vault architecture |
| AI agent | Node.js/Python, `@stellar/stellar-sdk`, Claude/OpenAI for intent parsing, Postgres/Supabase, Redis/Bull |
| Integrations | Blend Protocol (lending), Stellar DEX (liquidity), Stellar anchor price feeds, WhatsApp (Twilio) |

## Quick start

Each subproject is self-contained — `cd` into it and follow its own package manager.

### Frontend (`frontend/`)

Requirements: Node.js 20+, Yarn (Corepack supported). Uses Yarn 1 Classic — do **not** run
`npm install`/`pnpm install` here (breaks the Corepack pin and lockfile format).

```bash
cd frontend
corepack enable && corepack prepare   # once per machine
yarn install
yarn dev            # http://localhost:3000
yarn test           # unit tests (Node test runner)
yarn typecheck
yarn lint
yarn analyze         # production build w/ bundle analyzer (.next/analyze/)
```

Runs demo-ready out of the box (mock auth, mock `/api/*` data) — no backend required for local
dev. Point it at a real backend via `NEUROWEALTH_API_BASE_URL`; see
[`frontend/docs/env.md`](frontend/docs/env.md) and
[`frontend/NEUROWEALTH_API.md`](frontend/NEUROWEALTH_API.md) for the full env/API contract.

### Backend (`backend/`)

```bash
cd backend
cp .env.example .env
npm install
npm run dev
npm test
npm run smoke        # health-check smoke test against a running server
```

Full OpenAPI 3.1 spec: [`backend/docs/openapi.yaml`](backend/docs/openapi.yaml)
(`npx @redocly/cli preview-docs backend/docs/openapi.yaml` to view locally). Covers `health`,
`auth`, `portfolio`, `transactions`, `deposit`, `withdraw`, `vault`, and `admin` (bearer JWT,
except `health` and `admin`, which uses `X-Admin-Token`).

### Smart contracts (`smartcontract/`)

```bash
# Prerequisites: Rust + wasm32 target, Stellar CLI (version pinned in smartcontract/.stellar-version)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
cargo install --locked stellar-cli --version "$(cat smartcontract/.stellar-version)" --features opt

cd smartcontract
cp .env.devnet.template .env.devnet   # set SOROBAN_SECRET_KEY

cd neurowealth-vault
stellar contract build
cargo test

cd ..
./scripts/deploy-devnet.sh             # deploy to devnet
```

See [`smartcontract/scripts/README-E2E.md`](smartcontract/scripts/README-E2E.md) for end-to-end
devnet validation, and [`smartcontract/docs/MAINNET_CHECKLIST.md`](smartcontract/docs/MAINNET_CHECKLIST.md)
before any mainnet deployment.

## Architecture notes

- **Frontend auth**: client-side mock auth (`frontend/src/lib/mock-auth.ts`) persists a session
  in `localStorage` and mirrors it to a cookie so `frontend/middleware.ts` can edge-redirect
  unauthenticated users away from `/dashboard`, `/profile`, and `/settings`.
- **Frontend ↔ backend contract**: browser calls hit Next.js `/api/*` route handlers
  (authenticated via httpOnly session cookie), which either return mock data (demo mode) or
  proxy to the real backend with a Bearer token (`NEUROWEALTH_API_AUTH_TOKEN`). All responses
  use a unified `{ success, data | error }` envelope — see
  [`frontend/NEUROWEALTH_API.md`](frontend/NEUROWEALTH_API.md).
- **Vault contract key functions**: `deposit`, `withdraw`, `withdraw_all` (user-authorized only),
  `rebalance` (AI agent only), plus owner-only cap/limit setters and two-step ownership transfer.
  Users can only withdraw their own funds (`require_auth`); only the designated agent keypair can
  rebalance. See [`smartcontract/ARCHITECTURE.md`](smartcontract/ARCHITECTURE.md) and
  [`smartcontract/SECURITY.md`](smartcontract/SECURITY.md) for the full trust model.
- **AI agent** (in the backend/agent layer): an hourly decision loop compares live protocol
  APYs against each user's current strategy and rebalances on a >0.5% improvement, plus a
  real-time intent parser for chat-style commands (`deposit 50 USDC`, `withdraw all`, `what's
  my APY`, etc.).

## CI/CD

GitHub Actions workflows live under `.github/workflows/` and currently cover the frontend
(`frontend-ci.yml`, `deploy-staging.yml`, `deploy-production.yml`), each scoped to the
`frontend/` directory via `working-directory`.

## Documentation index

| Project | Docs |
|---|---|
| Frontend | [`frontend/docs/`](frontend/docs/) (env, API integration, theming, a11y, wallet architecture, QA), [`frontend/CONTRIBUTING.md`](frontend/CONTRIBUTING.md), [`frontend/SECURITY.md`](frontend/SECURITY.md), [`frontend/CHANGELOG.md`](frontend/CHANGELOG.md) |
| Backend | [`backend/docs/openapi.yaml`](backend/docs/openapi.yaml), `SLO_GUIDANCE.md`, `OBSERVABILITY.md`, `RUNBOOK.md`, `TROUBLESHOOTING.md` (all under `backend/docs/`) |
| Smart contracts | [`smartcontract/ARCHITECTURE.md`](smartcontract/ARCHITECTURE.md), [`smartcontract/EVENTS.md`](smartcontract/EVENTS.md), [`smartcontract/SECURITY.md`](smartcontract/SECURITY.md), [`smartcontract/docs/`](smartcontract/docs/) (Blend/DEX integration, mainnet checklist, state machine) |

Program submission: [`docs/LEVEL4_SUBMISSION.md`](docs/LEVEL4_SUBMISSION.md) (required
links, proof of user wallet interactions, feedback summary, screenshots).

Issue tracking (frontend): [audit issues](/.github/audit-issues/) (engineering clean-up),
[backlog](/.github/backlog/) (feature work), [issues index](/.github/ISSUES.md) (label guide).

## Contributing

Each project has its own contributing guide with setup steps, CI gates, and PR checklist:

- [`frontend/CONTRIBUTING.md`](frontend/CONTRIBUTING.md)
- [`smartcontract/CONTRIBUTING.md`](smartcontract/CONTRIBUTING.md)

General flow: fork/branch (`feature/your-feature-name`), make your change in the relevant
subproject, run that subproject's tests/lint/typecheck, then open a PR against `main`.

## Security

To report a vulnerability, see the relevant subproject's security policy — do not file public
issues for security reports:

- [`frontend/SECURITY.md`](frontend/SECURITY.md)
- [`smartcontract/SECURITY.md`](smartcontract/SECURITY.md)

## Deployment

- **Frontend**: Vercel (see `.github/workflows/deploy-staging.yml` / `deploy-production.yml`)
- **Backend / AI agent**: Railway, Render, or a persistent VPS (needs to run 24/7)
- **Database**: Supabase (managed PostgreSQL)
- **Smart contracts**: Stellar testnet for staging, mainnet for production (see
  [`smartcontract/docs/MAINNET_CHECKLIST.md`](smartcontract/docs/MAINNET_CHECKLIST.md))

### Current testnet deployment

| | |
|---|---|
| Vault contract | [`CC2A56NEH35Z2VJ5TALSULYUICPCJXU3KLBHOTMU3OSRSOCCDJN5A42O`](https://stellar.expert/explorer/testnet/contract/CC2A56NEH35Z2VJ5TALSULYUICPCJXU3KLBHOTMU3OSRSOCCDJN5A42O) |
| USDC token (Blend testnet) | `CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU` |
| Blend pool (`TestnetV2`) | `CCEBVDYM32YNYCVNRXQKDFFPISJJCV557CDZEIRBEE4NCV4KHPQ44HGF` |
| Network | Stellar testnet (`https://soroban-testnet.stellar.org`) |

Get testnet USDC for this deployment from the Blend faucet at
[testnet.blend.capital](https://testnet.blend.capital/) — connect a Friendbot-funded wallet
and sign the claim to receive 1,000 USDC.

## User onboarding & feedback

10 real users onboarded on Stellar testnet, each with a verified wallet interaction against
the deployed vault contract (18 successful deposit/withdrawal transactions total — see
[`docs/LEVEL4_SUBMISSION.md`](docs/LEVEL4_SUBMISSION.md) for the full transaction list and
Horizon verification).

- **Feedback form**: [ADD GOOGLE FORM LINK] — collects Name, Email, Wallet Address, Network
  (Testnet/Mainnet), Product Rating, and: which feature they liked most, what feature is
  missing, any bugs/usability issues encountered, whether they'd recommend the product, and
  what improvements they'd like to see.
- **Raw responses (public sheet)**: [ADD GOOGLE SHEET LINK] — a starting template with all
  10 users pre-filled is at [`docs/level4-users-template.csv`](docs/level4-users-template.csv).

> Wallet-to-user pairing below is listed in the order users were reported to us, not
> independently verified per-row — all 10 wallet addresses are independently confirmed real
> and distinct via Horizon (see submission doc).

### Users onboarded

| User ID | Name | Email | Wallet Address | Feedback Summary |
|---|---|---|---|---|
| U01 | Simil Abidoye | similoluwaeyitayoabidoye@gmail.com | `GDTZLLNX2URFAQTZ4WTPBQXP7DDNGAVJKRFPZO327LSKDSILRRFLLQZR` | Found the app basic and easy to navigate; liked not having to interact with DeFi protocols directly to earn yield. |
| U02 | Abimbola Akinpelumi | arulebarobbert701@gmail.com | `GAVV5LZDV6GITWR54DFJ6X73MXSSOL5XRNOASGCNTVODYTM3J5M6JTCY` | Felt the UI could be improved; would like a Google sign-in option alongside wallet connect. |
| U03 | Florence Funmilola | masuvicgloryschools@gmail.com | `GAZZZJVOT235FAJ6L2DCCRYA6VBAUJQRSXMAJ5NUI3OYAB5KNRVMHBLN` | Liked that funds are never locked in the vault/protocol; UI was simple to use. |
| U04 | Dotun Oye | breevs21@gmail.com | `GCK7UHJYOW2Z3M6E2I5TNNWI2SLGJR6XVKYDRYCA4SY336Z2B4I53MGB` | Liked the single-vault deposit flow for yield; appreciated non-custodial withdrawals available any time. |
| U05 | Bola Akin | attestify.xyz@gmail.com | `GAFS6DFGJJNLXUWIME2EGDU7N5LDADNAMFQ22UA2KVJMYTPXTV2JU7T5` | Requested a Google sign-in option; felt the UI has room for polish. |
| U06 | Ange Laura | angelauraiteriteka@gmail.com | `GDUTTXPQS2WECYDBRVZWYGZAU52YH5677HMQBXKWRMHC3YBKVEPQI56V` | Found the app easy to use; liked that balance is never locked into a protocol. |
| U07 | Victor Aruleba | arulebavictor80@gmail.com | `GDLY4EZE57GVBZO5OW2Q74W4HP4TH72N7JNINIJVD52MYLEFUHAKBDYS` | Liked not needing to research individual DeFi protocols; found the UI straightforward. |
| U08 | busayo akin | oluwabusayomi103@gmail.com | `GABXX4BN3NVD433X4QHMOSM5OPJPOG7222Z7CJHF72MY4LUALT3QRDLT` | Felt the UI could be better; requested Google sign-in as an alternative to wallet-only auth. |
| U09 | Oluwabusayo Akinsanya | busayomisecondacc@gmail.com | `GD3EYHWDP5OEKKNZBD3PDGNJFB2V2AJ6JJMBZ3XAPZHEGDW23MGBXAE6` | Appreciated the non-custodial design; liked the single-deposit-for-yield flow. |
| U10 | Akin demi | yormee591@gmail.com | `GCH6LJQ3XEJDCWSXSBM6OY6MNTL7XEM2CVMZGAIM6JXSEK64CA2T4TJ5` | Found the app basic and easy to navigate; requested Google sign-in. |

*(Feedback summaries above are paraphrased from aggregate themes reported across the 10
testers, not individually attributed verbatim quotes. Replace with each user's actual form
response once collected.)*

### Feedback implementation

Feedback that has already driven real, shipped changes (commits verifiable in this repo's
history):

| User ID | Name | Email | Wallet Address | Feedback Summary | Improvement Made | Git Commit ID |
|---|---|---|---|---|---|---|
| U04 | Dotun Oye | breevs21@gmail.com | `GCK7UHJYOW2Z3M6E2I5TNNWI2SLGJR6XVKYDRYCA4SY336Z2B4I53MGB` | Couldn't tell if/how the AI agent moved funds into a DeFi protocol | Added a dedicated "AI agent status" card showing active protocol + APY | [`4f77c55`](https://github.com/robertocarlous/NeuroWealth/commit/4f77c55) |
| U04 | Dotun Oye | breevs21@gmail.com | `GCK7UHJYOW2Z3M6E2I5TNNWI2SLGJR6XVKYDRYCA4SY336Z2B4I53MGB` | No confirmation a deposit/withdrawal actually succeeded on-chain | Transaction hash is now always shown after success, linked to Stellar Expert | [`4f77c55`](https://github.com/robertocarlous/NeuroWealth/commit/4f77c55) |
| U04 | Dotun Oye | breevs21@gmail.com | `GCK7UHJYOW2Z3M6E2I5TNNWI2SLGJR6XVKYDRYCA4SY336Z2B4I53MGB` | Transactions page showed mock data and the wrong connected wallet | Replaced the mock-data QA form with a clean deposit/withdraw form wired to the real backend | [`386b78c`](https://github.com/robertocarlous/NeuroWealth/commit/386b78c) |
| U04 | Dotun Oye | breevs21@gmail.com | `GCK7UHJYOW2Z3M6E2I5TNNWI2SLGJR6XVKYDRYCA4SY336Z2B4I53MGB` | Dashboard was cluttered with unrelated widgets | Simplified dashboard to deposit/withdraw + agent status + real activity log | [`e6cd7bf`](https://github.com/robertocarlous/NeuroWealth/commit/e6cd7bf) |
| U04 | Dotun Oye | breevs21@gmail.com | `GCK7UHJYOW2Z3M6E2I5TNNWI2SLGJR6XVKYDRYCA4SY336Z2B4I53MGB` | No way to see balance/yield history over time | Added a real per-user Earnings dashboard (balance, yield, APY, history chart) | [`bac47c7`](https://github.com/robertocarlous/NeuroWealth/commit/bac47c7) |
| U04 | Dotun Oye | breevs21@gmail.com | `GCK7UHJYOW2Z3M6E2I5TNNWI2SLGJR6XVKYDRYCA4SY336Z2B4I53MGB` | Wallet sign-in was unstable, kept looping / rate-limited | Fixed the sign-in retry loop and a SEP-53 signature verification bug | [`074cbb3`](https://github.com/robertocarlous/NeuroWealth/commit/074cbb3), [`960b404`](https://github.com/robertocarlous/NeuroWealth/commit/960b404) |
| U04 | Dotun Oye | breevs21@gmail.com | `GCK7UHJYOW2Z3M6E2I5TNNWI2SLGJR6XVKYDRYCA4SY336Z2B4I53MGB` | Deposits sat idle for up to an hour before earning yield | Agent now deploys new deposits within seconds instead of waiting for the hourly job | [`199d396`](https://github.com/robertocarlous/NeuroWealth/commit/199d396) |
| — | Multiple users (U02, U05, U08, U10) | — | — | UI could be more polished | Planned — not yet implemented | — |
| — | Multiple users (U02, U05, U08, U10) | — | — | Requested Google sign-in alongside wallet connect | Partially scoped, planned for a future phase | — |

## Roadmap

- **Phase 1 — Foundation** (current): Soroban vault contract, basic AI agent with Blend
  integration, natural language intent parsing, web frontend with portfolio dashboard,
  WhatsApp bot MVP
- **Phase 2 — Intelligence**: multi-protocol yield aggregation, strategy backtesting and risk
  scoring, personalized risk profiles, earnings history and projection charts
- **Phase 3 — Scale**: real-world asset (RWA) yield strategies, cross-chain bridging, social
  trading, NeuroWealth governance token

## License

Internal/demo project — see repository owner for license details.
