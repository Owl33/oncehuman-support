"use client";

import { CoopEvent, CoopProgress, EventCategory } from "@/types/coop-timer";
import { BaseCharacter } from "@/types/character";
import { Button } from "@/components/base/button";
import { Clock, Calendar, Filter, Crown } from "lucide-react";
import { CompactEventItem } from "./compact-event-item";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/base/card";

interface SimpleEventLayoutProps {
  character: BaseCharacter;
  events: CoopEvent[];
  progress: Record<string, CoopProgress>;
  onEventToggle: (eventId: string, completed: boolean) => void;
  getEventStatus: (characterId: string, eventId: string) => any;
}

// 카테고리 정보 (단순화)
const CATEGORY_INFO = {
  hourly: { title: "시간별 이벤트", icon: Clock, color: "text-green-600" },
  daily: { title: "일간 이벤트", icon: Calendar, color: "text-blue-600" },
  weekly: { title: "주간 퀘스트", icon: Crown, color: "text-yellow-600" },
  test: { title: "테스트 이벤트", icon: Clock, color: "text-gray-600" },
};

interface EventSectionProps {
  title: string;
  events: CoopEvent[];
  character: BaseCharacter;
  progress: Record<string, CoopProgress>;
  onEventToggle: (eventId: string, completed: boolean) => void;
  getEventStatus: (characterId: string, eventId: string) => any;
  className?: string;
}

function EventSection({
  title,
  events,
  character,
  progress,
  onEventToggle,
  getEventStatus,
  className = "",
}: EventSectionProps) {
  if (events.length === 0) {
    return (
      <div
        className={`p-4 bg-gray-50/30 rounded-lg border border-gray-200 text-center ${className}`}>
        <p className="text-muted-foreground text-sm">{title}가 없습니다.</p>
      </div>
    );
  }

  const completedCount = events.filter(
    (event) => getEventStatus(character.id, event.id).completed
  ).length;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 섹션 헤더 */}
      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {completedCount}/{events.length} 완료
          </p>
        </div>
      </div>

      {/* 이벤트 목록 */}
      <div className="space-y-2 grid grid-cols-2"></div>
    </div>
  );
}

export function SimpleEventLayout({
  character,
  events,
  progress,
  onEventToggle,
  getEventStatus,
}: SimpleEventLayoutProps) {
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);

  // 카테고리별 이벤트 분리
  const { weeklyEvents, coopEvents } = useMemo(() => {
    const filtered = showOnlyIncomplete
      ? events.filter((event) => !getEventStatus(character.id, event.id).completed)
      : events;

    const weekly = filtered.filter((e) => e.category === EventCategory.WEEKLY);
    const coop = filtered.filter((e) => e.category !== EventCategory.WEEKLY);

    return { weeklyEvents: weekly, coopEvents: coop };
  }, [events, character.id, getEventStatus, showOnlyIncomplete]);

  const totalCompleted = events.filter(
    (event) => getEventStatus(character.id, event.id).completed
  ).length;

  if (events.length === 0) {
    return (
      <div className="p-4 bg-gray-50/30 rounded-lg border border-gray-200 text-center">
        <p className="text-muted-foreground">이 시나리오에는 이벤트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="">
      {/* 전체 통계 및 필터 */}
      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
        <div>
          <h2 className="font-semibold text-sm">협동 이벤트 & 퀘스트</h2>
          <p className="text-xs text-muted-foreground">
            전체 {totalCompleted}/{events.length} 완료
          </p>
        </div>

        <Button
          variant={showOnlyIncomplete ? "default" : "outline"}
          size="sm"
          onClick={() => setShowOnlyIncomplete(!showOnlyIncomplete)}
          className="gap-1 h-6 px-2 text-xs">
          <Filter className="h-2.5 w-2.5" />
          {showOnlyIncomplete ? "전체" : "미완료"}
        </Button>
      </div>

      {/* 단일 반응형 그리드 구조 */}
      <div className="grid grid-cols-12 gap-4">
        {/* 주간 퀘스트 */}
        <div className="col-span-6 ">
          <div>주간 목록</div>
          <div className="grid grid-cols-12 gap-1">
            {weeklyEvents.map((event) => {
              const progressKey = `${character.id}-${event.id}`;
              return (
                <div
                  key={progressKey}
                  className="col-span-6">
                  <CompactEventItem
                    key={event.id}
                    event={event}
                    status={getEventStatus(character.id, event.id)}
                    progress={progress[progressKey]}
                    onToggle={(completed) => onEventToggle(event.id, completed)}
                  />
                </div>
              );
            })}
          </div>

          {/* <EventSection
            title="주간 퀘스트"
            events={weeklyEvents}
            character={character}
            progress={progress}
            onEventToggle={onEventToggle}
            getEventStatus={getEventStatus}
          /> */}
        </div>

        {/* 협동 이벤트 */}
        <div className="col-span-6 ">
          협동 이벤트
          <div className="grid grid-cols-12 gap-4">
            {coopEvents.map((event) => {
              const progressKey = `${character.id}-${event.id}`;
              return (
                <div
                  key={progressKey}
                  className="col-span-6">
                  <CompactEventItem
                    key={event.id}
                    event={event}
                    status={getEventStatus(character.id, event.id)}
                    progress={progress[progressKey]}
                    onToggle={(completed) => onEventToggle(event.id, completed)}
                  />
                </div>
              );
            })}
          </div>
          {/* <EventSection
            title="협동 이벤트"
            events={coopEvents}
            character={character}
            progress={progress}
            onEventToggle={onEventToggle}
            getEventStatus={getEventStatus}
          /> */}
        </div>
      </div>
    </div>
  );
}
