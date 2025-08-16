// app/coop-timer/hooks/use-coop-timer.ts
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CoopEvent, CoopProgress, EventStatus, ScenarioType, EventGroup, EventCategory } from "@/types/coop-timer";
import { ResetCalculator } from "../lib/timer-calculations";
import { useTimerStorage, COOP_TIMER_STORAGE_KEY } from "./use-timer-storage";
import { useTimerInterval } from "./use-timer-interval";
import { useBroadcastSync } from "./use-broadcast-sync";
import { dataLoader } from "../lib/data-loader";

/**
 * 스마트 폴링 시스템 - 가장 가까운 리셋까지의 시간에 따라 동적 조정
 */
const POLLING_CONFIG = {
  // 개발 모드: 테스트를 위한 빠른 폴링
  DEVELOPMENT: {
    DEFAULT: 5_000,      // 5초 - 테스트용
    NEAR_RESET: 1_000,   // 1초 - 리셋 1분 전
    TEST_MODE: 1_000     // 1초 - test 카테고리 이벤트용
  },
  
  // 프로덕션 모드: 효율적인 폴링
  PRODUCTION: {
    DEFAULT: 60_000,     // 1분 - 일반적인 경우
    NEAR_RESET: 10_000,  // 10초 - 리셋 5분 전
    HOURLY: 30_000,      // 30초 - 시간별 이벤트
    DAILY: 300_000,      // 5분 - 일간 이벤트  
    WEEKLY: 600_000,     // 10분 - 주간 이벤트
    TEST_MODE: 5_000     // 5초 - 테스트 이벤트용
  }
} as const;

// 현재 환경 감지
const isDevelopment = process.env.NODE_ENV === 'development';
const CURRENT_CONFIG = isDevelopment ? POLLING_CONFIG.DEVELOPMENT : POLLING_CONFIG.PRODUCTION;

type ExtendedEventStatus = EventStatus & {
  lastResetAt?: Date | null;
};

/**
 * 스마트 폴링 간격 계산
 */
function calculateOptimalPollingInterval(events: CoopEvent[]): number {
  if (events.length === 0) return CURRENT_CONFIG.DEFAULT;
  
  let shortestInterval: number = CURRENT_CONFIG.DEFAULT;
  let hasTestEvents = false;
  
  const now = new Date();
  
  for (const event of events) {
    // 테스트 이벤트가 있으면 테스트 모드 활성화
    if (event.category === EventCategory.TEST) {
      hasTestEvents = true;
      continue;
    }
    
    try {
      const nextReset = ResetCalculator.getNextResetTime(event.resetConfig);
      const timeToReset = nextReset.getTime() - now.getTime();
      
      // 리셋이 가까우면 더 자주 체크
      if (timeToReset <= 5 * 60 * 1000) { // 5분 이내
        shortestInterval = Math.min(shortestInterval, CURRENT_CONFIG.NEAR_RESET);
      } else {
        // 카테고리별 최적화된 간격
        const categoryInterval = getCategoryPollingInterval(event.category);
        shortestInterval = Math.min(shortestInterval, categoryInterval);
      }
    } catch (error) {
      console.warn(`Failed to calculate reset time for event ${event.id}:`, error);
    }
  }
  
  // 테스트 이벤트가 있으면 테스트 모드 간격 사용
  if (hasTestEvents) {
    return Math.min(shortestInterval, CURRENT_CONFIG.TEST_MODE);
  }
  
  return shortestInterval;
}

/**
 * 카테고리별 폴링 간격 반환
 */
function getCategoryPollingInterval(category: EventCategory): number {
  if (isDevelopment) {
    return CURRENT_CONFIG.DEFAULT; // 개발 모드에서는 모두 동일
  }
  
  // 프로덕션 모드에서만 세분화된 간격 사용
  const prodConfig = POLLING_CONFIG.PRODUCTION;
  
  switch (category) {
    case EventCategory.HOURLY:
      return prodConfig.HOURLY;
    case EventCategory.DAILY:
      return prodConfig.DAILY;
    case EventCategory.WEEKLY:
      return prodConfig.WEEKLY;
    case EventCategory.TEST:
      return prodConfig.TEST_MODE;
    default:
      return prodConfig.DEFAULT;
  }
}

