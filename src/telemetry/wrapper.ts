import { captureError, logAction } from "./sentry";

/**
 * Wrap a function with telemetry tracking
 * Automatically logs the action and captures errors
 */
export function withTelemetry<T extends (...args: never[]) => unknown>(
  actionType: string,
  fn: T,
): T {
  function wrappedFunction(...args: Parameters<T>): ReturnType<T> {
    try {
      logAction(actionType);

      const result = fn(...args);

      // Handle async functions
      if (result && typeof (result as Promise<unknown>).then === "function") {
        return (result as Promise<unknown>).catch((error: unknown) => {
          captureError(
            error instanceof Error ? error : new Error(String(error)),
            {
              action: actionType,
            },
          );
          throw error;
        }) as ReturnType<T>;
      }

      return result as ReturnType<T>;
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        action: actionType,
      });
      throw error;
    }
  }
  return wrappedFunction as T;
}
