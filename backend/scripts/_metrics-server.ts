import express from "express";
import metricsRouter from "../src/routes/metrics";
import {
  recordEventProcessed,
  recordHttpRequest,
  recordAnalyticsRequest,
  updateAgentStatus,
  updateAgentHeartbeat,
  recordRebalanceCheck,
  recordRebalanceTriggered,
  updateDlqSize,
  updateCursorLag,
  updateLastProcessedLedger,
} from "../src/utils/metrics";

const app = express();
app.use("/metrics", metricsRouter);

recordEventProcessed("vault_deposit");
recordEventProcessed("vault_deposit");
recordEventProcessed("vault_withdraw");
recordEventProcessed("yield_snapshot");
updateAgentStatus("running");
updateAgentHeartbeat();
recordRebalanceCheck("success");
recordRebalanceCheck("success");
recordRebalanceTriggered();
updateDlqSize(0);
updateCursorLag(0);
updateLastProcessedLedger(2679000);
recordHttpRequest("GET", "/api/vault/state", 200, 0.042);
recordHttpRequest("GET", "/api/vault/balance", 200, 0.031);
recordHttpRequest("GET", "/api/transactions", 200, 0.058);
recordAnalyticsRequest("portfolio/summary", "success", 0.11);

app.listen(3002, () => {
  console.log("[metrics-harness] GET http://localhost:3002/metrics");
});
