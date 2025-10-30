/**
 * Polling hook for periodic API requests
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
}

export function usePolling<T>({
  fn,
  shouldStopPolling,
  interval = 2000,
  enabled = true,
  onComplete,
  onError,
}: UsePollingOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const poll = async () => {
    try {
      const result = await fn();
      setData(result);

      if (shouldStopPolling(result)) {
        setIsPolling(false);
        onComplete?.(result);
      } else {
        // Schedule next poll
        timeoutRef.current = setTimeout(poll, interval);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsPolling(false);
      onError?.(error);
    }
  };

  const startPolling = () => {
    setIsPolling(true);
    setError(null);
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
