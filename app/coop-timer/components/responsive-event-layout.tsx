"use client";

import { useState, useMemo } from "react";
import { CoopEvent, CoopProgress, EventCategory } from "@/types/coop-timer";
import { BaseCharacter } from "@/types/character";
import { ScrollArea } from "@/components/base/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/base/collapsible";
import { Button } from "@/components/base/button";
import { 
  Clock, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  Filter,
  RotateCcw,
  Crown
} from "lucide-react";
import { CompactEventItem } from "./compact-event-item";

interface ResponsiveEventLayoutProps {
  character: BaseCharacter;
  events: CoopEvent[];
  progress: Record<string, CoopProgress>;
  onEventToggle: (eventId: string, completed: boolean) => void;
  getEventStatus: (characterId: string, eventId: string) => any;
}

// 카테고리 정보
const CATEGORY_INFO = {
  hourly: {
    title: "시간별 이벤트",
    icon: Clock,
    description: "1시간마다 진행 가능",
    color: "green",
    bgColor: "bg-green-50/30",
    borderColor: "border-green-200"
  },
  daily: {
    title: "일간 이벤트", 
    icon: Calendar,
    description: "하루 1회 진행 가능",
    color: "blue",
    bgColor: "bg-blue-50/30",
    borderColor: "border-blue-200"
  },
  weekly: {
    title: "주간 퀘스트",
    icon: Crown,
    description: "주 1회 진행 가능",
    color: "yellow",
    bgColor: "bg-yellow-50/30",
    borderColor: "border-yellow-200"
  },
  test: {
    title: "테스트 이벤트",
    icon: RotateCcw,
    description: "개발/테스트용",
    color: "gray",
    bgColor: "bg-gray-50/30",
    borderColor: "border-gray-200"
  }
};

interface CategorySectionProps {
  category: EventCategory;
  events: CoopEvent[];
  character: BaseCharacter;
  progress: Record<string, CoopProgress>;
  onEventToggle: (eventId: string, completed: boolean) => void;
  getEventStatus: (characterId: string, eventId: string) => any;
  defaultOpen?: boolean;
  isMobile?: boolean;
}

