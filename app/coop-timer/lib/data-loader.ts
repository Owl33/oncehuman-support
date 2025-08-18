// app/coop-timer/lib/data-loader.ts
import {
  CoopEvent,
  EventData,
  ScenarioType,
  EventCategory,
  GameMode,
  EventScope,
} from "@/types/coop-timer";
import { getEventsForScenario, getAllScenarios } from "./scenarios";
import eventsData from "../data/events.json";

class CoopTimerDataLoader {
  private eventsCache: EventData | null = null;
  private flatEventsCache: Record<string, CoopEvent> | null = null;

  /**
   * 이벤트 데이터 로드
   */
  async loadEvents(): Promise<EventData> {
    if (this.eventsCache) {
      return this.eventsCache;
    }

    try {
      // 직접 import된 데이터 사용
      this.eventsCache = eventsData as EventData;
      return this.eventsCache;
    } catch (error) {
      console.error("Error loading events:", error);
      return { events: [] };
    }
  }

  /**
   * 배열을 ID 기반 객체로 변환
   */
  private async getFlatEvents(): Promise<Record<string, CoopEvent>> {
    if (this.flatEventsCache) {
      return this.flatEventsCache;
    }

    const eventsData = await this.loadEvents();
    const flatEvents: Record<string, CoopEvent> = {};

    eventsData.events.forEach((event) => {
      flatEvents[event.id] = event;
    });

    this.flatEventsCache = flatEvents;
    return flatEvents;
  }

  /**
   * 시나리오별 이벤트 데이터 조합 (공통 + 시나리오 전용) - 게임모드 고려
   */
  async getScenarioEvents(scenarioType: ScenarioType): Promise<CoopEvent[]> {
    const eventsData = await this.loadEvents();

    // scenarios.ts에서 시나리오의 게임모드 가져오기
    const { getScenarioGameMode } = await import("./scenarios");
    const scenarioGameMode = getScenarioGameMode(scenarioType);

    return eventsData.events.filter((event) => {
      // 1. 이벤트의 게임모드가 시나리오의 게임모드와 일치해야 함
      if (event.gameMode !== scenarioGameMode) {
        return false;
      }
      if (scenarioType == "endless-dream") {
        return event.scope === "common" || event.scenario === scenarioType;
      }
      // if(scenarioType == 'endells')
      // 2. 공통 이벤트이거나 해당 시나리오의 전용 이벤트인 경우
      return event.scenario === "common" || event.scenario === scenarioType;
    });
  }

  /**
   * 모든 이벤트 데이터 반환 (ID 기반) - 플래트한 구조로 변환
   */
  async getAllEvents(): Promise<Record<string, CoopEvent>> {
    return await this.getFlatEvents();
  }

  /**
   * 특정 이벤트 조회
   */
  async getEvent(eventId: string): Promise<CoopEvent | null> {
    const allEvents = await this.getFlatEvents();
    return allEvents[eventId] || null;
  }

  /**
   * 카테고리별 이벤트 조회
   */
  async getEventsByCategory(category: EventCategory): Promise<CoopEvent[]> {
    const eventsData = await this.loadEvents();
    return eventsData.events.filter((event) => event.category === category);
  }

  /**
   * 게임 모드별 이벤트 조회
   */
  async getEventsByGameMode(gameMode: GameMode): Promise<CoopEvent[]> {
    const eventsData = await this.loadEvents();
    return eventsData.events.filter((event) => event.gameMode === gameMode);
  }

  /**
   * 스코프별 이벤트 조회
   */
  async getEventsByScope(scope: EventScope): Promise<CoopEvent[]> {
    const eventsData = await this.loadEvents();
    return eventsData.events.filter((event) => event.scope === scope);
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.eventsCache = null;
    this.flatEventsCache = null;
  }
}

// 싱글톤 인스턴스
export const dataLoader = new CoopTimerDataLoader();
