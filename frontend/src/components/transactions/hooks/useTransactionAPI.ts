/**
 * useTransactionAPI.ts
 *
 * Custom hook for transaction API operations.
 * Handles quote requests, submissions, and error mapping.
 */

import { useCallback, useState } from "react";
import {
    TransactionFormValues,
    TransactionKind,
    TransactionQuote,
    PendingTransaction,
    getTransactionRecoveryUI,
    type TransactionRecoveryUI,
} from "@/lib/transactions";
import { ApiRequestError, apiRequest } from "@/lib/api-client";
import { detailsToFieldErrors } from "../utils/transaction-utils";

export interface TransactionAPIState {
    isSubmitting: boolean;
    recovery: TransactionRecoveryUI | null;
    lastErrorReference: string | null;
}

export function useTransactionAPI() {
    const [state, setState] = useState<TransactionAPIState>({
        isSubmitting: false,
        recovery: null,
        lastErrorReference: null,
    });

    const requestQuote = useCallback(
        async (
            kind: TransactionKind,
            formValues: TransactionFormValues,
        ): Promise<{ quote: TransactionQuote } | null> => {
            setState((prev) => ({
                ...prev,
                isSubmitting: true,
                recovery: null,
            }));

            try {
                const payload = await apiRequest<{ quote: TransactionQuote }>(
                    "/api/transactions",
                    {
                        method: "POST",
                        body: {
                            intent: "quote",
                            kind,
                            values: formValues,
                        },
                        timeoutMs: 12000,
                    },
                );

                setState((prev) => ({
                    ...prev,
                    isSubmitting: false,
                }));

                return payload;
            } catch (error) {
                const recoveryUI =
                    error instanceof ApiRequestError
                        ? getTransactionRecoveryUI(error.code)
                        : getTransactionRecoveryUI("unknown_error");

                const fieldErrors =
                    error instanceof ApiRequestError
                        ? detailsToFieldErrors(error.details)
                        : {};

                setState((prev) => ({
                    ...prev,
                    isSubmitting: false,
                    recovery: recoveryUI,
                    lastErrorReference: null,
                }));

                return null;
            }
        },
        [],
    );

    const submitTransaction = useCallback(
        async (
            kind: TransactionKind,
            formValues: TransactionFormValues,
            quoteReference?: string,
        ): Promise<{ pending: PendingTransaction } | null> => {
            setState((prev) => ({
                ...prev,
                isSubmitting: true,
                recovery: null,
            }));

            try {
                const payload = await apiRequest<{ pending: PendingTransaction }>(
                    "/api/transactions",
                    {
                        method: "POST",
                        body: {
                            intent: "submit",
                            kind,
                            values: formValues,
                        },
                        timeoutMs: 12000,
                    },
                );

                setState((prev) => ({
                    ...prev,
                    isSubmitting: false,
                    lastErrorReference: payload.pending.reference,
                }));

                return payload;
            } catch (error) {
                const recoveryUI =
                    error instanceof ApiRequestError
                        ? getTransactionRecoveryUI(error.code, quoteReference)
                        : getTransactionRecoveryUI("unknown_error", quoteReference);

                const fieldErrors =
                    error instanceof ApiRequestError
                        ? detailsToFieldErrors(error.details)
                        : {};

                setState((prev) => ({
                    ...prev,
                    isSubmitting: false,
                    recovery: recoveryUI,
                    lastErrorReference: quoteReference || null,
                }));

                return null;
            }
        },
        [],
    );

    const clearRecovery = useCallback(() => {
        setState((prev) => ({
            ...prev,
            recovery: null,
        }));
    }, []);

    return {
        ...state,
        requestQuote,
        submitTransaction,
        clearRecovery,
    };
}
