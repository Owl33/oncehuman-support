"use client";

import { CoopEvent, CoopProgress, EventCategory } from "@/types/coop-timer";
import { BaseCharacter } from "@/types/character";
import { CompactEventCard } from "./compact-event-card";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Clock, Calendar, Crown, Timer, CheckCircle2, Circle, Zap } from "lucide-react";
import { Button } from "@/components/base/button";
import { cn } from "@/lib/utils";

interface CompactEventLayoutProps {
  character: BaseCharacter;
  events: CoopEvent[];
  progress: Record<string, CoopProgress>;
  onEventToggle: (eventId: string, completed: boolean) => void;
  getEventStatus: (characterId: string, eventId: string) => any;
}

const categoryConfig = {
  hourly: { title: "시간별", icon: Zap, color: "text-emerald-600" },
  daily: { title: "일간", icon: Calendar, color: "text-blue-600" },
  weekly: { title: "주간", icon: Crown, color: "text-purple-600" },
  test: { title: "테스트", icon: Timer, color: "text-gray-600" },
} as const;

interface CompactCategorySectionProps {
  category: keyof typeof categoryConfig;
  events: CoopEvent[];
  character: BaseCharacter;
  progress: Record<string, CoopProgress>;
  onEventToggle: (eventId: string, completed: boolean) => void;
  getEventStatus: (characterId: string, eventId: string) => any;
}

function CompactCategorySection({
  category,
  events,
  character,
  progress,
  onEventToggle,
  getEventStatus,
}: CompactCategorySectionProps) {
  if (events.length === 0) return null;

  const config = categoryConfig[category];
  const IconComponent = config.icon;
  
  const completedCount = events.filter(
    (event) => getEventStatus(character.id, event.id).completed
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Compact Section Header */}
      <div className="flex items-center justify-between py-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <IconComponent className={cn("w-4 h-4", config.color)} />
          <h3 className="text-sm font-semibold text-gray-800">
            {config.title}
          </h3>
          {/* 협동 이벤트 (hourly)는 완료 카운트 숨김 */}
          {category !== "hourly" && (
            <span className="text-xs text-gray-500">
              ({completedCount}/{events.length})
            </span>
          )}
          {/* 협동 이벤트는 다른 정보 표시 */}
          {category === "hourly" && (
            <span className="text-xs text-gray-500">
              ({events.length}개 이벤트)
            </span>
          )}
        </div>
      </div>

      {/* Events Grid - 2-3칸으로 조정 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {events.map((event, index) => {
            const progressKey = `${character.id}-${event.id}`;
            return (
              <motion.div
                key={progressKey}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  duration: 0.2,
                  delay: index * 0.02 
                }}
              >
                <CompactEventCard
                  event={event}
                  status={getEventStatus(character.id, event.id)}
                  progress={progress[progressKey]}
                  onToggle={(completed) => onEventToggle(event.id, completed)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function CompactEventLayout({
  character,
  events,
  progress,
  onEventToggle,
  getEventStatus,
}: CompactEventLayoutProps) {
  const [filterMode, setFilterMode] = useState<"all" | "incomplete" | "completed">("all");

  // 카테고리별 이벤트 분리 및 필터링
  const categorizedEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      if (filterMode === "all") return true;
      const isCompleted = getEventStatus(character.id, event.id).completed;
      return filterMode === "completed" ? isCompleted : !isCompleted;
    });

    return {
      weekly: filtered.filter((e) => e.category === EventCategory.WEEKLY),
      daily: filtered.filter((e) => e.category === EventCategory.DAILY),
      hourly: filtered.filter((e) => e.category === EventCategory.HOURLY),
      test: filtered.filter((e) => e.category === EventCategory.TEST),
    };
  }, [events, character.id, getEventStatus, filterMode]);

  const totalCompleted = events.filter(
    (event) => getEventStatus(character.id, event.id).completed
  ).length;

  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center"
      >
        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <h3 className="text-base font-medium text-gray-700 mb-1">
          이벤트가 없습니다
        </h3>
        <p className="text-sm text-gray-500">
          이 시나리오에는 현재 진행 중인 이벤트가 없습니다.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Header with Filters */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white rounded-xl border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900">협동 이벤트</h2>
          <span className="text-sm text-gray-500">
            {totalCompleted}/{events.length} 완료
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={filterMode === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterMode("all")}
            className="h-8 px-3 text-xs"
          >
            전체
          </Button>
          <Button
            variant={filterMode === "incomplete" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterMode("incomplete")}
            className="h-8 px-3 text-xs gap-1"
          >
            <Circle className="w-3 h-3" />
            미완료
          </Button>
          <Button
            variant={filterMode === "completed" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterMode("completed")}
            className="h-8 px-3 text-xs gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            완료
          </Button>
        </div>
      </motion.div>

      {/* Category Sections */}
      <div className="space-y-6">
        <CompactCategorySection
          category="weekly"
          events={categorizedEvents.weekly}
          character={character}
          progress={progress}
          onEventToggle={onEventToggle}
          getEventStatus={getEventStatus}
        />
        
        <CompactCategorySection
          category="daily"
          events={categorizedEvents.daily}
          character={character}
          progress={progress}
          onEventToggle={onEventToggle}
          getEventStatus={getEventStatus}
        />
        
        <CompactCategorySection
          category="hourly"
          events={categorizedEvents.hourly}
          character={character}
          progress={progress}
          onEventToggle={onEventToggle}
          getEventStatus={getEventStatus}
        />

        {/* Test section only in development */}
        {process.env.NODE_ENV === 'development' && categorizedEvents.test.length > 0 && (
          <CompactCategorySection
            category="test"
            events={categorizedEvents.test}
            character={character}
            progress={progress}
            onEventToggle={onEventToggle}
            getEventStatus={getEventStatus}
          />
        )}
      </div>
    </div>
  );
}