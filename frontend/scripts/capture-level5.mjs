import { chromium } from "playwright";
import fs from "node:fs";

const S = JSON.parse(fs.readFileSync("/tmp/nw-session.json", "utf8"));
const WALLET_PUB = S.wallet;
const TOKEN = fs
  .readFileSync("/Users/mac/Desktop/NeuroWealth/backend/.env", "utf8")
  .split("\n")
  .find((l) => l.startsWith("INTERNAL_SERVICE_TOKEN="))
  .split("=")[1];

const OUT = "/Users/mac/Desktop/NeuroWealth/docs/screenshots";

function initScript({ S, WALLET_PUB }) {
  return ({ S, WALLET_PUB }) => {
    const session = {
      user: {
        id: S.userId,
        displayName: "Demo",
        email: "demo@neurowealth.app",
        walletAddress: WALLET_PUB,
        avatarInitials: "NW",
        createdAt: new Date().toISOString(),
      },
      token: S.token,
      expiresAt: Date.now() + 86400e3,
    };
    localStorage.setItem("neurowealth_session", JSON.stringify(session));
    sessionStorage.setItem("nw_backend_jwt", S.token);
    localStorage.setItem("nw_cookie_consent", JSON.stringify({ accepted: true }));
    localStorage.setItem("nw_wallet_connected", "true");
    localStorage.setItem("nw_wallet_provider", "freighter");
    localStorage.setItem("nw_wallet_public_key", WALLET_PUB);
    localStorage.setItem("nw_wallet_display_name", "Freighter");
    localStorage.setItem("nw_wallet_network", "Test SDF Network ; September 2015");
    window.freighter = { isConnected: true };
    window.addEventListener("message", (event) => {
      const d = event.data;
      if (!d || d.source !== "FREIGHTER_EXTERNAL_MSG_REQUEST") return;
      const resp = { source: "FREIGHTER_EXTERNAL_MSG_RESPONSE", messagedId: d.messageId };
      if (d.type === "REQUEST_PUBLIC_KEY" || d.type === "REQUEST_ACCESS") resp.publicKey = WALLET_PUB;
      else if (d.type === "REQUEST_CONNECTION_STATUS") resp.isConnected = true;
      else if (d.type === "REQUEST_NETWORK") resp.network = "TESTNET";
      else if (d.type === "REQUEST_NETWORK_DETAILS")
        resp.networkDetails = {
          network: "TESTNET",
          networkPassphrase: "Test SDF Network ; September 2015",
          networkUrl: "https://horizon-testnet.stellar.org",
        };
      else if (d.type === "REQUEST_USER_INFO") resp.userInfo = { publicKey: WALLET_PUB };
      window.postMessage(resp, "*");
    });
  };
}

const browser = await chromium.launch();
const shots = [];

async function capture(url, name, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/Failed to load resource/.test(m.text()))
      errors.push(m.text().slice(0, 120));
  });
  if (opts.init) await page.addInitScript(initScript({ S, WALLET_PUB }), { S, WALLET_PUB });
  if (opts.headers) await page.setExtraHTTPHeaders(opts.headers);
  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(opts.wait ?? 4000);
  const file = `${OUT}/${name}`;
  await page.screenshot({ path: file, fullPage: true });
  console.log("saved:", name, "| url:", url, "| errs:", errors.slice(0, 2).join(" | ") || "none");
  shots.push(name);
  await ctx.close();
  return file;
}

await capture(
  "https://neurowealth-frontend.vercel.app/dashboard",
  "07-dashboard-desktop.png",
  { init: true, wait: 6000 }
);
await capture(
  "https://neurowealth-frontend.vercel.app/dashboard/portfolio",
  "08-portfolio-desktop.png",
  { init: true, wait: 5000 }
);
await capture(
  "https://neurowealth-frontend.vercel.app/dashboard/transactions",
  "09-transactions-desktop.png",
  { init: true, wait: 5000 }
);
await capture(
  "http://localhost:3002/metrics",
  "10-metrics-desktop.png",
  { headers: { "X-Internal-Token": TOKEN }, wait: 3000 }
);
await capture(
  "https://stellar.expert/explorer/testnet/account/GAZEBKUEC5G757V7B5KUG3MM3EFKULRTTUCLBINIR7TYSB57XPYPM2JB",
  "11-onchain-activity-desktop.png",
  { wait: 12000 }
);

await browser.close();
console.log("\nDONE:", shots.join(", "));
