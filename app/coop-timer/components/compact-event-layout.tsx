"use client";

import { CoopEvent, CoopProgress, EventCategory } from "@/types/coop-timer";
import { BaseCharacter } from "@/types/character";
import { CompactEventCard } from "@/components/ui";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Clock, Calendar, Crown, Timer, CheckCircle2, Circle, Zap } from "lucide-react";
import { Button } from "@/components/base/button";
import { CategorySection } from "@/components/ui";
import { ResetCalculator } from "../lib/timer-calculations";
import { cn } from "@/lib/utils";

interface CompactEventLayoutProps {
  character: BaseCharacter;
  events: CoopEvent[];
  progress: Record<string, CoopProgress>;
  onEventToggle: (eventId: string, completed: boolean) => void;
  getEventStatus: (characterId: string, eventId: string) => any;
  filterMode: "all" | "incomplete" | "completed";
}

// 카테고리 아이콘 매핑
const categoryIcons = {
  hourly: Zap,
  daily: Calendar,
  weekly: Crown,
  test: Timer,
} as const;

interface CompactCategorySectionProps {
  category: keyof typeof categoryIcons;
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

  const IconComponent = categoryIcons[category];

  const completedCount = events.filter(
    (event) => getEventStatus(character.id, event.id).completed
  ).length;

  const formatTimeRemaining = (resetDate: Date) => {
    const now = new Date();
    const diff = resetDate.getTime() - now.getTime();

    if (diff <= 0) return "곧 리셋";

    // 협동 이벤트 (hourly)는 다음 정시로 표시
    if (category === "hourly") {
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      const hourDiff = nextHour.getTime() - now.getTime();
      const remainingMinutes = Math.floor(hourDiff / (1000 * 60));

      if (remainingMinutes <= 0) return "이용 가능";
      if (remainingMinutes <= 5) return "곧 리셋";

      return `${String(nextHour.getHours()).padStart(2, "0")}:00`;
    }

    // 주간/일간 이벤트는 기존 로직
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}일`;
    }
    if (hours > 0) return `${hours}시간`;
    return `${minutes}분`;
  };

  return (
    <CategorySection
      category={category}
      icon={IconComponent}
      mode="compact"
      completedCount={completedCount}
      totalCount={events.length}
      hideProgress={category === "hourly"}>
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
                  delay: index * 0.02,
                }}>
                <CompactEventCard
                  variant={category}
                  title={event.name}
                  icon={IconComponent}
                  emoji={event.icon}
                  completed={getEventStatus(character.id, event.id).completed}
                  nextResetText={formatTimeRemaining(
                    getEventStatus(character.id, event.id).nextReset
                  )}
                  onToggle={(completed) => onEventToggle(event.id, completed)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </CategorySection>
  );
}

export function CompactEventLayout({
  character,
  events,
  progress,
  onEventToggle,
  getEventStatus,
  filterMode,
}: CompactEventLayoutProps) {
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
    } as Record<keyof typeof categoryIcons, CoopEvent[]>;
  }, [events, character.id, getEventStatus, filterMode]);

  const totalCompleted = events.filter(
    (event) => getEventStatus(character.id, event.id).completed
  ).length;

  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <h3 className="text-base font-medium text-gray-700 mb-1">이벤트가 없습니다</h3>
        <p className="text-sm text-gray-500">이 시나리오에는 현재 진행 중인 이벤트가 없습니다.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Header with Filters */}
      {/* <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white rounded-xl border border-gray-200">
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
            className="h-8 px-3 text-xs">
            전체
          </Button>
          <Button
            variant={filterMode === "incomplete" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterMode("incomplete")}
            className="h-8 px-3 text-xs gap-1">
            <Circle className="w-3 h-3" />
            미완료
          </Button>
          <Button
            variant={filterMode === "completed" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilterMode("completed")}
            className="h-8 px-3 text-xs gap-1">
            <CheckCircle2 className="w-3 h-3" />
            완료
          </Button>
        </div>
      </motion.div> */}

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
        {process.env.NODE_ENV === "development" && categorizedEvents.test.length > 0 && (
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
