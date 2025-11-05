import * as Sentry from "@sentry/node";

let isInitialized = false;

/**
 * Initialize Sentry telemetry
 *
 * Automatically captures:
 * - All uncaught exceptions
 * - All unhandled promise rejections
 * - Errors with full stack traces and context
 *
 * @param dsn - Sentry DSN (optional, can be set via SENTRY_DSN env var or passed directly)
 * @param environment - Environment name (optional, defaults to 'production')
 */
export function initTelemetry(dsn?: string, environment?: string): void {
  if (isInitialized) {
    return;
  }

  const sentryDsn = dsn || process.env.SENTRY_DSN;

  if (!sentryDsn) {
    // Silently fail if no DSN is provided - telemetry is optional
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      return event;
    },
  });

  isInitialized = true;
}

/**
 * Track an action being used (simple usage tracking)
 * @param actionType - Type of action (e.g., 'vaultV2Deposit', 'vaultV2Withdraw')
 */
export function trackAction(actionType: string): void {
  if (!isInitialized) {
    initTelemetry();
    return;
  }

  Sentry.addBreadcrumb({
    category: "action",
    message: `Action used: ${actionType}`,
    level: "info",
  });
}