export function useCoopTimer(scenario?: ScenarioType) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CoopEvent[]>([]);

  // 시나리오별 이벤트 로딩
  useEffect(() => {
    if (!scenario) {
      setLoading(false);
      return;
    }

    const loadScenarioData = async () => {
      try {
        setLoading(true);
        const scenarioEvents = await dataLoader.getScenarioEvents(scenario);
        setEvents(scenarioEvents);
      } catch (error) {
        console.error('Failed to load scenario data:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadScenarioData();
  }, [scenario]);

  // 카테고리별 이벤트 분리
  const weeklyQuests = useMemo(() => 
    events.filter(e => e.category === EventCategory.WEEKLY), 
    [events]
  );
  
  const coopEvents = useMemo(() => 
    events.filter(e => e.category !== EventCategory.WEEKLY), 
    [events]
  );
  
  const eventsById = useMemo(() => {
    const m = new Map<string, CoopEvent>();
    events.forEach((e) => m.set(e.id, e));
    return m;
  }, [events]);

  // 이벤트 그룹핑 (카테고리별)
  const eventGroups = useMemo((): EventGroup[] => {
    const groups: EventGroup[] = [];
    
    // 주간 퀘스트
    if (weeklyQuests.length > 0) {
      groups.push({
        title: "주간 퀘스트",
        category: EventCategory.WEEKLY,
        events: weeklyQuests
      });
    }
    
    // 시간별 이벤트
    const hourlyEvents = events.filter(e => e.category === EventCategory.HOURLY);
    if (hourlyEvents.length > 0) {
      groups.push({
        title: "시간별 이벤트",
        category: EventCategory.HOURLY,
        events: hourlyEvents
      });
    }
    
    // 일간 이벤트
    const dailyEvents = events.filter(e => e.category === EventCategory.DAILY);
    if (dailyEvents.length > 0) {
      groups.push({
        title: "일간 이벤트",
        category: EventCategory.DAILY,
        events: dailyEvents
      });
    }
    
    // 테스트 이벤트
    const testEvents = events.filter(e => e.category === EventCategory.TEST);
    if (testEvents.length > 0) {
      groups.push({
        title: "테스트 이벤트",
        category: EventCategory.TEST,
        events: testEvents
      });
    }
    
    return groups;
  }, [events, weeklyQuests]);

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

  // 동적 폴링 간격 계산
  const optimalPollingInterval = useMemo(() => {
    const interval = calculateOptimalPollingInterval(events);
    
    // 개발 모드에서 폴링 간격 로깅
    if (isDevelopment && events.length > 0) {
      console.log(`[Smart Polling] Calculated interval: ${interval}ms (${interval/1000}s) for ${events.length} events`);
      const testEvents = events.filter(e => e.category === EventCategory.TEST);
      if (testEvents.length > 0) {
        console.log(`[Smart Polling] Test events detected: ${testEvents.map(e => e.name).join(', ')}`);
      }
    }
    
    return interval;
  }, [events]);

  // Timer interval management with dynamic polling
  useTimerInterval({
    enabled: true,
    intervalMs: optimalPollingInterval,
    onTick: runResetCheck,
    immediate: true
  });

  // Tab synchronization
  const { broadcast } = useBroadcastSync({
    onMessage: (data) => {
      if (data === "progress-updated") {
        // \ub2e4\ub978 \ud0ed\uc5d0\uc11c \uc5c5\ub370\uc774\ud2b8\uac00 \uc788\uc744 \ub54c localStorage\uc5d0\uc11c \ub85c\ub4dc
        const freshProgress = loadProgress() || {};
        setProgress(freshProgress);
        setCurrentTime(Date.now());
      }
    }
  });

  // Storage events for cross-tab synchronization
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === COOP_TIMER_STORAGE_KEY) {
        // localStorage \ubcc0\uacbd \uc2dc \uc989\uc2dc \ub370\uc774\ud130 \ub9ac\ub85c\ub4dc
        const freshProgress = loadProgress() || {};
        setProgress(freshProgress);
        setCurrentTime(Date.now());
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, [loadProgress]);

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

      const next = {
        ...current,
        [key]: {
          ...existing,
          isCompleted: false,
          completedAt: 0,
          completionCount: nextCount,
        },
      };

      // Broadcast update to other tabs
      broadcast("progress-updated");

      return next;
    });
  }, [broadcast]);

  // getEventStatus (returns ExtendedEventStatus with optional lastResetAt)
  const getEventStatus = useCallback((characterId: string, eventId: string): ExtendedEventStatus => {
    const key = `${characterId}-${eventId}`;
    // 최신 progress 상태를 직접 참조
    const currentProgress = progress;
    const prog = currentProgress[key];
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
    const canComplete = true; // 더 이상 maxCompletions 제한 없음

    return {
      completed: true,
      timeLeft,
      lastCompleted: completedTime,
      nextReset,
      canComplete,
      lastResetAt: prog?.lastResetAt ? new Date(prog.lastResetAt) : null,
    };
  }, [progress, eventsById]);

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

    for (const event of events) {
      const key = `${characterId}-${event.id}`;
      const prog = progress[key];
      if (!prog || !prog.isCompleted || !prog.completedAt) continue;
      stats.completedEvents++;
      const last = new Date(prog.completedAt);
      if (last >= today) stats.completedToday++;
      if (last >= thisWeek) stats.completedThisWeek++;
    }

    return stats;
  }, [events, progress]);

  return {
    loading,
    events,
    weeklyQuests,
    coopEvents,
    eventGroups,
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
