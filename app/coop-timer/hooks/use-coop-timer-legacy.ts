// app/coop-timer/hooks/use-coop-timer.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CoopEvent, CoopProgress, EventStatus, ScenarioType, EventGroup, EventCategory } from "@/types/coop-timer";
import { ResetCalculator } from "../lib/timer-calculations";
import { COOP_TIMER_STORAGE_KEY } from "./use-timer-storage";
import { useTimerInterval } from "./use-timer-interval";
import { dataLoader } from "../lib/data-loader";

// 단순화된 폴링 설정
const SIMPLE_POLLING_INTERVAL = process.env.NODE_ENV === 'development' ? 10_000 : 60_000; // 10초(개발) / 1분(프로덕션)

type ExtendedEventStatus = EventStatus & {
  lastResetAt?: Date | null;
};

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

  const [progress, setProgress] = useState<Record<string, CoopProgress>>(() => {
    // 초기 상태를 lazy initialization으로 설정
    try {
      const raw = localStorage.getItem(COOP_TIMER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.error("Failed to load coop progress from localStorage", error);
      return {};
    }
  });
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // auto save when progress changes - 의존성 문제 해결
  useEffect(() => {
    try {
      const raw = JSON.stringify(progress ?? {});
      localStorage.setItem(COOP_TIMER_STORAGE_KEY, raw);
    } catch (error) {
      console.error("Failed to save coop progress to localStorage", error);
    }
  }, [progress]); // saveProgress 의존성 제거

  // Reset check logic (순환 의존성 해결)
  const runResetCheck = useCallback(() => {
    setCurrentTime(Date.now());

    setProgress(prev => {
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

      return changed ? cleaned : prev; // 변경사항이 있을 때만 새 객체 반환
    });
  }, [eventsById]); // progress 의존성 제거

  // 단순화된 폴링 간격 (복잡한 계산 제거)
  const pollingInterval = SIMPLE_POLLING_INTERVAL;

  // Timer interval management (단순화됨)
  useTimerInterval({
    enabled: true,
    intervalMs: pollingInterval,
    onTick: runResetCheck,
    immediate: true
  });

  // Storage events for cross-tab synchronization (단순화)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === COOP_TIMER_STORAGE_KEY) {
        // localStorage 변경 시 즉시 데이터 리로드
        try {
          const raw = localStorage.getItem(COOP_TIMER_STORAGE_KEY);
          const freshProgress = raw ? JSON.parse(raw) : {};
          setProgress(freshProgress);
          setCurrentTime(Date.now());
        } catch (error) {
          console.error("Failed to load progress from storage event", error);
        }
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []); // 의존성 제거

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

      return next;
    });
  }, [eventsById]); // broadcast 의존성 제거

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

      return next;
    });
  }, []); // broadcast 의존성 제거

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
