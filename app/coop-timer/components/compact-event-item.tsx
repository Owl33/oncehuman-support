"use client";

import { CoopEvent, CoopProgress } from "@/types/coop-timer";
import { Checkbox } from "@/components/base/checkbox";
import { Clock, History } from "lucide-react";
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
  hourly: "bg-green-50 border-green-200",
  daily: "bg-blue-50 border-blue-200",
  weekly: "bg-purple-50 border-purple-200",
  test: "bg-gray-50 border-gray-200",
} as const;

export function CompactEventItem({ event, status, progress, onToggle }: CompactEventItemProps) {
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
  const renderCompleteDate = () => {
    if (isCompleted) {
      return <span>초기화 시간 : {ResetCalculator.formatNextResetTime(status.nextReset)}</span>;
    }
    if (progress?.lastCompletedAt && progress.lastCompletedAt > 0) {
      return <span className="">이전 완료: {formatLastCompleted(progress.lastCompletedAt)}</span>;
    }
    return <div> -</div>;
  };
  return (
    <div className="border rounded-lg ">
      <div className="flex items-center ">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={(checked) => {
            onToggle(checked === true);
          }}
          className="size-4 flex-shrink-0"
        />
        <div className="ml-4">
          <h4>{event.name}</h4>

          <div className="ml-auto text-xs ">{renderCompleteDate()}</div>
        </div>
      </div>
    </div>
  );
}
