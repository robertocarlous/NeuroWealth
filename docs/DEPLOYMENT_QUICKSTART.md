# Deployment Quickstart (Vercel + Railway)

**Live right now:**

| | |
|---|---|
| Frontend | https://neurowealth-frontend.vercel.app |
| Backend | https://neurowealth-production.up.railway.app (`/health`) |

This is the fastest path to a live demo URL for the Level 4 submission: **frontend on Vercel**,
**backend + Postgres on Railway**. For Kubernetes/production-grade deployment, see
[`backend/docs/PRODUCTION_DEPLOYMENT.md`](../backend/docs/PRODUCTION_DEPLOYMENT.md) instead —
this guide is deliberately the quick path, not the hardened one.

Both steps require signing in to Vercel/Railway with your GitHub account in a browser — that
part can't be scripted from here. The rest below is what was actually run to produce the live
deployment above; re-run it (or `git push` to trigger Railway/Vercel's own auto-deploy once
configured) to redeploy after future changes.

## 1. Backend + Postgres on Railway

1. Go to [railway.app](https://railway.app) → sign in with GitHub → **New Project** → **Deploy
   from GitHub repo** → select `robertocarlous/NeuroWealth`.
2. Railway will ask which directory to deploy — set **Root Directory** to `backend`.
3. Add a **Postgres** plugin to the project (New → Database → PostgreSQL). Railway will inject
   `DATABASE_URL` automatically — copy that value for step 4.
4. Under the backend service's **Variables**, set (see `backend/.env.example` for the full list;
   values already known from the current testnet deployment are filled in below):

   ```
   NODE_ENV=production
   PORT=3001
   STELLAR_NETWORK=testnet
   STELLAR_RPC_URL=https://soroban-testnet.stellar.org
   VAULT_CONTRACT_ID=CC2A56NEH35Z2VJ5TALSULYUICPCJXU3KLBHOTMU3OSRSOCCDJN5A42O
   USDC_TOKEN_ADDRESS=CAQCFVLOBK5GIULPNZRGATJJMIZL5BSP7X5YJVMGCPTUEPFM4AVSRCJU
   BLEND_POOL_ID=CCEBVDYM32YNYCVNRXQKDFFPISJJCV557CDZEIRBEE4NCV4KHPQ44HGF
   DATABASE_URL=<copied from the Postgres plugin>
   STELLAR_AGENT_SECRET_KEY=<a funded testnet keypair for the agent; do not reuse a dev key>
   WALLET_ENCRYPTION_KEY=<generate fresh: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
   INTERNAL_SERVICE_TOKEN=<generate a random string>
   ADMIN_API_TOKEN=<generate a random string>
   ```

   Generate a **new** `STELLAR_AGENT_SECRET_KEY` for production rather than reusing whatever key
   was used for local testing — treat it as a real credential from here on.

5. Set the **Build Command** to `npm install && npm run build && npx prisma migrate deploy` and
   the **Start Command** to `npm start`. Railway auto-detects `npm start` from `package.json` if
   left blank, but migrations won't run without the explicit build command above.
6. Deploy. Once live, copy the public URL Railway gives the service (e.g.
   `https://neurowealth-backend-production.up.railway.app`) — you need it for step 2.
7. Verify: `curl https://<your-railway-url>/health` should return `{"status":"ok",...}`.

## 2. Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub → **Add New Project** → import
   `robertocarlous/NeuroWealth`.
2. Vercel will ask for the **Root Directory** — set it to `frontend`. Framework preset
   (Next.js) is auto-detected.
3. Under **Environment Variables**, set (see `frontend/.env.example` for the full reference):

   ```
   NEXT_PUBLIC_WEBHOOK_URL=https://<your-railway-url>
   NEXT_PUBLIC_API_URL=https://<your-railway-url>
   NEXT_PUBLIC_STELLAR_NETWORK=testnet
   NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
   NEXT_PUBLIC_BACKEND_URL=https://<your-railway-url>
   NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
   AUTH_SECRET=<generate a random string>
   ```

   Leave `NEUROWEALTH_API_BASE_URL` **unset** unless you also want the mock `/api/*` routes to
   proxy to the real backend (separate from the non-custodial deposit flow, which uses
   `NEXT_PUBLIC_BACKEND_URL` directly — see `frontend/docs/env.md`).

4. Deploy. Vercel gives you a `https://<project>.vercel.app` URL — this is the live demo link
   for the submission checklist.
5. Back on Railway, add `CORS_ORIGINS=https://<your-vercel-url>` to the backend's variables
   (comma-separated if you need more than one origin). In production the backend rejects any
   request whose `Origin` header isn't in this allowlist — see
   `backend/src/middleware/corsandbody.ts`.

## 3. Smoke test the live deployment

1. Open the Vercel URL, confirm the landing page loads.
2. Sign in with **Fill demo credentials** and confirm the dashboard loads (this exact flow was
   broken and fixed earlier in this session — worth re-checking after every deploy).
3. Connect a real testnet wallet (Freighter) and confirm `NEXT_PUBLIC_BACKEND_URL` being set
   routes the deposit flow through the real backend (check the network tab for calls to your
   Railway URL, not `/api/transactions`).
4. This is also your **10+ real user wallet interactions** surface — once live, share the
   Vercel URL for people to connect wallets and try it.
