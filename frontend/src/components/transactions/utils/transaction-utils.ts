/**
 * transaction-utils.ts
 *
 * Utility functions for transaction flow.
 * Extracted from TransactionFlow for reusability.
 */

import { TransactionFieldErrors } from "@/lib/transactions";
import styles from "../transaction-flow.module.css";

export function getTheme(
    searchParams: Pick<URLSearchParams, "get">,
): "light" | "dark" {
    return searchParams.get("theme") === "dark" ? "dark" : "light";
}

export function getToneClassName(
    tone: "error" | "success" | "warning",
): string {
    if (tone === "error") {
        return styles.statusError;
    }

    if (tone === "warning") {
        return styles.statusWarning;
    }

    return styles.statusSuccess;
}

export function getInputStateClassName(
    value: string,
    error?: string,
    isValidated?: boolean,
): string {
    if (error) {
        return styles.inputError;
    }

    if (isValidated && value) {
        return styles.inputSuccess;
    }

    return "";
}

export function sanitizeAmount(value: string): string {
    return value.replace(/[^\d.]/g, "");
}

export function detailsToFieldErrors(
    details?: Record<string, string | string[]>,
): TransactionFieldErrors {
    if (!details) {
        return {};
    }

    const readValue = (key: string): string | undefined => {
        const value = details[key];

        if (Array.isArray(value)) {
            return value[0];
        }

        return typeof value === "string" ? value : undefined;
    };

    return {
        amount: readValue("amount") ?? readValue("values.amount"),
        walletAddress:
            readValue("walletAddress") ?? readValue("values.walletAddress"),
        walletConnected:
            readValue("walletConnected") ?? readValue("values.walletConnected"),
        form: readValue("form") ?? readValue("body"),
    };
}

export function currentStepIndex(
    stage: "form" | "confirm" | "pending" | "success" | "failure" | "error",
): number {
    if (stage === "form" || stage === "error") {
        return 0;
    }

    if (stage === "confirm") {
        return 1;
    }

    return 2;
}
