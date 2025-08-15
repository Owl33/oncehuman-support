// app/coop-timer/hooks/use-broadcast-sync.ts
"use client";

import { useEffect, useRef } from "react";

const CHANNEL_NAME = "coop-timer";

interface UseBroadcastSyncOptions {
  onMessage: (data: any) => void;
  enabled?: boolean;
}

/**
 * BroadcastChannel을 이용한 탭 간 동기화 관리
 * 메모리 누수 방지와 에러 핸들링 개선
 */
export function useBroadcastSync({ onMessage, enabled = true }: UseBroadcastSyncOptions) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const callbackRef = useRef(onMessage);

  // Keep callback ref current
  useEffect(() => {
    callbackRef.current = onMessage;
  }, [onMessage]);

  // Setup BroadcastChannel
  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }

    try {
      channelRef.current = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current.onmessage = (event) => {
        callbackRef.current(event.data);
      };
    } catch (error) {
      console.warn("Failed to create BroadcastChannel:", error);
    }

    return () => {
      if (channelRef.current) {
        try {
          channelRef.current.close();
        } catch (error) {
          console.warn("Failed to close BroadcastChannel:", error);
        }
        channelRef.current = null;
      }
    };
  }, [enabled]);

  /**
   * 다른 탭으로 메시지 브로드캐스트
   */
  const broadcast = (data: any) => {
    if (!enabled || typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }

    try {
      // Create temporary channel for one-time message
      const tempChannel = new BroadcastChannel(CHANNEL_NAME);
      tempChannel.postMessage(data);
      tempChannel.close();
    } catch (error) {
      console.warn("Failed to broadcast message:", error);
    }
  };

  return { broadcast };
}