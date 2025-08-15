// app/coop-timer/components/event-card.tsx
"use client";

import { CoopEvent, EventStatus } from "@/types/coop-timer";
import { BaseCharacter } from "@/types/character";
import { Card, CardContent } from "@/components/base/card";
import { Badge } from "@/components/base/badge";
import { Checkbox } from "@/components/base/checkbox";
import { Progress } from "@/components/base/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/base/tooltip";
import { ResetCalculator } from "../lib/timer-calculations";
import { Clock, Users, Trophy, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: CoopEvent;
  character: BaseCharacter;
  status: EventStatus;
  onToggle: (characterId: string, eventId: string, completed: boolean) => void;
}

export function EventCard({ event, character, status, onToggle }: EventCardProps) {
  const difficultyColors = {
    "쉬움": "bg-green-500/10 text-green-600 border-green-500/20",
    "보통": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", 
    "어려움": "bg-red-500/10 text-red-600 border-red-500/20"
  };

  const categoryColors = {
    "monolith": "bg-purple-500/10 text-purple-600",
    "prism": "bg-blue-500/10 text-blue-600",
    "territory": "bg-green-500/10 text-green-600",
    "daily": "bg-orange-500/10 text-orange-600",
    "weekly": "bg-red-500/10 text-red-600"
  };

  const timeLeftPercentage = status.completed && status.timeLeft > 0 
    ? Math.max(0, (status.timeLeft / (event.resetConfig.interval || 86400000)) * 100)
    : 0;

  const handleToggle = () => {
    if (status.completed && !status.canComplete) {
      return; // 이미 완료했고 더 이상 완료할 수 없음
    }
    onToggle(character.id, event.id, !status.completed);
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10",
      "border-2 hover:border-primary/20",
      status.completed && !status.canComplete 
        ? "bg-muted/50 border-green-500/20" 
        : "hover:scale-[1.02]"
    )}>
      <CardContent className="p-4 space-y-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{event.icon}</div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm leading-none">{event.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex-shrink-0">
                  <Checkbox
                    checked={status.completed && !status.canComplete}
                    onCheckedChange={handleToggle}
                    disabled={status.completed && !status.canComplete}
                    className="h-5 w-5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {status.completed && !status.canComplete 
                  ? "완료됨 (리셋 대기 중)" 
                  : status.canComplete 
                    ? "추가 완료 가능"
                    : "완료하기"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* 배지들 */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            className={cn("text-xs", categoryColors[event.category as keyof typeof categoryColors])}
          >
            {event.category === "monolith" && "모노리스"}
            {event.category === "prism" && "프리즘"} 
            {event.category === "territory" && "영토"}
            {event.category === "daily" && "일일"}
            {event.category === "weekly" && "주간"}
          </Badge>
          
          {event.difficulty && (
            <Badge 
              variant="outline"
              className={cn("text-xs", difficultyColors[event.difficulty])}
            >
              {event.difficulty}
            </Badge>
          )}
        </div>

        {/* 진행 상태 */}
        {status.completed && status.timeLeft > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">리셋까지</span>
              <span className="font-medium">
                {ResetCalculator.formatTimeLeft(status.timeLeft)}
              </span>
            </div>
            <Progress 
              value={timeLeftPercentage} 
              className="h-2 bg-muted"
              indicatorClassName="bg-green-500"
            />
          </div>
        )}

        {/* 상태 정보 */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{event.participants}명</span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>
              {event.resetConfig.type === "hourly" && "1시간"}
              {event.resetConfig.type === "daily" && "일일"}
              {event.resetConfig.type === "weekly" && "주간"}
            </span>
          </div>
        </div>

        {/* 완료 시간 */}
        {status.lastCompleted && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
            <Calendar className="h-3 w-3" />
            <span>
              {ResetCalculator.formatCompletedTime(status.lastCompleted)} 완료
            </span>
          </div>
        )}

        {/* 보상 미리보기 */}
        {event.rewards.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-xs text-muted-foreground cursor-help">
                  <Trophy className="h-3 w-3" />
                  <span>{event.rewards.length}개 보상</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-sm">보상:</p>
                  <ul className="text-sm space-y-0.5">
                    {event.rewards.map((reward, idx) => (
                      <li key={idx}>• {reward}</li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* 완료 상태 오버레이 */}
        {status.completed && !status.canComplete && (
          <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
        )}
      </CardContent>
    </Card>
  );
}