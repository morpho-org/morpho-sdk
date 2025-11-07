import { captureError, logAction } from "./sentry";

// It's weird to use the naming "Action" everywhere while these are generic functions that are wrapping other functions

/**
 * Wrap a function with telemetry tracking
 * Automatically logs the action and captures errors
 */
// the typing is not clean here, type args and results instead
export function withTelemetry<TArgs extends any[], TResult>(
  actionType: string,// I wouldn't require anything here, I would use the function name instead with `fn.name`
  fn: (...args: TArgs) => TResult,
) {
 return  function wrappedFunction(...args: TArgs): TResult {
    try {
      logAction(actionType);

      const result = fn(...args);

      // Handle async functions
      if (result instanceof Promise) { // check for result instanceof Promise is cleaner and type safe
        return (result).catch((error: unknown) => {
          captureError(
            error instanceof Error ? error : new Error(String(error)),
            {
              action: actionType,
            },
          );
          throw error;
        }) as TResult;
      }

      return result;
    } catch (error) {
      captureError(error instanceof Error ? error : new Error(String(error)), {
        action: actionType,
      });
      throw error;
    }
  }
}

