import * as Sentry from "@sentry/node";
import packageJson from "../../package.json";

export interface TelemetryConfig {
  enabled?: boolean;
}

const SENTRY_DSN =
  "https://30a03395117af1c9e2081896438baff1@o1173271.ingest.us.sentry.io/4510312645525505";
let isInitialized = false;

/**
 * Initialize Sentry telemetry
 */
export function initTelemetry(): void {
  if (isInitialized) {
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
  });

  isInitialized = true;
}

/**
 * Capture an error and send it to Sentry
 * @param error - The error to capture
 * @param context - Additional context data
 */
export function captureError(
  error: Error,
  context?: Record<string, unknown>
): void {
  if (!isInitialized) {
    initTelemetry();
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, { value });
      });
    }
    scope.setTag("version", packageJson.version);
    Sentry.captureException(error);
  });
}

/**
 * Log an action usage to Sentry
 * @param actionType - Type of action being used
 * @param metadata - Additional metadata about the action
 */
export function logAction(actionType: string): void {
  if (!isInitialized) {
    initTelemetry();
    return;
  }

  Sentry.addBreadcrumb({
    category: "action",
    message: `Action: ${actionType}`,
    level: "info",
  });
}
