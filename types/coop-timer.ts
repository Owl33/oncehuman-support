// types/coop-timer.ts

// 리셋 주기 타입
export enum ResetType {
  HOURLY = "hourly",
  DAILY = "daily", 
  WEEKLY = "weekly",
  CUSTOM = "custom"
}

// 요일 열거형
export enum WeekDay {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

// 이벤트 카테고리
export enum CoopEventCategory {
  MONOLITH = "monolith",
  PRISM_DEVIATION = "prism",
  TERRITORY_PURIFICATION = "territory",
  DAILY_MISSION = "daily",
  WEEKLY_RAID = "weekly"
}

// 리셋 설정
export interface ResetConfig {
  type: ResetType;
  interval?: number;
  resetDay?: WeekDay;
  resetHour?: number;
  resetMinute?: number;
}

// 협동 이벤트
export interface CoopEvent {
  id: string;
  name: string;
  description: string;
  category: CoopEventCategory;
  resetConfig: ResetConfig;
  rewards: string[];
  difficulty?: "쉬움" | "보통" | "어려움";
  participants?: number;
  maxCompletions?: number;
  icon?: string;
}

// 진행상황
export interface CoopProgress {
  lastResetAt?: number; // ms timestamp, unified type
  characterId: string;
  eventId: string;
  completedAt: number;
  isCompleted: boolean;
  completionCount?: number;
  lastCompletedAt?: number; // 이전 완료시간 (리셋되기 전 마지막 완료시간)
}

// 이벤트 상태
export interface EventStatus {
  completed: boolean;
  timeLeft: number;
  lastCompleted: Date | null;
  nextReset: Date;
  canComplete: boolean;
}

// 저장소 타입
export interface CoopTimerStorage {
  version: string;
  progress: Record<string, CoopProgress>;
  lastUpdated: number;
}