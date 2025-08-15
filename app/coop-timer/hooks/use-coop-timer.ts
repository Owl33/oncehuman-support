// app/coop-timer/hooks/use-coop-timer.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { CoopEvent, CoopProgress, EventStatus } from "@/types/coop-timer";
import { BaseCharacter } from "@/types/character";
import { ResetCalculator } from "../lib/timer-calculations";
import { useTimerStorage } from "./use-timer-storage";
import eventsData from "../data/coop-events.json";

export function useCoopTimer() {
  const [events] = useState<CoopEvent[]>(eventsData.events as CoopEvent[]);
  const [progress, setProgress] = useState<Record<string, CoopProgress>>({});
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  const { saveProgress, loadProgress } = useTimerStorage();

  // 초기 데이터 로드
  useEffect(() => {
    const loadedProgress = loadProgress();
    setProgress(loadedProgress);
  }, [loadProgress]);

  // 진행상황 자동 저장
  useEffect(() => {
    saveProgress(progress);
  }, [progress, saveProgress]);

  // 1분마다 시간 업데이트 및 자동 리셋 체크
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      
      // 만료된 진행상황 자동 리셋
      setProgress(currentProgress => {
        const cleanedProgress = { ...currentProgress };
        let hasChanges = false;

        for (const [key, prog] of Object.entries(cleanedProgress)) {
          const event = events.find(e => key.endsWith(`-${e.id}`));
          if (event && ResetCalculator.shouldResetProgress(prog, event.resetConfig)) {
            cleanedProgress[key] = {
              ...prog,
              isCompleted: false,
              completedAt: 0,
              completionCount: 0
            };
            hasChanges = true;
          }
        }

        return hasChanges ? cleanedProgress : currentProgress;
      });
    }, 60000); // 1분마다

    return () => clearInterval(interval);
  }, [events]);

  // 이벤트 완료 처리
  const completeEvent = useCallback((characterId: string, eventId: string) => {
    const key = `${characterId}-${eventId}`;
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    setProgress(current => {
      const existing = current[key];
      const completionCount = (existing?.completionCount || 0) + 1;

      return {
        ...current,
        [key]: {
          characterId,
          eventId,
          completedAt: Date.now(),
          isCompleted: true,
          completionCount
        }
      };
    });
  }, [events]);

  // 이벤트 완료 취소
  const uncompleteEvent = useCallback((characterId: string, eventId: string) => {
    const key = `${characterId}-${eventId}`;
    
    setProgress(current => ({
      ...current,
      [key]: {
        ...current[key],
        isCompleted: false,
        completedAt: 0,
        completionCount: Math.max(0, (current[key]?.completionCount || 1) - 1)
      }
    }));
  }, []);

  // 이벤트 상태 확인
  const getEventStatus = useCallback((characterId: string, eventId: string): EventStatus => {
    const key = `${characterId}-${eventId}`;
    const prog = progress[key];
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return { 
        completed: false, 
        timeLeft: 0, 
        lastCompleted: null, 
        nextReset: new Date(),
        canComplete: false
      };
    }

    const nextReset = ResetCalculator.getNextResetTime(event.resetConfig);
    
    if (!prog || !prog.isCompleted) {
      return { 
        completed: false, 
        timeLeft: 0, 
        lastCompleted: null, 
        nextReset,
        canComplete: true
      };
    }

    const completedTime = new Date(prog.completedAt);
    const shouldReset = ResetCalculator.shouldResetProgress(prog, event.resetConfig);
    
    if (shouldReset) {
      return { 
        completed: false, 
        timeLeft: 0, 
        lastCompleted: null, 
        nextReset,
        canComplete: true
      };
    }

    const timeLeft = nextReset.getTime() - currentTime;
    const canComplete = event.maxCompletions ? 
      (prog.completionCount || 1) < event.maxCompletions : false;

    return {
      completed: true,
      timeLeft: Math.max(0, timeLeft),
      lastCompleted: completedTime,
      nextReset,
      canComplete
    };
  }, [progress, events, currentTime]);

  // 카테고리별 이벤트 그룹핑
  const eventsByCategory = useMemo(() => {
    const grouped = events.reduce((acc, event) => {
      if (!acc[event.category]) {
        acc[event.category] = [];
      }
      acc[event.category].push(event);
      return acc;
    }, {} as Record<string, CoopEvent[]>);

    return grouped;
  }, [events]);

  // 캐릭터별 완료 통계
  const getCharacterStats = useCallback((characterId: string) => {
    const stats = {
      totalEvents: events.length,
      completedEvents: 0,
      completedToday: 0,
      completedThisWeek: 0
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    thisWeek.setHours(0, 0, 0, 0);

    events.forEach(event => {
      const status = getEventStatus(characterId, event.id);
      if (status.completed) {
        stats.completedEvents++;
      }
      
      if (status.lastCompleted) {
        if (status.lastCompleted >= today) {
          stats.completedToday++;
        }
        if (status.lastCompleted >= thisWeek) {
          stats.completedThisWeek++;
        }
      }
    });

    return stats;
  }, [events, getEventStatus]);

  return {
    // 데이터
    events,
    progress,
    selectedCharacters,
    eventsByCategory,
    currentTime,
    
    // 액션
    setSelectedCharacters,
    completeEvent,
    uncompleteEvent,
    
    // 유틸리티
    getEventStatus,
    getCharacterStats
  };
}