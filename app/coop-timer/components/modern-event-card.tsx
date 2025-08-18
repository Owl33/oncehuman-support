"use client";

import { CoopEvent, CoopProgress } from "@/types/coop-timer";
import { Clock, Calendar, Crown, Timer, CheckCircle2, Circle, AlertCircle, Zap } from "lucide-react";
import { ResetCalculator } from "../lib/timer-calculations";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ModernEventCardProps {
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
    label: "시간별",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
    badgeColor: "bg-emerald-100 text-emerald-800"
  },
  daily: {
    icon: Calendar,
    label: "일간",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700",
    badgeColor: "bg-blue-100 text-blue-800"
  },
  weekly: {
    icon: Crown,
    label: "주간",
    color: "from-purple-500 to-violet-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    badgeColor: "bg-purple-100 text-purple-800"
  },
  test: {
    icon: Timer,
    label: "테스트",
    color: "from-gray-500 to-slate-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-700",
    badgeColor: "bg-gray-100 text-gray-800"
  },
} as const;

export function ModernEventCard({ event, status, progress, onToggle }: ModernEventCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isCompleted = status.completed;
  const categoryKey = event.category as keyof typeof categoryConfig;
  const config = categoryConfig[categoryKey];
  const IconComponent = config.icon;

  const formatLastCompleted = (timestamp: number) => {
    return ResetCalculator.formatAbsoluteDateTime(new Date(timestamp));
  };

  const formatTimeRemaining = (resetDate: Date) => {
    const now = new Date();
    const diff = resetDate.getTime() - now.getTime();
    
    if (diff <= 0) return "곧 리셋";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}일 ${hours % 24}시간`;
    }
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle(!isCompleted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleCardClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300",
        "bg-white shadow-lg hover:shadow-xl",
        isCompleted 
          ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50" 
          : config.borderColor,
        isHovered && "ring-4 ring-opacity-20",
        isCompleted && isHovered && "ring-green-300",
        !isCompleted && isHovered && `ring-${config.color.split('-')[1]}-300`
      )}
    >
      {/* Background Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-300",
        isHovered && "opacity-5",
        `bg-gradient-to-br ${config.color}`
      )} />
      
      {/* Top Status Bar */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 transition-all duration-300",
        isCompleted 
          ? "bg-gradient-to-r from-green-400 to-emerald-500" 
          : `bg-gradient-to-r ${config.color}`
      )} />

      <div className="relative p-5">
        {/* Header with Icon and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300",
              isCompleted 
                ? "bg-green-100 text-green-600" 
                : `${config.bgColor} ${config.textColor}`,
              isHovered && "scale-110"
            )}>
              <IconComponent className="w-6 h-6" />
              
              {/* Completion Indicator */}
              <AnimatePresence>
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-semibold text-base leading-tight transition-colors duration-200",
                isCompleted ? "text-green-800" : "text-gray-900"
              )}>
                {event.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium",
                  config.badgeColor
                )}>
                  {config.label}
                </span>
                {event.icon && (
                  <span className="text-lg leading-none">{event.icon}</span>
                )}
              </div>
            </div>
          </div>

          {/* Status Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(!isCompleted);
            }}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
              isCompleted 
                ? "text-green-600 hover:bg-green-100" 
                : "text-gray-400 hover:bg-gray-100"
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </motion.button>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {event.description}
          </p>
        )}

        {/* Timer Info */}
        <div className="space-y-3">
          {isCompleted ? (
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-gray-700">
                <span className="font-medium text-orange-600">리셋:</span>{" "}
                {ResetCalculator.formatNextResetTime(status.nextReset)}
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <Timer className="w-4 h-4 text-blue-500" />
                <span className="text-gray-700">
                  <span className="font-medium text-blue-600">남은 시간:</span>{" "}
                  {formatTimeRemaining(status.nextReset)}
                </span>
              </div>
              
              {progress?.lastCompletedAt && progress.lastCompletedAt > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">
                    이전 완료: {formatLastCompleted(progress.lastCompletedAt)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{isCompleted ? "완료됨" : "대기중"}</span>
            <span className="font-medium">
              {event.scope === "common" ? "공통" : "시나리오"}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300",
        isHovered && "opacity-100",
        "bg-gradient-to-r from-transparent via-white to-transparent",
        "translate-x-[-100%] hover:translate-x-[100%]",
        "bg-[length:200%_100%] animate-shimmer"
      )} 
      style={{
        background: isHovered 
          ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
          : undefined,
        animation: isHovered ? "shimmer 1.5s ease-in-out" : undefined
      }}
      />
    </motion.div>
  );
}