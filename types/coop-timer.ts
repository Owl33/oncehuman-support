// types/coop-timer.ts


// 시나리오 타입
export enum ScenarioType {
  MANIBUS = "manibus",
  WAY_OF_WINTER = "way-of-winter", 
  ENDLESS_DREAM = "endless-dream",
  PRISM_WAR = "prism-war",
  EVOLUTION_CALL = "evolution-call"
}

// 이벤트 카테고리 (리셋 주기별 분류)
export enum EventCategory {
  HOURLY = "hourly",     // 1시간마다 리셋
  DAILY = "daily",       // 일 1회 리셋  
  WEEKLY = "weekly",     // 주 1회 리셋
  TEST = "test"          // 테스트용
}

// 리셋 설정 (단순화된 문자열 패턴)
export interface ResetConfig {
  reset: string; // "3600000" | "daily-00:00" | "weekly-wed-06:00" 등
}

// 이벤트 스코프 (범위)
export enum EventScope {
  COMMON = "common",     // 공통 이벤트 (같은 게임모드의 여러 시나리오에서 공유)
  EXCLUSIVE = "exclusive" // 전용 이벤트 (특정 시나리오에서만)
}

// 게임 모드
export enum GameMode {
  PVE = "pve",  // PvE 시나리오
  PVP = "pvp"   // PvP 시나리오
}

// 협동 이벤트
export interface CoopEvent {
  id: string;
  name: string;
  description: string;
  scenario: ScenarioType;  // 이벤트가 속한 원본 시나리오
  scope: EventScope;       // 공통/전용 여부
  gameMode: GameMode;      // PvE/PvP 구분
  category: EventCategory; // 시간별/일간/주간/테스트
  resetConfig: ResetConfig;
  rewards?: string[];
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

// 시나리오 정보 (단순화)
export interface Scenario {
  id: ScenarioType;
  name: string;
  description: string;
}

// 이벤트 데이터 구조
export interface EventData {
  events: Record<string, CoopEvent>;
}

// 이벤트 그룹 (UI에서 사용)
export interface EventGroup {
  title: string;
  category: EventCategory;
  events: CoopEvent[];
}