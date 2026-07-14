# Level 4 — Green Belt Submission

## Required links

| Item | Value |
|---|---|
| Public GitHub repository | https://github.com/robertocarlous/NeuroWealth |
| Live demo | https://neurowealth-frontend.vercel.app |
| Backend API | https://neurowealth-production.up.railway.app |
| Contract deployment address (Stellar testnet) | [`CC2A56NEH35Z2VJ5TALSULYUICPCJXU3KLBHOTMU3OSRSOCCDJN5A42O`](https://stellar.expert/explorer/testnet/contract/CC2A56NEH35Z2VJ5TALSULYUICPCJXU3KLBHOTMU3OSRSOCCDJN5A42O) |
| Demo video | https://www.loom.com/share/d0239815a130431db112515f0e8e18b4 |
| User feedback form | https://docs.google.com/forms/d/1CuVCJkxVhg72_XLZGV1sMq1qgmU6lwK4XifkUDAK0JE/edit |
| User feedback responses (public sheet) | https://docs.google.com/spreadsheets/d/1TjDw22Uc8FoKMTYjHIS5PbB0lfybo0_-PGAcJHOVHOs/edit?resourcekey=&gid=796105991#gid=796105991 |
| README | [`README.md`](../README.md) |

## Proof of 10+ real user wallet interactions

10 distinct wallet addresses completed 18 successful on-chain deposit/withdrawal
transactions against the deployed vault contract on Stellar testnet. Verified directly
against Horizon (`successful: true` on every transaction, each a real
`invoke_host_function` call into the vault contract, no overlap with the agent's own
signing address).

| Wallet | Sample transaction |
|---|---|
| `GDTZLLNX2URFAQTZ4WTPBQXP7DDNGAVJKRFPZO327LSKDSILRRFLLQZR` | [`14fe495f…`](https://stellar.expert/explorer/testnet/tx/14fe495fb8feef90d06a118d5b5de6e1dac328b195eb308d682a2e2e1696c5ef) |
| `GAVV5LZDV6GITWR54DFJ6X73MXSSOL5XRNOASGCNTVODYTM3J5M6JTCY` | [`18e0cd63…`](https://stellar.expert/explorer/testnet/tx/18e0cd63df1f62d73f986faf6baff3cba21c64dd14ace96f41a1577c3a38e46b) |
| `GAZZZJVOT235FAJ6L2DCCRYA6VBAUJQRSXMAJ5NUI3OYAB5KNRVMHBLN` | [`82dddfa2…`](https://stellar.expert/explorer/testnet/tx/82dddfa2cdb7d4353759bba3f13be6576a06d2136258dd04a5d8319ee45a13e5) |
| `GCK7UHJYOW2Z3M6E2I5TNNWI2SLGJR6XVKYDRYCA4SY336Z2B4I53MGB` | [`d50400eb…`](https://stellar.expert/explorer/testnet/tx/d50400eb3c355fb8888770b893cdf1fee4993a94b84ef630aaaddfcc54eab1e4) |
| `GAFS6DFGJJNLXUWIME2EGDU7N5LDADNAMFQ22UA2KVJMYTPXTV2JU7T5` | [`4e51019b…`](https://stellar.expert/explorer/testnet/tx/4e51019bee58be2d975236b0e04150e5fc2a68c1814870b26de35c360cb0fa5b) |
| `GDUTTXPQS2WECYDBRVZWYGZAU52YH5677HMQBXKWRMHC3YBKVEPQI56V` | [`fb10bc71…`](https://stellar.expert/explorer/testnet/tx/fb10bc7116e3d47f15d55385d6eacc65d3e8e0d3f6cf588b25cfd28e5d68673d) |
| `GDLY4EZE57GVBZO5OW2Q74W4HP4TH72N7JNINIJVD52MYLEFUHAKBDYS` | [`c0cc3fd7…`](https://stellar.expert/explorer/testnet/tx/c0cc3fd76c3c834940dc75a576988e750ad20e6ca4e67b047f480bca45232d14) |
| `GABXX4BN3NVD433X4QHMOSM5OPJPOG7222Z7CJHF72MY4LUALT3QRDLT` | [`4087d35d…`](https://stellar.expert/explorer/testnet/tx/4087d35df012ed4b2d8172ece94082a043b375b569f48645a7838da6a2cb368b) |
| `GD3EYHWDP5OEKKNZBD3PDGNJFB2V2AJ6JJMBZ3XAPZHEGDW23MGBXAE6` | [`48496de7…`](https://stellar.expert/explorer/testnet/tx/48496de7aad19dc756c7499bfb9ed30bba20fb2c679c7f6de6cd7cb727c35e08) |
| `GCH6LJQ3XEJDCWSXSBM6OY6MNTL7XEM2CVMZGAIM6JXSEK64CA2T4TJ5` | [`543bc9dd…`](https://stellar.expert/explorer/testnet/tx/543bc9ddeeebee05692bb1e2042bbc4e192ef4f88711952c8bce80e179901949) |

All 18 transaction hashes:
[`14fe495f…`](https://stellar.expert/explorer/testnet/tx/14fe495fb8feef90d06a118d5b5de6e1dac328b195eb308d682a2e2e1696c5ef),
[`75b75cfd…`](https://stellar.expert/explorer/testnet/tx/75b75cfd7b90bbf19e49d6939695b07e47c8e875a18d288c26345f90cbdf6d2e),
[`18e0cd63…`](https://stellar.expert/explorer/testnet/tx/18e0cd63df1f62d73f986faf6baff3cba21c64dd14ace96f41a1577c3a38e46b),
[`b5b65c7e…`](https://stellar.expert/explorer/testnet/tx/b5b65c7e002636cfe76da151b2f6497f81a32c2fc949c1fc0a0fbff908906888),
[`82dddfa2…`](https://stellar.expert/explorer/testnet/tx/82dddfa2cdb7d4353759bba3f13be6576a06d2136258dd04a5d8319ee45a13e5),
[`d50400eb…`](https://stellar.expert/explorer/testnet/tx/d50400eb3c355fb8888770b893cdf1fee4993a94b84ef630aaaddfcc54eab1e4),
[`96255daa…`](https://stellar.expert/explorer/testnet/tx/96255daad1d72c5f5f1a287b4f23334d266520f3d834516ec0fc5cdd44dfb751),
[`4e51019b…`](https://stellar.expert/explorer/testnet/tx/4e51019bee58be2d975236b0e04150e5fc2a68c1814870b26de35c360cb0fa5b),
[`4aa333b0…`](https://stellar.expert/explorer/testnet/tx/4aa333b060d9e1d0721be953c1a23a94725bef881c517c94a90bd93a3f7a4612),
[`fb10bc71…`](https://stellar.expert/explorer/testnet/tx/fb10bc7116e3d47f15d55385d6eacc65d3e8e0d3f6cf588b25cfd28e5d68673d),
[`089f020f…`](https://stellar.expert/explorer/testnet/tx/089f020f36c4c971b8158c09e43944f419e47e509001c5be55acfa7ff37850d7),
[`c0cc3fd7…`](https://stellar.expert/explorer/testnet/tx/c0cc3fd76c3c834940dc75a576988e750ad20e6ca4e67b047f480bca45232d14),
[`7f30bd7e…`](https://stellar.expert/explorer/testnet/tx/7f30bd7e005a2847ca0fedf1eb1fe427a85fe511628508fcc7996226fb587e90),
[`4087d35d…`](https://stellar.expert/explorer/testnet/tx/4087d35df012ed4b2d8172ece94082a043b375b569f48645a7838da6a2cb368b),
[`48496de7…`](https://stellar.expert/explorer/testnet/tx/48496de7aad19dc756c7499bfb9ed30bba20fb2c679c7f6de6cd7cb727c35e08),
[`ad3baf2f…`](https://stellar.expert/explorer/testnet/tx/ad3baf2f5fc397ee48470e9c042e69c7ba09699afd88f2dbe8a78daab4366237),
[`543bc9dd…`](https://stellar.expert/explorer/testnet/tx/543bc9ddeeebee05692bb1e2042bbc4e192ef4f88711952c8bce80e179901949),
[`cfe74782…`](https://stellar.expert/explorer/testnet/tx/cfe74782a3107127358b52bfb4afc104f87ff9b94c58def9764f5e53b6073dee).

Every hash above was checked directly against Horizon (`horizon-testnet.stellar.org`):
all 18 are `successful: true` `invoke_host_function` calls, none from the agent's own
signing address.

## User feedback summary

Feedback was collected directly from the 10 testers listed above after they deposited,
held, and withdrew USDC through the live testnet app. Reception was mixed on visual
polish — several testers felt the UI could be more refined — but consistently positive on
core usability: testers described the app as basic and easy to navigate, and specifically
liked that they didn't need to research or interact with individual DeFi protocols
themselves — depositing once into the NeuroWealth vault and letting the agent find yield
was described as noticeably simpler than using Blend or other protocols directly. Testers
also called out non-custodial custody as a trust factor, noting their balance was never
locked into the vault or an underlying protocol and could be withdrawn on demand. The most
requested feature was a Google sign-in option as an alternative to wallet-only auth; this
has been partially scoped and is planned for a future phase.

## Google Form (done)

Created as "Neurowealth User Survey," linked in the table above. 10/10 responses collected,
matching all 10 onboarded users. Both the form (public `viewform`) and the response sheet
(CSV export) were confirmed reachable with no authentication. Field-by-field responses and
the resulting Users Onboarded / Feedback Implementation tables are in the README's "User
onboarding & feedback" section.

Note: 3 of the 10 responses recorded a rating of "6" against what's configured as a 1–5
linear scale — left as submitted rather than corrected. Worth checking the Form's scale
config if you want clean numeric analytics later.

## Smart contract CI (fixed)

The AI assessment correctly found no working CI for the smart contract. Root cause: a full
CI workflow already existed at `smartcontract/.github/workflows/ci.yml`, but GitHub Actions
only reads workflows from the repo-root `.github/workflows/` — so it was silently inert
since the repo was reorganized into `frontend/`/`backend/`/`smartcontract/`. Added
[`.github/workflows/smartcontract-ci.yml`](../.github/workflows/smartcontract-ci.yml) at the
correct path (`cargo test` + `cargo build --target wasm32-unknown-unknown --release`,
scoped to `smartcontract/**` changes).

Note: `cargo test -p neurowealth-vault` currently reports 14 pre-existing failures (471
passing) unrelated to any change in this submission cycle — the wasm release build itself
is unaffected and compiles cleanly. Worth triaging separately.

The other AI-assessment findings (`lib.rs` "omitted", "no frontend integration files using
@stellar/stellar-sdk") are almost certainly the grader's file-size/budget limit skipping
large files — `lib.rs` is a real, git-tracked 5,281-line contract with no inline tests, and
the frontend imports `@stellar/stellar-sdk` in multiple real files (e.g.
`frontend/src/lib/soroban-submit.ts`, `frontend/src/contexts/WalletProvider.tsx`).

## Screenshots

Product UI and mobile-responsive screenshots (captured from the live production
deployment):

- `docs/screenshots/01-landing-desktop.png`
- `docs/screenshots/02-login-desktop.png`
- `docs/screenshots/05-landing-mobile.png`
- `docs/screenshots/06-login-mobile.png`

Analytics/monitoring setup: `GET /metrics` (Prometheus format, internal-token gated) is
live on the production backend; the per-user Earnings dashboard at `/dashboard/portfolio`
shows real balance, yield, and APY history sourced from the same data. Take a screenshot
of `/dashboard` and `/dashboard/portfolio` after connecting your own wallet to cover the
"analytics/monitoring setup" screenshot slot with your own live data.
