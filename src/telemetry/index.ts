import * as Sentry from "@sentry/node";

let isInitialized = false;

/**
 * Initialize Sentry telemetry
 *
 * Note: Sentry DSNs are designed to be public and can be safely included in client-side code.
 * Only the DSN itself is needed - sensitive admin keys are separate.
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
    environment: environment || process.env.NODE_ENV || "production",
    tracesSampleRate: 0.1, // Sample 10% of transactions
    // Automatically capture unhandled errors
    // captureUnhandledRejections: true,
    // captureUncaughtExceptions: true,
    // Automatically enrich events with context
    beforeSend(event) {
      // Filter out sensitive data if needed
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
    return;
  }

  Sentry.addBreadcrumb({
    category: "action",
    message: `Action used: ${actionType}`,
    level: "info",
    data: {
      actionType,
    },
  });
}

/**
 * Set user context for telemetry
 * @param user - User information
 */
export function setUser(user: {
  address?: string;
  [key: string]: unknown;
}): void {
  if (!isInitialized) {
    return;
  }

  Sentry.setUser({
    id: user.address,
    ...user,
  });
}
