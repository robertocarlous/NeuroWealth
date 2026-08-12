# NeuroWealth — Demo Video Script

Script for the Level 5 product walkthrough (Loom). Target length: 3–5 minutes.

## Structure

### 1. Intro (0:00–0:25)
- "Hi, this is NeuroWealth — an autonomous yield agent on the Stellar network."
- "It watches live on-chain protocols, picks the best yield for your USDC, and moves your
  funds automatically — while you keep control of your keys."
- Mention: built on Stellar testnet (Soroban), contract is public and verifiable.

### 2. Sign in (0:25–1:00)
- Show the landing page and the sign-in screen.
- Sign in with Google (Level 5 addition) and/or connect a Stellar wallet (SEP-53 signature).
- Note the wallet connect explains the transaction each time — non-custodial.

### 3. Dashboard overview (1:00–1:45)
- Walk the dashboard: total deposited, current holdings, the agent status card.
- Point out the agent status is **Active** because funds are on the protocol.
- Show the yield-visibility card: live USDC APYs and the chosen protocol.

### 4. Deposit flow (1:45–2:45)
- Deposit a small amount of testnet USDC.
- Watch the agent go "Active" and show the deposit transaction hash.
- Open stellar.expert to show the on-chain record (proof of real activity).

### 5. Withdraw flow (2:45–3:30)
- Withdraw back to the wallet.
- Show the withdrawal transaction hash and the updated balance.

### 6. Feedback / growth (3:30–4:15)
- Show the "improvement summary" story: users asked for Google sign-in and UI polish —
  both shipped (point to README commit links).
- Show the live metrics endpoint (`GET /metrics`) as a peek at analytics.

### 7. Outro (4:15–5:00)
- Recap: autonomous, non-custodial, transparent, 50+ user goal on testnet.
- "Try it, fill the survey, and watch your feedback land as shipped commits."

## Recording notes
- Use the testnet funds, not mainnet. Real tx hashes make the demo verifiable.
- Capture from a clean browser window; mute notifications.
- If the Loom from Level 4 is reused, add a fresh segment for Google sign-in + yield card.
