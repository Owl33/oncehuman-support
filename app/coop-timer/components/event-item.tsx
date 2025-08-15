"use client";

import { CoopEvent, CoopProgress, ResetType } from "@/types/coop-timer";
import { Button } from "@/components/base/button";
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  Star,
  History,
  Users
} from "lucide-react";
import { ResetCalculator } from "../lib/timer-calculations";

interface EventItemProps {
  event: CoopEvent;
  status: {
    completed: boolean;
    nextReset: Date;
    lastCompleted: Date | null;
  };
  progress?: CoopProgress; // 추가: 완료 히스토리를 위해
  onToggle: (completed: boolean) => void;
  animationDelay: number;
}

const categoryIcons = {
  "monolith": "🏛️",
  "prism": "🔮", 
  "territory": "🌿",
  "daily": "📅",
  "weekly": "📆",
  "test": "🧪"
} as const;

const categoryColors = {
  "monolith": "border-purple-200 hover:border-purple-300",
  "prism": "border-blue-200 hover:border-blue-300",
  "territory": "border-green-200 hover:border-green-300", 
  "daily": "border-orange-200 hover:border-orange-300",
  "weekly": "border-red-200 hover:border-red-300",
  "test": "border-gray-200 hover:border-gray-300"
} as const;

export function EventItem({ 
  event, 
  status, 
  progress,
  onToggle, 
  animationDelay 
}: EventItemProps) {
  const isCompleted = status.completed;
  const categoryKey = event.category as keyof typeof categoryIcons;
  
  // 이전 완료시간 포맷
  const formatLastCompleted = (timestamp: number) => {
    return ResetCalculator.formatCompletedTime(new Date(timestamp));
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-sm ${
        isCompleted 
          ? "bg-green-50 border-green-200" 
          : `bg-white ${categoryColors[categoryKey]}`
      }`}
      style={{
        animationDelay: `${animationDelay}ms`
      }}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 체크박스 + 이벤트 정보 */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(e) => onToggle(e.target.checked)}
                className="w-4 h-4 text-green-600 bg-white border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-1"
              />
              {isCompleted && (
                <CheckCircle2 className="absolute inset-0 w-4 h-4 text-green-600 pointer-events-none" />
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {categoryIcons[categoryKey]}
              </span>
              <div>
                <h4 className={`font-medium text-sm ${
                  isCompleted ? "text-green-800" : "text-gray-700"
                }`}>
                  {event.name}
                </h4>
                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-0.5">
                  <Users className="h-3 w-3" />
                  <span>{event.participants}명</span>
                  <span>•</span>
                  <Calendar className="h-3 w-3" />
                  <span>{event.resetConfig.type === ResetType.CUSTOM ? "30초" : 
                         event.resetConfig.type === ResetType.HOURLY ? "1시간" :
                         event.resetConfig.type === ResetType.DAILY ? "매일" : "매주"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 오른쪽: 상태 정보 + 버튼 */}
          <div className="flex items-center space-x-2">
            <div className="text-right">
              {isCompleted ? (
                <div>
                  <div className="flex items-center space-x-1 text-green-700 font-medium">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs">완료</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mt-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{status.nextReset.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <XCircle className="h-3 w-3" />
                    <span className="text-xs">미완료</span>
                  </div>
                  {/* 이전 완료시간 표시 */}
                  {progress?.lastCompletedAt && progress.lastCompletedAt > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-gray-400 mt-0.5">
                      <History className="h-2.5 w-2.5" />
                      <span>전: {formatLastCompleted(progress.lastCompletedAt)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {isCompleted && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle(false)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 h-auto text-xs rounded"
              >
                취소
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      {isCompleted && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500" />
      )}
    </div>
  );
}