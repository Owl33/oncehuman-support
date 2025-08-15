// app/coop-timer/hooks/use-timer-storage.ts
"use client";

import { useCallback } from "react";
import { CoopProgress } from "@/types/coop-timer";

export const COOP_TIMER_STORAGE_KEY = "coop_timer_progress_v1";

export function useTimerStorage() {
  const saveProgress = useCallback((progress: Record<string, CoopProgress>) => {
    try {
      const raw = JSON.stringify(progress ?? {});
      localStorage.setItem(COOP_TIMER_STORAGE_KEY, raw);
    } catch (err) {
      console.error("Failed to save coop progress to localStorage", err);
    }
  }, []);

  const loadProgress = useCallback((): Record<string, CoopProgress> => {
    try {
      const raw = localStorage.getItem(COOP_TIMER_STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as Record<string, CoopProgress>;
    } catch (err) {
      console.error("Failed to load coop progress from localStorage", err);
      return {};
    }
  }, []);

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(COOP_TIMER_STORAGE_KEY);
      // 이전 버전들도 모두 삭제
      localStorage.removeItem("coop_timer_progress");
      localStorage.removeItem("coopTimerProgress");
      localStorage.removeItem("coop-timer-progress");
      localStorage.removeItem("timer_progress");
      
      // 혹시나 모르는 다른 키들도 확인
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('coop') || key.includes('timer')) {
          localStorage.removeItem(key);
          console.log(`Removed localStorage key: ${key}`);
        }
      });
      
      console.log("All coop timer data cleared from localStorage");
    } catch (err) {
      console.error("Failed to clear coop progress from localStorage", err);
    }
  }, []);

  return { saveProgress, loadProgress, clearProgress };
}
