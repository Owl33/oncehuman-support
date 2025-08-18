"use client";

import { CoopEvent, CoopProgress, EventCategory } from "@/types/coop-timer";
import { BaseCharacter } from "@/types/character";
import { ModernEventCard } from "./modern-event-card";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Clock, Calendar, Crown, Timer, TrendingUp, CheckCircle2, Circle, Zap } from "lucide-react";
import { Button } from "@/components/base/button";
import { Badge } from "@/components/base/badge";
import { Progress } from "@/components/base/progress";
import { cn } from "@/lib/utils";

interface ModernEventLayoutProps {
  character: BaseCharacter;
  events: CoopEvent[];
  progress: Record<string, CoopProgress>;
  onEventToggle: (eventId: string, completed: boolean) => void;
  getEventStatus: (characterId: string, eventId: string) => any;
}

const categoryConfig = {
  hourly: {
    title: "시간별 이벤트",
    icon: Zap,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700"
  },
  daily: {
    title: "일간 이벤트", 
    icon: Calendar,
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200", 
    textColor: "text-blue-700"
  },
  weekly: {
    title: "주간 퀘스트",
    icon: Crown,
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700"
  },
  test: {
    title: "테스트 이벤트",
    icon: Timer,
    color: "from-gray-500 to-slate-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-700"
  },
} as const;

interface CategorySectionProps {
  category: keyof typeof categoryConfig;
  events: CoopEvent[];
  character: BaseCharacter;
  progress: Record<string, CoopProgress>;
  onEventToggle: (eventId: string, completed: boolean) => void;
  getEventStatus: (characterId: string, eventId: string) => any;
}

function CategorySection({
  category,
  events,
  character,
  progress,
  onEventToggle,
  getEventStatus,
}: CategorySectionProps) {
  if (events.length === 0) return null;

  const config = categoryConfig[category];
  const IconComponent = config.icon;
  
  const completedCount = events.filter(
    (event) => getEventStatus(character.id, event.id).completed
  ).length;
  
  const completionRate = (completedCount / events.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      {/* Section Header */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl border-2 p-6",
        config.bgColor,
        config.borderColor
      )}>
        {/* Background Gradient */}
        <div className={cn(
          "absolute inset-0 opacity-10",
          `bg-gradient-to-br ${config.color}`
        )} />
        
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center justify-center w-14 h-14 rounded-xl",
              `bg-gradient-to-br ${config.color}`,
              "text-white shadow-lg"
            )}>
              <IconComponent className="w-7 h-7" />
            </div>
            
            <div>
              <h3 className={cn("text-xl font-bold", config.textColor)}>
                {config.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {events.length}개 이벤트 • {completedCount}개 완료
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className={cn("text-2xl font-bold", config.textColor)}>
              {completionRate.toFixed(0)}%
            </div>
            <Progress 
              value={completionRate} 
              className="w-24 h-2 mt-2"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">
              완료: <span className="font-semibold">{completedCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              남은: <span className="font-semibold">{events.length - completedCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              진행률: <span className="font-semibold">{completionRate.toFixed(1)}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {events.map((event, index) => {
            const progressKey = `${character.id}-${event.id}`;
            return (
              <motion.div
                key={progressKey}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05 
                }}
              >
                <ModernEventCard
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

export function ModernEventLayout({
  character,
  events,
  progress,
  onEventToggle,
  getEventStatus,
}: ModernEventLayoutProps) {
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

  const overallProgress = (totalCompleted / events.length) * 100;

  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          이벤트가 없습니다
        </h3>
        <p className="text-sm text-gray-500">
          이 시나리오에는 현재 진행 중인 이벤트가 없습니다.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Overall Stats & Filters */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">협동 이벤트 & 퀘스트</h2>
            <div className="flex items-center gap-4 text-white/90">
              <span className="text-sm">
                전체 진행률: <span className="font-semibold">{overallProgress.toFixed(1)}%</span>
              </span>
              <span className="text-sm">
                완료: <span className="font-semibold">{totalCompleted}/{events.length}</span>
              </span>
            </div>
            <Progress 
              value={overallProgress} 
              className="w-full max-w-md h-2 mt-3 bg-white/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filterMode === "all" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setFilterMode("all")}
              className={cn(
                "text-xs font-medium",
                filterMode === "all" 
                  ? "bg-white text-purple-600 hover:bg-white/90" 
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              )}
            >
              전체
            </Button>
            <Button
              variant={filterMode === "incomplete" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setFilterMode("incomplete")}
              className={cn(
                "text-xs font-medium gap-1",
                filterMode === "incomplete" 
                  ? "bg-white text-purple-600 hover:bg-white/90" 
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              )}
            >
              <Filter className="w-3 h-3" />
              미완료
            </Button>
            <Button
              variant={filterMode === "completed" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setFilterMode("completed")}
              className={cn(
                "text-xs font-medium gap-1",
                filterMode === "completed" 
                  ? "bg-white text-purple-600 hover:bg-white/90" 
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              )}
            >
              <CheckCircle2 className="w-3 h-3" />
              완료
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Category Sections */}
      <div className="space-y-8">
        <CategorySection
          category="weekly"
          events={categorizedEvents.weekly}
          character={character}
          progress={progress}
          onEventToggle={onEventToggle}
          getEventStatus={getEventStatus}
        />
        
        <CategorySection
          category="daily"
          events={categorizedEvents.daily}
          character={character}
          progress={progress}
          onEventToggle={onEventToggle}
          getEventStatus={getEventStatus}
        />
        
        <CategorySection
          category="hourly"
          events={categorizedEvents.hourly}
          character={character}
          progress={progress}
          onEventToggle={onEventToggle}
          getEventStatus={getEventStatus}
        />

        {/* Test section only in development */}
        {process.env.NODE_ENV === 'development' && categorizedEvents.test.length > 0 && (
          <CategorySection
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