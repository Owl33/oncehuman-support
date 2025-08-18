"use client";

import { CoopEvent, CoopProgress } from "@/types/coop-timer";
import { Clock, Calendar, Crown, Timer, CheckCircle2, Circle, Zap } from "lucide-react";
import { ResetCalculator } from "../lib/timer-calculations";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

interface CompactEventCardProps {
  event: CoopEvent;
  status: {
    completed: boolean;
    nextReset: Date;
    lastCompleted: Date | null;
  };
  progress?: CoopProgress;
  onToggle: (completed: boolean) => void;
}

const categoryConfig = {
  hourly: {
    icon: Zap,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    completedBg: "bg-emerald-100"
  },
  daily: {
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    completedBg: "bg-blue-100"
  },
  weekly: {
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    completedBg: "bg-purple-100"
  },
  test: {
    icon: Timer,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    completedBg: "bg-gray-100"
  },
} as const;

export function CompactEventCard({ event, status, progress, onToggle }: CompactEventCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isCompleted = status.completed;
  const categoryKey = event.category as keyof typeof categoryConfig;
  const config = categoryConfig[categoryKey];
  const IconComponent = config.icon;

  const formatTimeRemaining = (resetDate: Date) => {
    const now = new Date();
    const diff = resetDate.getTime() - now.getTime();
    
    if (diff <= 0) return "곧 리셋";
    
    // 협동 이벤트 (hourly)는 다음 정시로 표시
    if (event.category === "hourly") {
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      const hourDiff = nextHour.getTime() - now.getTime();
      const remainingMinutes = Math.floor(hourDiff / (1000 * 60));
      
      if (remainingMinutes <= 0) return "이용 가능";
      if (remainingMinutes <= 5) return "곧 리셋";
      
      return `${String(nextHour.getHours()).padStart(2, '0')}:00`;
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

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle(!isCompleted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleCardClick}
      className={cn(
        "group relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200",
        "hover:shadow-md",
        isCompleted 
          ? `${config.completedBg} border-green-200` 
          : `bg-white ${config.borderColor}`,
        isHovered && "ring-2 ring-opacity-50",
        isCompleted && isHovered && "ring-green-300",
        !isCompleted && isHovered && `ring-${config.color.split('-')[1]}-300`
      )}
    >
      {/* Status Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(!isCompleted);
        }}
        className={cn(
          "flex-shrink-0 transition-colors duration-200",
          isCompleted 
            ? "text-green-600" 
            : "text-gray-400 hover:text-gray-600"
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </motion.button>

      {/* Event Icon */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200",
        isCompleted 
          ? "bg-green-100 text-green-600" 
          : `${config.bgColor} ${config.color}`
      )}>
        <IconComponent className="w-4 h-4" />
      </div>

      {/* Event Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={cn(
            "font-medium text-sm truncate",
            isCompleted ? "text-green-800" : "text-gray-900"
          )}>
            {event.name}
          </h4>
          {event.icon && (
            <span className="text-sm flex-shrink-0">{event.icon}</span>
          )}
        </div>
      </div>

      {/* Time Info */}
      <div className="flex-shrink-0 text-right">
        <div className="text-xs text-gray-500">
          {isCompleted ? (
            <span className="text-orange-600 font-medium">
              {ResetCalculator.formatNextResetTime(status.nextReset).split(' ').slice(0, 2).join(' ')}
            </span>
          ) : (
            <span className="font-medium">
              {formatTimeRemaining(status.nextReset)}
            </span>
          )}
        </div>
      </div>

      {/* Completion Indicator Stripe */}
      {isCompleted && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-l-xl" />
      )}
    </motion.div>
  );
}