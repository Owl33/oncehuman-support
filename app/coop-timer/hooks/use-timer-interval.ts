// app/coop-timer/hooks/use-timer-interval.ts
"use client";

import { useEffect, useRef } from "react";

interface UseTimerIntervalOptions {
  enabled: boolean;
  intervalMs: number;
  onTick: () => void;
  immediate?: boolean;
}

/**
 * 타이머 간격 관리를 위한 커스텀 훅
 * setInterval 생성/해제와 visibility/storage 이벤트 처리를 통합 관리
 */
export function useTimerInterval({
  enabled,
  intervalMs,
  onTick,
  immediate = true
}: UseTimerIntervalOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(onTick);

  // Keep callback ref current
  useEffect(() => {
    callbackRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Immediate execution if requested
    if (immediate) {
      callbackRef.current();
    }

    // Setup interval
    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, intervalMs);

    // Visibility change handler
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        callbackRef.current();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, intervalMs, immediate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
}