/**
 * TransactionFormStage.tsx
 *
 * Form input stage for transaction flow.
 * Handles amount and wallet address input with validation.
 */

import { formatCurrency } from "@/lib/formatters";
import {
  TransactionFormValues,
  TransactionKind,
  getTransactionContext,
} from "@/lib/transactions";
import styles from "../transaction-flow.module.css";
import {
  getInputStateClassName,
  sanitizeAmount,
} from "../utils/transaction-utils";
import type { TransactionFieldErrors } from "@/lib/transactions";

interface TransactionFormStageProps {
  kind: TransactionKind;
  formValues: TransactionFormValues;
  fieldErrors: TransactionFieldErrors;
  isSubmitting: boolean;
  requestMessage: string | null;
  onFieldChange: <K extends keyof TransactionFormValues>(
    field: K,
    value: TransactionFormValues[K],
  ) => void;
  onMaxAmount: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function TransactionFormStage({
  kind,
  formValues,
  fieldErrors,
  isSubmitting,
  requestMessage,
  onFieldChange,
  onMaxAmount,
  onSubmit,
}: TransactionFormStageProps) {
  const context = getTransactionContext(kind);

  const amountInputClassName = [
    styles.input,
    getInputStateClassName(
      formValues.amount,
      fieldErrors.amount,
      Boolean(formValues.amount) && !fieldErrors.amount,
    ),
  ].join(" ");

  const walletInputClassName = [
    styles.input,
    getInputStateClassName(
      formValues.walletAddress,
      fieldErrors.walletAddress,
      kind === "withdrawal" &&
        Boolean(formValues.walletAddress) &&
        !fieldErrors.walletAddress,
    ),
  ].join(" ");

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label className={styles.fieldLabel} htmlFor="amount">
            {context.amountLabel}
          </label>
          <span className={styles.fieldHint}>
            Available {formatCurrency(context.availableAmount)}
          </span>
        </div>

        <div className={styles.amountRow}>
          <input
            className={amountInputClassName}
            id="amount"
            inputMode="decimal"
            onChange={(event) =>
              onFieldChange("amount", sanitizeAmount(event.target.value))
            }
            placeholder="0.00"
            value={formValues.amount}
          />
          <button
            className={styles.inlineButton}
            onClick={onMaxAmount}
            type="button"
          >
            Max
          </button>
        </div>

        <p className={styles.supportingCopy}>{context.amountHint}</p>
        {fieldErrors.amount ? (
          <p className={`${styles.fieldMessage} ${styles.errorMessage}`}>
            {fieldErrors.amount}
          </p>
        ) : formValues.amount ? (
          <p className={`${styles.fieldMessage} ${styles.successMessage}`}>
            Amount looks valid for the next confirmation step.
          </p>
        ) : null}
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.labelRow}>
          <label className={styles.fieldLabel} htmlFor="wallet">
            {context.walletLabel}
          </label>
          <span className={styles.fieldHint}>{context.reviewLabel}</span>
        </div>

        {kind === "deposit" ? (
          <>
            <div className={styles.walletDisplay}>
              <div>
                <div className={styles.fieldLabel}>
                  {context.connectedWalletLabel}
                </div>
                <div className={styles.walletAddress}>
                  {context.connectedWalletAddress}
                </div>
              </div>
              <button
                className={styles.walletToggle}
                onClick={() =>
                  onFieldChange("walletConnected", !formValues.walletConnected)
                }
                type="button"
              >
                {formValues.walletConnected ? "Disconnect" : "Reconnect"}
              </button>
            </div>
            <p className={styles.supportingCopy}>{context.walletHint}</p>
            {fieldErrors.walletConnected ? (
              <p className={`${styles.fieldMessage} ${styles.errorMessage}`}>
                {fieldErrors.walletConnected}
              </p>
            ) : (
              <p className={`${styles.fieldMessage} ${styles.successMessage}`}>
                Deposit uses the connected funding wallet shown above.
              </p>
            )}
          </>
        ) : (
          <>
            <input
              className={walletInputClassName}
              id="wallet"
              onChange={(event) =>
                onFieldChange(
                  "walletAddress",
                  event.target.value.toUpperCase().trim(),
                )
              }
              placeholder="G..."
              value={formValues.walletAddress}
            />
            <div className={styles.connectRow}>
              <button
                className={styles.walletToggle}
                onClick={() =>
                  onFieldChange("walletConnected", !formValues.walletConnected)
                }
                type="button"
              >
                {formValues.walletConnected
                  ? "Disconnect vault"
                  : "Reconnect vault"}
              </button>
              <span className={styles.fieldHint}>{context.walletHint}</span>
            </div>
            {fieldErrors.walletAddress ? (
              <p className={`${styles.fieldMessage} ${styles.errorMessage}`}>
                {fieldErrors.walletAddress}
              </p>
            ) : (
              <p className={`${styles.fieldMessage} ${styles.successMessage}`}>
                Destination address passes the Stellar public key format check.
              </p>
            )}
            {fieldErrors.walletConnected ? (
              <p className={`${styles.fieldMessage} ${styles.errorMessage}`}>
                {fieldErrors.walletConnected}
              </p>
            ) : null}
          </>
        )}
      </div>

      {requestMessage ? (
        <p className={`${styles.fieldMessage} ${styles.warningMessage}`}>
          {requestMessage}
        </p>
      ) : null}

      <div className={styles.actionBar}>
        <div className={styles.actionMeta}>
          Primary action stays anchored at the bottom on mobile for longer
          forms.
        </div>
        <div className={styles.actionButtons}>
          <button
            className={`${styles.button} ${styles.buttonPrimary}`}
            disabled={isSubmitting}
            type="submit"
            data-qa="transaction-review-button"
          >
            {isSubmitting ? "Preparing..." : context.primaryActionLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
