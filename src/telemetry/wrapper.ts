import { captureError, logAction } from "./sentry";

/**
 * Wrap a function with telemetry tracking
 * Automatically logs the action and captures errors
 */
export function withTelemetry<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
) {
  return function wrappedFunction(...args: TArgs): TResult {
    try {
      logAction(fn.name);

      const result = fn(...args);

      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error: unknown) => {
          captureError(
            error instanceof Error ? error : new Error(String(error)),
            {
              action: fn.name,
            },
          );
          throw error;
        }) as TResult;
      }

      return result;
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        action: fn.name,
      });
      throw error;
    }
  };
}
