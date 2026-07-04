import { parseScenario, PortfolioScenario } from "@/lib/portfolio";

export function resolveSandboxScenario(
  scenarioValue: string | null | undefined,
): PortfolioScenario {
  return parseScenario(scenarioValue ?? null);
}

export function isSandboxScenario(scenario: PortfolioScenario): boolean {
  return scenario !== "live";
}

