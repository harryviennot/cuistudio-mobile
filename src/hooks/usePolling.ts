/**
 * Polling hook for periodic API requests
 * Features retry logic and resilience to temporary errors
 */
import { useEffect, useRef, useState } from "react";

interface UsePollingOptions<T> {
  /**
   * Function to call on each poll
   */
  fn: () => Promise<T>;

  /**
   * Condition to determine when to stop polling
   */
  shouldStopPolling: (data: T) => boolean;

  /**
   * Interval in milliseconds (default: 2000ms)
   */
  interval?: number;

  /**
   * Whether polling is enabled (default: true)
   */
  enabled?: boolean;

  /**
   * Callback when polling completes
   */
  onComplete?: (data: T) => void;

  /**
   * Callback on error
   */
  onError?: (error: Error) => void;

  /**
   * Maximum number of consecutive errors before stopping (default: 5)
   * Set to 0 to never stop on errors
   */
  maxConsecutiveErrors?: number;

  /**
   * Delay after error before retrying (default: same as interval)
   */
  errorRetryDelay?: number;
}

export function usePolling<T>({
  fn,
  shouldStopPolling,
  interval = 2000,
  enabled = true,
  onComplete,
  onError,
  maxConsecutiveErrors = 5,
  errorRetryDelay,
}: UsePollingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const consecutiveErrorsRef = useRef<number>(0);

  const poll = async () => {
    try {
      const result = await fn();
      setData(result);
      setError(null);
      consecutiveErrorsRef.current = 0; // Reset error counter on success

      if (shouldStopPolling(result)) {
        setIsPolling(false);
        onComplete?.(result);
      } else {
        // Schedule next poll
        timeoutRef.current = setTimeout(poll, interval);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      consecutiveErrorsRef.current += 1;

      // Log error but continue polling (unless max errors reached)
      console.warn(
        `Polling error (attempt ${consecutiveErrorsRef.current}/${maxConsecutiveErrors || "∞"}):`,
        error.message
      );
      setError(error);
      onError?.(error);

      // Check if we should stop due to too many consecutive errors
      if (maxConsecutiveErrors > 0 && consecutiveErrorsRef.current >= maxConsecutiveErrors) {
        console.error(`Polling stopped after ${maxConsecutiveErrors} consecutive errors`);
        setIsPolling(false);
        return;
      }

      // Continue polling with retry delay
      const retryDelay = errorRetryDelay ?? interval;
      timeoutRef.current = setTimeout(poll, retryDelay);
    }
  };

  const startPolling = () => {
    setIsPolling(true);
    setError(null);
    consecutiveErrorsRef.current = 0; // Reset error counter when manually starting
    poll();
  };

  const stopPolling = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsPolling(false);
  };

  useEffect(() => {
    if (enabled) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    data,
    isPolling,
    error,
    startPolling,
    stopPolling,
  };
}
