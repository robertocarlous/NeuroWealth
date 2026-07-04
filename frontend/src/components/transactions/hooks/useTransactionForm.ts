/**
 * useTransactionForm.ts
 *
 * Custom hook for managing transaction form state and validation.
 * Separates form logic from UI rendering.
 */

import { useState, useCallback } from "react";
import {
    TransactionFieldErrors,
    TransactionFormValues,
    TransactionKind,
    getDefaultTransactionValues,
    validateTransactionValues,
} from "@/lib/transactions";

export function useTransactionForm(kind: TransactionKind) {
    const [formValues, setFormValues] = useState<TransactionFormValues>(() =>
        getDefaultTransactionValues(kind),
    );
    const [fieldErrors, setFieldErrors] = useState<TransactionFieldErrors>({});

    const updateField = useCallback(
        <K extends keyof TransactionFormValues>(
            field: K,
            value: TransactionFormValues[K],
        ) => {
            setFormValues((current) => ({
                ...current,
                [field]: value,
            }));

            setFieldErrors((current) => ({
                ...current,
                [field]: undefined,
                form: undefined,
            }));
        },
        [],
    );

    const validate = useCallback((): boolean => {
        const localErrors = validateTransactionValues(kind, formValues);

        if (Object.keys(localErrors).length > 0) {
            setFieldErrors(localErrors);
            return false;
        }

        setFieldErrors({});
        return true;
    }, [kind, formValues]);

    const reset = useCallback(() => {
        setFormValues(getDefaultTransactionValues(kind));
        setFieldErrors({});
    }, [kind]);

    const setErrors = useCallback((errors: TransactionFieldErrors) => {
        setFieldErrors(errors);
    }, []);

    return {
        formValues,
        fieldErrors,
        updateField,
        validate,
        reset,
        setErrors,
    };
}
