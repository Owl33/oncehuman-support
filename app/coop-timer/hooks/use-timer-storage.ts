// app/coop-timer/hooks/use-timer-storage.ts
"use client";

import { useCallback } from "react";
import { CoopTimerStorage, CoopProgress } from "@/types/coop-timer";

export function useTimerStorage() {
  const STORAGE_KEY = 'oncehuman-coop-timer';
  const VERSION = '1.0.0';

  const saveProgress = useCallback((progress: Record<string, CoopProgress>) => {
    const storage: CoopTimerStorage = {
      version: VERSION,
      progress,
      lastUpdated: Date.now()
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
    } catch (error) {
      console.error('협동 타이머 저장 실패:', error);
    }
  }, []);

  const loadProgress = useCallback((): Record<string, CoopProgress> => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return {};

      const storage: CoopTimerStorage = JSON.parse(stored);

      // 버전 체크
      if (storage.version !== VERSION) {
        localStorage.removeItem(STORAGE_KEY);
        return {};
      }

      return storage.progress || {};
    } catch (error) {
      console.error('협동 타이머 로드 실패:', error);
      return {};
    }
  }, []);

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('협동 타이머 삭제 실패:', error);
    }
  }, []);

  return { 
    saveProgress, 
    loadProgress, 
    clearProgress 
  };
}