function CategorySection({
  category,
  events,
  character,
  progress,
  onEventToggle,
  getEventStatus,
  defaultOpen = false,
  isMobile = false
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const categoryInfo = CATEGORY_INFO[category] || CATEGORY_INFO.test;

  const completedCount = events.filter(event => 
    getEventStatus(character.id, event.id).completed
  ).length;

  const IconComponent = categoryInfo.icon;
  const colorClasses = {
    green: "text-green-600 bg-green-100",
    blue: "text-blue-600 bg-blue-100", 
    yellow: "text-yellow-600 bg-yellow-100",
    gray: "text-gray-600 bg-gray-100"
  };

  if (events.length === 0) return null;

  return (
    <div className={`p-3 rounded-lg border ${categoryInfo.bgColor} ${categoryInfo.borderColor}`}>
      {isMobile ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-3 h-auto hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${colorClasses[categoryInfo.color as keyof typeof colorClasses]}`}>
                  <IconComponent className="h-3.5 w-3.5" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{categoryInfo.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {categoryInfo.description} • {completedCount}/{events.length} 완료
                  </div>
                </div>
              </div>
              {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-1 px-3 pb-3">
            {events.map((event) => {
              const progressKey = `${character.id}-${event.id}`;
              return (
                <CompactEventItem
                  key={event.id}
                  event={event}
                  status={getEventStatus(character.id, event.id)}
                  progress={progress[progressKey]}
                  onToggle={(completed) => onEventToggle(event.id, completed)}
                />
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        // Desktop: Always expanded
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-1.5 rounded-lg ${colorClasses[categoryInfo.color as keyof typeof colorClasses]}`}>
              <IconComponent className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="font-medium text-sm">{categoryInfo.title}</div>
              <div className="text-xs text-muted-foreground">
                {categoryInfo.description} • {completedCount}/{events.length} 완료
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            {events.map((event) => {
              const progressKey = `${character.id}-${event.id}`;
              return (
                <CompactEventItem
                  key={event.id}
                  event={event}
                  status={getEventStatus(character.id, event.id)}
                  progress={progress[progressKey]}
                  onToggle={(completed) => onEventToggle(event.id, completed)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ResponsiveEventLayout({
  character,
  events,
  progress,
  onEventToggle,
  getEventStatus,
}: ResponsiveEventLayoutProps) {
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);

  // 카테고리별 이벤트 분리
  const { weeklyEvents, coopEvents } = useMemo(() => {
    const filtered = showOnlyIncomplete 
      ? events.filter(event => !getEventStatus(character.id, event.id).completed)
      : events;

    const weekly = filtered.filter(e => e.category === EventCategory.WEEKLY);
    const coop = filtered.filter(e => e.category !== EventCategory.WEEKLY);

    return { 
      weeklyEvents: weekly,
      coopEvents: coop
    };
  }, [events, character.id, getEventStatus, showOnlyIncomplete]);

  // 협동 이벤트를 카테고리별로 그룹핑
  const coopEventsByCategory = useMemo(() => {
    const grouped: Record<EventCategory, CoopEvent[]> = {
      hourly: [],
      daily: [],
      weekly: [],
      test: []
    };
    
    coopEvents.forEach(event => {
      if (grouped[event.category]) {
        grouped[event.category].push(event);
      }
    });

    return grouped;
  }, [coopEvents]);

  const totalCompleted = events.filter(event => 
    getEventStatus(character.id, event.id).completed
  ).length;

  if (events.length === 0) {
    return (
      <div className="p-4 bg-gray-50/30 rounded-lg border border-gray-200 text-center">
        <p className="text-muted-foreground">이 시나리오에는 이벤트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      {/* 전체 통계 및 필터 */}
      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-4">
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
          className="gap-1 h-6 px-2 text-xs"
        >
          <Filter className="h-2.5 w-2.5" />
          {showOnlyIncomplete ? "전체" : "미완료"}
        </Button>
      </div>

      {/* 반응형 레이아웃 */}
      <div className="lg:hidden">
        {/* 모바일/태블릿: 통합된 레이아웃 */}
        <ScrollArea className="h-[400px] pr-1">
          <div className="space-y-3">
            {/* 주간 퀘스트 */}
            {weeklyEvents.length > 0 && (
              <CategorySection
                category={EventCategory.WEEKLY}
                events={weeklyEvents}
                character={character}
                progress={progress}
                onEventToggle={onEventToggle}
                getEventStatus={getEventStatus}
                defaultOpen={true}
                isMobile={true}
              />
            )}

            {/* 협동 이벤트들 */}
            {(Object.keys(coopEventsByCategory) as EventCategory[])
              .filter(category => category !== EventCategory.WEEKLY)
              .sort((a, b) => {
                const order = { hourly: 0, daily: 1, test: 9 };
                return order[a] - order[b];
              })
              .map((category) => (
                <CategorySection
                  key={category}
                  category={category}
                  events={coopEventsByCategory[category]}
                  character={character}
                  progress={progress}
                  onEventToggle={onEventToggle}
                  getEventStatus={getEventStatus}
                  defaultOpen={category === "hourly" || category === "daily"}
                  isMobile={true}
                />
              ))}
          </div>
        </ScrollArea>
      </div>

      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
        {/* PC: 왼쪽 주간 퀘스트 */}
        <div className="lg:col-span-1">
          {weeklyEvents.length > 0 ? (
            <CategorySection
              category={EventCategory.WEEKLY}
              events={weeklyEvents}
              character={character}
              progress={progress}
              onEventToggle={onEventToggle}
              getEventStatus={getEventStatus}
              defaultOpen={true}
              isMobile={false}
            />
          ) : (
            <div className="p-4 bg-yellow-50/30 rounded-lg border border-yellow-200 text-center">
              <p className="text-muted-foreground text-sm">주간 퀘스트가 없습니다.</p>
            </div>
          )}
        </div>

        {/* PC: 오른쪽 협동 이벤트 */}
        <div className="lg:col-span-2">
          <ScrollArea className="h-[400px] pr-1">
            <div className="space-y-3">
              {(Object.keys(coopEventsByCategory) as EventCategory[])
                .filter(category => category !== EventCategory.WEEKLY)
                .sort((a, b) => {
                  const order = { hourly: 0, daily: 1, test: 9 };
                  return order[a] - order[b];
                })
                .map((category) => (
                  <CategorySection
                    key={category}
                    category={category}
                    events={coopEventsByCategory[category]}
                    character={character}
                    progress={progress}
                    onEventToggle={onEventToggle}
                    getEventStatus={getEventStatus}
                    defaultOpen={true}
                    isMobile={false}
                  />
                ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}