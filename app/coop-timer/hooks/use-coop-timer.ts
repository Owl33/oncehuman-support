// app/coop-timer/hooks/use-coop-timer.ts
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CoopEvent, CoopProgress, EventStatus } from "@/types/coop-timer";
import { ResetCalculator } from "../lib/timer-calculations";
import { useTimerStorage, COOP_TIMER_STORAGE_KEY } from "./use-timer-storage";
import { useTimerInterval } from "./use-timer-interval";
import { useBroadcastSync } from "./use-broadcast-sync";
import eventsData from "../data/coop-events.json";

/**
 * 폴링 주기 (ms) — 테스트용: 30_000 (30초).
 * 초단위로 실시간 UI 확인하려면 1_000으로 낮출 수 있지만 배터리/성능 영향 있음.
 */
const POLL_INTERVAL_MS = 30_000;

type ExtendedEventStatus = EventStatus & {
  lastResetAt?: Date | null;
};

export function useCoopTimer() {
  const [events] = useState<CoopEvent[]>(eventsData.events as CoopEvent[]);
  const eventsById = useMemo(() => {
    const m = new Map<string, CoopEvent>();
    events.forEach((e) => m.set(e.id, e));
    return m;
  }, [events]);

  const [progress, setProgress] = useState<Record<string, CoopProgress>>({});
  const progressRef = useRef<Record<string, CoopProgress>>(progress);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  const { saveProgress, loadProgress } = useTimerStorage();

  // keep ref in sync so beforeunload and scheduled tasks see latest state
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Initial load
  useEffect(() => {
    const loaded = loadProgress() || {};
    setProgress(loaded);
    progressRef.current = loaded;
    setCurrentTime(Date.now());
  }, [loadProgress]);

  // auto save when progress changes (debounce could be added if needed)
  useEffect(() => {
    saveProgress(progress);
  }, [progress, saveProgress]);

  // Reset check logic
  const runResetCheck = useCallback(() => {
    setCurrentTime(Date.now());

    const prev = progressRef.current;
    let changed = false;
    const cleaned: Record<string, CoopProgress> = { ...prev };

    for (const [key, prog] of Object.entries(prev)) {
      // key format: `${characterId}-${eventId}`
      const parts = key.split("-");
      const eventId = parts[parts.length - 1];
      const event = eventsById.get(eventId);
      if (!event) continue;

      if (ResetCalculator.shouldResetProgress(prog, event.resetConfig)) {
        cleaned[key] = {
          ...prog,
          isCompleted: false,
          completedAt: 0,
          completionCount: 0,
          lastResetAt: Date.now(),
          // 이전 완료시간 보존
          lastCompletedAt: prog.completedAt > 0 ? prog.completedAt : prog.lastCompletedAt,
        };
        changed = true;
      }
    }

    if (changed) {
      setProgress(cleaned);
      // saveProgress will be triggered via progress effect
    }
  }, [eventsById]);

  // Timer interval management
  useTimerInterval({
    enabled: true,
    intervalMs: POLL_INTERVAL_MS,
    onTick: runResetCheck,
    immediate: true
  });

  // Tab synchronization
  const { broadcast } = useBroadcastSync({
    onMessage: (data) => {
      if (data === "progress-updated") {
        runResetCheck();
      }
    }
  });

  // Storage events and beforeunload
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === COOP_TIMER_STORAGE_KEY) {
        runResetCheck();
      }
    };
    window.addEventListener("storage", onStorage);

    const onBeforeUnload = () => {
      try {
        saveProgress(progressRef.current);
      } catch (error) {
        console.warn("Failed to save progress on beforeunload:", error);
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [runResetCheck, saveProgress]);

  // complete event
  const completeEvent = useCallback((characterId: string, eventId: string) => {
    const key = `${characterId}-${eventId}`;
    const event = eventsById.get(eventId);
    if (!event) return;

    setProgress((current) => {
      const existing = current[key];
      const completionCount = (existing?.completionCount || 0) + 1;

      const next: Record<string, CoopProgress> = {
        ...current,
        [key]: {
          characterId,
          eventId,
          completedAt: Date.now(),
          isCompleted: true,
          completionCount,
          // keep lastResetAt if present
          lastResetAt: existing?.lastResetAt,
          // 이전 완료시간은 현재 완료시간으로 업데이트하지 않고 기존 값 유지
          lastCompletedAt: existing?.lastCompletedAt,
        },
      };

      // Broadcast update to other tabs
      broadcast("progress-updated");

      return next;
    });
  }, [eventsById, broadcast]);

  // uncomplete event
  const uncompleteEvent = useCallback((characterId: string, eventId: string) => {
    const key = `${characterId}-${eventId}`;

    setProgress((current) => {
      const existing = current[key];
      if (!existing) return current; // 존재하지 않는 항목은 uncomplete 하지 않음
      
      const nextCount = Math.max(0, (existing?.completionCount || 1) - 1);

      return {
        ...current,
        [key]: {
          ...existing,
          isCompleted: false,
          completedAt: 0,
          completionCount: nextCount,
        },
      };
    });
  }, []);

  // getEventStatus (returns ExtendedEventStatus with optional lastResetAt)
  const getEventStatus = useCallback((characterId: string, eventId: string): ExtendedEventStatus => {
    const key = `${characterId}-${eventId}`;
    const prog = progressRef.current[key];
    const event = eventsById.get(eventId);

    if (!event) {
      return {
        completed: false,
        timeLeft: 0,
        lastCompleted: null,
        nextReset: new Date(),
        canComplete: false,
        lastResetAt: null,
      };
    }

    // nextReset: if completed -> compute from completion time, otherwise generic next reset
    let nextReset: Date;
    if (prog && prog.isCompleted && prog.completedAt) {
      nextReset = ResetCalculator.getNextResetTimeAfterCompletion(event.resetConfig, prog.completedAt);
    } else {
      nextReset = ResetCalculator.getNextResetTime(event.resetConfig);
    }

    // if not completed
    if (!prog || !prog.isCompleted) {
      return {
        completed: false,
        timeLeft: 0,
        lastCompleted: null,
        nextReset,
        canComplete: true,
        lastResetAt: prog?.lastResetAt ? new Date(prog.lastResetAt) : null,
      };
    }

    const completedTime = new Date(prog.completedAt);
    const shouldReset = ResetCalculator.shouldResetProgress(prog as CoopProgress, event.resetConfig);

    if (shouldReset) {
      return {
        completed: false,
        timeLeft: 0,
        lastCompleted: null,
        nextReset,
        canComplete: true,
        lastResetAt: prog?.lastResetAt ? new Date(prog.lastResetAt) : null,
      };
    }

    const timeLeft = Math.max(0, nextReset.getTime() - Date.now());
    const canComplete = event.maxCompletions ? (prog.completionCount || 0) < event.maxCompletions : true;

    return {
      completed: true,
      timeLeft,
      lastCompleted: completedTime,
      nextReset,
      canComplete,
      lastResetAt: prog?.lastResetAt ? new Date(prog.lastResetAt) : null,
    };
  }, [eventsById]);

  // events grouped by category
  const eventsByCategory = useMemo(() => {
    const grouped: Record<string, CoopEvent[]> = {};
    events.forEach((evt) => {
      if (!grouped[evt.category]) grouped[evt.category] = [];
      grouped[evt.category].push(evt);
    });
    return grouped;
  }, [events]);

  // character stats
  const getCharacterStats = useCallback((characterId: string) => {
    const stats = {
      totalEvents: events.length,
      completedEvents: 0,
      completedToday: 0,
      completedThisWeek: 0,
    };

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisWeek = new Date(); thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay()); thisWeek.setHours(0, 0, 0, 0);

    const p = progressRef.current;
    for (const event of events) {
      const key = `${characterId}-${event.id}`;
      const prog = p[key];
      if (!prog || !prog.isCompleted || !prog.completedAt) continue;
      stats.completedEvents++;
      const last = new Date(prog.completedAt);
      if (last >= today) stats.completedToday++;
      if (last >= thisWeek) stats.completedThisWeek++;
    }

    return stats;
  }, [events]);

  return {
    events,
    progress,
    selectedCharacters,
    eventsByCategory,
    currentTime,
    setSelectedCharacters,
    completeEvent,
    uncompleteEvent,
    getEventStatus,
    getCharacterStats,
  };
}
