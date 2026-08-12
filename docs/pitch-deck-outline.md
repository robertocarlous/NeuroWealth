# NeuroWealth — Pitch Deck Outline

Outline for the Blue Belt pitch deck:
https://docs.google.com/presentation/d/1ySdYMYBaBYLbkfV6_cg2oQUag4v9XZyS-jcuj-5rLPQ/edit

## 1. Hook / Problem
- Managing a personal crypto allocation across protocols is manual, slow, and easy to get
  wrong: you have to track APYs, monitor your positions, and rebalance by hand.
- Staking/yield on Stellar (Soroban) is new enough that users don't know where to put
  money or how to compare options.

## 2. Solution
- NeuroWealth: an autonomous yield agent on Stellar.
- Connect your wallet → deposit USDC → the agent selects a live, on-chain protocol
  (Blend testnet pools) and moves your funds — all visible and verifiable on the ledger.
- Non-custodial: your wallet signs every transaction client-side; the backend never
  holds keys (see the Architecture section of the README).

## 3. Product demo (screenshots / short clips)
- Google sign-in + wallet connect (SEP-53, with Google as the new Level 5 addition).
- Deposit flow → agent status goes "Active".
- Yield-visibility card with live USDC APYs and the chosen protocol.
- Withdraw flow → funds return to your wallet; every step shows a transaction hash.

## 4. Market
- Growing Stellar/Soroban ecosystem; Blend is a leading testnet lending pool.
- Target: retail users who hold USDC and want automated yield without managing positions.

## 5. Competitive landscape
- Manual DeFi dashboards vs. automated agents; custodial yield products vs. non-custodial.
- Our edge: on-chain agent autonomy, per-user transparency, and a clean, non-technical UI.

## 6. Business model / growth
- Free testnet onboarding for users; path to mainnet with protocol fees or subscription tiers.
- Milestone-driven: 50+ testnet users with real deposits/withdrawals, verified on Horizon.

## 7. Roadmap
- Ship: link Stellar wallet for Google users (guided first-run flow).
- Ship: more protocols (Templar, Stellar DEX liquidity) for rotation.
- Ship: Conservative/Balanced/Growth risk profiles with backtested projections.
- Live deployment to production with monitored agent + metrics.

## 8. Ask / next steps
- Connect 40+ more testnet users → reach the 50-user milestone.
- Finalize Vercel secrets so the live deploy completes.
- Feedback loop: every survey response drives a shipped commit (see README
  "Improvement summary").

## Deck notes
- Keep 1 idea per slide, lead with the on-chain proof (tx hashes, stellar.expert links).
- Use the real dashboard/transactions/metrics screenshots in `docs/screenshots/`.
