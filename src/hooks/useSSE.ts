/**
 * useSSE Hook
 *
 * Manages Server-Sent Events (SSE) connections for real-time extraction job updates.
 * Provides automatic reconnection, error handling, and cleanup.
 *
 * @example
 * const { data, error, isConnected } = useSSE<ExtractionJob>({
 *   url: `${API_URL}/extraction/jobs/${jobId}/stream`,
 *   token: authToken,
 *   onMessage: (data) => console.log('Update:', data),
 *   onComplete: (data) => console.log('Job complete:', data)
 * });
 */

import { useState, useEffect, useRef, useCallback } from "react";
import RNEventSource from "react-native-sse";

export interface SSEConfig<T> {
  url: string;
  token?: string;
  onMessage?: (data: T) => void;
  onComplete?: (data: T) => void;
  onError?: (error: Error) => void;
  shouldReconnect?: (error: Error) => boolean;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export interface SSEState<T> {
  data: T | null;
  error: Error | null;
  isConnected: boolean;
  reconnectAttempt: number;
}

/**
 * Hook for managing Server-Sent Events connections
 */
export function useSSE<T = any>(config: SSEConfig<T>): SSEState<T> {
  const {
    url,
    token,
    onMessage,
    onComplete,
    onError,
    shouldReconnect = () => true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 5,
  } = config;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const eventSourceRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUnmountedRef = useRef(false);
  const isCompletedRef = useRef(false); // Track if already completed

  // Use refs for callbacks to prevent recreating connect function on every render
  const onMessageRef = useRef(onMessage);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);
  const shouldReconnectRef = useRef(shouldReconnect);

  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
    shouldReconnectRef.current = shouldReconnect;
  }, [onMessage, onComplete, onError, shouldReconnect]);

  const cleanup = useCallback(() => {
    console.log("[SSE] 🧹 Cleanup called");
    if (eventSourceRef.current) {
      console.log("[SSE] Closing existing connection");
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      console.log("[SSE] Clearing reconnect timeout");
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (isUnmountedRef.current) return;
    if (isCompletedRef.current) {
      console.log("[SSE] ⛔ Already completed, skipping reconnection");
      return;
    }
    if (eventSourceRef.current) {
      console.log("[SSE] ⛔ Already connected, skipping reconnection");
      return;
    }

    try {
      cleanup();

      console.log("[SSE] Connecting to:", url);
      console.log("[SSE] With auth token:", token ? "YES" : "NO");

      // Build URL with auth token as header (react-native-sse supports headers)
      const eventSource = new RNEventSource(url, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      }) as any; // Type assertion for react-native-sse

      console.log("[SSE] EventSource created, waiting for connection...");

      eventSource.onopen = (event: any) => {
        if (isUnmountedRef.current) return;
        console.log("[SSE] ✅ Connection opened successfully");
        console.log("[SSE] Open event:", event);
        setIsConnected(true);
        setError(null);
        setReconnectAttempt(0);
      };

      eventSource.onmessage = (event: any) => {
        if (isUnmountedRef.current) return;
        console.log("[SSE] 📨 Received message event");
        console.log("[SSE] Message data type:", typeof event.data);
        console.log("[SSE] Message data:", event.data);
        try {
          // react-native-sse might already parse JSON, check the type
          let parsedData: T;
          if (typeof event.data === "string") {
            console.log("[SSE] Parsing string data as JSON");
            parsedData = JSON.parse(event.data) as T;
          } else {
            console.log("[SSE] Using data as-is (already parsed)");
            parsedData = event.data as T;
          }
          console.log("[SSE] ✅ Parsed data:", parsedData);
          setData(parsedData);
          onMessageRef.current?.(parsedData);
        } catch (err) {
          console.error("[SSE] ❌ Failed to parse message:", err);
          console.error("[SSE] Raw event:", event);
        }
      };

      // Listen for custom event types
      eventSource.addEventListener("job_update", (event: any) => {
        if (isUnmountedRef.current) return;
        console.log("[SSE] 📨 Received job_update event");
        try {
          // react-native-sse might already parse JSON, check the type
          let parsedData: T;
          if (typeof event.data === "string") {
            parsedData = JSON.parse(event.data) as T;
          } else {
            parsedData = event.data as T;
          }

          // Log the actual progress data
          const jobData = parsedData as any;
          console.log(
            `[SSE] ✅ Update: ${jobData.progress_percentage}% - ${jobData.current_step} (status: ${jobData.status})`
          );

          setData(parsedData);
          onMessageRef.current?.(parsedData);

          // Check if job is complete
          if (jobData.status === "completed" || jobData.status === "failed") {
            console.log("[SSE] 🏁 Job complete, closing connection");
            isCompletedRef.current = true; // Mark as completed to prevent reconnections
            onCompleteRef.current?.(parsedData);
            cleanup();
          }
        } catch (err) {
          console.error("[SSE] ❌ Failed to parse job_update:", err);
          console.error("[SSE] Event data:", event.data);
          console.error("[SSE] Full event object:", event);
        }
      });

      eventSource.addEventListener("error", (event: any) => {
        if (isUnmountedRef.current) return;
        console.log("[SSE] ⚠️ Received error event");
        console.log("[SSE] Error event:", event);
        try {
          // Try to parse as JSON, but handle raw strings too
          let errorMessage = "SSE error event";
          if (event.data) {
            console.log("[SSE] Error has data:", event.data);
            try {
              const errorData = JSON.parse(event.data);
              errorMessage = errorData.message || errorMessage;
            } catch {
              // If not JSON, use the data directly
              errorMessage = String(event.data);
            }
          }
          const error = new Error(errorMessage);
          console.error("[SSE] ❌ Error event parsed:", errorMessage);
          setError(error);
          onErrorRef.current?.(error);
        } catch (err) {
          console.error("[SSE] ❌ Error handling error event:", err);
        }
      });

      eventSource.onerror = (event: any) => {
        if (isUnmountedRef.current) return;

        console.error("[SSE] ❌ Connection error (onerror)");
        console.error("[SSE] Error event:", event);
        console.error("[SSE] Error type:", event?.type);
        console.error("[SSE] Error message:", event?.message);
        console.error("[SSE] ReadyState:", (eventSource as any).readyState);

        const error = new Error("SSE connection error");
        setError(error);
        setIsConnected(false);
        onErrorRef.current?.(error);

        // Attempt reconnection if allowed
        if (shouldReconnectRef.current(error) && reconnectAttempt < maxReconnectAttempts) {
          const nextAttempt = reconnectAttempt + 1;
          setReconnectAttempt(nextAttempt);
          console.log(
            `[SSE] Reconnecting in ${reconnectDelay}ms (attempt ${nextAttempt}/${maxReconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            if (!isUnmountedRef.current) {
              connect();
            }
          }, reconnectDelay);
        } else {
          console.log("[SSE] Max reconnect attempts reached or reconnection disabled");
          cleanup();
        }
      };

      eventSourceRef.current = eventSource;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to create SSE connection");
      console.error("[SSE] Connection failed:", error);
      setError(error);
      onErrorRef.current?.(error);
    }
  }, [url, token, reconnectDelay, maxReconnectAttempts, reconnectAttempt, cleanup]);

  // Connect on mount and when URL/token changes
  useEffect(() => {
    // Don't connect if token is required but not available yet
    if (!token) {
      console.log("[SSE] ⏳ Waiting for auth token before connecting...");
      return;
    }

    isUnmountedRef.current = false;
    isCompletedRef.current = false;
    console.log("[SSE] 🔄 Effect triggered - connecting with token");
    connect();

    return () => {
      console.log("[SSE] 🔄 Effect cleanup - unmounting");
      isUnmountedRef.current = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, token]); // Only reconnect when URL or token changes

  return {
    data,
    error,
    isConnected,
    reconnectAttempt,
  };
}

/**
 * Check if SSE is supported in the current environment
 */
export function isSSESupported(): boolean {
  // react-native-sse is always available after import
  return typeof RNEventSource !== "undefined";
}
