"use client";

import { CoopEvent, CoopProgress } from "@/types/coop-timer";
import { Checkbox } from "@/components/base/checkbox";
import { 
  Clock, 
  History
} from "lucide-react";
import { ResetCalculator } from "../lib/timer-calculations";
import { cn } from "@/lib/utils";

interface CompactEventItemProps {
  event: CoopEvent;
  status: {
    completed: boolean;
    nextReset: Date;
    lastCompleted: Date | null;
  };
  progress?: CoopProgress;
  onToggle: (completed: boolean) => void;
}

const categoryColors = {
  "hourly": "bg-green-50 border-green-200",
  "daily": "bg-blue-50 border-blue-200", 
  "weekly": "bg-purple-50 border-purple-200",
  "test": "bg-gray-50 border-gray-200"
} as const;

export function CompactEventItem({ 
  event, 
  status, 
  progress,
  onToggle
}: CompactEventItemProps) {
  const isCompleted = status.completed;
  const categoryKey = event.category as keyof typeof categoryColors;
  
  const formatLastCompleted = (timestamp: number) => {
    return ResetCalculator.formatAbsoluteDateTime(new Date(timestamp));
  };

  const getResetDisplayText = (resetPattern: string): string => {
    if (/^\d+$/.test(resetPattern)) {
      const ms = parseInt(resetPattern);
      if (ms === 30000) return "30초";
      if (ms === 3600000) return "1시간";
      return `${Math.floor(ms / 1000)}초`;
    }
    if (resetPattern.startsWith("daily-")) return "매일";
    if (resetPattern.startsWith("weekly-")) return "매주";
    return "사용자 지정";
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 hover:shadow-sm",
        isCompleted 
          ? "bg-green-50 border-green-200" 
          : categoryColors[categoryKey] || "bg-white border-gray-200"
      )}
    >
      {/* 체크박스 */}
      <Checkbox
        checked={isCompleted}
        onCheckedChange={(checked) => {
          onToggle(checked === true);
        }}
        className="size-4 flex-shrink-0"
      />
      
      {/* 이벤트 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{event.icon}</span>
          <h4 className={cn(
            "font-medium text-sm truncate",
            isCompleted ? "text-green-800" : "text-gray-900"
          )}>
            {event.name}
          </h4>
        </div>
        
        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
          <div className="flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            <span>{getResetDisplayText(event.resetConfig.reset)}</span>
          </div>
        </div>
      </div>

      {/* 상태 및 액션 */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {isCompleted ? (
          <div className="text-right">
            <div className="text-xs text-green-700 font-medium">완료</div>
            <div className="text-xs text-gray-500">
              리셋: {ResetCalculator.formatNextResetTime(status.nextReset)}
            </div>
          </div>
        ) : (
          <div className="text-right">
            <div className="text-xs text-gray-500">미완료</div>
            {progress?.lastCompletedAt && progress.lastCompletedAt > 0 && (
              <div className="flex items-center gap-0.5 text-xs text-gray-400">
                <History className="h-2 w-2" />
                <span>마지막 완료: {formatLastCompleted(progress.lastCompletedAt)}</span>
              </div>
            )}
          </div>
        )}
        
        {/* 취소 버튼 제거 - 체크박스로 통합 */}
      </div>
    </div>
  );
}