// app/coop-timer/lib/data-loader.ts
import { CoopEvent, EventData, ScenarioType, EventCategory, GameMode, EventScope } from "@/types/coop-timer";
import { getEventsForScenario, getAllScenarios } from "./scenarios";
import eventsData from "../data/events.json";

class CoopTimerDataLoader {
  private eventsCache: EventData | null = null;

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
      console.error('Error loading events:', error);
      return { events: {} };
    }
  }


  /**
   * 시나리오별 이벤트 데이터 조합 (새로운 구조)
   */
  async getScenarioEvents(scenarioType: ScenarioType): Promise<CoopEvent[]> {
    const eventsData = await this.loadEvents();
    const allEvents = Object.values(eventsData.events) as CoopEvent[];
    return getEventsForScenario(allEvents, scenarioType);
  }

  /**
   * 모든 이벤트 데이터 반환 (ID 기반)
   */
  async getAllEvents(): Promise<Record<string, CoopEvent>> {
    const eventsData = await this.loadEvents();
    return eventsData.events;
  }

  /**
   * 특정 이벤트 조회
   */
  async getEvent(eventId: string): Promise<CoopEvent | null> {
    const eventsData = await this.loadEvents();
    return eventsData.events[eventId] || null;
  }

  /**
   * 카테고리별 이벤트 조회
   */
  async getEventsByCategory(category: EventCategory): Promise<CoopEvent[]> {
    const eventsData = await this.loadEvents();
    return (Object.values(eventsData.events) as CoopEvent[]).filter(event => event.category === category);
  }

  /**
   * 게임 모드별 이벤트 조회
   */
  async getEventsByGameMode(gameMode: GameMode): Promise<CoopEvent[]> {
    const eventsData = await this.loadEvents();
    return (Object.values(eventsData.events) as CoopEvent[]).filter(event => event.gameMode === gameMode);
  }

  /**
   * 스코프별 이벤트 조회
   */
  async getEventsByScope(scope: EventScope): Promise<CoopEvent[]> {
    const eventsData = await this.loadEvents();
    return (Object.values(eventsData.events) as CoopEvent[]).filter(event => event.scope === scope);
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.eventsCache = null;
  }
}

// 싱글톤 인스턴스
export const dataLoader = new CoopTimerDataLoader();